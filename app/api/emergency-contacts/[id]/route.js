import { EmergencyContacts } from "@/lib/models";
import {
  successResponse,
  notFoundResponse,
  handleApiError,
  sanitizeDocIds,
} from "@/lib/api-helpers";

export async function PUT(request, { params }) {
  try {
    const body = await request.json();
    const coll = await EmergencyContacts.getCollection();
    const existing = await coll.findOne({ _id: params.id });
    if (!existing) return notFoundResponse("Emergency contact");
    const update = EmergencyContacts.prepareForUpdate(body);
    await coll.updateOne({ _id: params.id }, { $set: update });
    const updated = await coll.findOne({ _id: params.id });
    return successResponse(sanitizeDocIds(updated));
  } catch (error) {
    return handleApiError(error);
  }
}

export async function DELETE(request, { params }) {
  try {
    const coll = await EmergencyContacts.getCollection();
    const result = await coll.deleteOne({ _id: params.id });
    if (result.deletedCount === 0) return notFoundResponse("Emergency contact");
    return successResponse({ deleted: true });
  } catch (error) {
    return handleApiError(error);
  }
}
