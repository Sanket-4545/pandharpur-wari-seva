export const dynamic = "force-dynamic";

import { HelpRequests } from "@/lib/models";
import {
  successResponse,
  notFoundResponse,
  handleApiError,
  handleAuthError,
  sanitizeDocId,
  requireRole,
} from "@/lib/api-helpers";

export async function GET(request, { params }) {
  try {
    await requireRole(request, ["super_admin", "admin"]);
    const item = await HelpRequests.findByRequestId(params.id);
    if (!item) return notFoundResponse("Help request");
    return successResponse(sanitizeDocId(item));
  } catch (error) {
    return handleAuthError(error);
  }
}

export async function PATCH(request, { params }) {
  try {
    await requireRole(request, ["super_admin", "admin"]);
    const existing = await HelpRequests.findByRequestId(params.id);
    if (!existing) return notFoundResponse("Help request");
    const body = await request.json();
    if (body.status) {
      await HelpRequests.updateStatus(params.id, body.status);
    }
    const coll = await HelpRequests.getCollection();
    const updated = await coll.findOne({ requestId: params.id });
    return successResponse(sanitizeDocId(updated));
  } catch (error) {
    return handleAuthError(error);
  }
}

export async function DELETE(request, { params }) {
  try {
    await requireRole(request, ["super_admin", "admin"]);
    const coll = await HelpRequests.getCollection();
    const result = await coll.deleteOne({ requestId: params.id });
    if (result.deletedCount === 0) return notFoundResponse("Help request");
    return successResponse({ deleted: true });
  } catch (error) {
    return handleAuthError(error);
  }
}
