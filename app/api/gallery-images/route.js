import { GalleryImages } from "@/lib/models";
import {
  createdResponse,
  handleApiError,
  parseQueryParams,
  paginatedResponse,
  sanitizeDocIds,
} from "@/lib/api-helpers";

export async function GET(request) {
  try {
    const { page, limit, skip } = parseQueryParams(request);
    const { searchParams } = new URL(request.url);
    const category = searchParams.get("category");
    const filter = {};
    if (category && category !== "all") filter.category = category;
    const [items, total] = await Promise.all([
      GalleryImages.getCollection().then(c => c.find(filter).sort({ createdAt: -1 }).skip(skip).limit(limit).toArray()),
      GalleryImages.getCollection().then(c => c.countDocuments(filter)),
    ]);
    return paginatedResponse(sanitizeDocIds(items), total, page, limit);
  } catch (error) {
    return handleApiError(error);
  }
}

export async function POST(request) {
  try {
    const body = await request.json();
    const coll = await GalleryImages.getCollection();
    const result = await coll.insertOne(GalleryImages.prepareForInsert(body));
    const inserted = await coll.findOne({ _id: result.insertedId });
    return createdResponse(sanitizeDocIds(inserted));
  } catch (error) {
    return handleApiError(error, "Failed to add gallery image");
  }
}
