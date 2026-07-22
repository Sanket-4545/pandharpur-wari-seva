import { AnalyticsEvents } from "@/lib/models";
import {
  successResponse,
  notFoundResponse,
  handleApiError,
  sanitizeDocIds,
} from "@/lib/api-helpers";

export async function GET(request, { params }) {
  try {
    const coll = await AnalyticsEvents.getCollection();
    const item = await coll.findOne({ _id: params.id });
    if (!item) return notFoundResponse("Analytics event");
    return successResponse(sanitizeDocIds(item));
  } catch (error) {
    return handleApiError(error);
  }
}
