import { EmergencyContacts } from "@/lib/models";
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
    const coll = await EmergencyContacts.getCollection();
    const item = await coll.findOne({ _id: params.id });
    if (!item) return notFoundResponse("Emergency contact");
    return successResponse(sanitizeDocId(item));
  } catch (error) {
    return handleAuthError(error);
  }
}

export async function PUT(request, { params }) {
  try {
    await requireRole(request, ["super_admin", "admin"]);
    const body = await request.json();
    const coll = await EmergencyContacts.getCollection();
    const existing = await coll.findOne({ _id: params.id });
    if (!existing) return notFoundResponse("Emergency contact");
    const update = EmergencyContacts.prepareForUpdate(body);
    await coll.updateOne({ _id: params.id }, { $set: update });
    const updated = await coll.findOne({ _id: params.id });
    return successResponse(sanitizeDocId(updated));
  } catch (error) {
    return handleAuthError(error);
  }
}

export async function DELETE(request, { params }) {
  try {
    await requireRole(request, ["super_admin", "admin"]);
    const coll = await EmergencyContacts.getCollection();
    const result = await coll.deleteOne({ _id: params.id });
    if (result.deletedCount === 0) return notFoundResponse("Emergency contact");
    return successResponse({ deleted: true });
  } catch (error) {
    return handleAuthError(error);
  }
}
