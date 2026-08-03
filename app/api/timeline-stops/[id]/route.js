import { TimelineStops } from "@/lib/models";
import { requireObjectId } from "@/lib/models/helpers";
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
    await requireRole(request, ["super_admin", "admin", "coordinator"]);
    const coll = await TimelineStops.getCollection();
    const item = await coll.findOne({ _id: requireObjectId(params.id) });
    if (!item) return notFoundResponse("Timeline stop");
    return successResponse(sanitizeDocId(item));
  } catch (error) {
    return handleAuthError(error);
  }
}

export async function PUT(request, { params }) {
  try {
    await requireRole(request, ["super_admin", "admin"]);
    const body = await request.json();
    const coll = await TimelineStops.getCollection();
    const existing = await coll.findOne({ _id: requireObjectId(params.id) });
    if (!existing) return notFoundResponse("Timeline stop");
    const update = TimelineStops.prepareForUpdate(body);
    await coll.updateOne({ _id: requireObjectId(params.id) }, { $set: update });
    const updated = await coll.findOne({ _id: requireObjectId(params.id) });
    return successResponse(sanitizeDocId(updated));
  } catch (error) {
    return handleAuthError(error);
  }
}

export async function DELETE(request, { params }) {
  try {
    await requireRole(request, ["super_admin", "admin"]);
    const coll = await TimelineStops.getCollection();
    const result = await coll.deleteOne({ _id: requireObjectId(params.id) });
    if (result.deletedCount === 0) return notFoundResponse("Timeline stop");
    return successResponse({ deleted: true });
  } catch (error) {
    return handleAuthError(error);
  }
}
