import { MissingPersons } from "@/lib/models";
import {
  successResponse,
  notFoundResponse,
  handleApiError,
  sanitizeDocIds,
} from "@/lib/api-helpers";

export async function GET(request, { params }) {
  try {
    const item = await MissingPersons.findByCaseId(params.id);
    if (!item) return notFoundResponse("Missing person case");
    return successResponse(sanitizeDocIds(item));
  } catch (error) {
    return handleApiError(error);
  }
}

export async function PATCH(request, { params }) {
  try {
    const existing = await MissingPersons.findByCaseId(params.id);
    if (!existing) return notFoundResponse("Missing person case");
    const body = await request.json();

    if (body.status) {
      await MissingPersons.updateStatus(params.id, body.status);
    }
    const coll = await MissingPersons.getCollection();
    const updated = await coll.findOneAndUpdate(
      { caseId: params.id },
      { $set: body },
      { returnDocument: "after" }
    );
    return successResponse(sanitizeDocIds(updated));
  } catch (error) {
    return handleApiError(error);
  }
}

export async function DELETE(request, { params }) {
  try {
    const coll = await MissingPersons.getCollection();
    const result = await coll.deleteOne({ caseId: params.id });
    if (result.deletedCount === 0) return notFoundResponse("Missing person case");
    return successResponse({ deleted: true });
  } catch (error) {
    return handleApiError(error);
  }
}
