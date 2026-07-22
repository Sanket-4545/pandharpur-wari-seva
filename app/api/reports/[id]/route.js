import { Reports } from "@/lib/models";
import {
  successResponse,
  notFoundResponse,
  handleApiError,
  sanitizeDocIds,
} from "@/lib/api-helpers";

export async function GET(request, { params }) {
  try {
    const item = await Reports.findByReportId(params.id);
    if (!item) return notFoundResponse("Report");
    return successResponse(sanitizeDocIds(item));
  } catch (error) {
    return handleApiError(error);
  }
}

export async function PATCH(request, { params }) {
  try {
    const existing = await Reports.findByReportId(params.id);
    if (!existing) return notFoundResponse("Report");
    const body = await request.json();
    const coll = await Reports.getCollection();
    const updated = await coll.findOneAndUpdate(
      { reportId: params.id },
      { $set: { ...body, updatedAt: new Date() } },
      { returnDocument: "after" }
    );
    return successResponse(sanitizeDocIds(updated));
  } catch (error) {
    return handleApiError(error);
  }
}

export async function DELETE(request, { params }) {
  try {
    const coll = await Reports.getCollection();
    const result = await coll.deleteOne({ reportId: params.id });
    if (result.deletedCount === 0) return notFoundResponse("Report");
    return successResponse({ deleted: true });
  } catch (error) {
    return handleApiError(error);
  }
}
