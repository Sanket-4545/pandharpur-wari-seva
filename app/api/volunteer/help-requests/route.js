export const dynamic = "force-dynamic";

import { HelpRequests } from "@/lib/models";
import {
  handleAuthError,
  parseQueryParams,
  paginatedResponse,
  sanitizeDocIds,
  requireVolunteerAuth,
} from "@/lib/api-helpers";

export async function GET(request) {
  try {
    const volunteer = await requireVolunteerAuth(request);
    const { page, limit, skip, status } = parseQueryParams(request);
    const { searchParams } = new URL(request.url);
    const mine = searchParams.get("mine") === "true";
    const filter = { status: status || "Pending" };
    if (mine) {
      filter.volunteerId = volunteer.volunteerId;
    }
    const [items, total] = await Promise.all([
      HelpRequests.getCollection().then((c) =>
        c.find(filter).sort({ createdAt: -1 }).skip(skip).limit(limit).toArray()
      ),
      HelpRequests.getCollection().then((c) => c.countDocuments(filter)),
    ]);
    return paginatedResponse(sanitizeDocIds(items), total, page, limit);
  } catch (error) {
    return handleAuthError(error);
  }
}
