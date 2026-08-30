export const dynamic = "force-dynamic";

import { LostItems } from "@/lib/models";
import {
  successResponse,
  notFoundResponse,
  handleApiError,
  handleAuthError,
  sanitizeDocId,
  requireVolunteerAuth,
} from "@/lib/api-helpers";

export async function GET(request, { params }) {
  try {
    const volunteer = await requireVolunteerAuth(request);
    const item = await LostItems.findByItemId(params.id);
    if (!item) return notFoundResponse("Lost item");
    if (item.volunteerId !== volunteer.volunteerId) return notFoundResponse("Lost item");
    return successResponse(sanitizeDocId(item));
  } catch (error) {
    return handleAuthError(error);
  }
}

export async function PATCH(request, { params }) {
  try {
    const volunteer = await requireVolunteerAuth(request);
    const existing = await LostItems.findByItemId(params.id);
    if (!existing) return notFoundResponse("Lost item");
    if (existing.volunteerId !== volunteer.volunteerId) return notFoundResponse("Lost item");
    const body = await request.json();
    if (body.status) {
      await LostItems.updateStatus(params.id, body.status);
    }
    const allowedFields = {};
    if (body.itemType !== undefined) allowedFields.itemType = body.itemType;
    if (body.foundLocation !== undefined) allowedFields.foundLocation = body.foundLocation;
    if (body.brand !== undefined) allowedFields.brand = body.brand;
    if (body.color !== undefined) allowedFields.color = body.color;
    if (body.storageLocation !== undefined) allowedFields.storageLocation = body.storageLocation;
    if (body.contactNumber !== undefined) allowedFields.contactNumber = body.contactNumber;
    if (body.notes !== undefined) allowedFields.notes = body.notes;
    if (body.description !== undefined) allowedFields.description = body.description;
    if (body.photoUrl !== undefined) allowedFields.photoUrl = body.photoUrl;
    if (Object.keys(allowedFields).length === 0) {
      return successResponse(sanitizeDocId(existing));
    }
    const coll = await LostItems.getCollection();
    const update = { ...allowedFields, updatedAt: new Date() };
    const updated = await coll.findOneAndUpdate(
      { itemId: params.id },
      { $set: update },
      { returnDocument: "after" }
    );
    return successResponse(sanitizeDocId(updated));
  } catch (error) {
    return handleAuthError(error);
  }
}
