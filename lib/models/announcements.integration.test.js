import { describe, it, expect, beforeAll, afterAll, beforeEach, vi } from "vitest";
import { MongoMemoryReplSet } from "mongodb-memory-server";
import { MongoClient } from "mongodb";

// Mock @/lib/api-helpers since it imports Next.js modules (next/server,
// etc.) that are unavailable in plain Node.js / Vitest.
vi.mock("@/lib/api-helpers", () => ({
  ValidationError: class ValidationError extends Error {
    constructor(message) {
      super(message);
      this.name = "ValidationError";
    }
  },
}));

// Isolated temporary MongoDB replica set for transaction-dependent tests.
// Never connects to any production database. MONGODB_URI is set only in
// process memory, never written to .env.local, and never logged.
let replSet;
let client;
let coll;
let publishExisting;
let createPublished;

beforeAll(async () => {
  // Start an isolated, temporary local MongoDB replica set.
  // MongoMemoryReplSet.create() in v7+ already starts the instances.
  replSet = await MongoMemoryReplSet.create({
    instanceOpts: [{ dbName: "wariseva" }],
    replSet: { name: "testset", count: 1 },
  });
  await replSet.waitUntilRunning();

  // Validate the URI points to the temporary local test server.
  const uri = replSet.getUri("wariseva");
  if (!uri.includes("127.0.0.1") && !uri.includes("localhost")) {
    throw new Error(`Unexpected MongoDB URI host: ${uri}`);
  }
  if (!uri.includes("replicaSet=testset")) {
    throw new Error(`Missing replicaSet parameter in URI: ${uri}`);
  }

  // Set MONGODB_URI before importing model modules. lib/mongodb.js reads it
  // at module load time and throws if it is missing.
  process.env.MONGODB_URI = uri;

  // Dynamic import after env var is set so lib/mongodb.js -> lib/db.js use
  // the temporary test server, not any production database.
  const mod = await import("./announcements.js");
  publishExisting = mod.publishExisting;
  createPublished = mod.createPublished;

  // Direct client for test data setup/cleanup (bypasses model layer).
  client = new MongoClient(uri);
  await client.connect();
  coll = client.db("wariseva").collection("announcements");
});

afterAll(async () => {
  // Always close connections and stop the temporary server, even if a test
  // fails.
  try {
    await client.close();
  } catch {}
  if (replSet) {
    try {
      await replSet.stop();
      await replSet.cleanup();
    } catch {}
  }
});

beforeEach(async () => {
  await coll.deleteMany({});
});

describe("Announcement model — publishing (transactional, replica set)", () => {
  it("publishing a draft demotes the previous published announcement", async () => {
    await coll.insertOne({
      announcementId: "ANN-2026-001",
      title: "Published A",
      description: "Desc A",
      category: "general",
      status: "published",
      priority: "medium",
      publishDate: new Date(),
      createdAt: new Date(),
      updatedAt: new Date(),
    });
    await coll.insertOne({
      announcementId: "ANN-2026-002",
      title: "Draft B",
      description: "Desc B",
      category: "schedule",
      status: "draft",
      priority: "medium",
      publishDate: new Date(),
      createdAt: new Date(),
      updatedAt: new Date(),
    });

    const result = await publishExisting("ANN-2026-002");

    expect(result).not.toBeNull();
    expect("becamePublished" in result).toBe(true);

    const a = await coll.findOne({ announcementId: "ANN-2026-001" });
    const b = await coll.findOne({ announcementId: "ANN-2026-002" });
    expect(a.status).toBe("draft");
    expect(b.status).toBe("published");
  });

  it("the target announcement becomes published", async () => {
    await coll.insertOne({
      announcementId: "ANN-2026-001",
      title: "Published A",
      description: "Desc A",
      category: "general",
      status: "published",
      priority: "medium",
      publishDate: new Date(),
      createdAt: new Date(),
      updatedAt: new Date(),
    });
    await coll.insertOne({
      announcementId: "ANN-2026-002",
      title: "Draft B",
      description: "Desc B",
      category: "schedule",
      status: "draft",
      priority: "medium",
      publishDate: new Date(),
      createdAt: new Date(),
      updatedAt: new Date(),
    });

    const result = await publishExisting("ANN-2026-002");
    expect(result.announcement.status).toBe("published");
  });

  it("becamePublished is true when a draft becomes published", async () => {
    await coll.insertOne({
      announcementId: "ANN-2026-001",
      title: "Published A",
      description: "Desc A",
      category: "general",
      status: "published",
      priority: "medium",
      publishDate: new Date(),
      createdAt: new Date(),
      updatedAt: new Date(),
    });
    await coll.insertOne({
      announcementId: "ANN-2026-002",
      title: "Draft B",
      description: "Desc B",
      category: "schedule",
      status: "draft",
      priority: "medium",
      publishDate: new Date(),
      createdAt: new Date(),
      updatedAt: new Date(),
    });

    const result = await publishExisting("ANN-2026-002");
    expect(result.becamePublished).toBe(true);
  });

  it("becamePublished is false when the target was already published", async () => {
    await coll.insertOne({
      announcementId: "ANN-2026-001",
      title: "Published A",
      description: "Desc A",
      category: "general",
      status: "published",
      priority: "medium",
      publishDate: new Date(),
      createdAt: new Date(),
      updatedAt: new Date(),
    });

    const result = await publishExisting("ANN-2026-001");
    expect(result.becamePublished).toBe(false);
  });

  it("requireStatus: archived rejects a target that is no longer archived", async () => {
    await coll.insertOne({
      announcementId: "ANN-2026-001",
      title: "Archived A",
      description: "Desc A",
      category: "general",
      status: "archived",
      priority: "medium",
      publishDate: new Date(),
      createdAt: new Date(),
      updatedAt: new Date(),
    });
    // Change status to draft outside the model (simulating external change).
    await coll.updateOne({ announcementId: "ANN-2026-001" }, { $set: { status: "draft" } });

    const result = await publishExisting("ANN-2026-001", {}, { requireStatus: "archived" });
    expect(result.statusConflict).toBe(true);
    expect(result.existingStatus).toBe("draft");
    expect(result.requiredStatus).toBe("archived");
  });

  it("a missing target returns null", async () => {
    const result = await publishExisting("ANN-2026-999");
    expect(result).toBe(null);
  });

  it("creating a published announcement demotes the previous published announcement", async () => {
    await coll.insertOne({
      announcementId: "ANN-2026-001",
      title: "Published A",
      description: "Desc A",
      category: "general",
      status: "published",
      priority: "medium",
      publishDate: new Date(),
      createdAt: new Date(),
      updatedAt: new Date(),
    });

    await createPublished({
      title: "New Published",
      description: "Desc",
      category: "general",
    });

    const a = await coll.findOne({ announcementId: "ANN-2026-001" });
    expect(a.status).toBe("draft");
  });

  it("the newly created announcement is the published record after the transaction succeeds", async () => {
    const result = await createPublished({
      title: "New Published",
      description: "Desc",
      category: "general",
    });

    expect(result.announcement.status).toBe("published");

    const published = await coll.find({ status: "published" }).toArray();
    expect(published).toHaveLength(1);
    expect(published[0].announcementId).toBe(result.announcement.announcementId);
  });
});
