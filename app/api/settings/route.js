import { Settings } from "@/lib/models";
import {
  successResponse,
  createdResponse,
  handleApiError,
  errorResponse,
  parseQueryParams,
  paginatedResponse,
  sanitizeDocIds,
} from "@/lib/api-helpers";

export async function GET(request) {
  try {
    const { page, limit, skip } = parseQueryParams(request);
    const [items, total] = await Promise.all([
      Settings.getCollection().then(c => c.find({}).sort({ key: 1 }).skip(skip).limit(limit).toArray()),
      Settings.getCollection().then(c => c.countDocuments({})),
    ]);
    return paginatedResponse(sanitizeDocIds(items), total, page, limit);
  } catch (error) {
    return handleApiError(error);
  }
}

export async function POST(request) {
  try {
    const body = await request.json();
    const coll = await Settings.getCollection();
    const result = await coll.insertOne(Settings.prepareForInsert(body));
    const inserted = await coll.findOne({ _id: result.insertedId });
    return createdResponse(sanitizeDocIds(inserted));
  } catch (error) {
    return handleApiError(error, "Failed to create setting");
  }
}

export async function PATCH(request) {
  try {
    const body = await request.json();
    if (!body.key) {
      return errorResponse("key is required");
    }
    await Settings.upsert(body.key, body.value, body.type || "string", body.updatedBy || null);
    const updated = await Settings.findByKey(body.key);
    return successResponse(sanitizeDocIds(updated));
  } catch (error) {
    return handleApiError(error);
  }
}
