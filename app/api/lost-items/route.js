export const dynamic = "force-dynamic";

import { LostItems } from "@/lib/models";
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

const PUBLIC_STATUSES = ["Lost", "Found", "Claimed"];

export async function GET(request) {
  try {
    const isAdmin = await isAdminUser(request);
    const projection = isAdmin ? {} : { contactInfo: 0, contactNumber: 0, volunteerId: 0 };
    const { page, limit, skip, status, search, category } = parseQueryParams(request);
    const filter = {};
    if (isAdmin && status) filter.status = status;
    if (!isAdmin) filter.status = { $in: PUBLIC_STATUSES };
    if (category) filter.category = category;
    if (search) filter.$text = { $search: search };
    const [items, total] = await Promise.all([
      LostItems.getCollection().then(c => c.find(filter, { projection }).sort({ dateReported: -1 }).skip(skip).limit(limit).toArray()),
      LostItems.getCollection().then(c => c.countDocuments(filter)),
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
    const result = await LostItems.insertOne(body);
    const coll = await LostItems.getCollection();
    const inserted = await coll.findOne({ _id: result.insertedId });
    return createdResponse(sanitizeDocId(inserted));
  } catch (error) {
    return handleAuthError(error);
  }
}
