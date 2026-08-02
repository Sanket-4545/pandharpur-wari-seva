import { getDb } from "../db.js";
import {
  isValidDate,
  createTimestamps,
  updateTimestamp,
  generateItemId,
  insertOneWithRetry,
  getNextSequenceFor,
  validateRequiredStrings,
  validateEnum,
} from "./helpers.js";
import { ValidationError } from "@/lib/api-helpers";

const COLLECTION = "lost_items";
const VALID_STATUSES = ["Lost", "Found", "Claimed"];
const VALID_CATEGORIES = ["Mobile", "Wallet", "Bag", "Documents", "Jewelry", "Shoes", "Other"];

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
  await coll.createIndex({ itemId: 1 }, { unique: true });
  await coll.createIndex({ status: 1 });
  await coll.createIndex({ category: 1 });
  await coll.createIndex({ name: "text", description: "text" });
  await coll.createIndex({ dateReported: -1 });
}

export async function ensureIndexes() {
  await getCollection();
  await indexesEnsured;
}

export function validate(doc, { isUpdate = false } = {}) {
  if (!isUpdate) {
    validateRequiredStrings(doc, ["name", "category", "locationFound", "contactInfo"]);
  }

  validateEnum(doc, "status", VALID_STATUSES);
  validateEnum(doc, "category", VALID_CATEGORIES);

  if (doc.dateReported !== undefined && !isValidDate(doc.dateReported)) {
    throw new ValidationError("dateReported must be a valid date");
  }
  if (doc.claimedDate !== undefined && !isValidDate(doc.claimedDate)) {
    throw new ValidationError("claimedDate must be a valid date");
  }

  return true;
}

export function prepareForInsert(doc) {
  validate(doc);
  return {
    name: String(doc.name).trim(),
    category: doc.category,
    locationFound: String(doc.locationFound).trim(),
    contactInfo: String(doc.contactInfo).trim(),
    description: doc.description ? String(doc.description).trim() : undefined,
    status: doc.status || "Lost",
    dateReported: doc.dateReported || new Date(),
    ...createTimestamps(),
  };
}

export function prepareForUpdate(doc) {
  const update = { ...doc };
  delete update._id;
  delete update.itemId;
  delete update.createdAt;
  validate(doc, { isUpdate: true });
  return updateTimestamp(update);
}

export async function getNextSequence() {
  const coll = await getCollection();
  return getNextSequenceFor(coll, "itemId");
}

export async function insertOne(doc) {
  const coll = await getCollection();
  return insertOneWithRetry(coll, generateItemId, prepareForInsert, doc, "itemId");
}

export async function findByItemId(itemId) {
  const coll = await getCollection();
  return coll.findOne({ itemId });
}

export async function findAll(filter = {}, sort = { createdAt: -1 }) {
  const coll = await getCollection();
  return coll.find(filter).sort(sort).toArray();
}

export async function updateStatus(itemId, newStatus) {
  if (!VALID_STATUSES.includes(newStatus)) {
    throw new ValidationError(`Status must be one of: ${VALID_STATUSES.join(", ")}`);
  }
  const coll = await getCollection();
  return coll.updateOne(
    { itemId },
    { $set: { status: newStatus, updatedAt: new Date() } }
  );
}
