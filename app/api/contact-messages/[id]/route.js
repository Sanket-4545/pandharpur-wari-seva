import { ContactMessages } from "@/lib/models";
import {
  successResponse,
  notFoundResponse,
  handleApiError,
  sanitizeDocIds,
} from "@/lib/api-helpers";

export async function GET(request, { params }) {
  try {
    const coll = await ContactMessages.getCollection();
    const item = await coll.findOne({ _id: params.id });
    if (!item) return notFoundResponse("Contact message");
    return successResponse(sanitizeDocIds(item));
  } catch (error) {
    return handleApiError(error);
  }
}

export async function PATCH(request, { params }) {
  try {
    const body = await request.json();
    const coll = await ContactMessages.getCollection();
    const existing = await coll.findOne({ _id: params.id });
    if (!existing) return notFoundResponse("Contact message");

    const update = { updatedAt: new Date() };
    if (body.isRead === true || body.isRead === false) {
      update.isRead = body.isRead;
      if (body.isRead) update.readAt = new Date();
    }
    await coll.updateOne({ _id: params.id }, { $set: update });
    const updated = await coll.findOne({ _id: params.id });
    return successResponse(sanitizeDocIds(updated));
  } catch (error) {
    return handleApiError(error);
  }
}

export async function DELETE(request, { params }) {
  try {
    const coll = await ContactMessages.getCollection();
    const result = await coll.deleteOne({ _id: params.id });
    if (result.deletedCount === 0) return notFoundResponse("Contact message");
    return successResponse({ deleted: true });
  } catch (error) {
    return handleApiError(error);
  }
}
