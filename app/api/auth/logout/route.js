export const dynamic = "force-dynamic";

import { getSessionCookieOptions } from "@/lib/auth";
import { NextResponse } from "next/server";

export async function POST() {
  try {
    const cookieOpts = getSessionCookieOptions(0);

    const response = NextResponse.json(
      { success: true, data: { message: "Logged out successfully" } },
      { status: 200 }
    );

    response.cookies.set(cookieOpts.name, "", {
      httpOnly: cookieOpts.httpOnly,
      secure: cookieOpts.secure,
      sameSite: cookieOpts.sameSite,
      path: cookieOpts.path,
      maxAge: 0,
    });

    return response;
  } catch (error) {
    return NextResponse.json(
      { success: false, error: "Logout failed" },
      { status: 500 }
    );
  }
}
