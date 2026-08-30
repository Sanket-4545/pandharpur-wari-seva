export const dynamic = "force-dynamic";

import { HelpRequests } from "@/lib/models";
import {
  successResponse,
  handleApiError,
  handleAuthError,
  requireRole,
} from "@/lib/api-helpers";

const MAX_BULK_DELETE = 50;

export async function DELETE(request) {
  try {
    await requireRole(request, ["super_admin", "admin"]);
    const body = await request.json();
    const { ids } = body;

    if (!Array.isArray(ids) || ids.length === 0) {
      return handleApiError(new Error("ids array is required and must not be empty"));
    }

    if (ids.length > MAX_BULK_DELETE) {
      return handleApiError(new Error(`Cannot delete more than ${MAX_BULK_DELETE} items at once`));
    }

    const validIds = ids.filter((id) => typeof id === "string" && id.trim().length > 0);
    if (validIds.length === 0) {
      return handleApiError(new Error("No valid request IDs provided"));
    }

    const coll = await HelpRequests.getCollection();
    const result = await coll.deleteMany({ requestId: { $in: validIds } });

    return successResponse({
      deleted: result.deletedCount,
      requested: validIds.length,
    });
  } catch (error) {
    return handleAuthError(error);
  }
}
