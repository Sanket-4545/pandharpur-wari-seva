import { describe, it, expect, beforeAll, afterAll, beforeEach, vi } from "vitest";
import { MongoMemoryReplSet } from "mongodb-memory-server";
import { MongoClient } from "mongodb";

// Mock @/lib/api-helpers since it imports Next.js modules unavailable in Vitest.
vi.mock("@/lib/api-helpers", () => ({
  ValidationError: class ValidationError extends Error {
    constructor(message) {
      super(message);
      this.name = "ValidationError";
    }
  },
}));

// Isolated temporary MongoDB replica set for index and concurrency tests.
// Never connects to any production database. MONGODB_URI is set only in
// process memory, never written to .env.local, and never logged.
let replSet;
let client;
let coll;
let createPublished;
let publishExisting;
let isPublishStatusConflictError;

const INDEX_NAME = "uniq_published_status";

beforeAll(async () => {
  // Start an isolated, temporary local MongoDB replica set.
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

  // Set MONGODB_URI before importing model modules.
  process.env.MONGODB_URI = uri;

  // Dynamic import after env var is set so lib/mongodb.js -> lib/db.js use
  // the temporary test server.
  const mod = await import("./announcements.js");
  createPublished = mod.createPublished;
  publishExisting = mod.publishExisting;
  isPublishStatusConflictError = mod.isPublishStatusConflictError;

  // Direct client for test data setup/cleanup and direct index operations.
  client = new MongoClient(uri);
  await client.connect();
  coll = client.db("wariseva").collection("announcements");
});

