import { describe, it, expect, beforeAll, afterAll, beforeEach, vi } from "vitest";
import { MongoMemoryReplSet } from "mongodb-memory-server";
import { MongoClient } from "mongodb";

// Mock @/lib/api-helpers since it imports Next.js modules (next/server,
// next/headers) that are unavailable in plain Node.js / Vitest. Only
// ValidationError is needed by the missing-persons model.
vi.mock("@/lib/api-helpers", () => ({
  ValidationError: class ValidationError extends Error {
    constructor(message) {
      super(message);
      this.name = "ValidationError";
    }
  },
}));

// Isolated temporary MongoDB replica set for the resolve/status tests.
// Never connects to any production database. MONGODB_URI is set only in
// process memory, never written to .env.local, and never logged.
let replSet;
let client;
let coll;
let MissingPersons;
let ValidationError;

beforeAll(async () => {
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
  // the temporary test server, not any production database.
  const mod = await import("./missingPersons.js");
  MissingPersons = mod;

  const helpers = await import("@/lib/api-helpers");
  ValidationError = helpers.ValidationError;

  // Direct client for test data setup/cleanup (bypasses model validation).
  client = new MongoClient(uri);
  await client.connect();
  coll = client.db("wariseva").collection("missing_persons");
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

beforeEach(async () => {
  await coll.deleteMany({});
});

async function insertCase(overrides = {}) {
  const caseId = overrides.caseId || "MP-2026-001";
  await coll.insertOne({
    caseId,
    volunteerId: "VOL2026001",
    name: "Test Person",
    gender: "Male",
    category: "Male",
    age: 30,
    lastSeenLocation: "Pandharpur Temple",
    contactPhone: "9876543210",
    clothing: "White kurta",
    status: "Missing",
    dateReported: new Date("2026-06-01T08:00:00Z"),
    createdAt: new Date("2026-06-01T08:00:00Z"),
    updatedAt: new Date("2026-06-01T08:00:00Z"),
    ...overrides,
  });
  return coll.findOne({ caseId });
}

describe("MissingPersons.resolveAsFound", () => {
  it("transitions a Missing case to Found and records resolution metadata", async () => {
    await insertCase({ status: "Missing" });

    const updated = await MissingPersons.resolveAsFound("MP-2026-001", {
      volunteerId: "VOL2026042",
      name: "Resolving Volunteer",
    });

    expect(updated).toBeTruthy();
    expect(updated.status).toBe("Found");
    expect(updated.resolvedAt).toBeInstanceOf(Date);
    expect(updated.resolvedByVolunteerId).toBe("VOL2026042");
    expect(updated.resolvedByName).toBe("Resolving Volunteer");
    // Unrelated fields are preserved.
    expect(updated.name).toBe("Test Person");
    expect(updated.volunteerId).toBe("VOL2026001");
  });

  it("transitions a Pending case to Found", async () => {
    await insertCase({ status: "Pending" });

    const updated = await MissingPersons.resolveAsFound("MP-2026-001", {
      volunteerId: "VOL2026042",
    });

    expect(updated).toBeTruthy();
    expect(updated.status).toBe("Found");
    expect(updated.resolvedByVolunteerId).toBe("VOL2026042");
  });

  it("does not affect any other case when resolving one case", async () => {
    await insertCase({ caseId: "MP-2026-001", status: "Missing", name: "Case One" });
    await insertCase({ caseId: "MP-2026-002", status: "Missing", name: "Case Two" });
    await insertCase({ caseId: "MP-2026-003", status: "Pending", name: "Case Three" });

    await MissingPersons.resolveAsFound("MP-2026-001", { volunteerId: "VOL2026042" });

    const one = await coll.findOne({ caseId: "MP-2026-001" });
    const two = await coll.findOne({ caseId: "MP-2026-002" });
    const three = await coll.findOne({ caseId: "MP-2026-003" });

    expect(one.status).toBe("Found");
    expect(two.status).toBe("Missing");
    expect(two.resolvedAt).toBeUndefined();
    expect(three.status).toBe("Pending");
    expect(three.resolvedAt).toBeUndefined();
  });

  it("returns null on repeated resolution and preserves the original resolution", async () => {
    const first = await insertCase({ status: "Missing" });

    const firstResolve = await MissingPersons.resolveAsFound("MP-2026-001", {
      volunteerId: "VOL2026042",
      name: "First Resolver",
    });
    expect(firstResolve).toBeTruthy();

    const secondResolve = await MissingPersons.resolveAsFound("MP-2026-001", {
      volunteerId: "VOL2026099",
      name: "Second Resolver",
    });
    expect(secondResolve).toBeNull();

    const current = await coll.findOne({ caseId: "MP-2026-001" });
    expect(current.status).toBe("Found");
    expect(current.resolvedByVolunteerId).toBe("VOL2026042");
    expect(current.resolvedByName).toBe("First Resolver");
    expect(current.resolvedAt.getTime()).toBe(firstResolve.resolvedAt.getTime());
    expect(current.updatedAt.getTime()).toBe(firstResolve.resolvedAt.getTime());
    expect(current.createdAt.getTime()).toBe(first.createdAt.getTime());
  });

  it("returns null and leaves a Rejected case untouched", async () => {
    await insertCase({ status: "Rejected" });

    const result = await MissingPersons.resolveAsFound("MP-2026-001", {
      volunteerId: "VOL2026042",
    });

    expect(result).toBeNull();
    const current = await coll.findOne({ caseId: "MP-2026-001" });
    expect(current.status).toBe("Rejected");
    expect(current.resolvedAt).toBeUndefined();
  });

  it("returns null for an unknown case ID", async () => {
    const result = await MissingPersons.resolveAsFound("MP-2026-999", {
      volunteerId: "VOL2026042",
    });
    expect(result).toBeNull();
  });

  it("works without a resolver identity (fields stay unset)", async () => {
    await insertCase({ status: "Missing" });

    const updated = await MissingPersons.resolveAsFound("MP-2026-001");

    expect(updated.status).toBe("Found");
    expect(updated.resolvedAt).toBeInstanceOf(Date);
    expect(updated.resolvedByVolunteerId).toBeUndefined();
    expect(updated.resolvedByName).toBeUndefined();
  });
});

describe("MissingPersons.updateStatus — resolution timestamps", () => {
  it("records resolvedAt when an admin transitions Missing -> Found", async () => {
    await insertCase({ status: "Missing" });

    await MissingPersons.updateStatus("MP-2026-001", "Found");

    const current = await coll.findOne({ caseId: "MP-2026-001" });
    expect(current.status).toBe("Found");
    expect(current.resolvedAt).toBeInstanceOf(Date);
  });

  it("clears resolution history when a Found case is reopened as Missing", async () => {
    await insertCase({
      status: "Found",
      resolvedAt: new Date("2026-06-02T10:00:00Z"),
      resolvedByVolunteerId: "VOL2026042",
      resolvedByName: "Resolving Volunteer",
    });

    await MissingPersons.updateStatus("MP-2026-001", "Missing");

    const current = await coll.findOne({ caseId: "MP-2026-001" });
    expect(current.status).toBe("Missing");
    expect(current.resolvedAt).toBeUndefined();
    expect(current.resolvedByVolunteerId).toBeUndefined();
    expect(current.resolvedByName).toBeUndefined();
  });

  it("still rejects invalid transitions such as Pending -> Found", async () => {
    await insertCase({ status: "Pending" });

    await expect(MissingPersons.updateStatus("MP-2026-001", "Found")).rejects.toThrow(
      ValidationError
    );
    const current = await coll.findOne({ caseId: "MP-2026-001" });
    expect(current.status).toBe("Pending");
  });

  it("still rejects unknown status values", async () => {
    await insertCase({ status: "Missing" });

    await expect(
      MissingPersons.updateStatus("MP-2026-001", "Resolved")
    ).rejects.toThrow(ValidationError);
  });
});

describe("MissingPersons.isValidCaseId", () => {
  it("accepts generated case IDs", () => {
    expect(MissingPersons.isValidCaseId("MP-2026-001")).toBe(true);
    expect(MissingPersons.isValidCaseId("MP-2026-1000")).toBe(true);
  });

  it("rejects malformed or missing IDs", () => {
    expect(MissingPersons.isValidCaseId("bad-id")).toBe(false);
    expect(MissingPersons.isValidCaseId("MP-2026-")).toBe(false);
    expect(MissingPersons.isValidCaseId("")).toBe(false);
    expect(MissingPersons.isValidCaseId(null)).toBe(false);
    expect(MissingPersons.isValidCaseId(undefined)).toBe(false);
    expect(MissingPersons.isValidCaseId(123)).toBe(false);
    expect(MissingPersons.isValidCaseId({ $ne: null })).toBe(false);
  });
});

describe("MissingPersons.ACTIVE_STATUSES", () => {
  it("covers exactly the open case statuses", () => {
    expect([...MissingPersons.ACTIVE_STATUSES].sort()).toEqual(["Missing", "Pending"]);
  });
});
