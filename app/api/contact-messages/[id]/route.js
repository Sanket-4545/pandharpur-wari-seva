import { ContactMessages } from "@/lib/models";
import { toObjectId } from "@/lib/models/helpers";
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
    const coll = await ContactMessages.getCollection();
    const item = await coll.findOne({ _id: toObjectId(params.id) });
    if (!item) return notFoundResponse("Contact message");
    return successResponse(sanitizeDocId(item));
  } catch (error) {
    return handleAuthError(error);
  }
}

export async function PATCH(request, { params }) {
  try {
    await requireRole(request, ["super_admin", "admin"]);
    const body = await request.json();
    const coll = await ContactMessages.getCollection();
    const existing = await coll.findOne({ _id: toObjectId(params.id) });
    if (!existing) return notFoundResponse("Contact message");

    const update = { updatedAt: new Date() };
    if (body.isRead === true || body.isRead === false) {
      update.isRead = body.isRead;
      if (body.isRead) update.readAt = new Date();
    }
    await coll.updateOne({ _id: toObjectId(params.id) }, { $set: update });
    const updated = await coll.findOne({ _id: toObjectId(params.id) });
    return successResponse(sanitizeDocId(updated));
  } catch (error) {
    return handleAuthError(error);
  }
}

export async function DELETE(request, { params }) {
  try {
    await requireRole(request, ["super_admin", "admin"]);
    const coll = await ContactMessages.getCollection();
    const result = await coll.deleteOne({ _id: toObjectId(params.id) });
    if (result.deletedCount === 0) return notFoundResponse("Contact message");
    return successResponse({ deleted: true });
  } catch (error) {
    return handleAuthError(error);
  }
}
