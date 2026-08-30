import { Admin } from "@/lib/models";
import { requireObjectId, validatePassword } from "@/lib/models/helpers";
import { hashPassword, comparePassword } from "@/lib/password";
import {
  successResponse,
  errorResponse,
  notFoundResponse,
  rateLimitedResponse,
  requireAuth,
  handleAuthError,
} from "@/lib/api-helpers";
import { rateLimit, getClientIp } from "@/lib/rate-limit";

const passwordChangeLimiter = rateLimit({ interval: 300000, max: 5 });

export async function POST(request) {
  try {
    const ip = getClientIp(request);
    const limit = passwordChangeLimiter(ip);
    if (!limit.allowed) {
      return rateLimitedResponse();
    }

    const payload = await requireAuth(request);
    const adminId = requireObjectId(payload.userId);
    const { currentPassword, newPassword } = await request.json();

    if (!currentPassword || !newPassword) {
      return errorResponse("currentPassword and newPassword are required", 400);
    }

    validatePassword(newPassword);

    const admin = await Admin.findById(adminId);
    if (!admin) return notFoundResponse("Admin");

    if (!comparePassword(currentPassword, admin.passwordHash)) {
      return errorResponse("Current password is incorrect", 400);
    }

    if (currentPassword === newPassword) {
      return errorResponse("New password must differ from current password", 400);
    }

    const newHash = hashPassword(newPassword);
    const coll = await Admin.getCollection();
    await coll.updateOne(
      { _id: adminId },
      { $set: { passwordHash: newHash, updatedAt: new Date() } }
    );

    return successResponse({ message: "Password updated successfully" });
  } catch (error) {
    return handleAuthError(error);
  }
}
