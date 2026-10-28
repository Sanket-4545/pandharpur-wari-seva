import { getDb, withTransaction } from "../db.js";
import {
  isValidDate,
  createTimestamps,
  updateTimestamp,
  generateAnnouncementId,
  insertOneWithRetry,
  getNextSequenceFor,
  validateRequiredStrings,
  validateEnum,
} from "./helpers.js";
import { ValidationError } from "@/lib/api-helpers";

const COLLECTION = "announcements";
const VALID_STATUSES = ["published", "draft", "scheduled", "archived"];
const VALID_PRIORITIES = ["high", "medium", "low"];
const VALID_CATEGORIES = ["safety", "schedule", "camp", "general"];
const MAX_PUBLISH_ATTEMPTS = 5;
const ANNOUNCEMENT_NOT_FOUND = "ANNOUNCEMENT_NOT_FOUND";
const ANNOUNCEMENT_STATUS_CONFLICT = "ANNOUNCEMENT_STATUS_CONFLICT";

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
  await coll.createIndex({ announcementId: 1 }, { unique: true });
  await coll.createIndex({ status: 1, publishDate: -1 });
  await coll.createIndex({ priority: 1 });
  await coll.createIndex({ category: 1 });
}

export async function ensureIndexes() {
  await getCollection();
  await indexesEnsured;
}

export function validate(doc, { isUpdate = false } = {}) {
  if (!isUpdate) {
    validateRequiredStrings(doc, ["title", "description", "category"]);
  }

  validateEnum(doc, "status", VALID_STATUSES);
  validateEnum(doc, "priority", VALID_PRIORITIES);
  validateEnum(doc, "category", VALID_CATEGORIES);

  if (doc.publishDate !== undefined && !isValidDate(doc.publishDate)) {
    throw new ValidationError("publishDate must be a valid date");
  }

  return true;
}

export function prepareForInsert(doc) {
  validate(doc);
  return {
    announcementId: doc.announcementId,
    title: String(doc.title).trim(),
    description: String(doc.description).trim(),
    category: doc.category,
    status: doc.status || "draft",
    priority: doc.priority || "medium",
    publishDate: doc.publishDate || new Date(),
    ...createTimestamps(),
  };
}

export function prepareForUpdate(doc) {
  const update = { ...doc };
  delete update._id;
  delete update.announcementId;
  delete update.createdAt;
  validate(doc, { isUpdate: true });
  return updateTimestamp(update);
}

export async function getNextSequence() {
  const coll = await getCollection();
  return getNextSequenceFor(coll, "announcementId");
}

export async function insertOne(doc) {
  const coll = await getCollection();
  return insertOneWithRetry(coll, generateAnnouncementId, prepareForInsert, doc, "announcementId");
}

export async function findByAnnouncementId(announcementId) {
  const coll = await getCollection();
  return coll.findOne({ announcementId });
}

export async function findPublished(sort = { publishDate: -1 }) {
  const coll = await getCollection();
  return coll.find({ status: "published" }).sort(sort).toArray();
}

export async function findAll(filter = {}, sort = { createdAt: -1 }) {
  const coll = await getCollection();
  return coll.find(filter).sort(sort).toArray();
}

export async function deleteByAnnouncementId(announcementId) {
  const coll = await getCollection();
  return coll.deleteOne({ announcementId });
}

// ─── Transactional Publishing ─────────────────────────────────────────────────

function normalizeUpdateFields(updateFields) {
  if (updateFields === undefined || updateFields === null) return {};
  if (typeof updateFields !== "object" || Array.isArray(updateFields)) {
    throw new ValidationError("updateFields must be an object");
  }
  return updateFields;
}

function announcementNotFoundError(announcementId) {
  const error = new Error(`Announcement ${announcementId} not found`);
  error.code = ANNOUNCEMENT_NOT_FOUND;
  return error;
}

function announcementStatusConflictError(announcementId, existingStatus, requiredStatus) {
  const error = new Error(
    `Announcement ${announcementId} status conflict: expected ${requiredStatus}, found ${existingStatus}`
  );
  error.code = ANNOUNCEMENT_STATUS_CONFLICT;
  error.existingStatus = existingStatus;
  error.requiredStatus = requiredStatus;
  return error;
}

function isDuplicateAnnouncementIdError(error) {
  if (error?.code !== 11000) return false;
  return (
    error?.keyPattern?.announcementId !== undefined ||
    error?.keyValue?.announcementId !== undefined ||
    (typeof error?.message === "string" && error.message.includes("announcementId"))
  );
}

