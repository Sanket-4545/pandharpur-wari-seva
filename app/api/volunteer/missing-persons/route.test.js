import { describe, it, expect, beforeAll, afterAll, beforeEach, vi } from "vitest";
import { MongoMemoryReplSet } from "mongodb-memory-server";
import { MongoClient } from "mongodb";

// ── Mocks ──────────────────────────────────────────────────────────────
// Mock @/lib/api-helpers (imports Next.js modules unavailable in Vitest).
// Response helpers return plain objects with a `status` and `body` property
// so tests can assert HTTP status codes and payloads without NextResponse.
// Auth helpers are vi.fn() so each test controls the authentication result.
vi.mock("@/lib/api-helpers", () => {
  class ValidationError extends Error {
    constructor(message) {
      super(message);
      this.name = "ValidationError";
    }
  }
  class AuthError extends Error {
    constructor(message, status = 401, code = undefined) {
      super(message);
      this.status = status;
      this.code = code;
      this.name = "AuthError";
    }
  }
  const json = (body, status = 200) => ({ status, body });
  const errorResponse = (message, status = 400) =>
    json({ success: false, error: message }, status);
  const sanitizeDocId = (doc) => {
    if (!doc) return null;
    const { _id, ...rest } = doc;
    return { ...rest, _id: _id?.toString?.() ?? _id };
  };
  return {
    ValidationError,
    AuthError,
    successResponse: (data, status = 200) => json({ success: true, data }, status),
    createdResponse: (data) => json({ success: true, data }, 201),
    errorResponse,
    notFoundResponse: (entity = "Resource") => errorResponse(`${entity} not found`, 404),
    forbiddenResponse: (message = "Access denied") => errorResponse(message, 403),
    conflictResponse: (message = "Resource already exists") => errorResponse(message, 409),
    sanitizeDocId,
    sanitizeDocIds: (docs) => docs.map(sanitizeDocId),
    parseQueryParams: (request) => {
      const { searchParams } = new URL(request.url);
      const page = Math.max(1, parseInt(searchParams.get("page") || "1", 10));
      const limit = Math.min(100, Math.max(1, parseInt(searchParams.get("limit") || "20", 10)));
      return {
        page,
        limit,
        skip: (page - 1) * limit,
        sort: "createdAt",
        order: -1,
        search: searchParams.get("search") || "",
        status: searchParams.get("status") || "",
        category: searchParams.get("category") || "",
      };
    },
    paginatedResponse: (data, total, page, limit) =>
      json({
        success: true,
        data: {
          items: data,
          pagination: { page, limit, total, totalPages: Math.ceil(total / limit) || 1 },
        },
      }),
    requireVolunteerAuth: vi.fn(),
    requireRole: vi.fn(),
    isAdminUser: vi.fn(),
    handleAuthError: (error) => {
      if (error instanceof AuthError) return errorResponse(error.message, error.status);
      if (error instanceof ValidationError) return errorResponse(error.message, 400);
      return errorResponse("An unexpected error occurred", 500);
    },
    handleApiError: (error, defaultMessage = "An unexpected error occurred") => {
      if (error instanceof ValidationError) return errorResponse(error.message, 400);
      if (error instanceof AuthError) return errorResponse(error.message, error.status);
      return errorResponse(defaultMessage, 500);
    },
  };
});

// ── Environment ────────────────────────────────────────────────────────
// Isolated temporary MongoDB replica set. Never connects to any production
// database. MONGODB_URI is set only in process memory, never written to
// .env.local, and never logged.
let replSet;
let client;
let coll;
let volunteerRoute;
let resolveRoute;
let adminListRoute;
let helpers;

