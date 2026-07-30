import { Volunteers } from "@/lib/models";
import {
  successResponse,
  notFoundResponse,
  errorResponse,
  handleApiError,
  sanitizeDocId,
  requireRole,
  handleAuthError,
} from "@/lib/api-helpers";

export async function GET(request, { params }) {
  try {
    await requireRole(request, ["super_admin", "admin", "coordinator"]);
    const item = await Volunteers.findById(params.id);
    if (!item) return notFoundResponse("Volunteer");
    return successResponse(sanitizeDocId(item));
  } catch (error) {
    return handleAuthError(error);
  }
}

export async function PATCH(request, { params }) {
  try {
    await requireRole(request, ["super_admin", "admin"]);
    const body = await request.json();
    const existing = await Volunteers.findById(params.id);
    if (!existing) return notFoundResponse("Volunteer");

    const updateData = Volunteers.prepareForUpdate(body);
    const coll = await Volunteers.getCollection();
    await coll.updateOne(
      { volunteerId: params.id },
      { $set: updateData }
    );

    const updated = await Volunteers.findById(params.id);
    return successResponse(sanitizeDocId(updated));
  } catch (error) {
    return handleAuthError(error);
  }
}

export async function DELETE(request, { params }) {
  try {
    await requireRole(request, ["super_admin", "admin"]);
    const coll = await Volunteers.getCollection();
    const result = await coll.deleteOne({ volunteerId: params.id });
    if (result.deletedCount === 0) return notFoundResponse("Volunteer");
    return successResponse({ deleted: true });
  } catch (error) {
    return handleAuthError(error);
  }
}
