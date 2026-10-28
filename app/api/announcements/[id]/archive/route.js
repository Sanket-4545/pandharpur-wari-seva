import { Announcements } from "@/lib/models";
import {
  successResponse,
  notFoundResponse,
  handleApiError,
  sanitizeDocId,
  requireRole,
  handleAuthError,
  conflictResponse,
} from "@/lib/api-helpers";

export async function POST(request, { params }) {
  try {
    await requireRole(request, ["super_admin", "admin"]);
    const existing = await Announcements.findByAnnouncementId(params.id);
    if (!existing) return notFoundResponse("Announcement");

    // Only allow archiving published or scheduled announcements
    if (existing.status === "archived") {
      return conflictResponse("Announcement is already archived");
    }
    if (existing.status === "draft") {
      return conflictResponse("Draft announcements cannot be archived; delete them instead");
    }

    const coll = await Announcements.getCollection();
    const updated = await coll.findOneAndUpdate(
      { announcementId: params.id },
      { $set: Announcements.prepareForUpdate({ status: "archived" }) },
      { returnDocument: "after" }
    );

    return successResponse(sanitizeDocId(updated));
  } catch (error) {
    return handleAuthError(error);
  }
}