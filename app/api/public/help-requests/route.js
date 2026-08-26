export const dynamic = "force-dynamic";

import { HelpRequests } from "@/lib/models";
import {
  createdResponse,
  handleApiError,
  rateLimitedResponse,
} from "@/lib/api-helpers";
import { rateLimit, getClientIp } from "@/lib/rate-limit";

const helpRequestLimiter = rateLimit({ interval: 60000, max: 5 });

export async function POST(request) {
  try {
    const ip = getClientIp(request);
    const limit = helpRequestLimiter(ip);
    if (!limit.allowed) {
      return rateLimitedResponse();
    }

    const body = await request.json();

    const cleanBody = {
      fullName: body.fullName,
      contactNumber: body.contactNumber,
      helpType: body.helpType,
      location: body.location || null,
    };
    if (body.message && typeof body.message === "string") {
      cleanBody.message = body.message;
    }

    const result = await HelpRequests.insertOne(cleanBody);
    const coll = await HelpRequests.getCollection();
    const inserted = await coll.findOne({ _id: result.insertedId });
    return createdResponse(inserted);
  } catch (error) {
    return handleApiError(error, "Failed to submit help request");
  }
}
