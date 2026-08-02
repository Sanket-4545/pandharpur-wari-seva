import { getDb } from "../db.js";
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
const VALID_STATUSES = ["published", "draft", "scheduled"];
const VALID_PRIORITIES = ["high", "medium", "low"];
const VALID_CATEGORIES = ["safety", "schedule", "camp", "general"];

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
