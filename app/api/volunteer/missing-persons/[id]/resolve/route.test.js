import { describe, it, expect, beforeAll, afterAll, beforeEach, vi } from "vitest";
import { MongoMemoryReplSet } from "mongodb-memory-server";
import { MongoClient } from "mongodb";

// ── Mocks ──────────────────────────────────────────────────────────────
// Mock @/lib/api-helpers (imports Next.js modules unavailable in Vitest).
// Response helpers return plain objects with a `status` property so tests
// can assert HTTP status codes without NextResponse.
vi.mock("@/lib/api-helpers", () => {
  class ValidationError extends Error {
    constructor(message) {
      super(message);
      this.name = "ValidationError";
    }
  }
  class AuthError extends Error {
    constructor(message, status = 401) {
      super(message);
      this.status = status;
      this.name = "AuthError";
    }
  }
  const sanitizeDocId = (doc) => {
    if (!doc) return null;
    const { _id, ...rest } = doc;
    return { ...rest, _id: _id?.toString?.() ?? _id };
  };
  return {
    ValidationError,
    AuthError,
    successResponse: (data, status = 200) => ({ success: true, data, status }),
    errorResponse: (message, status = 400) => ({ success: false, error: message, status }),
    notFoundResponse: (entity = "Resource") => ({
      success: false,
      error: `${entity} not found`,
      status: 404,
    }),
    conflictResponse: (message = "Resource already exists") => ({
      success: false,
      error: message,
      status: 409,
    }),
    handleAuthError: (error) => {
      if (error instanceof AuthError) {
        return { success: false, error: error.message, status: error.status };
      }
      return { success: false, error: error?.message || "Error", status: 500 };
    },
    sanitizeDocId,
    sanitizeDocIds: (docs) => docs.map(sanitizeDocId),
    requireVolunteerAuth: vi.fn(),
  };
});

// ── Test setup ─────────────────────────────────────────────────────────
// Isolated temporary MongoDB replica set. Never connects to any production
// database. MONGODB_URI is set only in process memory.
let replSet;
let client;
let coll;
let resolveRoute;
let requireVolunteerAuth;
let AuthError;

const AUTHENTICATED_VOLUNTEER = {
  volunteerId: "VOL2026042",
  email: "volunteer@example.com",
  name: "Resolving Volunteer",
  type: "volunteer",
  volunteer: { volunteerId: "VOL2026042", name: "Resolving Volunteer", isActive: true, status: "approved" },
};

beforeAll(async () => {
  replSet = await MongoMemoryReplSet.create({
    instanceOpts: [{ dbName: "wariseva" }],
    replSet: { name: "testset", count: 1 },
  });
  await replSet.waitUntilRunning();

  const uri = replSet.getUri("wariseva");
  if (!uri.includes("127.0.0.1") && !uri.includes("localhost")) {
    throw new Error(`Unexpected MongoDB URI host: ${uri}`);
  }
  if (!uri.includes("replicaSet=testset")) {
    throw new Error(`Missing replicaSet parameter in URI: ${uri}`);
  }

  process.env.MONGODB_URI = uri;

  const apiHelpers = await import("@/lib/api-helpers");
  requireVolunteerAuth = apiHelpers.requireVolunteerAuth;
  AuthError = apiHelpers.AuthError;

  const mod = await import("./route.js");
  resolveRoute = mod;

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
  vi.clearAllMocks();
  // Default: an authenticated, approved volunteer session.
  requireVolunteerAuth.mockResolvedValue(AUTHENTICATED_VOLUNTEER);
});

// ── Helpers ────────────────────────────────────────────────────────────
function createMockRequest(method = "PATCH") {
  return {
    method,
    url: "http://localhost/api/volunteer/missing-persons/MP-2026-001/resolve",
    headers: new Headers(),
    json: async () => ({}),
  };
}

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
    status: "Missing",
    dateReported: new Date("2026-06-01T08:00:00Z"),
    createdAt: new Date("2026-06-01T08:00:00Z"),
    updatedAt: new Date("2026-06-01T08:00:00Z"),
    ...overrides,
  });
  return coll.findOne({ caseId });
}

function callRoute(caseId = "MP-2026-001") {
  return resolveRoute.PATCH(createMockRequest(), { params: { id: caseId } });
}

