import { Admin } from "@/lib/models";
import { hashPassword, comparePassword } from "@/lib/password";
import {
  successResponse,
  errorResponse,
  notFoundResponse,
  requireAuth,
  handleAuthError,
} from "@/lib/api-helpers";

export async function POST(request) {
  try {
    const payload = await requireAuth(request);
    const { currentPassword, newPassword } = await request.json();

    if (!currentPassword || !newPassword) {
      return errorResponse("currentPassword and newPassword are required", 400);
    }

    if (newPassword.length < 8) {
      return errorResponse("New password must be at least 8 characters", 400);
    }

    const coll = await Admin.getCollection();
    const admin = await coll.findOne({ _id: payload.userId });
    if (!admin) return notFoundResponse("Admin");

    if (!comparePassword(currentPassword, admin.passwordHash)) {
      return errorResponse("Current password is incorrect", 400);
    }

    if (currentPassword === newPassword) {
      return errorResponse("New password must differ from current password", 400);
    }

    const newHash = hashPassword(newPassword);
    await coll.updateOne(
      { _id: payload.userId },
      { $set: { passwordHash: newHash, updatedAt: new Date() } }
    );

    return successResponse({ message: "Password updated successfully" });
  } catch (error) {
    return handleAuthError(error);
  }
}
