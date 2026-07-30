export const dynamic = "force-dynamic";

import { EmergencyContacts } from "@/lib/models";
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
    const all = searchParams.get("all") === "true";
    const filter = all ? {} : { isActive: true };
    if (category) filter.category = category;
    const [items, total] = await Promise.all([
      EmergencyContacts.getCollection().then(c => c.find(filter).sort({ order: 1 }).skip(skip).limit(limit).toArray()),
      EmergencyContacts.getCollection().then(c => c.countDocuments(filter)),
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
    const coll = await EmergencyContacts.getCollection();
    const result = await coll.insertOne(EmergencyContacts.prepareForInsert(body));
    const inserted = await coll.findOne({ _id: result.insertedId });
    return createdResponse(sanitizeDocId(inserted));
  } catch (error) {
    return handleAuthError(error);
  }
}
