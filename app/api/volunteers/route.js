import { Volunteers } from "@/lib/models";
import {
  createdResponse,
  errorResponse,
  handleApiError,
  parseQueryParams,
  paginatedResponse,
  sanitizeDocIds,
} from "@/lib/api-helpers";

export async function POST(request) {
  try {
    const body = await request.json();
    const result = await Volunteers.insertOne(body);
    const inserted = await Volunteers.findById(result.ops?.[0]?.volunteerId);
    return createdResponse(sanitizeDocIds(inserted || { insertedId: result.insertedId }));
  } catch (error) {
    return handleApiError(error, "Failed to register volunteer");
  }
}

export async function GET(request) {
  try {
    const { page, limit, skip, status, search } = parseQueryParams(request);
    const filter = {};
    if (status) filter.status = status;
    if (search) filter.$text = { $search: search };
    const [items, total] = await Promise.all([
      Volunteers.getCollection().then(c => c.find(filter).sort({ createdAt: -1 }).skip(skip).limit(limit).toArray()),
      Volunteers.getCollection().then(c => c.countDocuments(filter)),
    ]);
    return paginatedResponse(sanitizeDocIds(items), total, page, limit);
  } catch (error) {
    return handleApiError(error);
  }
}
