import { getDb } from "../db.js";
import {
  isValidDate,
  createTimestamps,
  updateTimestamp,
  generateAnnouncementId,
  validateRequiredStrings,
  validateEnum,
} from "./helpers.js";

const COLLECTION = "announcements";
const VALID_STATUSES = ["published", "draft", "scheduled"];
const VALID_PRIORITIES = ["high", "medium", "low"];
const VALID_CATEGORIES = ["safety", "schedule", "camp", "general"];

export async function getCollection() {
  const db = await getDb();
  return db.collection(COLLECTION);
}

export async function ensureIndexes() {
  const coll = await getCollection();
  await coll.createIndex({ announcementId: 1 }, { unique: true });
  await coll.createIndex({ status: 1, publishDate: -1 });
  await coll.createIndex({ priority: 1 });
  await coll.createIndex({ category: 1 });
}

export function validate(doc, { isUpdate = false } = {}) {
  if (!isUpdate) {
    validateRequiredStrings(doc, ["title", "description", "category"]);
  }

  validateEnum(doc, "status", VALID_STATUSES);
  validateEnum(doc, "priority", VALID_PRIORITIES);
  validateEnum(doc, "category", VALID_CATEGORIES);

  if (doc.publishDate !== undefined && !isValidDate(doc.publishDate)) {
    throw new Error("publishDate must be a valid date");
  }

  return true;
}

export function prepareForInsert(doc) {
  validate(doc);
  return {
    ...doc,
    status: doc.status || "draft",
    priority: doc.priority || "medium",
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
  const count = await coll.countDocuments();
  return count + 1;
}

export async function insertOne(doc) {
  const coll = await getCollection();
  const seq = await getNextSequence();
  const announcementId = generateAnnouncementId(seq);
  const prepared = prepareForInsert({ ...doc, announcementId });
  return coll.insertOne(prepared);
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