const VOLUNTEER = {
  volunteerId: "VOL2026042",
  name: "Resolving Volunteer",
  volunteer: {
    volunteerId: "VOL2026042",
    name: "Resolving Volunteer",
    status: "approved",
    isActive: true,
  },
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

  // Set MONGODB_URI before importing route/model modules so they connect to
  // the temporary local test server, not any production database.
  process.env.MONGODB_URI = uri;

  volunteerRoute = await import("./route.js");
  resolveRoute = await import("./[id]/resolve/route.js");
  adminListRoute = await import("@/app/api/missing-persons/route.js");
  helpers = await import("@/lib/api-helpers");

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
  helpers.requireVolunteerAuth.mockResolvedValue(VOLUNTEER);
  helpers.isAdminUser.mockResolvedValue(true);
  helpers.requireRole.mockResolvedValue({ role: "admin" });
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

function getRequest(url) {
  return { url, method: "GET", headers: new Headers() };
}

function patchRequest(url) {
  return {
    url,
    method: "PATCH",
    headers: new Headers(),
    json: async () => ({}),
  };
}

describe("GET /api/volunteer/missing-persons — active list", () => {
  it("returns only open cases (Pending, Missing) for status=active", async () => {
    await insertCase({ caseId: "MP-2026-001", status: "Missing", name: "Active Missing" });
    await insertCase({ caseId: "MP-2026-002", status: "Pending", name: "Active Pending" });
    await insertCase({ caseId: "MP-2026-003", status: "Found", name: "Resolved" });
    await insertCase({ caseId: "MP-2026-004", status: "Rejected", name: "Rejected" });

    const res = await volunteerRoute.GET(
      getRequest("http://test.local/api/volunteer/missing-persons?status=active")
    );

    expect(res.status).toBe(200);
    const names = res.body.data.items.map((i) => i.name).sort();
    expect(names).toEqual(["Active Missing", "Active Pending"]);
    expect(res.body.data.pagination.total).toBe(2);
  });

  it("keeps backward compatibility for explicit status filters", async () => {
    await insertCase({ caseId: "MP-2026-001", status: "Missing" });
    await insertCase({ caseId: "MP-2026-002", status: "Found" });

    const res = await volunteerRoute.GET(
      getRequest("http://test.local/api/volunteer/missing-persons?status=Found")
    );

    expect(res.status).toBe(200);
    expect(res.body.data.items).toHaveLength(1);
    expect(res.body.data.items[0].status).toBe("Found");
  });

  it("without a status filter still returns every status", async () => {
    await insertCase({ caseId: "MP-2026-001", status: "Missing" });
    await insertCase({ caseId: "MP-2026-002", status: "Found" });
    await insertCase({ caseId: "MP-2026-003", status: "Pending" });

    const res = await volunteerRoute.GET(
      getRequest("http://test.local/api/volunteer/missing-persons")
    );

    expect(res.status).toBe(200);
    expect(res.body.data.items).toHaveLength(3);
  });

  it("requires an authenticated volunteer", async () => {
    helpers.requireVolunteerAuth.mockRejectedValue(
      new helpers.AuthError("Authentication required", 401)
    );

    const res = await volunteerRoute.GET(
      getRequest("http://test.local/api/volunteer/missing-persons?status=active")
    );

    expect(res.status).toBe(401);
    expect(res.body.success).toBe(false);
  });
});

describe("PATCH /api/volunteer/missing-persons/[id]/resolve — mark as found", () => {
  it("marks an active case as Found and records the resolving volunteer", async () => {
    await insertCase({ caseId: "MP-2026-001", status: "Missing" });

    const res = await resolveRoute.PATCH(patchRequest("http://test.local/x"), {
      params: { id: "MP-2026-001" },
    });

    expect(res.status).toBe(200);
    expect(res.body.success).toBe(true);
    expect(res.body.data.status).toBe("Found");
    expect(res.body.data.resolvedAt).toBeTruthy();
    expect(res.body.data.resolvedByVolunteerId).toBe("VOL2026042");
    expect(res.body.data.resolvedByName).toBe("Resolving Volunteer");
    // Reporter and case details are preserved.
    expect(res.body.data.volunteerId).toBe("VOL2026001");
    expect(res.body.data.name).toBe("Test Person");
  });

  it("removes the resolved case from the active list; other cases are unchanged", async () => {
    await insertCase({ caseId: "MP-2026-001", status: "Missing", name: "Case One" });
    await insertCase({ caseId: "MP-2026-002", status: "Missing", name: "Case Two" });
    await insertCase({ caseId: "MP-2026-003", status: "Pending", name: "Case Three" });

    const res = await resolveRoute.PATCH(patchRequest("http://test.local/x"), {
      params: { id: "MP-2026-001" },
    });
    expect(res.status).toBe(200);

    const active = await volunteerRoute.GET(
      getRequest("http://test.local/api/volunteer/missing-persons?status=active")
    );
    const activeNames = active.body.data.items.map((i) => i.name).sort();
    expect(activeNames).toEqual(["Case Three", "Case Two"]);

    const two = await coll.findOne({ caseId: "MP-2026-002" });
    expect(two.status).toBe("Missing");
    expect(two.resolvedAt).toBeUndefined();
    const three = await coll.findOne({ caseId: "MP-2026-003" });
    expect(three.status).toBe("Pending");
    expect(three.resolvedAt).toBeUndefined();
  });

  it("rejects repeated resolution with 409 and keeps the original resolver", async () => {
    await insertCase({ caseId: "MP-2026-001", status: "Missing" });

    const first = await resolveRoute.PATCH(patchRequest("http://test.local/x"), {
      params: { id: "MP-2026-001" },
    });
    expect(first.status).toBe(200);

    const second = await resolveRoute.PATCH(patchRequest("http://test.local/x"), {
      params: { id: "MP-2026-001" },
    });
    expect(second.status).toBe(409);
    expect(second.body.success).toBe(false);

    const current = await coll.findOne({ caseId: "MP-2026-001" });
    expect(current.status).toBe("Found");
    expect(current.resolvedByVolunteerId).toBe("VOL2026042");
    expect(current.resolvedAt.getTime()).toBe(first.body.data.resolvedAt.getTime());
  });

  it("returns 404 for malformed case IDs", async () => {
    const res = await resolveRoute.PATCH(patchRequest("http://test.local/x"), {
      params: { id: "not-a-case-id" },
    });
    expect(res.status).toBe(404);
    expect(helpers.requireVolunteerAuth).toHaveBeenCalled();
  });

  it("returns 404 for unknown case IDs", async () => {
    const res = await resolveRoute.PATCH(patchRequest("http://test.local/x"), {
      params: { id: "MP-2026-999" },
    });
    expect(res.status).toBe(404);
  });

  it("returns 400 for cases that cannot be resolved (Rejected)", async () => {
    await insertCase({ caseId: "MP-2026-001", status: "Rejected" });

    const res = await resolveRoute.PATCH(patchRequest("http://test.local/x"), {
      params: { id: "MP-2026-001" },
    });
    expect(res.status).toBe(400);

    const current = await coll.findOne({ caseId: "MP-2026-001" });
    expect(current.status).toBe("Rejected");
    expect(current.resolvedAt).toBeUndefined();
  });

  it("rejects unauthenticated resolve attempts and changes nothing", async () => {
    await insertCase({ caseId: "MP-2026-001", status: "Missing" });
    helpers.requireVolunteerAuth.mockRejectedValue(
      new helpers.AuthError("Authentication required", 401)
    );

    const res = await resolveRoute.PATCH(patchRequest("http://test.local/x"), {
      params: { id: "MP-2026-001" },
    });
    expect(res.status).toBe(401);

    const current = await coll.findOne({ caseId: "MP-2026-001" });
    expect(current.status).toBe("Missing");
    expect(current.resolvedAt).toBeUndefined();
  });

  it("resolves Pending cases too (they are active)", async () => {
    await insertCase({ caseId: "MP-2026-001", status: "Pending" });

    const res = await resolveRoute.PATCH(patchRequest("http://test.local/x"), {
      params: { id: "MP-2026-001" },
    });
    expect(res.status).toBe(200);
    expect(res.body.data.status).toBe("Found");
  });
});

describe("GET /api/missing-persons — admin archive view", () => {
  it("lets an authorized admin list resolved cases (status=Found)", async () => {
    await insertCase({ caseId: "MP-2026-001", status: "Missing" });
    await insertCase({
      caseId: "MP-2026-002",
      status: "Found",
      resolvedAt: new Date("2026-06-02T10:00:00Z"),
      resolvedByVolunteerId: "VOL2026042",
      resolvedByName: "Resolving Volunteer",
    });

    const res = await adminListRoute.GET(
      getRequest("http://test.local/api/missing-persons?status=Found")
    );

    expect(res.status).toBe(200);
    expect(res.body.data.items).toHaveLength(1);
    expect(res.body.data.items[0].caseId).toBe("MP-2026-002");
    expect(res.body.data.items[0].resolvedByVolunteerId).toBe("VOL2026042");
    // Admins keep full visibility of contact details.
    expect(res.body.data.items[0].contactPhone).toBe("9876543210");
  });

  it("keeps the public view restricted to Missing/Found without contact phone", async () => {
    helpers.isAdminUser.mockResolvedValue(false);
    await insertCase({ caseId: "MP-2026-001", status: "Missing" });
    await insertCase({ caseId: "MP-2026-002", status: "Found" });
    await insertCase({ caseId: "MP-2026-003", status: "Pending" });
    await insertCase({ caseId: "MP-2026-004", status: "Rejected" });

    const res = await adminListRoute.GET(
      getRequest("http://test.local/api/missing-persons")
    );

    expect(res.status).toBe(200);
    const statuses = res.body.data.items.map((i) => i.status).sort();
    expect(statuses).toEqual(["Found", "Missing"]);
    for (const item of res.body.data.items) {
      expect(item.contactPhone).toBeUndefined();
    }
  });
});
