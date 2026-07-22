import { getDbStats, listCollections } from "@/lib/models";
import { successResponse, handleApiError } from "@/lib/api-helpers";

export async function GET() {
  try {
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
    return handleApiError(error, "Failed to get database info");
  }
}
