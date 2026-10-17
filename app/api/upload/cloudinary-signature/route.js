import { NextResponse } from "next/server";
import { getUploadSignature } from "@/lib/cloudinary";
import { requireRole, handleAuthError, rateLimitedResponse } from "@/lib/api-helpers";
import { rateLimit, getClientIp } from "@/lib/rate-limit";

const signatureRateLimit = rateLimit({ interval: 60000, max: 10 });

const ALLOWED_SIGN_PARAMS = new Set([
  "public_id",
  "tags",
  "context",
  "metadata",
  "max_file_size",
  "max_image_file_size",
  "max_video_file_size",
  "max_raw_file_size",
  "allowed_formats",
  "face_detection",
  "image_metadata",
  "quality_analysis",
  "access_control",
  "transformation",
  "eager",
  "eager_async",
  "eager_notification_url",
  "auto_tagging",
  "categorization",
  "detection",
  "similarity_search",
  "background_removal",
  "ocr",
  "raw_convert",
  "save_original",
  "save_original_version",
  "overwrite",
  "invalidate",
  "notification_url",
  "upload_preset",
  "folder",
  "resource_type",
  "timestamp",
  "api_key",
  // The Upload Widget automatically includes source=uw in every upload request.
  // Cloudinary's own documentation states that source MUST be included in the
  // string to sign. Excluding it causes an "Invalid Signature" error.
  "source",
]);

function filterSignParams(params) {
  const filtered = {};
  for (const [key, value] of Object.entries(params)) {
    if (ALLOWED_SIGN_PARAMS.has(key)) {
      filtered[key] = value;
    }
  }
  return filtered;
}

export async function POST(request) {
  try {
    await requireRole(request, ["super_admin", "admin"]);

    const ip = getClientIp(request);
    const rlResult = await signatureRateLimit(ip);
    if (!rlResult.allowed) {
      return rateLimitedResponse("Too many signature requests. Please try again later.");
    }

    const body = await request.json().catch(() => ({}));

    const paramsToSign = body.paramsToSign || body;

    const allowedParams = filterSignParams(paramsToSign);

    // Do NOT inject folder or resource_type here.
    // The Upload Widget sends exactly the params it wants signed (paramsToSign).
    // Cloudinary verifies the signature against those same params on its server.
    // Injecting extra params (folder, resource_type) that were not in paramsToSign
    // creates a signature over a different set of params → "Invalid Signature".
    const signatureData = getUploadSignature(allowedParams);

    return NextResponse.json({ signature: signatureData.signature });
  } catch (error) {
    return handleAuthError(error);
  }
}