// ── Tests ──────────────────────────────────────────────────────────────
describe("PATCH /api/volunteer/missing-persons/[id]/resolve", () => {
  it("1. rejects unauthenticated requests with 401", async () => {
    requireVolunteerAuth.mockRejectedValue(
      new AuthError("Volunteer authentication required", 401)
    );

    const response = await callRoute();

    expect(response.status).toBe(401);
    const saved = await coll.findOne({ caseId: "MP-2026-001" });
    expect(saved).toBeNull();
  });

  it("2. rejects deactivated volunteers with 403", async () => {
    requireVolunteerAuth.mockRejectedValue(
      new AuthError("Your account has been deactivated. Please contact the administrator.", 403)
    );
    await insertCase({ status: "Missing" });

    const response = await callRoute();

    expect(response.status).toBe(403);
    const saved = await coll.findOne({ caseId: "MP-2026-001" });
    expect(saved.status).toBe("Missing");
  });

  it("3. rejects malformed case IDs with 404 without touching the database", async () => {
    await insertCase({ status: "Missing" });

    const response = await callRoute("not-a-case-id");

    expect(response.status).toBe(404);
    // The valid case remains untouched.
    const saved = await coll.findOne({ caseId: "MP-2026-001" });
    expect(saved.status).toBe("Missing");
  });

  it("4. returns 404 for a well-formed but unknown case ID", async () => {
    const response = await callRoute("MP-2026-999");
    expect(response.status).toBe(404);
  });

  it("5. marks a Missing case as Found and records the resolving volunteer", async () => {
    await insertCase({ status: "Missing" });

    const response = await callRoute("MP-2026-001");

    expect(response.status).toBe(200);
    expect(response.success).toBe(true);
    expect(response.data.status).toBe("Found");
    expect(response.data.resolvedByVolunteerId).toBe("VOL2026042");
    expect(response.data.resolvedByName).toBe("Resolving Volunteer");
    expect(response.data.resolvedAt).toBeTruthy();

    const saved = await coll.findOne({ caseId: "MP-2026-001" });
    expect(saved.status).toBe("Found");
    expect(saved.resolvedByVolunteerId).toBe("VOL2026042");
  });

  it("6. marks a Pending case as Found", async () => {
    await insertCase({ status: "Pending" });

    const response = await callRoute("MP-2026-001");

    expect(response.status).toBe(200);
    expect(response.data.status).toBe("Found");
  });

  it("7. returns 409 on repeated resolution and preserves the original resolution", async () => {
    await insertCase({
      status: "Found",
      resolvedAt: new Date("2026-06-02T10:00:00Z"),
      resolvedByVolunteerId: "VOL2026042",
      resolvedByName: "First Resolver",
    });

    const response = await callRoute("MP-2026-001");

    expect(response.status).toBe(409);
    const saved = await coll.findOne({ caseId: "MP-2026-001" });
    expect(saved.status).toBe("Found");
    expect(saved.resolvedByVolunteerId).toBe("VOL2026042");
    expect(saved.resolvedByName).toBe("First Resolver");
    expect(saved.resolvedAt.toISOString()).toBe("2026-06-02T10:00:00.000Z");
  });

  it("8. rejects resolving a Rejected case with 400 and leaves it unchanged", async () => {
    await insertCase({ status: "Rejected" });

    const response = await callRoute("MP-2026-001");

    expect(response.status).toBe(400);
    const saved = await coll.findOne({ caseId: "MP-2026-001" });
    expect(saved.status).toBe("Rejected");
    expect(saved.resolvedAt).toBeUndefined();
  });

  it("9. resolving one case does not affect other cases", async () => {
    await insertCase({ caseId: "MP-2026-001", status: "Missing", name: "Case One" });
    await insertCase({ caseId: "MP-2026-002", status: "Missing", name: "Case Two" });
    await insertCase({ caseId: "MP-2026-003", status: "Pending", name: "Case Three" });

    const response = await callRoute("MP-2026-001");

    expect(response.status).toBe(200);
    const one = await coll.findOne({ caseId: "MP-2026-001" });
    const two = await coll.findOne({ caseId: "MP-2026-002" });
    const three = await coll.findOne({ caseId: "MP-2026-003" });
    expect(one.status).toBe("Found");
    expect(two.status).toBe("Missing");
    expect(two.resolvedAt).toBeUndefined();
    expect(three.status).toBe("Pending");
    expect(three.resolvedAt).toBeUndefined();
  });

  it("10. two concurrent resolutions resolve the case exactly once", async () => {
    await insertCase({ status: "Missing" });

    const [first, second] = await Promise.all([
      callRoute("MP-2026-001"),
      callRoute("MP-2026-001"),
    ]);

    const statuses = [first.status, second.status].sort();
    expect(statuses).toEqual([200, 409]);

    const saved = await coll.findOne({ caseId: "MP-2026-001" });
    expect(saved.status).toBe("Found");
  });

  it("11. does not allow the reporter-only PATCH edit route semantics to leak in (any approved volunteer can resolve)", async () => {
    // Case reported by a different volunteer; the authenticated volunteer
    // (VOL2026042) is not the reporter but may still confirm the find.
    await insertCase({ status: "Missing", volunteerId: "VOL2026001" });

    const response = await callRoute("MP-2026-001");

    expect(response.status).toBe(200);
    const saved = await coll.findOne({ caseId: "MP-2026-001" });
    expect(saved.status).toBe("Found");
    // The reporting volunteer is preserved; resolution identity is separate.
    expect(saved.volunteerId).toBe("VOL2026001");
    expect(saved.resolvedByVolunteerId).toBe("VOL2026042");
  });
});
