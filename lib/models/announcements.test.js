import { describe, it, expect, beforeAll, vi } from "vitest";

// Mock @/lib/api-helpers since it imports Next.js modules (next/server,
// next/headers) that are unavailable in plain Node.js / Vitest. Only
// ValidationError is needed by the announcements model.
vi.mock("@/lib/api-helpers", () => ({
  ValidationError: class ValidationError extends Error {
    constructor(message) {
      super(message);
      this.name = "ValidationError";
    }
  },
}));

// lib/mongodb.js requires MONGODB_URI at module load time. Set a dummy
// local URI before importing the model so the module chain loads; no
// connection is ever made for these pure function tests.
process.env.MONGODB_URI = process.env.MONGODB_URI || "mongodb://127.0.0.1:27017/test";

let isPublishStatusConflictError;

beforeAll(async () => {
  const mod = await import("./announcements.js");
  isPublishStatusConflictError = mod.isPublishStatusConflictError;
});

describe("isPublishStatusConflictError", () => {
  it("returns true for a status-index duplicate-key error", () => {
    const error = new Error("E11000 duplicate key");
    error.code = 11000;
    error.keyPattern = { status: 1 };
    error.keyValue = { status: "published" };
    expect(isPublishStatusConflictError(error)).toBe(true);
  });

  it("returns false for an announcementId duplicate-key error", () => {
    const error = new Error("E11000 duplicate key");
    error.code = 11000;
    error.keyPattern = { announcementId: 1 };
    error.keyValue = { announcementId: "ANN-2026-001" };
    expect(isPublishStatusConflictError(error)).toBe(false);
  });

  it("returns false for unrelated errors", () => {
    const error = new Error("network timeout");
    expect(isPublishStatusConflictError(error)).toBe(false);

    const nonDupError = new Error("some other error");
    nonDupError.code = 11001;
    expect(isPublishStatusConflictError(nonDupError)).toBe(false);
  });

  it("returns false for undefined and null", () => {
    expect(isPublishStatusConflictError(undefined)).toBe(false);
    expect(isPublishStatusConflictError(null)).toBe(false);
  });

  it("returns false for a duplicate-key error with no status key", () => {
    const error = new Error("E11000 duplicate key");
    error.code = 11000;
    error.keyPattern = { announcementId: 1 };
    error.keyValue = { announcementId: "ANN-2026-001" };
    expect(isPublishStatusConflictError(error)).toBe(false);
  });
});
