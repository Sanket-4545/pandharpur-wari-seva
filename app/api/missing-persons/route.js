export const dynamic = "force-dynamic";

import { MissingPersons } from "@/lib/models";
import {
  createdResponse,
  handleApiError,
  parseQueryParams,
  paginatedResponse,
  sanitizeDocId,
  sanitizeDocIds,
  requireRole,
  handleAuthError,
  isAdminUser,
} from "@/lib/api-helpers";

export async function GET(request) {
  try {
    const isAdmin = await isAdminUser(request);
    const projection = isAdmin ? {} : { contactPhone: 0 };
    const { page, limit, skip, status, search, category } = parseQueryParams(request);
    const filter = {};
    if (status) filter.status = status;
    if (category) filter.category = category;
    if (search) filter.$text = { $search: search };
    const [items, total] = await Promise.all([
      MissingPersons.getCollection().then(c => c.find(filter, { projection }).sort({ dateReported: -1 }).skip(skip).limit(limit).toArray()),
      MissingPersons.getCollection().then(c => c.countDocuments(filter)),
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
    const result = await MissingPersons.insertOne(body);
    const coll = await MissingPersons.getCollection();
    const inserted = await coll.findOne({ _id: result.insertedId });
    return createdResponse(sanitizeDocId(inserted));
  } catch (error) {
    return handleAuthError(error);
  }
}
