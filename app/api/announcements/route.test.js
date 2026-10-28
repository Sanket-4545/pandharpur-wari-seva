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
    createdResponse: (data) => ({ success: true, data, status: 201 }),
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
    handleApiError: (error) => ({
      success: false,
      error: error?.message || "Error",
      status: 500,
    }),
    handleAuthError: (error) => {
      if (error instanceof AuthError) {
        return { success: false, error: error.message, status: error.status };
      }
      return { success: false, error: error?.message || "Error", status: 500 };
    },
    requireRole: vi.fn(async () => ({ role: "super_admin" })),
    isAdminUser: vi.fn(async () => false),
    sanitizeDocId,
    sanitizeDocIds: (docs) => docs.map(sanitizeDocId),
    parseQueryParams: vi.fn(() => ({
      page: 1,
      limit: 20,
      skip: 0,
      status: "",
      category: "",
      sort: "createdAt",
      order: -1,
      search: "",
    })),
    paginatedResponse: (data, total, page, limit) => ({
      success: true,
      data: {
        items: data,
        pagination: {
          page,
          limit,
          total,
          totalPages: Math.ceil(total / limit) || 1,
        },
      },
      status: 200,
    }),
  };
});

// Mock @/lib/push-notifications so no real notifications are sent.
vi.mock("@/lib/push-notifications", () => ({
  sendPushToAllVolunteers: vi.fn(async () => ({ sent: 0, failed: 0 })),
}));

import { sendPushToAllVolunteers as mockSendPush } from "@/lib/push-notifications";

// ── Test setup ─────────────────────────────────────────────────────────
let replSet;
let client;
let coll;

let announcementsRoute;
let announcementsIdRoute;
let archiveRoute;
let restoreRoute;
let Announcements;
let requireRole;
let isAdminUser;

