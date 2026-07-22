import { Announcements } from "@/lib/models";
import {
  createdResponse,
  handleApiError,
  parseQueryParams,
  paginatedResponse,
  sanitizeDocIds,
} from "@/lib/api-helpers";

export async function GET(request) {
  try {
    const { page, limit, skip, status, category } = parseQueryParams(request);
    const filter = {};
    if (status) filter.status = status;
    if (category) filter.category = category;
    const sort = status === "published"
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
    const body = await request.json();
    const result = await Announcements.insertOne(body);
    const inserted = await Announcements.findByAnnouncementId(result.ops?.[0]?.announcementId);
    return createdResponse(sanitizeDocIds(inserted || { insertedId: result.insertedId }));
  } catch (error) {
    return handleApiError(error, "Failed to create announcement");
  }
}
