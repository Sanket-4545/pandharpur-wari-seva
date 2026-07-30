export const dynamic = "force-dynamic";

import { Admin } from "@/lib/models";
import { createToken, getSessionCookieOptions } from "@/lib/auth";
import { errorResponse, handleApiError, successResponse, rateLimitedResponse } from "@/lib/api-helpers";
import { rateLimit, getClientIp } from "@/lib/rate-limit";
import { cookies } from "next/headers";

const loginLimiter = rateLimit({ interval: 60000, max: 10 });

export async function POST(request) {
  try {
    const ip = getClientIp(request);
    const limit = loginLimiter(ip);
    if (!limit.allowed) {
      return rateLimitedResponse();
    }

    const body = await request.json();
    const { email, password } = body;

    if (!email || !password) {
      return errorResponse("Email and password are required", 400);
    }

    const admin = await Admin.findByEmail(email);
    if (!admin) {
      return errorResponse("Invalid email or password", 401);
    }

    const passwordValid = Admin.comparePassword(admin, password);
    if (!passwordValid) {
      return errorResponse("Invalid email or password", 401);
    }

    if (!admin.isActive) {
      return errorResponse("Account is deactivated. Contact a super administrator.", 403);
    }

    await Admin.setLastLogin(admin._id);

    const token = await createToken({
      userId: admin._id.toString(),
      email: admin.email,
      role: admin.role,
      name: admin.name,
    });

    const cookieOpts = getSessionCookieOptions(86400);
    cookieOpts.value = token;

    const cookieStore = cookies();
    cookieStore.set(cookieOpts.name, cookieOpts.value, {
      httpOnly: cookieOpts.httpOnly,
      secure: cookieOpts.secure,
      sameSite: cookieOpts.sameSite,
      path: cookieOpts.path,
      maxAge: cookieOpts.maxAge,
    });

    return successResponse({
      user: Admin.sanitizeAdmin(admin),
    });
  } catch (error) {
    return handleApiError(error, "Login failed");
  }
}
