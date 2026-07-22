import { LostItems } from "@/lib/models";
import {
  successResponse,
  notFoundResponse,
  handleApiError,
  sanitizeDocIds,
} from "@/lib/api-helpers";

export async function GET(request, { params }) {
  try {
    const item = await LostItems.findByItemId(params.id);
    if (!item) return notFoundResponse("Lost item");
    return successResponse(sanitizeDocIds(item));
  } catch (error) {
    return handleApiError(error);
  }
}

export async function PATCH(request, { params }) {
  try {
    const existing = await LostItems.findByItemId(params.id);
    if (!existing) return notFoundResponse("Lost item");
    const body = await request.json();
    if (body.status) {
      await LostItems.updateStatus(params.id, body.status);
    }
    const coll = await LostItems.getCollection();
    const updated = await coll.findOneAndUpdate(
      { itemId: params.id },
      { $set: body },
      { returnDocument: "after" }
    );
    return successResponse(sanitizeDocIds(updated));
  } catch (error) {
    return handleApiError(error);
  }
}

export async function DELETE(request, { params }) {
  try {
    const coll = await LostItems.getCollection();
    const result = await coll.deleteOne({ itemId: params.id });
    if (result.deletedCount === 0) return notFoundResponse("Lost item");
    return successResponse({ deleted: true });
  } catch (error) {
    return handleApiError(error);
  }
}
