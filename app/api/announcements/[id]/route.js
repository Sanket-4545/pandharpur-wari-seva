import { Announcements } from "@/lib/models";
import {
  successResponse,
  notFoundResponse,
  handleApiError,
  sanitizeDocId,
  requireRole,
  handleAuthError,
  isAdminUser,
  conflictResponse,
} from "@/lib/api-helpers";

export async function GET(request, { params }) {
  try {
    const isAdmin = await isAdminUser(request);
    const item = await Announcements.findByAnnouncementId(params.id);
    if (!item) return notFoundResponse("Announcement");
    if (!isAdmin && item.status !== "published") {
      return notFoundResponse("Announcement");
    }
    return successResponse(sanitizeDocId(item));
  } catch (error) {
    return handleApiError(error);
  }
}

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

export async function PATCH(request, { params }) {
  try {
    await requireRole(request, ["super_admin", "admin"]);
    const existing = await Announcements.findByAnnouncementId(params.id);
    if (!existing) return notFoundResponse("Announcement");
    const body = await request.json();

    if (body?.status === "published") {
      // Publish through the model so the target is re-read, validated, and
      // updated while every other published announcement is demoted in the
      // same transaction. Notification happens only after the commit resolves.
      const result = await Announcements.publishExisting(params.id, body);
      if (!result) return notFoundResponse("Announcement");

      if (result.becamePublished) {
        await notifyPublishedAnnouncement(result.announcement);
      }

      return successResponse(sanitizeDocId(result.announcement));
    }

    const update = Announcements.prepareForUpdate(body);
    const coll = await Announcements.getCollection();
    const updated = await coll.findOneAndUpdate(
      { announcementId: params.id },
      { $set: update },
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

export async function DELETE(request, { params }) {
  try {
    await requireRole(request, ["super_admin", "admin"]);
    const coll = await Announcements.getCollection();
    const result = await coll.deleteOne({ announcementId: params.id });
    if (result.deletedCount === 0) return notFoundResponse("Announcement");
    return successResponse({ deleted: true });
  } catch (error) {
    return handleAuthError(error);
  }
}
