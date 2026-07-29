import { Reports } from "@/lib/models";
import {
  createdResponse,
  handleApiError,
  parseQueryParams,
  paginatedResponse,
  sanitizeDocId,
  sanitizeDocIds,
} from "@/lib/api-helpers";

export async function GET(request) {
  try {
    const { page, limit, skip } = parseQueryParams(request);
    const { searchParams } = new URL(request.url);
    const typeFilter = searchParams.get("type");
    const filter = {};
    if (typeFilter) filter.type = typeFilter;
    const [items, total] = await Promise.all([
      Reports.getCollection().then(c => c.find(filter).sort({ date: -1 }).skip(skip).limit(limit).toArray()),
      Reports.getCollection().then(c => c.countDocuments(filter)),
    ]);
    return paginatedResponse(sanitizeDocIds(items), total, page, limit);
  } catch (error) {
    return handleApiError(error);
  }
}

export async function POST(request) {
  try {
    const body = await request.json();
    const result = await Reports.insertOne(body);
    const coll = await Reports.getCollection();
    const inserted = await coll.findOne({ _id: result.insertedId });
    return createdResponse(sanitizeDocId(inserted));
  } catch (error) {
    return handleApiError(error, "Failed to create report");
  }
}
