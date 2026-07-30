import { ContactMessages } from "@/lib/models";
import {
  createdResponse,
  handleApiError,
  parseQueryParams,
  paginatedResponse,
  sanitizeDocId,
  sanitizeDocIds,
  requireRole,
  handleAuthError,
  rateLimitedResponse,
} from "@/lib/api-helpers";
import { rateLimit, getClientIp } from "@/lib/rate-limit";

const contactLimiter = rateLimit({ interval: 60000, max: 5 });

export async function POST(request) {
  try {
    const ip = getClientIp(request);
    const limit = contactLimiter(ip);
    if (!limit.allowed) {
      return rateLimitedResponse();
    }

    const body = await request.json();
    const result = await ContactMessages.insertOne(body);
    const coll = await ContactMessages.getCollection();
    const inserted = await coll.findOne({ _id: result.insertedId });
    return createdResponse(sanitizeDocId(inserted));
  } catch (error) {
    return handleApiError(error, "Failed to submit contact message");
  }
}

export async function GET(request) {
  try {
    await requireRole(request, ["super_admin", "admin", "coordinator"]);
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
    return handleAuthError(error);
  }
}
