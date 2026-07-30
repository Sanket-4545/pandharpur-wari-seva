export const dynamic = "force-dynamic";

import { getDbStats, listCollections } from "@/lib/models";
import { successResponse, handleApiError, requireRole, handleAuthError } from "@/lib/api-helpers";

export async function GET(request) {
  try {
    await requireRole(request, ["super_admin", "admin"]);
    const [stats, collections] = await Promise.all([
      getDbStats(),
      listCollections(),
    ]);
    return successResponse({
      database: "wariseva",
      collections,
      stats,
    });
  } catch (error) {
    return handleAuthError(error);
  }
}
