import { Admin } from "@/lib/models";
import { toObjectId } from "@/lib/models/helpers";
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
    const item = await Admin.findById(toObjectId(params.id));
    if (!item) return notFoundResponse("Admin");
    return successResponse(Admin.sanitizeAdmin(item));
  } catch (error) {
    return handleAuthError(error);
  }
}

export async function PUT(request, { params }) {
  try {
    await requireRole(request, ["super_admin"]);
    const adminId = toObjectId(params.id);
    const body = await request.json();
    const coll = await Admin.getCollection();
    const existing = await Admin.findById(adminId);
    if (!existing) return notFoundResponse("Admin");

    if (body.passwordHash) {
      return errorResponse("Password updates must use a dedicated password change endpoint", 400);
    }

    const update = Admin.prepareForUpdate(body);
    await coll.updateOne({ _id: adminId }, { $set: update });
    const updated = await Admin.findById(adminId);
    return successResponse(Admin.sanitizeAdmin(updated));
  } catch (error) {
    return handleAuthError(error);
  }
}

export async function DELETE(request, { params }) {
  try {
    await requireRole(request, ["super_admin"]);
    const coll = await Admin.getCollection();
    const result = await coll.deleteOne({ _id: toObjectId(params.id) });
    if (result.deletedCount === 0) return notFoundResponse("Admin");
    return successResponse({ deleted: true });
  } catch (error) {
    return handleAuthError(error);
  }
}
