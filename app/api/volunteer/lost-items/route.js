export const dynamic = "force-dynamic";

import { LostItems } from "@/lib/models";
import {
  createdResponse,
  handleApiError,
  handleAuthError,
  parseQueryParams,
  paginatedResponse,
  sanitizeDocId,
  sanitizeDocIds,
  requireVolunteerAuth,
} from "@/lib/api-helpers";

export async function GET(request) {
  try {
    const volunteer = await requireVolunteerAuth(request);
    const { page, limit, skip, status, search } = parseQueryParams(request);
    const filter = { volunteerId: volunteer.volunteerId };
    if (status) filter.status = status;
    if (search) filter.$text = { $search: search };
    const [items, total] = await Promise.all([
      LostItems.getCollection().then(c =>
        c.find(filter).sort({ dateReported: -1 }).skip(skip).limit(limit).toArray()
      ),
      LostItems.getCollection().then(c => c.countDocuments(filter)),
    ]);
    return paginatedResponse(sanitizeDocIds(items), total, page, limit);
  } catch (error) {
    return handleAuthError(error);
  }
}

export async function POST(request) {
  try {
    const volunteer = await requireVolunteerAuth(request);
    const body = await request.json();
    body.volunteerId = volunteer.volunteerId;
    const result = await LostItems.insertOne(body);
    const coll = await LostItems.getCollection();
    const inserted = await coll.findOne({ _id: result.insertedId });
    return createdResponse(sanitizeDocId(inserted));
  } catch (error) {
    return handleAuthError(error);
  }
}
