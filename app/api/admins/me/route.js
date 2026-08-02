export const dynamic = "force-dynamic";

import { Admin } from "@/lib/models";
import { toObjectId, requiredField, sanitizeString, isValidPhoneWithCode } from "@/lib/models/helpers";
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
    const admin = await Admin.findById(toObjectId(payload.userId));
    if (!admin) return notFoundResponse("Admin");
    return successResponse(Admin.sanitizeAdmin(admin));
  } catch (error) {
    return handleAuthError(error);
  }
}

export async function PUT(request) {
  try {
    const payload = await requireAuth(request);
    const adminId = toObjectId(payload.userId);
    const body = await request.json();

    const allowedFields = {};
    if (body.name !== undefined) {
      const trimmedName = sanitizeString(body.name, 100);
      requiredField(trimmedName, "name");
      allowedFields.name = trimmedName;
    }
    if (body.phone !== undefined) {
      if (body.phone !== "" && body.phone !== null && !isValidPhoneWithCode(String(body.phone))) {
        return errorResponse("Phone must be a valid 10-15 digit number", 400);
      }
      allowedFields.phone = body.phone || null;
    }
    if (body.about !== undefined) {
      allowedFields.about = body.about ? sanitizeString(body.about, 500) : null;
    }

    if (Object.keys(allowedFields).length === 0) {
      return errorResponse("No updatable fields provided", 400);
    }

    const update = Admin.prepareForUpdate(allowedFields);
    delete update.role;
    delete update.isActive;

    const existing = await Admin.findById(adminId);
    if (!existing) return notFoundResponse("Admin");

    const coll = await Admin.getCollection();
    await coll.updateOne({ _id: adminId }, { $set: update });
    const updated = await Admin.findById(adminId);
    return successResponse(Admin.sanitizeAdmin(updated));
  } catch (error) {
    return handleAuthError(error);
  }
}
