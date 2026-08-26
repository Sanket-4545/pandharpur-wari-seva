export const dynamic = "force-dynamic";

import { HelpRequests } from "@/lib/models";
import {
  successResponse,
  notFoundResponse,
  conflictResponse,
  handleAuthError,
  handleApiError,
  requireVolunteerAuth,
} from "@/lib/api-helpers";

export async function PATCH(request, { params }) {
  try {
    const volunteer = await requireVolunteerAuth(request);
    const updated = await HelpRequests.acceptRequest(
      params.id,
      volunteer.volunteerId
    );
    if (!updated) {
      const existing = await HelpRequests.findByRequestId(params.id);
      if (!existing) return notFoundResponse("Help request");
      return conflictResponse("This request has already been accepted by another volunteer");
    }
    return successResponse(updated);
  } catch (error) {
    return handleAuthError(error);
  }
}
