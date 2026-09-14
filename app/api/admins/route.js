import { Admin } from "@/lib/models";
import { validatePassword } from "@/lib/models/helpers";
import {
  successResponse,
  createdResponse,
  handleApiError,
  errorResponse,
  parseQueryParams,
  paginatedResponse,
  requireRole,
  handleAuthError,
  rateLimitedResponse,
} from "@/lib/api-helpers";
import { rateLimit, getClientIp } from "@/lib/rate-limit";

const adminMutationLimiter = rateLimit({ interval: 60000, max: 5 });

export async function GET(request) {
  try {
    await requireRole(request, ["super_admin", "admin"]);
    const { page, limit, skip } = parseQueryParams(request);
    const [items, total] = await Promise.all([
      Admin.getCollection().then(c => c.find({}).sort({ createdAt: -1 }).skip(skip).limit(limit).toArray()),
      Admin.getCollection().then(c => c.countDocuments({})),
    ]);
    return paginatedResponse(Admin.sanitizeAdmins(items), total, page, limit);
  } catch (error) {
    return handleAuthError(error);
  }
}

export async function POST(request) {
  try {
    const ip = getClientIp(request);
    const limit = adminMutationLimiter(ip);
    if (!limit.allowed) {
      return rateLimitedResponse();
    }
    await requireRole(request, ["super_admin"]);
    const body = await request.json();
    if (body.passwordHash) {
      validatePassword(body.passwordHash);
    }
    const existing = await Admin.findByEmail(body.email);
    if (existing) {
      return errorResponse("An admin with this email already exists", 409);
    }
    const result = await Admin.insertOne(body);
    const inserted = await Admin.findByEmail(body.email);
    return createdResponse(Admin.sanitizeAdmin(inserted));
  } catch (error) {
    return handleAuthError(error);
  }
}
