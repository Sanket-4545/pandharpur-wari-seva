import { getDb } from "../db.js";
import {
  isValidDate,
  isValidPhone,
  createTimestamps,
  updateTimestamp,
  generateCaseId,
  insertOneWithRetry,
  getNextSequenceFor,
  validateRequiredStrings,
  validateRequiredNumbers,
  validateEnum,
} from "./helpers.js";
import { ValidationError } from "@/lib/api-helpers";

const COLLECTION = "missing_persons";
const VALID_STATUSES = ["Pending", "Missing", "Found", "Rejected"];
const VALID_CATEGORIES = ["Child", "Senior Citizen", "Male", "Female"];

// Statuses that represent an open/active case. Active cases appear in the
// volunteer "active" list and may be resolved (marked as Found). Found and
// Rejected are terminal until an authorized user changes them.
const ACTIVE_STATUSES = ["Pending", "Missing"];

// Matches case IDs produced by generateCaseId (e.g. "MP-2026-001").
const CASE_ID_PATTERN = /^MP-\d{4}-\d{3,6}$/;

const ALLOWED_TRANSITIONS = {
  Pending: ["Missing", "Rejected"],
  Missing: ["Found"],
  Found: ["Missing"],
  Rejected: [],
};

let indexesEnsured = null;

export async function getCollection() {
  const db = await getDb();
  const coll = db.collection(COLLECTION);
  ensureIndexesOnce(coll);
  return coll;
}

function ensureIndexesOnce(coll) {
  if (!indexesEnsured) {
    indexesEnsured = Promise.resolve()
      .then(() => createIndexes(coll))
      .catch((err) => {
        console.error(`[${COLLECTION}] index creation failed:`, err?.message);
        indexesEnsured = null;
      });
  }
  return indexesEnsured;
}

async function createIndexes(coll) {
  await coll.createIndex({ caseId: 1 }, { unique: true });
  await coll.createIndex({ status: 1 });
  await coll.createIndex({ name: "text", clothing: "text" });
  await coll.createIndex({ dateReported: -1 });
  await coll.createIndex({ category: 1 });
}

export async function ensureIndexes() {
  await getCollection();
  await indexesEnsured;
}

export function validate(doc, { isUpdate = false } = {}) {
  if (!isUpdate) {
    validateRequiredStrings(doc, ["name", "gender", "category", "lastSeenLocation", "contactPhone"]);
    validateRequiredNumbers(doc, ["age"]);
  }

  validateEnum(doc, "status", VALID_STATUSES);
  validateEnum(doc, "category", VALID_CATEGORIES);

  if (doc.contactPhone !== undefined && !isValidPhone(doc.contactPhone)) {
    throw new ValidationError("Contact phone must be a valid 10-digit number");
  }
  if (doc.dateReported !== undefined && !isValidDate(doc.dateReported)) {
    throw new ValidationError("dateReported must be a valid date");
  }

  return true;
}

export function prepareForInsert(doc) {
  validate(doc);
  return {
    caseId: doc.caseId,
    volunteerId: doc.volunteerId ? String(doc.volunteerId).trim() : undefined,
    name: String(doc.name).trim(),
    gender: doc.gender,
    category: doc.category,
    age: doc.age,
    lastSeenLocation: String(doc.lastSeenLocation).trim(),
    contactPhone: String(doc.contactPhone).trim(),
    clothing: doc.clothing ? String(doc.clothing).trim() : undefined,
    description: doc.description ? String(doc.description).trim() : undefined,
    photoUrl: doc.photoUrl || undefined,
    status: doc.status || "Missing",
    dateReported: doc.dateReported || new Date(),
    ...createTimestamps(),
  };
}

export function prepareForUpdate(doc) {
  const update = { ...doc };
  delete update._id;
  delete update.caseId;
  delete update.createdAt;
  validate(doc, { isUpdate: true });
  return updateTimestamp(update);
}

export async function getNextSequence() {
  const coll = await getCollection();
  return getNextSequenceFor(coll, "caseId");
}

export async function insertOne(doc) {
  const coll = await getCollection();
  return insertOneWithRetry(coll, generateCaseId, prepareForInsert, doc, "caseId");
}

export async function findByCaseId(caseId) {
  const coll = await getCollection();
  return coll.findOne({ caseId });
}

export async function findAll(filter = {}, sort = { createdAt: -1 }) {
  const coll = await getCollection();
  return coll.find(filter).sort(sort).toArray();
}

export async function updateStatus(caseId, newStatus) {
  if (!VALID_STATUSES.includes(newStatus)) {
    throw new ValidationError(`Status must be one of: ${VALID_STATUSES.join(", ")}`);
  }
  const coll = await getCollection();
  const doc = await coll.findOne({ caseId });
  if (!doc) {
    throw new ValidationError("Missing person case not found");
  }
  if (doc.status === newStatus) {
    return coll.updateOne(
      { caseId },
      { $set: { updatedAt: new Date() } }
    );
  }
  const allowed = ALLOWED_TRANSITIONS[doc.status];
  if (!allowed || !allowed.includes(newStatus)) {
    throw new ValidationError(
      `Invalid status transition from ${doc.status} to ${newStatus}`
    );
  }
  const now = new Date();
  const setFields = { status: newStatus, updatedAt: now };
  const update = { $set: setFields };
  if (newStatus === "Found") {
    // Record the resolution timestamp when a case is resolved.
    setFields.resolvedAt = now;
  } else if (doc.status === "Found") {
    // Reopening a resolved case clears its resolution history so the
    // archive never shows stale resolution data for an active case.
    update.$unset = { resolvedAt: "", resolvedByVolunteerId: "", resolvedByName: "" };
  }
  return coll.updateOne({ caseId }, update);
}

/**
 * Check whether a case ID has the expected generated format. Used to reject
 * malformed IDs before they reach the database.
 */
export function isValidCaseId(caseId) {
  return typeof caseId === "string" && CASE_ID_PATTERN.test(caseId);
}

/**
 * Atomically resolve a missing-person case as Found.
 *
 * Only transitions cases whose current status is active (Pending or Missing).
 * The status guard in the filter makes the update safe under concurrent or
 * repeated requests: only one caller can win the transition, and a case that
 * is already Found (or Rejected) is never modified. Returns the updated
 * document, or null when the case does not exist or is not in an active state.
 *
 * @param {string} caseId
 * @param {{ volunteerId?: string, name?: string }} resolver Identity of the
 *   authenticated volunteer confirming the person was found (optional).
 */
export async function resolveAsFound(caseId, resolver = {}) {
  const coll = await getCollection();
  const now = new Date();
  const setFields = {
    status: "Found",
    resolvedAt: now,
    updatedAt: now,
  };
  if (resolver.volunteerId) {
    setFields.resolvedByVolunteerId = String(resolver.volunteerId).trim();
  }
  if (resolver.name) {
    setFields.resolvedByName = String(resolver.name).trim();
  }
  return coll.findOneAndUpdate(
    { caseId, status: { $in: ACTIVE_STATUSES } },
    { $set: setFields },
    { returnDocument: "after" }
  );
}

export { ACTIVE_STATUSES, VALID_STATUSES };
