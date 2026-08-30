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
    const allowedFields = {};
    if (body.name !== undefined) allowedFields.name = body.name;
    if (body.gender !== undefined) allowedFields.gender = body.gender;
    if (body.category !== undefined) allowedFields.category = body.category;
    if (body.age !== undefined) allowedFields.age = body.age;
    if (body.lastSeenLocation !== undefined) allowedFields.lastSeenLocation = body.lastSeenLocation;
    if (body.contactPhone !== undefined) allowedFields.contactPhone = body.contactPhone;
    if (body.clothing !== undefined) allowedFields.clothing = body.clothing;
    if (body.description !== undefined) allowedFields.description = body.description;
    if (body.photoUrl !== undefined) allowedFields.photoUrl = body.photoUrl;
    if (Object.keys(allowedFields).length === 0) {
      return successResponse(sanitizeDocId(existing));
    }
    const coll = await MissingPersons.getCollection();
    const update = { ...allowedFields, updatedAt: new Date() };
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
