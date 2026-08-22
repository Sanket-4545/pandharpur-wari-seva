export const dynamic = "force-dynamic";

import { MissingPersons } from "@/lib/models";
import {
  successResponse,
  notFoundResponse,
  handleAuthError,
  sanitizeDocId,
  requireVolunteerAuth,
} from "@/lib/api-helpers";

export async function GET(request, { params }) {
  try {
    const volunteer = await requireVolunteerAuth(request);
    const person = await MissingPersons.findByCaseId(params.id);
    if (!person) return notFoundResponse("Missing person");
    if (person.volunteerId !== volunteer.volunteerId) return notFoundResponse("Missing person");
    return successResponse(sanitizeDocId(person));
  } catch (error) {
    return handleAuthError(error);
  }
}

export async function PATCH(request, { params }) {
  try {
    const volunteer = await requireVolunteerAuth(request);
    const existing = await MissingPersons.findByCaseId(params.id);
    if (!existing) return notFoundResponse("Missing person");
    if (existing.volunteerId !== volunteer.volunteerId) return notFoundResponse("Missing person");
    const body = await request.json();
    delete body.status;
    const coll = await MissingPersons.getCollection();
    const update = { ...body, updatedAt: new Date() };
    delete update._id;
    delete update.caseId;
    delete update.createdAt;
    delete update.volunteerId;
    const updated = await coll.findOneAndUpdate(
      { caseId: params.id },
      { $set: update },
      { returnDocument: "after" }
    );
    return successResponse(sanitizeDocId(updated));
  } catch (error) {
    return handleAuthError(error);
  }
}
