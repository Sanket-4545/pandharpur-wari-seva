import { NextResponse } from "next/server";
import { cookies as getCookies } from "next/headers";
import { verifyToken, COOKIE_NAME } from "./auth";

export class ValidationError extends Error {
  constructor(message) {
    super(message);
    this.name = "ValidationError";
  }
}

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

export function rateLimitedResponse(message = "Too many requests. Please try again later.") {
  return errorResponse(message, 429);
}

export function handleApiError(error, defaultMessage = "An unexpected error occurred") {
  console.error("=== API Error ===");
  console.error("Message:", error?.message);
  console.error("Stack:", error?.stack);
  console.error("Full error:", error);
  console.error("Raw error JSON:", JSON.stringify(error, Object.getOwnPropertyNames(error)));
  if (error?.cause) console.error("Cause:", error.cause);
  if (error instanceof ValidationError) {
    return errorResponse(error.message, 400);
  }
  if (error instanceof AuthError) {
    return NextResponse.json(
      { success: false, error: error.message },
      { status: error.status }
    );
  }
  return errorResponse(error?.message || defaultMessage, 500);
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

function isValidOrigin(request) {
  const origin = request.headers.get("origin");
  const referer = request.headers.get("referer");
  const host = request.headers.get("host");
  if (!host) return true;
  const allowedOrigins = [host];
  if (process.env.APP_URL) {
    try {
      const url = new URL(process.env.APP_URL);
      allowedOrigins.push(url.host);
      allowedOrigins.push(url.host.replace(/^www\./, ""));
    } catch {}
  }
  const checkValue = (value) => {
    if (!value) return false;
    try {
      const url = new URL(value);
      const valueHost = url.host.replace(/:\d+$/, "");
      return allowedOrigins.some((allowed) => {
        const allowedClean = allowed.replace(/:\d+$/, "");
        return valueHost === allowedClean;
      });
    } catch {
      return false;
    }
  };
  if (origin) return checkValue(origin);
  if (referer) return checkValue(referer);
  return true;
}

export async function requireAuth(request) {
  if (request && !isValidOrigin(request)) {
    throw new AuthError("Invalid request origin", 403);
  }
  const cookieStore = getCookies();
  const sessionCookie = cookieStore.get(COOKIE_NAME);
  if (!sessionCookie?.value) {
    throw new AuthError("Authentication required", 401);
  }
  const payload = await verifyToken(sessionCookie.value);
  if (!payload) {
    throw new AuthError("Invalid or expired session", 401);
  }
  return payload;
}

export async function requireRole(request, allowedRoles) {
  const payload = await requireAuth(request);
  if (!allowedRoles.includes(payload.role)) {
    throw new AuthError(
      `Access denied. Required role: ${allowedRoles.join(" or ")}`,
      403
    );
  }
  return payload;
}

export class AuthError extends Error {
  constructor(message, status = 401) {
    super(message);
    this.status = status;
    this.name = "AuthError";
  }
}

export function handleAuthError(error) {
  if (error instanceof AuthError) {
    return NextResponse.json(
      { success: false, error: error.message },
      { status: error.status }
    );
  }
  return handleApiError(error);
}