beforeAll(async () => {
  const apiHelpers = await import("@/lib/api-helpers");
  requireRole = apiHelpers.requireRole;
  isAdminUser = apiHelpers.isAdminUser;
  // Start an isolated, temporary local MongoDB replica set (transactions
  // require a replica set). Never connects to any production database.
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

  // Set MONGODB_URI before importing model/route modules.
  process.env.MONGODB_URI = uri;

  // Import route modules after env var is set.
  const announcementsMod = await import("./route.js");
  announcementsRoute = announcementsMod;

  const idMod = await import("./[id]/route.js");
  announcementsIdRoute = idMod;

  const archiveMod = await import("./[id]/archive/route.js");
  archiveRoute = archiveMod;

  const restoreMod = await import("./[id]/restore/route.js");
  restoreRoute = restoreMod;

  const modelsMod = await import("@/lib/models");
  Announcements = modelsMod.Announcements;

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

beforeEach(async () => {
  await coll.deleteMany({});
  // Reset mock call history but keep implementations.
  vi.clearAllMocks();
  // Default: admin auth passes.
  requireRole.mockResolvedValue({ role: "super_admin" });
  isAdminUser.mockResolvedValue(false);
  mockSendPush.mockResolvedValue({ sent: 0, failed: 0 });
});

// ── Helpers ────────────────────────────────────────────────────────────
function createMockRequest(body = {}, url = "http://localhost/api/announcements", method = "POST") {
  return {
    json: async () => body,
    url,
    method,
    headers: new Headers(),
  };
}

async function insertAnnouncement(overrides = {}) {
  const id = overrides.announcementId || "ANN-2026-001";
  return coll.insertOne({
    announcementId: id,
    title: overrides.title || "Test Announcement",
    description: overrides.description || "Description",
    category: overrides.category || "general",
    status: overrides.status || "draft",
    priority: overrides.priority || "medium",
    publishDate: overrides.publishDate || new Date(),
    createdAt: new Date(),
    updatedAt: new Date(),
    ...overrides,
  });
}

function statusConflictError() {
  const err = new Error("E11000 duplicate key");
  err.code = 11000;
  err.keyPattern = { status: 1 };
  err.keyValue = { status: "published" };
  return err;
}

function announcementIdConflictError() {
  const err = new Error("E11000 duplicate key");
  err.code = 11000;
  err.keyPattern = { announcementId: 1 };
  err.keyValue = { announcementId: "ANN-2026-001" };
  return err;
}

// ── A. POST /api/announcements ─────────────────────────────────────────
describe("POST /api/announcements", () => {
  it("1. creating a published announcement returns 201 and publishes the new announcement", async () => {
    const response = await announcementsRoute.POST(
      createMockRequest({
        title: "New Published",
        description: "Desc",
        category: "general",
        status: "published",
      })
    );
    expect(response.status).toBe(201);
    expect(response.data.status).toBe("published");

    const saved = await coll.findOne({ announcementId: response.data.announcementId });
    expect(saved.status).toBe("published");
  });

  it("2. the previously published announcement is demoted", async () => {
    await insertAnnouncement({
      announcementId: "ANN-2026-001",
      title: "Old Published",
      status: "published",
    });

    await announcementsRoute.POST(
      createMockRequest({
        title: "New Published",
        description: "Desc",
        category: "general",
        status: "published",
      })
    );

    const old = await coll.findOne({ announcementId: "ANN-2026-001" });
    expect(old.status).toBe("draft");
  });

  it("3. creating a draft does not demote the currently published announcement", async () => {
    await insertAnnouncement({
      announcementId: "ANN-2026-001",
      title: "Still Published",
      status: "published",
    });

    await announcementsRoute.POST(
      createMockRequest({
        title: "New Draft",
        description: "Desc",
        category: "general",
        status: "draft",
      })
    );

    const existing = await coll.findOne({ announcementId: "ANN-2026-001" });
    expect(existing.status).toBe("published");
  });

  it("4. a publishing status conflict maps to HTTP 409", async () => {
    const spy = vi.spyOn(Announcements, "createPublished").mockRejectedValue(statusConflictError());
    try {
      const response = await announcementsRoute.POST(
        createMockRequest({
          title: "Conflict",
          description: "Desc",
          category: "general",
          status: "published",
        })
      );
      expect(response.status).toBe(409);
    } finally {
      spy.mockRestore();
    }
  });

  it("5. announcement ID conflicts are not incorrectly classified as published-status conflicts", async () => {
    const spy = vi
      .spyOn(Announcements, "createPublished")
      .mockRejectedValue(announcementIdConflictError());
    try {
      const response = await announcementsRoute.POST(
        createMockRequest({
          title: "ID Conflict",
          description: "Desc",
          category: "general",
          status: "published",
        })
      );
      // Not a status conflict → not 409.
      expect(response.status).not.toBe(409);
    } finally {
      spy.mockRestore();
    }
  });
});

// ── B. PATCH /api/announcements/[id] ───────────────────────────────────
describe("PATCH /api/announcements/[id]", () => {
  it("6. publishing an existing draft returns a success response", async () => {
    await insertAnnouncement({
      announcementId: "ANN-2026-001",
      title: "Draft",
      status: "draft",
    });

    const response = await announcementsIdRoute.PATCH(
      createMockRequest({ status: "published" }, "http://localhost/api/announcements/ANN-2026-001", "PATCH"),
      { params: { id: "ANN-2026-001" } }
    );
    expect(response.status).toBe(200);
    expect(response.data.status).toBe("published");
  });

  it("7. publishing the draft demotes the previous published announcement", async () => {
    await insertAnnouncement({
      announcementId: "ANN-2026-001",
      title: "Old Published",
      status: "published",
    });
    await insertAnnouncement({
      announcementId: "ANN-2026-002",
      title: "Draft",
      status: "draft",
    });

    await announcementsIdRoute.PATCH(
      createMockRequest({ status: "published" }, "http://localhost/api/announcements/ANN-2026-002", "PATCH"),
      { params: { id: "ANN-2026-002" } }
    );

    const old = await coll.findOne({ announcementId: "ANN-2026-001" });
    const target = await coll.findOne({ announcementId: "ANN-2026-002" });
    expect(old.status).toBe("draft");
    expect(target.status).toBe("published");
  });

  it("8. a missing announcement returns a not-found response", async () => {
    const response = await announcementsIdRoute.PATCH(
      createMockRequest({ status: "published" }, "http://localhost/api/announcements/ANN-99999", "PATCH"),
      { params: { id: "ANN-99999" } }
    );
    expect(response.status).toBe(404);
  });

  it("9. a publishing status conflict maps to HTTP 409", async () => {
    await insertAnnouncement({
      announcementId: "ANN-2026-001",
      title: "Existing",
      status: "draft",
    });
    const spy = vi.spyOn(Announcements, "publishExisting").mockRejectedValue(statusConflictError());
    try {
      const response = await announcementsIdRoute.PATCH(
        createMockRequest({ status: "published" }, "http://localhost/api/announcements/ANN-2026-001", "PATCH"),
        { params: { id: "ANN-2026-001" } }
      );
      expect(response.status).toBe(409);
    } finally {
      spy.mockRestore();
    }
  });

  it("10. updating an announcement without publishing it does not trigger publishing behavior", async () => {
    await insertAnnouncement({
      announcementId: "ANN-2026-001",
      title: "Original",
      status: "draft",
    });

    const response = await announcementsIdRoute.PATCH(
      createMockRequest({ title: "Updated Title" }, "http://localhost/api/announcements/ANN-2026-001", "PATCH"),
      { params: { id: "ANN-2026-001" } }
    );
    expect(response.status).toBe(200);

    const updated = await coll.findOne({ announcementId: "ANN-2026-001" });
    expect(updated.status).toBe("draft");
    expect(updated.title).toBe("Updated Title");
  });
});

// ── C. Restore and archive ─────────────────────────────────────────────
describe("POST /api/announcements/[id]/archive and /restore", () => {
  it("11. restoring an archived announcement as published uses the publishing workflow", async () => {
    await insertAnnouncement({
      announcementId: "ANN-2026-001",
      title: "Archived",
      status: "archived",
    });

    const response = await restoreRoute.POST(
      createMockRequest({ status: "published" }, "http://localhost/api/announcements/ANN-2026-001/restore", "POST"),
      { params: { id: "ANN-2026-001" } }
    );
    expect(response.status).toBe(200);
    expect(response.data.status).toBe("published");
  });

  it("12. restoring an archived announcement as a draft does not publish it", async () => {
    await insertAnnouncement({
      announcementId: "ANN-2026-001",
      title: "Archived",
      status: "archived",
    });

    const response = await restoreRoute.POST(
      createMockRequest({ status: "draft" }, "http://localhost/api/announcements/ANN-2026-001/restore", "POST"),
      { params: { id: "ANN-2026-001" } }
    );
    expect(response.status).toBe(200);
    expect(response.data.status).toBe("draft");
  });

  it("13. restoring a non-archived announcement returns a conflict response", async () => {
    await insertAnnouncement({
      announcementId: "ANN-2026-001",
      title: "Draft",
      status: "draft",
    });

    const response = await restoreRoute.POST(
      createMockRequest({ status: "published" }, "http://localhost/api/announcements/ANN-2026-001/restore", "POST"),
      { params: { id: "ANN-2026-001" } }
    );
    expect(response.status).toBe(409);
  });

  it("14. archiving an eligible published announcement returns success", async () => {
    await insertAnnouncement({
      announcementId: "ANN-2026-001",
      title: "Published",
      status: "published",
    });

    const response = await archiveRoute.POST(
      createMockRequest({}, "http://localhost/api/announcements/ANN-2026-001/archive", "POST"),
      { params: { id: "ANN-2026-001" } }
    );
    expect(response.status).toBe(200);
    expect(response.data.status).toBe("archived");
  });

  it("15. archiving an ineligible draft announcement returns conflict", async () => {
    await insertAnnouncement({
      announcementId: "ANN-2026-001",
      title: "Draft",
      status: "draft",
    });

    const response = await archiveRoute.POST(
      createMockRequest({}, "http://localhost/api/announcements/ANN-2026-001/archive", "POST"),
      { params: { id: "ANN-2026-001" } }
    );
    expect(response.status).toBe(409);
  });

  it("16. missing announcements return not-found for archive and restore", async () => {
    const archiveResp = await archiveRoute.POST(
      createMockRequest({}, "http://localhost/api/announcements/ANN-99999/archive", "POST"),
      { params: { id: "ANN-99999" } }
    );
    expect(archiveResp.status).toBe(404);

    const restoreResp = await restoreRoute.POST(
      createMockRequest({ status: "draft" }, "http://localhost/api/announcements/ANN-99999/restore", "POST"),
      { params: { id: "ANN-99999" } }
    );
    expect(restoreResp.status).toBe(404);
  });
});

// ── D. Public visibility ───────────────────────────────────────────────
describe("Public GET /api/announcements visibility", () => {
  it("17. public GET excludes drafts, scheduled, and archived announcements", async () => {
    await insertAnnouncement({ announcementId: "ANN-2026-001", status: "published", title: "Pub" });
    await insertAnnouncement({ announcementId: "ANN-2026-002", status: "draft", title: "Draft" });
    await insertAnnouncement({ announcementId: "ANN-2026-003", status: "scheduled", title: "Scheduled" });
    await insertAnnouncement({ announcementId: "ANN-2026-004", status: "archived", title: "Archived" });

    // Public visitor: requireRole throws (auth fails), isAdminUser returns false.
    requireRole.mockRejectedValue(new Error("Auth required"));
    isAdminUser.mockResolvedValue(false);

    const response = await announcementsRoute.GET(
      createMockRequest({}, "http://localhost/api/announcements", "GET")
    );
    expect(response.status).toBe(200);
    const ids = response.data.items.map((item) => item.announcementId);
    expect(ids).toContain("ANN-2026-001");
    expect(ids).not.toContain("ANN-2026-002");
    expect(ids).not.toContain("ANN-2026-003");
    expect(ids).not.toContain("ANN-2026-004");
  });

  it("18. public GET /api/announcements/[id] does not expose unpublished announcements", async () => {
    await insertAnnouncement({ announcementId: "ANN-2026-001", status: "draft", title: "Draft" });

    isAdminUser.mockResolvedValue(false);

    const response = await announcementsIdRoute.GET(
      createMockRequest({}, "http://localhost/api/announcements/ANN-2026-001", "GET"),
      { params: { id: "ANN-2026-001" } }
    );
    expect(response.status).toBe(404);
  });
});

// ── E. Notifications ───────────────────────────────────────────────────
describe("Announcement publication notifications", () => {
  it("19. push-notification helper is mocked (no real notifications sent)", async () => {
    // The mock is in place; verify it resolves without sending.
    const result = await mockSendPush({ title: "T", body: "B", url: "/", tag: "wari-announcement" });
    expect(result).toEqual({ sent: 0, failed: 0 });
  });

  it("20. publication notifications occur only after successful publication", async () => {
    await announcementsRoute.POST(
      createMockRequest({
        title: "Notify Me",
        description: "Desc",
        category: "general",
        status: "published",
      })
    );
    expect(mockSendPush).toHaveBeenCalled();
  });

  it("21. failed publication does not send a notification", async () => {
    const spy = vi.spyOn(Announcements, "createPublished").mockRejectedValue(new Error("Publish failed"));
    try {
      await announcementsRoute.POST(
        createMockRequest({
          title: "Fail",
          description: "Desc",
          category: "general",
          status: "published",
        })
      );
    } catch {
      // Expected: route catches the error and returns 500.
    } finally {
      spy.mockRestore();
    }
    expect(mockSendPush).not.toHaveBeenCalled();
  });
});
