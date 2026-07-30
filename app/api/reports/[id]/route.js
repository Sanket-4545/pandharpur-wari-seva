import { Reports } from "@/lib/models";
import {
  successResponse,
  notFoundResponse,
  handleApiError,
  sanitizeDocId,
  requireRole,
  handleAuthError,
} from "@/lib/api-helpers";

export async function GET(request, { params }) {
  try {
    await requireRole(request, ["super_admin", "admin", "coordinator"]);
    const item = await Reports.findByReportId(params.id);
    if (!item) return notFoundResponse("Report");
    return successResponse(sanitizeDocId(item));
  } catch (error) {
    return handleAuthError(error);
  }
}

export async function PATCH(request, { params }) {
  try {
    await requireRole(request, ["super_admin", "admin"]);
    const existing = await Reports.findByReportId(params.id);
    if (!existing) return notFoundResponse("Report");
    const body = await request.json();
    const update = Reports.prepareForUpdate(body);
    const coll = await Reports.getCollection();
    const updated = await coll.findOneAndUpdate(
      { reportId: params.id },
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
    const coll = await Reports.getCollection();
    const result = await coll.deleteOne({ reportId: params.id });
    if (result.deletedCount === 0) return notFoundResponse("Report");
    return successResponse({ deleted: true });
  } catch (error) {
    return handleAuthError(error);
  }
}
