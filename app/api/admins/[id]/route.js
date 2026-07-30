import { Admin } from "@/lib/models";
import {
  successResponse,
  notFoundResponse,
  handleApiError,
  errorResponse,
  requireRole,
  handleAuthError,
} from "@/lib/api-helpers";

export async function GET(request, { params }) {
  try {
    await requireRole(request, ["super_admin", "admin"]);
    const coll = await Admin.getCollection();
    const item = await coll.findOne({ _id: params.id });
    if (!item) return notFoundResponse("Admin");
    return successResponse(Admin.sanitizeAdmin(item));
  } catch (error) {
    return handleAuthError(error);
  }
}

export async function PUT(request, { params }) {
  try {
    await requireRole(request, ["super_admin"]);
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
    return handleAuthError(error);
  }
}

export async function DELETE(request, { params }) {
  try {
    await requireRole(request, ["super_admin"]);
    const coll = await Admin.getCollection();
    const result = await coll.deleteOne({ _id: params.id });
    if (result.deletedCount === 0) return notFoundResponse("Admin");
    return successResponse({ deleted: true });
  } catch (error) {
    return handleAuthError(error);
  }
}