export function isPublishStatusConflictError(error) {
  if (error?.code !== 11000) return false;
  // Never route announcementId conflicts through this path; they have their own
  // retry logic in createPublished().
  if (isDuplicateAnnouncementIdError(error)) return false;
  // A unique partial index on { status: 1 } with
  // partialFilterExpression: { status: "published" } reports conflicts on the
  // status field. keyPattern/keyValue are the structured, version-stable fields
  // of a MongoDB duplicate-key error; the human message format varies by version
  // and is not relied upon here.
  return (
    error?.keyPattern?.status !== undefined ||
    error?.keyValue?.status !== undefined
  );
}

/**
 * Publishes an existing announcement inside a transaction.
 *
 * Every other currently published announcement is demoted to `draft` (never
 * deleted or archived). The target's `announcementId` cannot be changed because
 * `prepareForUpdate` strips protected identity fields.
 *
 * @param {string} announcementId
 * @param {object} [updateFields] Fields to validate and apply to the target.
 * @param {object} [options]
 * @param {string} [options.requireStatus] If set, the target's current status
 *   must equal this value inside the transaction, otherwise a status conflict
 *   is returned instead of publishing.
 * @returns {Promise<null | {
 *   announcement: object,
 *   becamePublished: boolean,
 *   demotedCount: number,
 * } | { statusConflict: boolean, existingStatus: string, requiredStatus: string }>}
 * `null` when the target does not exist. `{ statusConflict: true }` when the
 * target exists but its status does not match `options.requireStatus`.
 */
export async function publishExisting(announcementId, updateFields = {}, options = {}) {
  if (typeof announcementId !== "string" || announcementId.trim() === "") {
    return null;
  }

  const fields = normalizeUpdateFields(updateFields);
  const { requireStatus } = options;

  try {
    return await withTransaction(async (db, session) => {
      const coll = db.collection(COLLECTION);

      const existing = await coll.findOne({ announcementId }, { session });
      if (!existing) return null;

      // Enforce eligibility inside the transaction so a status change between
      // the route's pre-check and the write cannot cause an ineligible restore
      // to be published. No writes have occurred yet, so aborting is clean.
      if (requireStatus !== undefined && existing.status !== requireStatus) {
        throw announcementStatusConflictError(announcementId, existing.status, requireStatus);
      }

      const update = prepareForUpdate(fields);
      update.status = "published";

      const demoteResult = await coll.updateMany(
        { status: "published", announcementId: { $ne: announcementId } },
        { $set: { status: "draft", updatedAt: update.updatedAt } },
        { session }
      );

      const announcement = await coll.findOneAndUpdate(
        { announcementId },
        { $set: update },
        { returnDocument: "after", session }
      );

      if (!announcement) {
        // The target disappeared between the read and the write. Abort so the
        // demotions above are not committed without a replacement publish.
        throw announcementNotFoundError(announcementId);
      }

      return {
        announcement,
        becamePublished: existing.status !== "published",
        demotedCount: demoteResult.modifiedCount,
      };
    });
  } catch (error) {
    if (error?.code === ANNOUNCEMENT_NOT_FOUND) return null;
    if (error?.code === ANNOUNCEMENT_STATUS_CONFLICT) {
      return {
        statusConflict: true,
        existingStatus: error.existingStatus,
        requiredStatus: error.requiredStatus,
      };
    }
    throw error;
  }
}

/**
 * Creates an announcement that is already `published` inside a transaction.
 *
 * All previously published announcements are demoted to `draft`. The
 * announcement ID is generated from the current sequence inside the same
 * transaction, so a duplicate-ID conflict aborts the transaction and is retried
 * with a completely fresh session/transaction.
 *
 * @param {object} doc
 * @returns {Promise<{ announcement: object, demotedCount: number }>}
 */
export async function createPublished(doc) {
  for (let attempt = 0; attempt < MAX_PUBLISH_ATTEMPTS; attempt++) {
    try {
      return await withTransaction(async (db, session) => {
        const coll = db.collection(COLLECTION);
        const seq = await getNextSequenceFor(coll, "announcementId", { session });
        const prepared = prepareForInsert({
          ...doc,
          announcementId: generateAnnouncementId(seq),
          status: "published",
        });

        const demoteResult = await coll.updateMany(
          { status: "published" },
          { $set: { status: "draft", updatedAt: prepared.updatedAt } },
          { session }
        );

        const insertResult = await coll.insertOne(prepared, { session });

        return {
          announcement: { ...prepared, _id: insertResult.insertedId },
          demotedCount: demoteResult.modifiedCount,
        };
      });
    } catch (error) {
      // A duplicate announcementId is not a transient transaction error, so the
      // aborted transaction must be discarded and restarted from scratch.
      if (!isDuplicateAnnouncementIdError(error) || attempt === MAX_PUBLISH_ATTEMPTS - 1) {
        throw error;
      }
    }
  }

  throw new Error(
    `Failed to create published announcement after ${MAX_PUBLISH_ATTEMPTS} attempts`
  );
}
