import { TimelineStops } from "@/lib/models";
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
    const filter = { isActive: true };
    const [items, total] = await Promise.all([
      TimelineStops.getCollection().then(c => c.find(filter).sort({ order: 1 }).skip(skip).limit(limit).toArray()),
      TimelineStops.getCollection().then(c => c.countDocuments(filter)),
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
    const coll = await TimelineStops.getCollection();
    const result = await coll.insertOne(TimelineStops.prepareForInsert(body));
    const inserted = await coll.findOne({ _id: result.insertedId });
    return createdResponse(sanitizeDocId(inserted));
  } catch (error) {
    return handleAuthError(error);
  }
}
