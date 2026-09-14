import { Admin } from "@/lib/models";
import { requireObjectId, validatePassword } from "@/lib/models/helpers";
import { hashPassword } from "@/lib/password";
import {
  successResponse,
  errorResponse,
  notFoundResponse,
  rateLimitedResponse,
  requireRole,
  handleAuthError,
} from "@/lib/api-helpers";
import { rateLimit, getClientIp } from "@/lib/rate-limit";

const passwordResetLimiter = rateLimit({ interval: 300000, max: 5 });

export async function POST(request, { params }) {
  try {
    const ip = getClientIp(request);
    const limit = passwordResetLimiter(ip);
    if (!limit.allowed) {
      return rateLimitedResponse();
    }

    await requireRole(request, ["super_admin"]);

    const adminId = requireObjectId(params.id);
    const { newPassword } = await request.json();

    if (!newPassword) {
      return errorResponse("newPassword is required", 400);
    }

    validatePassword(newPassword);

    const admin = await Admin.findById(adminId);
    if (!admin) return notFoundResponse("Admin");

    const newHash = hashPassword(newPassword);
    const coll = await Admin.getCollection();
    await coll.updateOne(
      { _id: adminId },
      { $set: { passwordHash: newHash, updatedAt: new Date() } }
    );

    return successResponse({ message: "Password reset successfully" });
  } catch (error) {
    return handleAuthError(error);
  }
}
