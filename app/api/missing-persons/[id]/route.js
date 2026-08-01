export const dynamic = "force-dynamic";

import { MissingPersons } from "@/lib/models";
import {
  successResponse,
  notFoundResponse,
  handleApiError,
  sanitizeDocId,
  requireRole,
  handleAuthError,
  isAdminUser,
} from "@/lib/api-helpers";

export async function GET(request, { params }) {
  try {
    const isAdmin = await isAdminUser(request);
    const item = await MissingPersons.findByCaseId(params.id);
    if (!item) return notFoundResponse("Missing person case");
    if (isAdmin) return successResponse(sanitizeDocId(item));
    const { contactPhone, ...publicItem } = item;
    return successResponse(sanitizeDocId(publicItem));
  } catch (error) {
    return handleApiError(error);
  }
}

export async function PATCH(request, { params }) {
  try {
    await requireRole(request, ["super_admin", "admin"]);
    const existing = await MissingPersons.findByCaseId(params.id);
    if (!existing) return notFoundResponse("Missing person case");
    const body = await request.json();
    const update = MissingPersons.prepareForUpdate(body);
    const coll = await MissingPersons.getCollection();
    if (body.status) {
      await MissingPersons.updateStatus(params.id, body.status);
    }
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

export async function DELETE(request, { params }) {
  try {
    await requireRole(request, ["super_admin", "admin"]);
    const coll = await MissingPersons.getCollection();
    const result = await coll.deleteOne({ caseId: params.id });
    if (result.deletedCount === 0) return notFoundResponse("Missing person case");
    return successResponse({ deleted: true });
  } catch (error) {
    return handleAuthError(error);
  }
}
