import { getDb } from "../db.js";
import { isValidDate, createTimestamps, updateTimestamp, generateReportId, validateRequiredStrings, validateEnum } from "./helpers.js";

const COLLECTION = "reports";
const VALID_TYPES = ["daily", "volunteer", "emergency", "audit", "weekly"];

export async function getCollection() {
  const db = await getDb();
  return db.collection(COLLECTION);
}

export async function ensureIndexes() {
  const coll = await getCollection();
  await coll.createIndex({ reportId: 1 }, { unique: true });
  await coll.createIndex({ type: 1, date: -1 });
  await coll.createIndex({ date: -1 });
}

export function validate(doc) {
  validateRequiredStrings(doc, ["title", "description", "type"]);
  validateEnum(doc, "type", VALID_TYPES);

  if (doc.date !== undefined && !isValidDate(doc.date)) {
    throw new Error("date must be a valid date");
  }

  return true;
}

export function prepareForInsert(doc) {
  validate(doc);
  return {
    ...doc,
    downloadCount: doc.downloadCount || 0,
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
  const count = await coll.countDocuments();
  return count + 1;
}

export async function insertOne(doc) {
  const coll = await getCollection();
  const seq = await getNextSequence();
  const reportId = generateReportId(seq);
  const prepared = prepareForInsert({ ...doc, reportId });
  return coll.insertOne(prepared);
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
