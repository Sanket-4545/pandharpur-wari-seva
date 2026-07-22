import { AnalyticsEvents } from "@/lib/models";
import {
  createdResponse,
  handleApiError,
  parseQueryParams,
  paginatedResponse,
  sanitizeDocIds,
  errorResponse,
} from "@/lib/api-helpers";

export async function GET(request) {
  try {
    const { page, limit, skip } = parseQueryParams(request);
    const { searchParams } = new URL(request.url);
    const eventType = searchParams.get("eventType");
    const filter = {};
    if (eventType) filter.eventType = eventType;
    const [items, total] = await Promise.all([
      AnalyticsEvents.getCollection().then(c => c.find(filter).sort({ createdAt: -1 }).skip(skip).limit(limit).toArray()),
      AnalyticsEvents.getCollection().then(c => c.countDocuments(filter)),
    ]);
    return paginatedResponse(sanitizeDocIds(items), total, page, limit);
  } catch (error) {
    return handleApiError(error);
  }
}

export async function POST(request) {
  try {
    const body = await request.json();
    const coll = await AnalyticsEvents.getCollection();
    const result = await coll.insertOne(AnalyticsEvents.prepareForInsert(body));
    const inserted = await coll.findOne({ _id: result.insertedId });
    return createdResponse(sanitizeDocIds(inserted));
  } catch (error) {
    return handleApiError(error, "Failed to log analytics event");
  }
}
