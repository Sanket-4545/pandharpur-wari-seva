import { ContactMessages } from "@/lib/models";
import {
  createdResponse,
  handleApiError,
  parseQueryParams,
  paginatedResponse,
  sanitizeDocIds,
} from "@/lib/api-helpers";

export async function POST(request) {
  try {
    const body = await request.json();
    const result = await ContactMessages.insertOne(body);
    const coll = await ContactMessages.getCollection();
    const inserted = await coll.findOne({ _id: result.insertedId });
    return createdResponse(sanitizeDocIds(inserted));
  } catch (error) {
    return handleApiError(error, "Failed to submit contact message");
  }
}

export async function GET(request) {
  try {
    const { page, limit, skip } = parseQueryParams(request);
    const { searchParams } = new URL(request.url);
    const isRead = searchParams.get("isRead");
    const filter = {};
    if (isRead === "true") filter.isRead = true;
    if (isRead === "false") filter.isRead = false;
    const [items, total] = await Promise.all([
      ContactMessages.getCollection().then(c => c.find(filter).sort({ createdAt: -1 }).skip(skip).limit(limit).toArray()),
      ContactMessages.getCollection().then(c => c.countDocuments(filter)),
    ]);
    return paginatedResponse(sanitizeDocIds(items), total, page, limit);
  } catch (error) {
    return handleApiError(error);
  }
}
