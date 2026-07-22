import { ObjectId } from "mongodb";

// ─── Validation Helpers ───────────────────────────────────────────────────────

export const EMAIL_REGEX = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
export const PHONE_REGEX = /^\d{10}$/;
export const PHONE_REGEX_WITH_CODE = /^\+?\d{10,15}$/;

export function isValidEmail(email) {
  return typeof email === "string" && EMAIL_REGEX.test(email);
}

export function isValidPhone(phone) {
  return typeof phone === "string" && PHONE_REGEX.test(phone);
}

export function isValidPhoneWithCode(phone) {
  return typeof phone === "string" && PHONE_REGEX_WITH_CODE.test(phone);
}

export function isValidObjectId(id) {
  try {
    return ObjectId.isValid(id) && new ObjectId(id).toString() === id;
  } catch {
    return false;
  }
}

export function isValidEnum(value, allowedValues) {
  return allowedValues.includes(value);
}

export function isValidDate(date) {
  if (!date) return false;
  const d = new Date(date);
  return !isNaN(d.getTime());
}

export function sanitizeString(value, maxLength = 5000) {
  if (typeof value !== "string") return null;
  return value.trim().slice(0, maxLength);
}

export function requiredField(value, fieldName) {
  if (value === undefined || value === null || value === "") {
    throw new Error(`${fieldName} is required`);
  }
  return true;
}

// ─── Timestamp Helpers ────────────────────────────────────────────────────────

export function createTimestamps() {
  const now = new Date();
  return { createdAt: now, updatedAt: now };
}

export function updateTimestamp(doc) {
  return { ...doc, updatedAt: new Date() };
}

// ─── Human-Readable ID Generation ─────────────────────────────────────────────

export function generateVolunteerId(seq) {
  const pad = String(seq).padStart(3, "0");
  return `VOL-2026-${pad}`;
}

export function generateCaseId(seq) {
  const pad = String(seq).padStart(3, "0");
  return `MP-2026-${pad}`;
}

export function generateItemId(seq) {
  const pad = String(seq).padStart(3, "0");
  return `LI-2026-${pad}`;
}

export function generateAnnouncementId(seq) {
  const pad = String(seq).padStart(3, "0");
  return `ANN-2026-${pad}`;
}

export function generateReportId(seq) {
  const pad = String(seq).padStart(3, "0");
  return `REP-2026-${pad}`;
}

// ─── Schema Validation Helpers ────────────────────────────────────────────────

/**
 * Validates required string fields.
 * @param {object} data - The document data.
 * @param {string[]} fields - Field names that must be non-empty strings.
 * @throws {Error} If any required field is missing.
 */
export function validateRequiredStrings(data, fields) {
  for (const field of fields) {
    if (!data[field] || typeof data[field] !== "string" || data[field].trim() === "") {
      throw new Error(`${field} is required and must be a non-empty string`);
    }
  }
}

/**
 * Validates required numeric fields.
 * @param {object} data - The document data.
 * @param {string[]} fields - Field names that must be numbers.
 */
export function validateRequiredNumbers(data, fields) {
  for (const field of fields) {
    if (typeof data[field] !== "number" || isNaN(data[field])) {
      throw new Error(`${field} is required and must be a number`);
    }
  }
}

/**
 * Validates an enum field against allowed values.
 */
export function validateEnum(data, fieldName, allowedValues) {
  if (data[fieldName] !== undefined && !allowedValues.includes(data[fieldName])) {
    throw new Error(`${fieldName} must be one of: ${allowedValues.join(", ")}`);
  }
}

/**
 * Validates that a field is a valid Date.
 */
export function validateDate(data, fieldName) {
  if (data[fieldName] !== undefined && !isValidDate(data[fieldName])) {
    throw new Error(`${fieldName} must be a valid date`);
  }
}

/**
 * Validates optional array fields.
 */
export function validateArray(data, fieldName) {
  if (data[fieldName] !== undefined && !Array.isArray(data[fieldName])) {
    throw new Error(`${fieldName} must be an array`);
  }
}
