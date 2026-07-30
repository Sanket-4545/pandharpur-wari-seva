import { Settings } from "@/lib/models";
import {
  successResponse,
  notFoundResponse,
  handleApiError,
  sanitizeDocId,
  requireRole,
  handleAuthError,
} from "@/lib/api-helpers";

export async function GET(request, { params }) {
  try {
    await requireRole(request, ["super_admin", "admin"]);
    const item = await Settings.findByKey(params.key);
    if (!item) return notFoundResponse("Setting");
    return successResponse(sanitizeDocId(item));
  } catch (error) {
    return handleAuthError(error);
  }
}

export async function PUT(request, { params }) {
  try {
    await requireRole(request, ["super_admin", "admin"]);
    const body = await request.json();
    await Settings.upsert(params.key, body.value, body.type || "string", body.updatedBy || null);
    const updated = await Settings.findByKey(params.key);
    return successResponse(sanitizeDocId(updated));
  } catch (error) {
    return handleAuthError(error);
  }
}

export async function DELETE(request, { params }) {
  try {
    await requireRole(request, ["super_admin", "admin"]);
    const result = await Settings.deleteByKey(params.key);
    if (result.deletedCount === 0) return notFoundResponse("Setting");
    return successResponse({ deleted: true });
  } catch (error) {
    return handleAuthError(error);
  }
}
