export const dynamic = "force-dynamic";

import { HelpRequests } from "@/lib/models";
import {
  successResponse,
  notFoundResponse,
  forbiddenResponse,
  handleAuthError,
  requireVolunteerAuth,
} from "@/lib/api-helpers";

export async function PATCH(request, { params }) {
  try {
    const volunteer = await requireVolunteerAuth(request);
    const existing = await HelpRequests.findByRequestId(params.id);
    if (!existing) return notFoundResponse("Help request");
    if (existing.volunteerId !== volunteer.volunteerId) {
      return forbiddenResponse("You can only update requests assigned to you");
    }
    const body = await request.json();
    if (!body.status) {
      return forbiddenResponse("Status is required");
    }
    await HelpRequests.updateStatus(params.id, body.status);
    const coll = await HelpRequests.getCollection();
    const updated = await coll.findOne({ requestId: params.id });
    return successResponse(updated);
  } catch (error) {
    return handleAuthError(error);
  }
}
