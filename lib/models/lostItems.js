import { getDb } from "../db.js";
import {
  isValidDate,
  createTimestamps,
  updateTimestamp,
  generateItemId,
  validateRequiredStrings,
  validateEnum,
} from "./helpers.js";

const COLLECTION = "lost_items";
const VALID_STATUSES = ["Lost", "Found", "Claimed"];
const VALID_CATEGORIES = ["Mobile", "Wallet", "Bag", "Documents", "Jewelry", "Shoes", "Other"];

export async function getCollection() {
  const db = await getDb();
  return db.collection(COLLECTION);
}

export async function ensureIndexes() {
  const coll = await getCollection();
  await coll.createIndex({ itemId: 1 }, { unique: true });
  await coll.createIndex({ status: 1 });
  await coll.createIndex({ category: 1 });
  await coll.createIndex({ name: "text", description: "text" });
  await coll.createIndex({ dateReported: -1 });
}

export function validate(doc, { isUpdate = false } = {}) {
  if (!isUpdate) {
    validateRequiredStrings(doc, ["name", "category", "locationFound", "contactInfo"]);
  }

  validateEnum(doc, "status", VALID_STATUSES);
  validateEnum(doc, "category", VALID_CATEGORIES);

  if (doc.dateReported !== undefined && !isValidDate(doc.dateReported)) {
    throw new Error("dateReported must be a valid date");
  }
  if (doc.claimedDate !== undefined && !isValidDate(doc.claimedDate)) {
    throw new Error("claimedDate must be a valid date");
  }

  return true;
}

export function prepareForInsert(doc) {
  validate(doc);
  return {
    ...doc,
    status: doc.status || "Lost",
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
  const count = await coll.countDocuments();
  return count + 1;
}

export async function insertOne(doc) {
  const coll = await getCollection();
  const seq = await getNextSequence();
  const itemId = generateItemId(seq);
  const prepared = prepareForInsert({ ...doc, itemId });
  return coll.insertOne(prepared);
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
    throw new Error(`Status must be one of: ${VALID_STATUSES.join(", ")}`);
  }
  const coll = await getCollection();
  return coll.updateOne(
    { itemId },
    { $set: { status: newStatus, updatedAt: new Date() } }
  );
}
