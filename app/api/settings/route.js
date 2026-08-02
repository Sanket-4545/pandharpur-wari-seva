import { Settings } from "@/lib/models";
import {
  successResponse,
  createdResponse,
  handleApiError,
  errorResponse,
  parseQueryParams,
  paginatedResponse,
  sanitizeDocId,
  sanitizeDocIds,
  requireRole,
  handleAuthError,
  ValidationError,
} from "@/lib/api-helpers";
import { validateEnum } from "@/lib/models/helpers";

const VALID_TYPES = ["string", "number", "boolean", "json"];

export async function GET(request) {
  try {
    await requireRole(request, ["super_admin", "admin"]);
    const { page, limit, skip } = parseQueryParams(request);
    const [items, total] = await Promise.all([
      Settings.getCollection().then(c => c.find({}).sort({ key: 1 }).skip(skip).limit(limit).toArray()),
      Settings.getCollection().then(c => c.countDocuments({})),
    ]);
    return paginatedResponse(sanitizeDocIds(items), total, page, limit);
  } catch (error) {
    return handleAuthError(error);
  }
}

export async function POST(request) {
  try {
    await requireRole(request, ["super_admin", "admin"]);
    const body = await request.json();
    const coll = await Settings.getCollection();
    const result = await coll.insertOne(Settings.prepareForInsert(body));
    const inserted = await coll.findOne({ _id: result.insertedId });
    return createdResponse(sanitizeDocId(inserted));
  } catch (error) {
    return handleAuthError(error);
  }
}

export async function PATCH(request) {
  try {
    await requireRole(request, ["super_admin", "admin"]);
    const body = await request.json();
    if (!body.key) {
      return errorResponse("key is required");
    }
    if (body.type !== undefined) {
      validateEnum(body, "type", VALID_TYPES);
    }
    await Settings.upsert(body.key, body.value, body.type || "string", body.updatedBy || null);
    const updated = await Settings.findByKey(body.key);
    return successResponse(sanitizeDocId(updated));
  } catch (error) {
    return handleAuthError(error);
  }
}
