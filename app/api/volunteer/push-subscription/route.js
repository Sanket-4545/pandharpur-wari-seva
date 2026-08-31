export const dynamic = "force-dynamic";

import {
  requireVolunteerAuth,
  successResponse,
  handleApiError,
  ValidationError,
  rateLimitedResponse,
} from "@/lib/api-helpers";
import { PushSubscriptions } from "@/lib/models";
import { rateLimit, getClientIp } from "@/lib/rate-limit";

const pushSubLimiter = rateLimit({ interval: 60000, max: 10 });

export async function POST(request) {
  try {
    const payload = await requireVolunteerAuth(request);

    const ip = getClientIp(request);
    const limit = pushSubLimiter(`pushsub:${payload.volunteerId}:${ip}`);
    if (!limit.allowed) {
      return rateLimitedResponse();
    }

    const body = await request.json();

    if (!body || typeof body !== "object") {
      return handleApiError(new ValidationError("Request body is required"), "Invalid request");
    }

    if (!body.endpoint || typeof body.endpoint !== "string") {
      return handleApiError(new ValidationError("Missing or invalid endpoint"), "Invalid subscription");
    }

    if (!body.keys || typeof body.keys !== "object" || !body.keys.p256dh || !body.keys.auth) {
      return handleApiError(new ValidationError("Missing or invalid subscription keys"), "Invalid subscription");
    }

    await PushSubscriptions.upsertSubscription(payload.volunteerId, {
      endpoint: body.endpoint,
      keys: {
        p256dh: body.keys.p256dh,
        auth: body.keys.auth,
      },
      userAgent: request.headers.get("user-agent") || null,
    });

    return successResponse({ message: "Push subscription saved" }, 201);
  } catch (error) {
    return handleApiError(error, "Failed to save push subscription");
  }
}

export async function DELETE(request) {
  try {
    const payload = await requireVolunteerAuth(request);

    const ip = getClientIp(request);
    const limit = pushSubLimiter(`pushdel:${payload.volunteerId}:${ip}`);
    if (!limit.allowed) {
      return rateLimitedResponse();
    }

    const body = await request.json().catch(() => ({}));

    if (body.endpoint && typeof body.endpoint === "string") {
      // Remove specific subscription
      await PushSubscriptions.removeByVolunteerAndEndpoint(payload.volunteerId, body.endpoint);
    } else {
      // Remove all subscriptions for this volunteer
      await PushSubscriptions.removeByVolunteerId(payload.volunteerId);
    }

    return successResponse({ message: "Push subscription removed" });
  } catch (error) {
    return handleApiError(error, "Failed to remove push subscription");
  }
}
