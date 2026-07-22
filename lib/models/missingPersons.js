import { getDb } from "../db.js";
import {
  isValidDate,
  isValidPhone,
  createTimestamps,
  updateTimestamp,
  generateCaseId,
  validateRequiredStrings,
  validateRequiredNumbers,
  validateEnum,
} from "./helpers.js";

const COLLECTION = "missing_persons";
const VALID_STATUSES = ["Missing", "Found"];
const VALID_CATEGORIES = ["Child", "Senior Citizen", "Male", "Female"];

export async function getCollection() {
  const db = await getDb();
  return db.collection(COLLECTION);
}

export async function ensureIndexes() {
  const coll = await getCollection();
  await coll.createIndex({ caseId: 1 }, { unique: true });
  await coll.createIndex({ status: 1 });
  await coll.createIndex({ name: "text", clothing: "text" });
  await coll.createIndex({ dateReported: -1 });
  await coll.createIndex({ category: 1 });
}

export function validate(doc, { isUpdate = false } = {}) {
  if (!isUpdate) {
    validateRequiredStrings(doc, ["name", "gender", "category", "lastSeenLocation", "contactPhone"]);
    validateRequiredNumbers(doc, ["age"]);
  }

  validateEnum(doc, "status", VALID_STATUSES);
  validateEnum(doc, "category", VALID_CATEGORIES);

  if (doc.contactPhone !== undefined && !isValidPhone(doc.contactPhone)) {
    throw new Error("Contact phone must be a valid 10-digit number");
  }
  if (doc.dateReported !== undefined && !isValidDate(doc.dateReported)) {
    throw new Error("dateReported must be a valid date");
  }

  return true;
}

export function prepareForInsert(doc) {
  validate(doc);
  return {
    ...doc,
    status: doc.status || "Missing",
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
  const count = await coll.countDocuments();
  return count + 1;
}

export async function insertOne(doc) {
  const coll = await getCollection();
  const seq = await getNextSequence();
  const caseId = generateCaseId(seq);
  const prepared = prepareForInsert({ ...doc, caseId });
  return coll.insertOne(prepared);
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
    throw new Error(`Status must be one of: ${VALID_STATUSES.join(", ")}`);
  }
  const coll = await getCollection();
  return coll.updateOne(
    { caseId },
    { $set: { status: newStatus, updatedAt: new Date() } }
  );
}
