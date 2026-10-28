export const dynamic = "force-dynamic";

import { Announcements } from "@/lib/models";
import {
  createdResponse,
  handleApiError,
  parseQueryParams,
  paginatedResponse,
  sanitizeDocId,
  sanitizeDocIds,
  requireRole,
  handleAuthError,
  conflictResponse,
} from "@/lib/api-helpers";

export async function GET(request) {
  try {
    let isAdmin = false;
    try {
      await requireRole(request, ["super_admin", "admin", "coordinator"]);
      isAdmin = true;
    } catch {
      // Anonymous visitors only see published announcements
    }
    const { page, limit, skip, status, category } = parseQueryParams(request);
    const filter = {};
    if (category) filter.category = category;
    if (isAdmin) {
      if (status) filter.status = status;
    } else {
      filter.status = "published";
    }
    const isPublishedView = isAdmin ? status === "published" : true;
    const sort = isPublishedView
      ? { publishDate: -1 }
      : { createdAt: -1 };
    const [items, total] = await Promise.all([
      Announcements.getCollection().then(c => c.find(filter).sort(sort).skip(skip).limit(limit).toArray()),
      Announcements.getCollection().then(c => c.countDocuments(filter)),
    ]);
    return paginatedResponse(sanitizeDocIds(items), total, page, limit);
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

export async function POST(request) {
  try {
    await requireRole(request, ["super_admin", "admin"]);
    const body = await request.json();

    let inserted;

    if (body?.status === "published") {
      // Demote any previously published announcement and insert the new one in
      // the same transaction. createPublished() resolves only after commit, so
      // the notification below remains an external post-commit side effect.
      const result = await Announcements.createPublished(body);
      inserted = result.announcement;
    } else {
      // Preserve the existing creation behavior, including the model's default
      // status (draft), ID generation, timestamps, and validation.
      const result = await Announcements.insertOne(body);
      const coll = await Announcements.getCollection();
      inserted = await coll.findOne({ _id: result.insertedId });
    }

    await notifyPublishedAnnouncement(inserted);

    return createdResponse(sanitizeDocId(inserted));
  } catch (error) {
    if (Announcements.isPublishStatusConflictError(error)) {
      return conflictResponse("An announcement is already published. Only one announcement can be published at a time.");
    }
    return handleAuthError(error);
  }
}
