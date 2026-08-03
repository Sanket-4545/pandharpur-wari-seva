export const dynamic = "force-dynamic";

import { Admin } from "@/lib/models";
import { createToken, getSessionCookieOptions } from "@/lib/auth";
import { rateLimit, getClientIp } from "@/lib/rate-limit";
import { NextResponse } from "next/server";

const loginLimiter = rateLimit({ interval: 60000, max: 10 });

export async function POST(request) {
  try {
    const ip = getClientIp(request);
    const limit = loginLimiter(ip);
    if (!limit.allowed) {
      return NextResponse.json(
        { success: false, error: "Too many requests. Please try again later." },
        { status: 429 }
      );
    }

    const body = await request.json();
    const { email, password } = body;

    if (!email || !password) {
      return NextResponse.json(
        { success: false, error: "Email and password are required" },
        { status: 400 }
      );
    }

    const admin = await Admin.findByEmail(email);
    if (!admin) {
      return NextResponse.json(
        { success: false, error: "Invalid email or password" },
        { status: 401 }
      );
    }

    const passwordValid = Admin.comparePassword(admin, password);
    if (!passwordValid) {
      return NextResponse.json(
        { success: false, error: "Invalid email or password" },
        { status: 401 }
      );
    }

    if (!admin.isActive) {
      return NextResponse.json(
        { success: false, error: "Account is deactivated. Contact a super administrator." },
        { status: 403 }
      );
    }

    await Admin.setLastLogin(admin._id);

    const token = await createToken({
      userId: admin._id.toString(),
      email: admin.email,
      role: admin.role,
      name: admin.name,
    });

    const cookieOpts = getSessionCookieOptions(86400);

    const response = NextResponse.json(
      { success: true, data: { user: Admin.sanitizeAdmin(admin) } },
      { status: 200 }
    );

    response.cookies.set(cookieOpts.name, token, {
      httpOnly: cookieOpts.httpOnly,
      secure: cookieOpts.secure,
      sameSite: cookieOpts.sameSite,
      path: cookieOpts.path,
      maxAge: cookieOpts.maxAge,
    });

    return response;
  } catch (error) {
    console.error("=== API Error ===");
    console.error("Message:", error?.message);
    console.error("Stack:", error?.stack);
    return NextResponse.json(
      { success: false, error: "Login failed" },
      { status: 500 }
    );
  }
}
