import {
  successResponse,
  notFoundResponse,
  handleApiError,
  sanitizeDocIds,
} from "@/lib/api-helpers";

export async function DELETE(request, { params }) {
  try {
    const { GalleryImages } = await import("@/lib/models");
    const coll = await GalleryImages.getCollection();
    const result = await coll.deleteOne({ _id: params.id });
    if (result.deletedCount === 0) return notFoundResponse("Gallery image");
    return successResponse({ deleted: true });
  } catch (error) {
    return handleApiError(error);
  }
}
