export const dynamic = "force-dynamic";

import { NssActivities } from "@/lib/models";
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
    let isAdmin = false;
    try {
      await requireRole(request, ["super_admin", "admin", "coordinator"]);
      isAdmin = true;
    } catch {
      // Anonymous visitors only see published activities
    }
    const { page, limit, skip, status } = parseQueryParams(request);
    const filter = {};
    if (isAdmin) {
      if (status) filter.status = status;
    } else {
      filter.status = "published";
    }
    const isPublishedView = isAdmin ? status === "published" : true;
    const sort = isPublishedView
      ? { activityDate: 1 }
      : { createdAt: -1 };
    const [items, total] = await Promise.all([
      NssActivities.getCollection().then((c) =>
        c.find(filter).sort(sort).skip(skip).limit(limit).toArray()
      ),
      NssActivities.getCollection().then((c) => c.countDocuments(filter)),
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

    const { googleFormUrl, totalParticipants, activityId, createdAt, updatedAt, _id, ...cleanBody } = body;

    const result = await NssActivities.insertOne(cleanBody);
    const coll = await NssActivities.getCollection();
    const inserted = await coll.findOne({ _id: result.insertedId });

    return createdResponse(sanitizeDocId(inserted));
  } catch (error) {
    return handleAuthError(error);
  }
}