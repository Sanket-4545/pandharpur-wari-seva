export const dynamic = "force-dynamic";

import { HelpRequests } from "@/lib/models";
import {
  createdResponse,
  handleApiError,
  handleAuthError,
  parseQueryParams,
  paginatedResponse,
  sanitizeDocId,
  sanitizeDocIds,
  requireRole,
} from "@/lib/api-helpers";

export async function GET(request) {
  try {
    await requireRole(request, ["super_admin", "admin"]);
    const { page, limit, skip, status, search } = parseQueryParams(request);
    const filter = {};
    if (status) filter.status = status;
    if (search) {
      filter.$or = [
        { fullName: { $regex: search, $options: "i" } },
        { requestId: { $regex: search, $options: "i" } },
      ];
    }
    const [items, total] = await Promise.all([
      HelpRequests.getCollection().then((c) =>
        c.find(filter).sort({ createdAt: -1 }).skip(skip).limit(limit).toArray()
      ),
      HelpRequests.getCollection().then((c) => c.countDocuments(filter)),
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
    const result = await HelpRequests.insertOne(body);
    const coll = await HelpRequests.getCollection();
    const inserted = await coll.findOne({ _id: result.insertedId });
    return createdResponse(sanitizeDocId(inserted));
  } catch (error) {
    return handleAuthError(error);
  }
}
