import { AnalyticsEvents } from "@/lib/models";
import { requireObjectId } from "@/lib/models/helpers";
import {
  successResponse,
  notFoundResponse,
  handleApiError,
  sanitizeDocId,
  requireRole,
  handleAuthError,
} from "@/lib/api-helpers";

export async function GET(request, { params }) {
  try {
    await requireRole(request, ["super_admin", "admin", "coordinator"]);
    const coll = await AnalyticsEvents.getCollection();
    const item = await coll.findOne({ _id: requireObjectId(params.id) });
    if (!item) return notFoundResponse("Analytics event");
    return successResponse(sanitizeDocId(item));
  } catch (error) {
    return handleAuthError(error);
  }
}
