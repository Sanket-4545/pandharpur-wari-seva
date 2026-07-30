export const dynamic = "force-dynamic";

import { Admin } from "@/lib/models";
import {
  successResponse,
  notFoundResponse,
  requireAuth,
  handleAuthError,
  errorResponse,
} from "@/lib/api-helpers";

export async function GET(request) {
  try {
    const payload = await requireAuth(request);
    const coll = await Admin.getCollection();
    const admin = await coll.findOne({ _id: payload.userId });
    if (!admin) return notFoundResponse("Admin");
    return successResponse(Admin.sanitizeAdmin(admin));
  } catch (error) {
    return handleAuthError(error);
  }
}

export async function PUT(request) {
  try {
    const payload = await requireAuth(request);
    const body = await request.json();

    const allowedFields = {};
    if (body.name !== undefined) allowedFields.name = body.name;
    if (body.phone !== undefined) allowedFields.phone = body.phone;
    if (body.about !== undefined) allowedFields.about = body.about;

    if (Object.keys(allowedFields).length === 0) {
      return errorResponse("No updatable fields provided", 400);
    }

    const update = Admin.prepareForUpdate(allowedFields);
    delete update.role;
    delete update.isActive;

    const coll = await Admin.getCollection();
    const existing = await coll.findOne({ _id: payload.userId });
    if (!existing) return notFoundResponse("Admin");

    await coll.updateOne({ _id: payload.userId }, { $set: update });
    const updated = await coll.findOne({ _id: payload.userId });
    return successResponse(Admin.sanitizeAdmin(updated));
  } catch (error) {
    return handleAuthError(error);
  }
}
