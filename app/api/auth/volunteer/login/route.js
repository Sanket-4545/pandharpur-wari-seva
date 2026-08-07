export const dynamic = "force-dynamic";

import { Volunteers } from "@/lib/models";
import { createVolunteerToken, getVolunteerSessionCookieOptions } from "@/lib/volunteer-auth";
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
    const { volunteerId, password } = body;

    if (!volunteerId || !password) {
      return NextResponse.json(
        { success: false, error: "Volunteer ID and password are required" },
        { status: 400 }
      );
    }

    const volunteer = await Volunteers.findById(volunteerId);
    if (!volunteer) {
      return NextResponse.json(
        { success: false, error: "Invalid volunteer ID or password" },
        { status: 401 }
      );
    }

    const passwordValid = Volunteers.comparePassword(volunteer, password);
    if (!passwordValid) {
      return NextResponse.json(
        { success: false, error: "Invalid volunteer ID or password" },
        { status: 401 }
      );
    }

    if (!volunteer.isActive || volunteer.status !== "approved") {
      return NextResponse.json(
        { success: false, error: "Your account has been deactivated. Please contact the administrator." },
        { status: 403 }
      );
    }

    await Volunteers.setLastLogin(volunteer.volunteerId);

    const token = await createVolunteerToken({
      volunteerId: volunteer.volunteerId,
      email: volunteer.email,
      name: volunteer.name,
    });

    const cookieOpts = getVolunteerSessionCookieOptions(86400);

    const response = NextResponse.json(
      { success: true, data: { user: Volunteers.sanitizeVolunteer(volunteer) } },
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
    console.error("=== Volunteer Login Error ===");
    console.error("Message:", error?.message);
    console.error("Stack:", error?.stack);
    return NextResponse.json(
      { success: false, error: "Login failed" },
      { status: 500 }
    );
  }
}
