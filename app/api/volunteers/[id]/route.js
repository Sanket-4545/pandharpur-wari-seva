import { Volunteers } from "@/lib/models";
import {
  successResponse,
  notFoundResponse,
  errorResponse,
  handleApiError,
  sanitizeDocIds,
} from "@/lib/api-helpers";

export async function GET(request, { params }) {
  try {
    const item = await Volunteers.findById(params.id);
    if (!item) return notFoundResponse("Volunteer");
    return successResponse(sanitizeDocIds(item));
  } catch (error) {
    return handleApiError(error);
  }
}

export async function PATCH(request, { params }) {
  try {
    const body = await request.json();
    const existing = await Volunteers.findById(params.id);
    if (!existing) return notFoundResponse("Volunteer");

    if (body.status) {
      await Volunteers.updateStatus(params.id, body.status);
    }
    const updated = await Volunteers.findById(params.id);
    return successResponse(sanitizeDocIds(updated));
  } catch (error) {
    return handleApiError(error);
  }
}

export async function DELETE(request, { params }) {
  try {
    const coll = await Volunteers.getCollection();
    const result = await coll.deleteOne({ volunteerId: params.id });
    if (result.deletedCount === 0) return notFoundResponse("Volunteer");
    return successResponse({ deleted: true });
  } catch (error) {
    return handleApiError(error);
  }
}
