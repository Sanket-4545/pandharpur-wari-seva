import { ObjectId } from "mongodb";
import {
  successResponse,
  notFoundResponse,
  errorResponse,
  handleApiError,
  sanitizeDocIds,
} from "@/lib/api-helpers";

export async function DELETE(request, { params }) {
  try {
    let objectId;
    try {
      objectId = new ObjectId(params.id);
    } catch {
      return errorResponse("Invalid gallery image ID", 400);
    }

    const { GalleryImages } = await import("@/lib/models");
    const coll = await GalleryImages.getCollection();
    const result = await coll.deleteOne({ _id: objectId });
    if (result.deletedCount === 0) return notFoundResponse("Gallery image");
    return successResponse({ deleted: true });
  } catch (error) {
    return handleApiError(error);
  }
}
