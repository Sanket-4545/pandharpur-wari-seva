import { Admin } from "@/lib/models";
import {
  successResponse,
  createdResponse,
  handleApiError,
  errorResponse,
  parseQueryParams,
  paginatedResponse,
  requireRole,
  handleAuthError,
} from "@/lib/api-helpers";

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
    await requireRole(request, ["super_admin"]);
    const body = await request.json();
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
