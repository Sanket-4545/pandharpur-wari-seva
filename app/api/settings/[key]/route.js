import { Settings } from "@/lib/models";
import {
  successResponse,
  notFoundResponse,
  handleApiError,
  sanitizeDocIds,
} from "@/lib/api-helpers";

export async function GET(request, { params }) {
  try {
    const item = await Settings.findByKey(params.key);
    if (!item) return notFoundResponse("Setting");
    return successResponse(sanitizeDocIds(item));
  } catch (error) {
    return handleApiError(error);
  }
}

export async function PUT(request, { params }) {
  try {
    const body = await request.json();
    await Settings.upsert(params.key, body.value, body.type || "string", body.updatedBy || null);
    const updated = await Settings.findByKey(params.key);
    return successResponse(sanitizeDocIds(updated));
  } catch (error) {
    return handleApiError(error);
  }
}

export async function DELETE(request, { params }) {
  try {
    const result = await Settings.deleteByKey(params.key);
    if (result.deletedCount === 0) return notFoundResponse("Setting");
    return successResponse({ deleted: true });
  } catch (error) {
    return handleApiError(error);
  }
}
