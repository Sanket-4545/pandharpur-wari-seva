export const dynamic = "force-dynamic";

import { LostItems } from "@/lib/models";
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
    const item = await LostItems.findByItemId(params.id);
    if (!item) return notFoundResponse("Lost item");
    return successResponse(sanitizeDocId(item));
  } catch (error) {
    return handleApiError(error);
  }
}

export async function PATCH(request, { params }) {
  try {
    await requireRole(request, ["super_admin", "admin"]);
    const existing = await LostItems.findByItemId(params.id);
    if (!existing) return notFoundResponse("Lost item");
    const body = await request.json();
    const update = LostItems.prepareForUpdate(body);
    const coll = await LostItems.getCollection();
    if (body.status) {
      await LostItems.updateStatus(params.id, body.status);
    }
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

export async function DELETE(request, { params }) {
  try {
    await requireRole(request, ["super_admin", "admin"]);
    const coll = await LostItems.getCollection();
    const result = await coll.deleteOne({ itemId: params.id });
    if (result.deletedCount === 0) return notFoundResponse("Lost item");
    return successResponse({ deleted: true });
  } catch (error) {
    return handleAuthError(error);
  }
}
