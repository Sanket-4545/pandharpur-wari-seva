export const dynamic = "force-dynamic";

import { Announcements } from "@/lib/models";
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
    const { page, limit, skip, status, category } = parseQueryParams(request);
    const filter = {};
    if (category) filter.category = category;
    if (isAdmin) {
      if (status) filter.status = status;
    } else {
      filter.status = "published";
    }
    const isPublishedView = isAdmin ? status === "published" : true;
    const sort = isPublishedView
      ? { publishDate: -1 }
      : { createdAt: -1 };
    const [items, total] = await Promise.all([
      Announcements.getCollection().then(c => c.find(filter).sort(sort).skip(skip).limit(limit).toArray()),
      Announcements.getCollection().then(c => c.countDocuments(filter)),
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
    const result = await Announcements.insertOne(body);
    const coll = await Announcements.getCollection();
    const inserted = await coll.findOne({ _id: result.insertedId });
    return createdResponse(sanitizeDocId(inserted));
  } catch (error) {
    return handleAuthError(error);
  }
}
