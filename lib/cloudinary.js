import { v2 as cloudinary } from "cloudinary";

function isPlaceholderSecret(value) {
  // Vercel (and similar) write redacted "Sensitive" env vars to pulled .env
  // files as a run of asterisks. Such a value can never match the account key
  // and always produces Cloudinary "Invalid Signature" errors, so surface it
  // as an explicit configuration problem instead of a silent misconfiguration.
  return /^\*+$/.test(value) || /^(your[-_ ]?)?(cloudinary[-_ ]?)?(api[-_ ]?)?secret$/i.test(value);
}

function getCloudinaryConfig() {
  const cloudName = process.env.CLOUDINARY_CLOUD_NAME;
  const apiKey = process.env.CLOUDINARY_API_KEY;
  const apiSecret = process.env.CLOUDINARY_API_SECRET;

  if (!cloudName || !apiKey || !apiSecret) {
    throw new Error("Cloudinary configuration is incomplete. Required: CLOUDINARY_CLOUD_NAME, CLOUDINARY_API_KEY, CLOUDINARY_API_SECRET");
  }

  if (isPlaceholderSecret(apiSecret)) {
    throw new Error("CLOUDINARY_API_SECRET is a redacted placeholder, not a real secret. Set the actual API secret for this cloud/API key.");
  }

  return { cloudName, apiKey, apiSecret };
}

let configured = false;

function configureCloudinary() {
  if (configured) return;
  const { cloudName, apiKey, apiSecret } = getCloudinaryConfig();
  // The cloudinary SDK only recognizes snake_case config keys.
  cloudinary.config({
    cloud_name: cloudName,
    api_key: apiKey,
    api_secret: apiSecret,
  });
  configured = true;
}

function getUploadSignature(params) {
  configureCloudinary();
  const { cloudName, apiKey, apiSecret } = getCloudinaryConfig();
  // Ensure timestamp is set; otherwise generate one.
  const timestamp = params.timestamp || Math.floor(Date.now() / 1000);
  const signatureParams = {
    ...params,
    timestamp,
  };
  // Sign exactly the params received. Do NOT inject folder, resource_type, or any
  // other param not already present — the Upload Widget sends only the params it
  // wants signed, and Cloudinary verifies the signature against those same params.
  const signature = cloudinary.utils.api_sign_request(signatureParams, apiSecret);
  return {
    signature,
    timestamp,
    apiKey,
    cloudName,
  };
}

async function deleteAsset(publicId) {
  if (!publicId) return { deleted: false, reason: "no_public_id" };
  configureCloudinary();
  try {
    const result = await cloudinary.uploader.destroy(publicId, { resource_type: "image" });
    return { deleted: result.result === "ok", result };
  } catch (error) {
    console.error("[Cloudinary] Failed to delete asset:", publicId, error?.message);
    return { deleted: false, error: error?.message };
  }
}

export { cloudinary, configureCloudinary, getUploadSignature, getCloudinaryConfig, deleteAsset };