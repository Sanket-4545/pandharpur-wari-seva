export const dynamic = "force-dynamic";

import { Volunteers } from "@/lib/models";
import {
  successResponse,
  notFoundResponse,
  errorResponse,
  handleApiError,
  requireRole,
  handleAuthError,
} from "@/lib/api-helpers";

export async function PUT(request, { params }) {
  try {
    await requireRole(request, ["super_admin", "admin"]);
    const body = await request.json();
    const { password } = body;

    if (!password || typeof password !== "string") {
      return errorResponse("Password is required", 400);
    }
    if (password.length < 8 || password.length > 64) {
      return errorResponse("Password must be between 8 and 64 characters", 400);
    }

    const existing = await Volunteers.findById(params.id);
    if (!existing) return notFoundResponse("Volunteer");

    await Volunteers.setPassword(params.id, password);

    return successResponse({ volunteerId: params.id, message: "Password updated successfully" });
  } catch (error) {
    return handleAuthError(error);
  }
}
