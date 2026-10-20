"use client";

import React, { useState, useCallback, useEffect, useRef } from "react";
import { CldUploadWidget } from "next-cloudinary";
import { useLanguage } from "@/context/LanguageContext";
import { Image as ImageIcon, Loader2, CheckCircle, XCircle, Upload, X } from "lucide-react";

export default function NSSActivityPosterUpload({
  value,
  publicIdValue = "",
  onChange,
  onPublicIdChange,
  onUploadStateChange,
  disabled = false,
  maxFileSize = 10 * 1024 * 1024,
}) {
  const { t } = useLanguage();
  const [isUploading, setIsUploading] = useState(false);
  const [uploadError, setUploadError] = useState(null);
  const [previewUrl, setPreviewUrl] = useState(value || null);
  const [publicId, setPublicId] = useState(publicIdValue || null);

  // Refs avoid stale closures when parent passes inline callbacks.
  const onChangeRef = useRef(onChange);
  const onPublicIdChangeRef = useRef(onPublicIdChange);
  const onUploadStateChangeRef = useRef(onUploadStateChange);
  useEffect(() => {
    onChangeRef.current = onChange;
    onPublicIdChangeRef.current = onPublicIdChange;
    onUploadStateChangeRef.current = onUploadStateChange;
  }, [onChange, onPublicIdChange, onUploadStateChange]);

  // Keep parent save-guard in sync without looping on callback identity.
  useEffect(() => {
    onUploadStateChangeRef.current?.(isUploading);
  }, [isUploading]);

  // Existing poster must load (and clear) correctly when editing activities.
  useEffect(() => {
    setPreviewUrl(value || null);
  }, [value]);
  useEffect(() => {
    setPublicId(publicIdValue || null);
  }, [publicIdValue]);

  const setUploadingState = useCallback((uploading) => {
    setIsUploading(uploading);
  }, []);

  const handleWidgetOpen = useCallback((open) => {
    setUploadError(null);
    // Mark uploading as soon as the widget opens so a fast Save cannot
    // race the async Cloudinary upload; cleared on success/error/close.
    setUploadingState(true);
    open();
  }, [setUploadingState]);

  const handleUploadSuccess = useCallback((result) => {
    const info = result?.info || result;
    if (info?.secure_url && info?.public_id) {
      setPreviewUrl(info.secure_url);
      setPublicId(info.public_id);
      // Both fields are set together before saving is re-enabled.
      onChangeRef.current?.(info.secure_url);
      onPublicIdChangeRef.current?.(info.public_id);
      setUploadError(null);
    } else {
      setUploadError(t("admin.activities.upload_error") || "Failed to upload poster. Please try again.");
    }
    setUploadingState(false);
  }, [setUploadingState, t]);

  const handleUploadError = useCallback((error) => {
    console.error("Upload error:", error);
    setUploadError(t("admin.activities.upload_error") || "Failed to upload poster. Please try again.");
    // Unblock saving so a failed upload never permanently blocks the form.
    setUploadingState(false);
  }, [setUploadingState, t]);

  const handleWidgetClose = useCallback(() => {
    // User cancelled without uploading, or dialog closed after success.
    // Never leave the form blocked: success already stored the URLs above.
    setUploadingState(false);
  }, [setUploadingState]);

  const handleRemove = useCallback(() => {
    setPreviewUrl(null);
    setPublicId(null);
    onChangeRef.current?.("");
    onPublicIdChangeRef.current?.("");
    setUploadError(null);
  }, []);

  // Determine if Cloudinary is configured. Both cloudName and apiKey must be present
  // for the upload widget to initialize. These are set via NEXT_PUBLIC_* env vars.
  const cloudName = process.env.NEXT_PUBLIC_CLOUDINARY_CLOUD_NAME;
  const apiKey = process.env.NEXT_PUBLIC_CLOUDINARY_API_KEY;
  const isCloudinaryConfigured = Boolean(cloudName && apiKey);

  // next-cloudinary v6 reads widget configuration from the `options` prop.
  // Passing these fields as top-level props (cloudName/apiKey/folder/...) is
  // silently ignored, which disabled folder targeting and the file constraints.
  const widgetOptions = isCloudinaryConfigured
    ? {
        cloudName,
        apiKey,
        sources: ["local"],
        maxFiles: 1,
        maxFileSize,
        clientAllowedFormats: ["jpg", "jpeg", "png", "webp", "avif"],
        resourceType: "image",
        folder: "nss-activities",
        showAdvancedOptions: false,
        showPoweredBy: false,
        styles: {
          palette: {
            window: "#FFFFFF",
            windowBorder: "#94A3B8",
            tabIcon: "#0EA5E9",
            menuIcons: "#64748B",
            textDark: "#0F172A",
            textLight: "#FFFFFF",
            link: "#0EA5E9",
            action: "#0EA5E9",
            inactiveTabIcon: "#94A3B8",
            error: "#EF4444",
            inProgress: "#0EA5E9",
            complete: "#22C55E",
            sourceBg: "#F8FAFC",
          },
          fonts: {
            default: "'Inter', system-ui, sans-serif",
          },
        },
        text: {
          en: {
            or: t("admin.activities.upload_or") || "or",
            browse: t("admin.activities.upload_browse") || "Browse",
            dropFiles: t("admin.activities.upload_drop") || "Drop files here",
            selectFiles: t("admin.activities.upload_select") || "Select files",
            uploadButton: t("admin.activities.upload_button") || "Upload",
            uploading: t("admin.activities.upload_uploading") || "Uploading...",
            uploadComplete: t("admin.activities.upload_complete") || "Upload complete",
            uploadError: t("admin.activities.upload_error") || "Upload failed",
            fileTooLarge: t("admin.activities.upload_file_large") || "File too large",
            invalidFileType: t("admin.activities.upload_invalid_type") || "Invalid file type",
            maxFilesExceeded: t("admin.activities.upload_max_files") || "Maximum files exceeded",
          },
        },
      }
    : null;

  return (
    <div className="space-y-4">
      <label className="block text-slate-400 dark:text-gray-500 mb-1.5 uppercase text-xs font-semibold">
        {t("admin.activities.poster_label")}
      </label>

      {previewUrl && (
        <div className="relative group">
          <div className="relative aspect-[4/3] max-w-md mx-auto">
            <img
              src={previewUrl}
              alt="Poster preview"
              className="w-full h-full object-cover rounded-xl border border-slate-200 dark:border-gray-700"
            />
            <div className="absolute inset-0 bg-black/50 rounded-xl flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity duration-200">
              <button
                type="button"
                onClick={handleRemove}
                disabled={isUploading}
                className="p-3 bg-white/90 dark:bg-gray-900/90 rounded-full shadow-lg hover:bg-white dark:hover:bg-gray-800 transition-colors"
                aria-label={t("admin.activities.remove_poster") || "Remove poster"}
              >
                <X className="w-5 h-5 text-red-600" />
              </button>
            </div>
          </div>
          <p className="mt-2 text-center text-xs text-slate-500 dark:text-gray-400">
            {t("admin.activities.poster_uploaded") || "Poster uploaded"}
          </p>
        </div>
      )}

      {!previewUrl && (
        <div className="border-2 border-dashed border-slate-200 dark:border-gray-700 rounded-2xl p-8 text-center bg-slate-50 dark:bg-gray-800/50">
          <Upload className="w-10 h-10 mx-auto text-slate-400 dark:text-gray-500 mb-3" />
          <p className="text-sm text-slate-500 dark:text-gray-400 mb-4">
            {t("admin.activities.upload_prompt") || "Upload an activity poster"}
          </p>
          {isCloudinaryConfigured ? (
            <>
              <CldUploadWidget
                signatureEndpoint="/api/upload/cloudinary-signature"
                options={widgetOptions}
                onSuccess={handleUploadSuccess}
                onError={handleUploadError}
                onClose={handleWidgetClose}
                onQueuesStart={() => setUploadingState(true)}
                onQueuesEnd={handleWidgetClose}
                buttonProps={{
                  className: "inline-flex items-center gap-2 px-5 py-2.5 bg-primary hover:bg-primary-dark text-white rounded-xl text-xs font-bold transition-all shadow-saffron-glow focus:outline-none disabled:opacity-50 disabled:cursor-not-allowed",
                  disabled: isUploading || disabled,
                  "aria-label": t("admin.activities.upload_poster") || "Upload poster",
                }}
              >
                {({ open }) => (
                  <button
                    type="button"
                    onClick={() => handleWidgetOpen(open)}
                    disabled={isUploading || disabled}
                    className="inline-flex items-center gap-2 px-5 py-2.5 bg-primary hover:bg-primary-dark text-white rounded-xl text-xs font-bold transition-all shadow-saffron-glow focus:outline-none disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    <Upload className="w-4 h-4" />
                    {isUploading ? (
                      <>
                        <Loader2 className="w-4 h-4 animate-spin" />
                        {t("admin.activities.uploading") || "Uploading..."}
                      </>
                    ) : (
                      t("admin.activities.upload_btn") || "Upload Poster"
                    )}
                  </button>
                )}
              </CldUploadWidget>
              <p className="mt-3 text-[10px] text-slate-400 dark:text-gray-500 max-w-xs mx-auto">
                {t("admin.activities.upload_constraints") || "JPG, PNG, WebP, AVIF · Max 10MB"}
              </p>
            </>
          ) : (
            <div className="space-y-3">
              <button
                type="button"
                disabled
                className="inline-flex items-center gap-2 px-5 py-2.5 bg-slate-200 dark:bg-gray-700 text-slate-400 dark:text-gray-500 rounded-xl text-xs font-bold cursor-not-allowed"
              >
                <Upload className="w-4 h-4" />
                {t("admin.activities.upload_unavailable") || "Upload unavailable — Cloudinary not configured"}
              </button>
              <p className="text-[10px] text-amber-600 dark:text-amber-400">
                {t("admin.activities.cloudinary_not_configured") || "Cloudinary upload requires NEXT_PUBLIC_CLOUDINARY_CLOUD_NAME and NEXT_PUBLIC_CLOUDINARY_API_KEY environment variables. Posters cannot be uploaded until configured."}
              </p>
            </div>
          )}
        </div>
      )}

      {isUploading && !previewUrl && (
        <div className="flex items-center justify-center gap-2 text-sm text-primary">
          <Loader2 className="w-4 h-4 animate-spin" />
          <span>{t("admin.activities.uploading") || "Uploading poster..."}</span>
        </div>
      )}

      {uploadError && (
        <div className="flex items-center gap-2 text-sm text-red-600 dark:text-red-400 bg-red-50 dark:bg-red-950/20 border border-red-200/30 dark:border-red-900/30 rounded-xl p-3">
          <XCircle className="w-4 h-4 flex-shrink-0" />
          <span>{uploadError}</span>
        </div>
      )}
    </div>
  );
}