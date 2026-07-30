export const dynamic = "force-dynamic";

import { getSessionCookieOptions } from "@/lib/auth";
import { successResponse, handleApiError } from "@/lib/api-helpers";
import { cookies } from "next/headers";

export async function POST() {
  try {
    const cookieOpts = getSessionCookieOptions(0);
    const cookieStore = cookies();
    cookieStore.set(cookieOpts.name, "", {
      httpOnly: cookieOpts.httpOnly,
      secure: cookieOpts.secure,
      sameSite: cookieOpts.sameSite,
      path: cookieOpts.path,
      maxAge: 0,
    });

    return successResponse({ message: "Logged out successfully" });
  } catch (error) {
    return handleApiError(error, "Logout failed");
  }
}
