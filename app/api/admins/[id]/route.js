import { Admin } from "@/lib/models";
import {
  successResponse,
  notFoundResponse,
  handleApiError,
} from "@/lib/api-helpers";

export async function GET(request, { params }) {
  try {
    const coll = await Admin.getCollection();
    const item = await coll.findOne({ _id: params.id });
    if (!item) return notFoundResponse("Admin");
    return successResponse(Admin.sanitizeAdmin(item));
  } catch (error) {
    return handleApiError(error);
  }
}

export async function PUT(request, { params }) {
  try {
    const body = await request.json();
    const coll = await Admin.getCollection();
    const existing = await coll.findOne({ _id: params.id });
    if (!existing) return notFoundResponse("Admin");

    if (body.passwordHash) {
      return errorResponse("Password updates must use a dedicated password change endpoint", 400);
    }

    const update = Admin.prepareForUpdate(body);
    await coll.updateOne({ _id: params.id }, { $set: update });
    const updated = await coll.findOne({ _id: params.id });
    return successResponse(Admin.sanitizeAdmin(updated));
  } catch (error) {
    return handleApiError(error);
  }
}

export async function DELETE(request, { params }) {
  try {
    const coll = await Admin.getCollection();
    const result = await coll.deleteOne({ _id: params.id });
    if (result.deletedCount === 0) return notFoundResponse("Admin");
    return successResponse({ deleted: true });
  } catch (error) {
    return handleApiError(error);
  }
}