afterAll(async () => {
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

async function dropAllIndexes() {
  try {
    await coll.dropIndexes();
  } catch {
    // Ignore errors if no indexes exist
  }
}

async function insertPublishedDoc(overrides = {}) {
  const id = overrides.announcementId || `ANN-2026-${Math.floor(Math.random() * 1000).toString().padStart(3, "0")}`;
  return coll.insertOne({
    announcementId: id,
    title: overrides.title || "Test",
    description: overrides.description || "Desc",
    category: overrides.category || "general",
    status: "published",
    priority: overrides.priority || "medium",
    publishDate: overrides.publishDate || new Date(),
    createdAt: new Date(),
    updatedAt: new Date(),
    ...overrides,
  });
}

async function countPublished() {
  return coll.countDocuments({ status: "published" });
}

async function createPartialUniqueIndex() {
  return coll.createIndex(
    { status: 1 },
    { unique: true, partialFilterExpression: { status: "published" }, name: INDEX_NAME }
  );
}

// ── Unique partial index — behavior tests ──
describe("Unique partial index — behavior", () => {
  beforeEach(async () => {
    await coll.deleteMany({});
    await dropAllIndexes();
  });

  it("1. Creating the index succeeds when there are zero published announcements", async () => {
    await createPartialUniqueIndex();
    const indexes = await coll.indexes();
    const found = indexes.find((idx) => idx.name === INDEX_NAME);
    expect(found).toBeDefined();
    expect(found.unique).toBe(true);
    expect(found.partialFilterExpression).toEqual({ status: "published" });
  });

  it("2. Creating the index succeeds when there is exactly one published announcement", async () => {
    await insertPublishedDoc({ announcementId: "ANN-2026-001" });
    await createPartialUniqueIndex();
    const indexes = await coll.indexes();
    const found = indexes.find((idx) => idx.name === INDEX_NAME);
    expect(found).toBeDefined();
    expect(found.unique).toBe(true);
  });

  it("3. Creating the index fails when the collection already contains two published announcements", async () => {
    await insertPublishedDoc({ announcementId: "ANN-2026-001", title: "First" });
    await insertPublishedDoc({ announcementId: "ANN-2026-002", title: "Second" });
    await expect(createPartialUniqueIndex()).rejects.toThrow();
  });

  it("4. After the index exists, inserting a second published announcement is rejected with code 11000", async () => {
    await insertPublishedDoc({ announcementId: "ANN-2026-001", title: "First" });
    await createPartialUniqueIndex();
    await expect(
      coll.insertOne({
        announcementId: "ANN-2026-002",
        title: "Second",
        description: "Desc",
        category: "general",
        status: "published",
        priority: "medium",
        publishDate: new Date(),
        createdAt: new Date(),
        updatedAt: new Date(),
      })
    ).rejects.toMatchObject({ code: 11000 });
  });

  it("5. Multiple draft, scheduled, and archived announcements remain allowed with the index", async () => {
    await insertPublishedDoc({ announcementId: "ANN-2026-001", status: "published" });
    await createPartialUniqueIndex();

    await coll.insertOne({
      announcementId: "ANN-2026-002",
      title: "Draft",
      description: "D",
      category: "general",
      status: "draft",
      priority: "medium",
      publishDate: new Date(),
      createdAt: new Date(),
      updatedAt: new Date(),
    });
    await coll.insertOne({
      announcementId: "ANN-2026-003",
      title: "Scheduled",
      description: "D",
      category: "general",
      status: "scheduled",
      priority: "medium",
      publishDate: new Date(),
      createdAt: new Date(),
      updatedAt: new Date(),
    });
    await coll.insertOne({
      announcementId: "ANN-2026-004",
      title: "Archived",
      description: "D",
      category: "general",
      status: "archived",
      priority: "medium",
      publishDate: new Date(),
      createdAt: new Date(),
      updatedAt: new Date(),
    });

    const published = await countPublished();
    expect(published).toBe(1);
    const total = await coll.countDocuments({});
    expect(total).toBe(4);
  });

  it("6. Changing the current published announcement to draft allows a different announcement to become published", async () => {
    await insertPublishedDoc({ announcementId: "ANN-2026-001", status: "published" });
    await createPartialUniqueIndex();

    await coll.updateOne({ announcementId: "ANN-2026-001" }, { $set: { status: "draft" } });

    await coll.insertOne({
      announcementId: "ANN-2026-002",
      title: "New Published",
      description: "D",
      category: "general",
      status: "published",
      priority: "medium",
      publishDate: new Date(),
      createdAt: new Date(),
      updatedAt: new Date(),
    });

    const published = await countPublished();
    expect(published).toBe(1);
    const first = await coll.findOne({ announcementId: "ANN-2026-001" });
    expect(first.status).toBe("draft");
  });
});

// ── Unique partial index — concurrent publishing test ──
describe("Unique partial index — concurrent publishing", () => {
  beforeAll(async () => {
    await coll.deleteMany({});
    // Create the partial unique index once for all concurrency tests.
    await createPartialUniqueIndex();
  });

  beforeEach(async () => {
    await coll.deleteMany({});
    // Do not drop indexes here — the partial unique index must persist.
  });

  it("concurrent createPublished() results in at most one published announcement", async () => {
    let inFlight = 0;
    let maxConcurrent = 0;
    let callCount = 0;

    const trackedCreatePublished = async (doc) => {
      callCount++;
      inFlight++;
      maxConcurrent = Math.max(maxConcurrent, inFlight);
      try {
        return await createPublished(doc);
      } finally {
        inFlight--;
      }
    };

    const results = await Promise.allSettled([
      trackedCreatePublished({
        title: "Concurrent A",
        description: "Desc A",
        category: "general",
      }),
      trackedCreatePublished({
        title: "Concurrent B",
        description: "Desc B",
        category: "schedule",
      }),
    ]);

    // Verify concurrency was actually established at the test level
    expect(callCount).toBe(2);
    expect(maxConcurrent).toBe(2);

    // Verify at most one published announcement exists in the database
    const publishedCount = await countPublished();
    expect(publishedCount).toBeLessThanOrEqual(1);

    // Report outcomes for diagnostic purposes
    const statuses = results.map((r) => r.status);
    const fulfilledCount = statuses.filter((s) => s === "fulfilled").length;
    const rejectedCount = statuses.filter((s) => s === "rejected").length;

    // At least one must succeed (the collection started empty)
    expect(fulfilledCount).toBeGreaterThanOrEqual(1);

    // If one was rejected, verify it is a recognized status conflict
    if (rejectedCount > 0) {
      const rejected = results.find((r) => r.status === "rejected");
      expect(rejected.reason.code).toBe(11000);
      expect(isPublishStatusConflictError(rejected.reason)).toBe(true);
    }

    // Verify the fulfilled result is actually published
    const fulfilled = results.find((r) => r.status === "fulfilled");
    if (fulfilled) {
      expect(fulfilled.value.announcement.status).toBe("published");
    }
  });

  it("concurrent publishExisting() on two drafts results in at most one published announcement", async () => {
    // Seed two distinct draft announcements eligible for publication.
    await coll.insertOne({
      announcementId: "ANN-2026-001",
      title: "Draft A",
      description: "Desc A",
      category: "general",
      status: "draft",
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

    let inFlight = 0;
    let maxConcurrent = 0;
    let callCount = 0;

    const trackedPublishExisting = async (id) => {
      callCount++;
      inFlight++;
      maxConcurrent = Math.max(maxConcurrent, inFlight);
      try {
        return await publishExisting(id, { status: "published" });
      } finally {
        inFlight--;
      }
    };

    const results = await Promise.allSettled([
      trackedPublishExisting("ANN-2026-001"),
      trackedPublishExisting("ANN-2026-002"),
    ]);

    // Verify concurrency was actually established at the test level
    expect(callCount).toBe(2);
    expect(maxConcurrent).toBe(2);

    // Verify at most one published announcement exists in the database
    const publishedCount = await countPublished();
    expect(publishedCount).toBeLessThanOrEqual(1);

    // Report outcomes for diagnostic purposes
    const statuses = results.map((r) => r.status);
    const fulfilledCount = statuses.filter((s) => s === "fulfilled").length;
    const rejectedCount = statuses.filter((s) => s === "rejected").length;

    // At least one should succeed (both drafts were eligible)
    expect(fulfilledCount).toBeGreaterThanOrEqual(1);

    // If one was rejected, verify it is a recognized status conflict
    if (rejectedCount > 0) {
      const rejected = results.find((r) => r.status === "rejected");
      expect(rejected.reason.code).toBe(11000);
      expect(isPublishStatusConflictError(rejected.reason)).toBe(true);
    }

    // Verify the fulfilled result is actually published
    const fulfilled = results.find((r) => r.status === "fulfilled");
    if (fulfilled) {
      expect(fulfilled.value.announcement.status).toBe("published");
    }
  });
});
