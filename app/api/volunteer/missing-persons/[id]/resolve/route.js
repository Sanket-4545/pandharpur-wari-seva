export const dynamic = "force-dynamic";

import { MissingPersons } from "@/lib/models";
import {
  successResponse,
  notFoundResponse,
  conflictResponse,
  errorResponse,
  handleAuthError,
  sanitizeDocId,
  requireVolunteerAuth,
} from "@/lib/api-helpers";

/**
 * PATCH /api/volunteer/missing-persons/[id]/resolve
 *
 * Marks an active missing-person case (Pending or Missing) as Found.
 * Requires an authenticated, approved volunteer session. The transition is
 * applied atomically with a status guard, so repeated or concurrent requests
 * cannot resolve the same case twice or affect any other case.
 */
export async function PATCH(request, { params }) {
  try {
    const volunteer = await requireVolunteerAuth(request);
    const caseId = params?.id;
    if (!MissingPersons.isValidCaseId(caseId)) {
      return notFoundResponse("Missing person case");
    }
    const existing = await MissingPersons.findByCaseId(caseId);
    if (!existing) {
      return notFoundResponse("Missing person case");
    }
    if (existing.status === "Found") {
      return conflictResponse("This case has already been marked as found");
    }
    if (!MissingPersons.ACTIVE_STATUSES.includes(existing.status)) {
      return errorResponse(
        `Cases with status "${existing.status}" cannot be marked as found`,
        400
      );
    }
    const updated = await MissingPersons.resolveAsFound(caseId, {
      volunteerId: volunteer.volunteerId,
      name: volunteer.volunteer?.name || volunteer.name,
    });
    if (!updated) {
      // A concurrent request changed the case between the check and the
      // atomic update. Re-read and report the accurate outcome.
      const current = await MissingPersons.findByCaseId(caseId);
      if (!current) return notFoundResponse("Missing person case");
      if (current.status === "Found") {
        return conflictResponse("This case has already been marked as found");
      }
      return errorResponse(
        `Cases with status "${current.status}" cannot be marked as found`,
        400
      );
    }
    return successResponse(sanitizeDocId(updated));
  } catch (error) {
    return handleAuthError(error);
  }
}
