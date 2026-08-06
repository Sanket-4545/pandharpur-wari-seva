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
    await requireVolunteerAuth(request);
    const item = await LostItems.findByItemId(params.id);
    if (!item) return notFoundResponse("Lost item");
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
    const body = await request.json();
    if (body.status) {
      await LostItems.updateStatus(params.id, body.status);
    }
    const coll = await LostItems.getCollection();
    const update = { ...body, updatedAt: new Date() };
    delete update._id;
    delete update.itemId;
    delete update.createdAt;
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
