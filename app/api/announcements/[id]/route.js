import { Announcements } from "@/lib/models";
import {
  successResponse,
  notFoundResponse,
  handleApiError,
  sanitizeDocIds,
} from "@/lib/api-helpers";

export async function GET(request, { params }) {
  try {
    const item = await Announcements.findByAnnouncementId(params.id);
    if (!item) return notFoundResponse("Announcement");
    return successResponse(sanitizeDocIds(item));
  } catch (error) {
    return handleApiError(error);
  }
}

export async function PATCH(request, { params }) {
  try {
    const existing = await Announcements.findByAnnouncementId(params.id);
    if (!existing) return notFoundResponse("Announcement");
    const body = await request.json();
    const coll = await Announcements.getCollection();
    const updated = await coll.findOneAndUpdate(
      { announcementId: params.id },
      { $set: { ...body, updatedAt: new Date() } },
      { returnDocument: "after" }
    );
    return successResponse(sanitizeDocIds(updated));
  } catch (error) {
    return handleApiError(error);
  }
}

export async function DELETE(request, { params }) {
  try {
    const coll = await Announcements.getCollection();
    const result = await coll.deleteOne({ announcementId: params.id });
    if (result.deletedCount === 0) return notFoundResponse("Announcement");
    return successResponse({ deleted: true });
  } catch (error) {
    return handleApiError(error);
  }
}
