import { MissingPersons } from "@/lib/models";
import {
  createdResponse,
  handleApiError,
  parseQueryParams,
  paginatedResponse,
  sanitizeDocIds,
} from "@/lib/api-helpers";

export async function GET(request) {
  try {
    const { page, limit, skip, status, search, category } = parseQueryParams(request);
    const filter = {};
    if (status) filter.status = status;
    if (category) filter.category = category;
    if (search) filter.$text = { $search: search };
    const [items, total] = await Promise.all([
      MissingPersons.getCollection().then(c => c.find(filter).sort({ dateReported: -1 }).skip(skip).limit(limit).toArray()),
      MissingPersons.getCollection().then(c => c.countDocuments(filter)),
    ]);
    return paginatedResponse(sanitizeDocIds(items), total, page, limit);
  } catch (error) {
    return handleApiError(error);
  }
}

export async function POST(request) {
  try {
    const body = await request.json();
    const result = await MissingPersons.insertOne(body);
    const inserted = await MissingPersons.findByCaseId(result.ops?.[0]?.caseId);
    return createdResponse(sanitizeDocIds(inserted || { insertedId: result.insertedId }));
  } catch (error) {
    return handleApiError(error, "Failed to create missing person report");
  }
}
