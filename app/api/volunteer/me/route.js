export const dynamic = "force-dynamic";

import { cookies as getCookies } from "next/headers";
import { Volunteers } from "@/lib/models";
import { verifyVolunteerToken, VOLUNTEER_COOKIE_NAME } from "@/lib/volunteer-auth";
import { isValidPhoneWithCode } from "@/lib/models/helpers";
import {
  successResponse,
  notFoundResponse,
  errorResponse,
  handleApiError,
  AuthError,
} from "@/lib/api-helpers";

async function requireVolunteerAuth(request) {
  if (request) {
    const origin = request.headers.get("origin");
    const referer = request.headers.get("referer");
    const host = request.headers.get("host");
    if (host) {
      const allowedOrigins = [host];
      if (process.env.APP_URL) {
        try {
          const url = new URL(process.env.APP_URL);
          allowedOrigins.push(url.host);
          allowedOrigins.push(url.host.replace(/^www\./, ""));
        } catch {}
      }
      const checkValue = (value) => {
        if (!value) return false;
        try {
          const url = new URL(value);
          const valueHost = url.host.replace(/:\d+$/, "");
          return allowedOrigins.some((allowed) => {
            const allowedClean = allowed.replace(/:\d+$/, "");
            return valueHost === allowedClean;
          });
        } catch {
          return false;
        }
      };
      if (origin && !checkValue(origin)) {
        throw new AuthError("Invalid request origin", 403);
      }
      if (!origin && referer && !checkValue(referer)) {
        throw new AuthError("Invalid request origin", 403);
      }
    }
  }
  const cookieStore = getCookies();
  const sessionCookie = cookieStore.get(VOLUNTEER_COOKIE_NAME);
  if (!sessionCookie?.value) {
    throw new AuthError("Authentication required", 401);
  }
  const payload = await verifyVolunteerToken(sessionCookie.value);
  if (!payload) {
    throw new AuthError("Invalid or expired session", 401);
  }
  const volunteer = await Volunteers.findById(payload.volunteerId);
  if (!volunteer) {
    throw new AuthError("Volunteer account not found", 401);
  }
  if (!volunteer.isActive || volunteer.status !== "approved") {
    throw new AuthError("Your account has been deactivated. Please contact the administrator.", 403, "VOLUNTEER_DEACTIVATED");
  }
  return payload;
}

export async function GET(request) {
  try {
    const payload = await requireVolunteerAuth(request);
    const volunteer = await Volunteers.findById(payload.volunteerId);
    if (!volunteer) return notFoundResponse("Volunteer");
    return successResponse(Volunteers.sanitizeVolunteer(volunteer));
  } catch (error) {
    return handleApiError(error);
  }
}

export async function PUT(request) {
  try {
    const payload = await requireVolunteerAuth(request);
    const body = await request.json();

    const allowedFields = {};
    if (body.phone !== undefined) {
      if (body.phone !== "" && body.phone !== null && !isValidPhoneWithCode(String(body.phone))) {
        return errorResponse("Phone must be a valid 10-15 digit number", 400);
      }
      allowedFields.phone = body.phone || null;
    }
    if (body.emergencyPhone !== undefined) {
      if (body.emergencyPhone !== "" && body.emergencyPhone !== null && !isValidPhoneWithCode(String(body.emergencyPhone))) {
        return errorResponse("Emergency phone must be a valid 10-15 digit number", 400);
      }
      allowedFields.emergencyPhone = body.emergencyPhone || null;
    }
    if (body.skills !== undefined) {
      if (!Array.isArray(body.skills)) {
        return errorResponse("Skills must be an array", 400);
      }
      allowedFields.skills = body.skills;
    }
    if (body.languages !== undefined) {
      if (!Array.isArray(body.languages)) {
        return errorResponse("Languages must be an array", 400);
      }
      allowedFields.languages = body.languages;
    }
    if (body.shift !== undefined) {
      const VALID_SHIFTS = ["morning", "afternoon", "evening", "night"];
      if (!VALID_SHIFTS.includes(body.shift)) {
        return errorResponse("Shift must be one of: morning, afternoon, evening, night", 400);
      }
      allowedFields.shift = body.shift;
    }

    if (Object.keys(allowedFields).length === 0) {
      return errorResponse("No updatable fields provided", 400);
    }

    const existing = await Volunteers.findById(payload.volunteerId);
    if (!existing) return notFoundResponse("Volunteer");

    const coll = await Volunteers.getCollection();
    await coll.updateOne(
      { volunteerId: payload.volunteerId },
      { $set: { ...allowedFields, updatedAt: new Date() } }
    );
    const updated = await Volunteers.findById(payload.volunteerId);
    return successResponse(Volunteers.sanitizeVolunteer(updated));
  } catch (error) {
    return handleApiError(error);
  }
}
