import { NextResponse } from "next/server";

export function successResponse(data, status = 200) {
  return NextResponse.json({ success: true, data }, { status });
}

export function createdResponse(data) {
  return NextResponse.json({ success: true, data }, { status: 201 });
}

export function errorResponse(message, status = 400) {
  return NextResponse.json({ success: false, error: message }, { status });
}

export function notFoundResponse(entity = "Resource") {
  return errorResponse(`${entity} not found`, 404);
}

export function forbiddenResponse(message = "Access denied") {
  return errorResponse(message, 403);
}

export function conflictResponse(message = "Resource already exists") {
  return errorResponse(message, 409);
}

export function handleApiError(error, defaultMessage = "An unexpected error occurred") {
  console.error("API Error:", error.message);
  if (error.message.startsWith("is required") || error.message.startsWith("must be") || error.message.startsWith("Invalid")) {
    return errorResponse(error.message, 400);
  }
  return errorResponse(defaultMessage, 500);
}

export function parseQueryParams(request) {
  const { searchParams } = new URL(request.url);
  const page = Math.max(1, parseInt(searchParams.get("page") || "1", 10));
  const limit = Math.min(100, Math.max(1, parseInt(searchParams.get("limit") || "20", 10)));
  const skip = (page - 1) * limit;
  const sort = searchParams.get("sort") || "createdAt";
  const order = searchParams.get("order") === "asc" ? 1 : -1;
  const search = searchParams.get("search") || "";
  const status = searchParams.get("status") || "";
  const category = searchParams.get("category") || "";
  return { page, limit, skip, sort, order, search, status, category };
}

export function buildPaginationMeta(total, page, limit) {
  return {
    page,
    limit,
    total,
    totalPages: Math.ceil(total / limit) || 1,
  };
}

export function paginatedResponse(data, total, page, limit) {
  return successResponse({
    items: data,
    pagination: buildPaginationMeta(total, page, limit),
  });
}

export function sanitizeDocId(doc) {
  if (!doc) return null;
  const { _id, ...rest } = doc;
  return { ...rest, _id: _id.toString() };
}

export function sanitizeDocIds(docs) {
  return docs.map(sanitizeDocId);
}
