import { getDb } from "../db.js";
import { createTimestamps, updateTimestamp, validateRequiredStrings } from "./helpers.js";

const COLLECTION = "services";

export async function getCollection() {
  const db = await getDb();
  return db.collection(COLLECTION);
}

export async function ensureIndexes() {
  const coll = await getCollection();
  await coll.createIndex({ serviceId: 1 }, { unique: true });
  await coll.createIndex({ order: 1 });
}

export function validate(doc) {
  validateRequiredStrings(doc, ["serviceId", "titleKey", "descriptionKey"]);
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
  delete update.serviceId;
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
