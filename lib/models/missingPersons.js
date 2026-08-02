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
const VALID_STATUSES = ["Missing", "Found"];
const VALID_CATEGORIES = ["Child", "Senior Citizen", "Male", "Female"];

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
  return coll.updateOne(
    { caseId },
    { $set: { status: newStatus, updatedAt: new Date() } }
  );
}
