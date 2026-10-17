import { NssActivities } from "@/lib/models";
import { deleteAsset } from "@/lib/cloudinary";
import {
  successResponse,
  notFoundResponse,
  handleApiError,
  sanitizeDocId,
  requireRole,
  handleAuthError,
  isAdminUser,
} from "@/lib/api-helpers";

export async function GET(request, { params }) {
  try {
    const isAdmin = await isAdminUser(request);
    const item = await NssActivities.findByActivityId(params.id);
    if (!item) return notFoundResponse("Activity");
    if (!isAdmin && item.status !== "published") {
      return notFoundResponse("Activity");
    }
    return successResponse(sanitizeDocId(item));
  } catch (error) {
    return handleApiError(error);
  }
}

export async function PATCH(request, { params }) {
  try {
    await requireRole(request, ["super_admin", "admin"]);
    const existing = await NssActivities.findByActivityId(params.id);
    if (!existing) return notFoundResponse("Activity");
    const body = await request.json();

    const {
      googleFormUrl,
      totalParticipants,
      activityId,
      createdAt,
      updatedAt,
      _id,
      ...cleanBody
    } = body;

    // Handle Cloudinary asset cleanup if posterPublicId changes
    const newPublicId = cleanBody.posterPublicId;
    const oldPublicId = existing.posterPublicId;
    if (newPublicId !== undefined && newPublicId !== oldPublicId && oldPublicId) {
      await deleteAsset(oldPublicId);
    }

    const update = NssActivities.prepareForUpdate(cleanBody, existing);
    const coll = await NssActivities.getCollection();
    const updated = await coll.findOneAndUpdate(
      { activityId: params.id },
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
    const existing = await NssActivities.findByActivityId(params.id);
    if (!existing) return notFoundResponse("Activity");

    // Delete Cloudinary asset if posterPublicId exists
    if (existing.posterPublicId) {
      await deleteAsset(existing.posterPublicId);
    }

    const coll = await NssActivities.getCollection();
    const result = await coll.deleteOne({ activityId: params.id });
    if (result.deletedCount === 0) return notFoundResponse("Activity");
    return successResponse({ deleted: true });
  } catch (error) {
    return handleAuthError(error);
  }
}