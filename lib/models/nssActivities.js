import { getDb } from "../db.js";
import {
  createTimestamps,
  updateTimestamp,
  validateRequiredStrings,
  validateRequiredNumbers,
  validateEnum,
  validateDate,
  isValidDate,
  generateActivityId,
  getNextSequenceFor,
  insertOneWithRetry,
} from "./helpers.js";
import { ValidationError } from "@/lib/api-helpers";

const COLLECTION = "nss_activities";
const VALID_STATUSES = ["draft", "published"];
const URL_REGEX = /^https?:\/\/.+/;

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
  await coll.createIndex({ activityId: 1 }, { unique: true });
  await coll.createIndex({ activityDate: 1 });
  await coll.createIndex({ status: 1 });
}

export async function ensureIndexes() {
  await getCollection();
  await indexesEnsured;
}

export function validate(doc, { isUpdate = false } = {}) {
  if (!isUpdate) {
    validateRequiredStrings(doc, ["title", "description", "venue"]);
    validateRequiredNumbers(doc, ["boysCount", "girlsCount"]);
  }

  if (doc.title !== undefined) {
    validateRequiredStrings(doc, ["title"]);
  }
  if (doc.description !== undefined) {
    validateRequiredStrings(doc, ["description"]);
  }
  if (doc.venue !== undefined) {
    validateRequiredStrings(doc, ["venue"]);
  }

  if (doc.boysCount !== undefined) {
    if (typeof doc.boysCount !== "number" || isNaN(doc.boysCount) || doc.boysCount < 0 || !Number.isInteger(doc.boysCount)) {
      throw new ValidationError("boysCount must be a non-negative integer");
    }
  }
  if (doc.girlsCount !== undefined) {
    if (typeof doc.girlsCount !== "number" || isNaN(doc.girlsCount) || doc.girlsCount < 0 || !Number.isInteger(doc.girlsCount)) {
      throw new ValidationError("girlsCount must be a non-negative integer");
    }
  }

  if (doc.totalParticipants !== undefined) {
    const expectedTotal = (doc.boysCount ?? 0) + (doc.girlsCount ?? 0);
    if (doc.totalParticipants !== expectedTotal) {
      throw new ValidationError("totalParticipants must equal boysCount + girlsCount");
    }
  }

  if (doc.activityDate !== undefined) {
    if (!isValidDate(doc.activityDate)) {
      throw new ValidationError("activityDate must be a valid date");
    }
  }

  if (doc.startTime !== undefined && doc.startTime !== null && doc.startTime !== "") {
    if (typeof doc.startTime !== "string" || !/^\d{2}:\d{2}$/.test(doc.startTime)) {
      throw new ValidationError("startTime must be in HH:MM format");
    }
  }

  if (doc.endTime !== undefined && doc.endTime !== null && doc.endTime !== "") {
    if (typeof doc.endTime !== "string" || !/^\d{2}:\d{2}$/.test(doc.endTime)) {
      throw new ValidationError("endTime must be in HH:MM format");
    }
  }

  if (doc.posterUrl !== undefined && doc.posterUrl !== null && doc.posterUrl !== "") {
    if (typeof doc.posterUrl !== "string" || !URL_REGEX.test(doc.posterUrl)) {
      throw new ValidationError("posterUrl must be a valid HTTP/HTTPS URL");
    }
  }

  validateEnum(doc, "status", VALID_STATUSES);

  return true;
}

export function prepareForInsert(doc) {
  const boysCount = typeof doc.boysCount === "number" ? doc.boysCount : 0;
  const girlsCount = typeof doc.girlsCount === "number" ? doc.girlsCount : 0;

  validate(doc);

  return {
    title: String(doc.title).trim(),
    description: String(doc.description).trim(),
    venue: String(doc.venue).trim(),
    activityDate: doc.activityDate ? new Date(doc.activityDate) : new Date(),
    startTime: doc.startTime || null,
    endTime: doc.endTime || null,
    posterUrl: doc.posterUrl ? String(doc.posterUrl).trim() : null,
    boysCount,
    girlsCount,
    totalParticipants: boysCount + girlsCount,
    status: doc.status || "draft",
    ...createTimestamps(),
  };
}

export function prepareForUpdate(doc, existing = {}) {
  const update = { ...doc };
  delete update._id;
  delete update.activityId;
  delete update.createdAt;
  delete update.totalParticipants;

  if (update.boysCount !== undefined || update.girlsCount !== undefined) {
    const boys = update.boysCount !== undefined ? update.boysCount : (existing.boysCount ?? 0);
    const girls = update.girlsCount !== undefined ? update.girlsCount : (existing.girlsCount ?? 0);
    update.totalParticipants = boys + girls;
  }

  validate(doc, { isUpdate: true });
  return updateTimestamp(update);
}

export async function getNextSequence() {
  const coll = await getCollection();
  return getNextSequenceFor(coll, "activityId");
}

export async function insertOne(doc) {
  const coll = await getCollection();
  return insertOneWithRetry(coll, generateActivityId, prepareForInsert, doc, "activityId");
}

export async function findByActivityId(activityId) {
  const coll = await getCollection();
  return coll.findOne({ activityId });
}

export async function findPublished(sort = { activityDate: 1 }) {
  const coll = await getCollection();
  return coll.find({ status: "published" }).sort(sort).toArray();
}

export async function findAll(filter = {}, sort = { createdAt: -1 }) {
  const coll = await getCollection();
  return coll.find(filter).sort(sort).toArray();
}

export async function deleteByActivityId(activityId) {
  const coll = await getCollection();
  return coll.deleteOne({ activityId });
}