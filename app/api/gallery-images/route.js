export const dynamic = "force-dynamic";

import { GalleryImages } from "@/lib/models";
import {
  createdResponse,
  handleApiError,
  parseQueryParams,
  paginatedResponse,
  sanitizeDocId,
  sanitizeDocIds,
  requireRole,
  handleAuthError,
} from "@/lib/api-helpers";

export async function GET(request) {
  try {
    const { page, limit, skip } = parseQueryParams(request);
    const { searchParams } = new URL(request.url);
    const category = searchParams.get("category");
    const filter = {};
    if (category && category !== "all") filter.category = category;

    let isAdmin = false;
    try {
      await requireRole(request, ["super_admin", "admin", "coordinator"]);
      isAdmin = true;
    } catch {
      // Anonymous visitors only see active images
    }
    if (!isAdmin) filter.isActive = true;

    const coll = await GalleryImages.getCollection();
    const [items, total] = await Promise.all([
      coll.find(filter).sort({ createdAt: -1 }).skip(skip).limit(limit).toArray(),
      coll.countDocuments(filter),
    ]);
    return paginatedResponse(sanitizeDocIds(items), total, page, limit);
  } catch (error) {
    return handleApiError(error);
  }
}

export async function POST(request) {
  try {
    await requireRole(request, ["super_admin", "admin"]);
    const body = await request.json();
    const coll = await GalleryImages.getCollection();
    const result = await coll.insertOne(GalleryImages.prepareForInsert(body));
    const inserted = await coll.findOne({ _id: result.insertedId });
    return createdResponse(sanitizeDocId(inserted));
  } catch (error) {
    return handleAuthError(error);
  }
}
