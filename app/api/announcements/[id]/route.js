import { Announcements } from "@/lib/models";
import {
  successResponse,
  notFoundResponse,
  handleApiError,
  sanitizeDocId,
  requireRole,
  handleAuthError,
} from "@/lib/api-helpers";

export async function GET(request, { params }) {
  try {
    const item = await Announcements.findByAnnouncementId(params.id);
    if (!item) return notFoundResponse("Announcement");
    return successResponse(sanitizeDocId(item));
  } catch (error) {
    return handleApiError(error);
  }
}

export async function PATCH(request, { params }) {
  try {
    await requireRole(request, ["super_admin", "admin"]);
    const existing = await Announcements.findByAnnouncementId(params.id);
    if (!existing) return notFoundResponse("Announcement");
    const body = await request.json();
    const update = Announcements.prepareForUpdate(body);
    const coll = await Announcements.getCollection();
    const updated = await coll.findOneAndUpdate(
      { announcementId: params.id },
      { $set: update },
      { returnDocument: "after" }
    );
    return successResponse(sanitizeDocId(updated));
  } catch (error) {
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
