export const dynamic = "force-dynamic";

import { Volunteers } from "@/lib/models";
import {
  createdResponse,
  errorResponse,
  handleApiError,
  parseQueryParams,
  paginatedResponse,
  sanitizeDocId,
  sanitizeDocIds,
  requireRole,
  handleAuthError,
  rateLimitedResponse,
} from "@/lib/api-helpers";
import { rateLimit, getClientIp } from "@/lib/rate-limit";

const registerLimiter = rateLimit({ interval: 60000, max: 10 });

export async function POST(request) {
  try {
    const ip = getClientIp(request);
    const limit = registerLimiter(ip);
    if (!limit.allowed) {
      return rateLimitedResponse();
    }

    const body = await request.json();
    if (body.email) {
      const existing = await Volunteers.findByEmail(body.email);
      if (existing) {
        return errorResponse("A volunteer with this email already exists", 409);
      }
    }
    const registrationBody = {
      name: body.name,
      email: body.email,
      phone: body.phone,
      gender: body.gender,
      age: body.age,
      city: body.city,
      college: body.college,
      nssUnit: body.nssUnit,
      bloodGroup: body.bloodGroup,
      emergencyPhone: body.emergencyPhone,
      shift: body.shift,
      skills: body.skills,
      languages: body.languages,
      passwordHash: body.passwordHash,
    };
    const result = await Volunteers.insertOne(registrationBody);
    const coll = await Volunteers.getCollection();
    const inserted = await coll.findOne({ _id: result.insertedId });
    if (!inserted) {
      return errorResponse("Failed to retrieve created volunteer", 500);
    }
    return createdResponse(sanitizeDocId(inserted));
  } catch (error) {
    return handleApiError(error, "Failed to register volunteer");
  }
}

export async function GET(request) {
  try {
    await requireRole(request, ["super_admin", "admin", "coordinator"]);
    const { page, limit, skip, status, search } = parseQueryParams(request);
    const filter = {};
    if (status) filter.status = status;
    if (search) filter.$text = { $search: search };
    const [items, total] = await Promise.all([
      Volunteers.getCollection().then(c => c.find(filter).sort({ createdAt: -1 }).skip(skip).limit(limit).toArray()),
      Volunteers.getCollection().then(c => c.countDocuments(filter)),
    ]);
    return paginatedResponse(sanitizeDocIds(items), total, page, limit);
  } catch (error) {
    return handleAuthError(error);
  }
}
