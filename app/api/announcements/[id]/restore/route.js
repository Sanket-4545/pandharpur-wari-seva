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

async function notifyPublishedAnnouncement(announcement) {
  if (!announcement || announcement.status !== "published") return;

  try {
    const { sendPushToAllVolunteers } = await import("@/lib/push-notifications");
    await sendPushToAllVolunteers({
      title: announcement.title,
      body: announcement.description,
      url: "/",
      tag: "wari-announcement",
    });
  } catch (pushErr) {
    console.error("[announcements] Push notification failed:", pushErr?.message);
  }
}

export async function POST(request, { params }) {
  try {
    await requireRole(request, ["super_admin", "admin"]);
    const existing = await Announcements.findByAnnouncementId(params.id);
    if (!existing) return notFoundResponse("Announcement");

    // Only allow restoring archived announcements
    if (existing.status !== "archived") {
      return conflictResponse("Only archived announcements can be restored");
    }

    const body = await request.json().catch(() => ({}));
    const targetStatus = body.status === "published" ? "published" : "draft";

    if (targetStatus === "published") {
      // Restore to published through the transactional model operation so the
      // target becomes published and every other published announcement is
      // demoted to draft in the same transaction. The notification is sent
      // only after the transaction commits, and only when the announcement
      // genuinely became published.
      const result = await Announcements.publishExisting(params.id, { status: "published" }, { requireStatus: "archived" });
      if (!result) return notFoundResponse("Announcement");

      // The announcement existed but was no longer archived when the
      // transaction ran (race with a concurrent update). Report a conflict
      // without changing any announcement.
      if (result.statusConflict) {
        return conflictResponse(`Only archived announcements can be restored (current status: ${result.existingStatus})`);
      }

      if (result.becamePublished) {
        await notifyPublishedAnnouncement(result.announcement);
      }

      return successResponse(sanitizeDocId(result.announcement));
    }

    const coll = await Announcements.getCollection();
    const updated = await coll.findOneAndUpdate(
      { announcementId: params.id },
      { $set: Announcements.prepareForUpdate({ status: targetStatus }) },
      { returnDocument: "after" }
    );

    return successResponse(sanitizeDocId(updated));
  } catch (error) {
    if (Announcements.isPublishStatusConflictError(error)) {
      return conflictResponse("An announcement is already published. Only one announcement can be published at a time.");
    }
    return handleAuthError(error);
  }
}
