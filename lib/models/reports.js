import { getDb } from "../db.js";
import {
  isValidDate,
  createTimestamps,
  updateTimestamp,
  generateReportId,
  insertOneWithRetry,
  getNextSequenceFor,
  validateRequiredStrings,
  validateEnum,
} from "./helpers.js";
import { ValidationError } from "@/lib/api-helpers";

const COLLECTION = "reports";
const VALID_TYPES = ["daily", "volunteer", "emergency", "audit", "weekly"];

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
  await coll.createIndex({ reportId: 1 }, { unique: true });
  await coll.createIndex({ type: 1, date: -1 });
  await coll.createIndex({ date: -1 });
}

export async function ensureIndexes() {
  await getCollection();
  await indexesEnsured;
}

export function validate(doc) {
  validateRequiredStrings(doc, ["title", "description", "type"]);
  validateEnum(doc, "type", VALID_TYPES);

  if (doc.date !== undefined && !isValidDate(doc.date)) {
    throw new ValidationError("date must be a valid date");
  }

  return true;
}

export function prepareForInsert(doc) {
  validate(doc);
  return {
    title: String(doc.title).trim(),
    description: String(doc.description).trim(),
    type: doc.type,
    date: doc.date || new Date(),
    downloadCount: 0,
    ...createTimestamps(),
  };
}

export function prepareForUpdate(doc) {
  const update = { ...doc };
  delete update._id;
  delete update.reportId;
  delete update.createdAt;
  validate(doc);
  return updateTimestamp(update);
}

export async function getNextSequence() {
  const coll = await getCollection();
  return getNextSequenceFor(coll, "reportId");
}

export async function insertOne(doc) {
  const coll = await getCollection();
  return insertOneWithRetry(coll, generateReportId, prepareForInsert, doc, "reportId");
}

export async function findByReportId(reportId) {
  const coll = await getCollection();
  return coll.findOne({ reportId });
}

export async function findAll(filter = {}, sort = { date: -1 }) {
  const coll = await getCollection();
  return coll.find(filter).sort(sort).toArray();
}

export async function incrementDownloads(reportId) {
  const coll = await getCollection();
  return coll.updateOne(
    { reportId },
    { $inc: { downloadCount: 1 }, $set: { updatedAt: new Date() } }
  );
}
