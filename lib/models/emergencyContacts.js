import { getDb } from "../db.js";
import { createTimestamps, updateTimestamp, validateRequiredStrings, validateEnum } from "./helpers.js";

const COLLECTION = "emergency_contacts";
const VALID_CATEGORIES = ["police", "ambulance", "medical", "fire", "nss", "women", "child", "control_room"];

export async function getCollection() {
  const db = await getDb();
  return db.collection(COLLECTION);
}

export async function ensureIndexes() {
  const coll = await getCollection();
  await coll.createIndex({ category: 1, order: 1 });
  await coll.createIndex({ isActive: 1 });
}

export function validate(doc) {
  validateRequiredStrings(doc, ["label", "phoneNumber", "category"]);
  validateEnum(doc, "category", VALID_CATEGORIES);
  return true;
}

export function prepareForInsert(doc) {
  validate(doc);
  return {
    ...doc,
    order: doc.order || 0,
    isActive: doc.isActive !== undefined ? doc.isActive : true,
    ...createTimestamps(),
  };
}

export function prepareForUpdate(doc) {
  const update = { ...doc };
  delete update._id;
  delete update.createdAt;
  validate(doc);
  return updateTimestamp(update);
}

export async function insertOne(doc) {
  const coll = await getCollection();
  const prepared = prepareForInsert(doc);
  return coll.insertOne(prepared);
}

export async function findActive(sort = { order: 1 }) {
  const coll = await getCollection();
  return coll.find({ isActive: true }).sort(sort).toArray();
}

export async function findAll(filter = {}, sort = { order: 1 }) {
  const coll = await getCollection();
  return coll.find(filter).sort(sort).toArray();
}

export async function deleteById(_id) {
  const coll = await getCollection();
  return coll.deleteOne({ _id });
}
