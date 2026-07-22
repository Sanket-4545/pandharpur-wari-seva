import { getDb } from "../db.js";
import { createTimestamps, updateTimestamp, validateRequiredStrings, validateEnum } from "./helpers.js";

const COLLECTION = "settings";
const VALID_TYPES = ["string", "number", "boolean", "json"];

export async function getCollection() {
  const db = await getDb();
  return db.collection(COLLECTION);
}

export async function ensureIndexes() {
  const coll = await getCollection();
  await coll.createIndex({ key: 1 }, { unique: true });
}

export function validate(doc) {
  validateRequiredStrings(doc, ["key"]);
  validateEnum(doc, "type", VALID_TYPES);
  return true;
}

export function prepareForInsert(doc) {
  validate(doc);
  return {
    key: doc.key,
    value: doc.value,
    type: doc.type || "string",
    description: doc.description || null,
    updatedBy: doc.updatedBy || null,
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

export async function findByKey(key) {
  const coll = await getCollection();
  return coll.findOne({ key });
}

export async function findAll(filter = {}, sort = { key: 1 }) {
  const coll = await getCollection();
  return coll.find(filter).sort(sort).toArray();
}

export async function upsert(key, value, type = "string", updatedBy = null) {
  const coll = await getCollection();
  return coll.updateOne(
    { key },
    {
      $set: { value, type, updatedBy, updatedAt: new Date() },
      $setOnInsert: { key, createdAt: new Date() },
    },
    { upsert: true }
  );
}

export async function getValue(key) {
  const coll = await getCollection();
  const doc = await coll.findOne({ key });
  return doc ? doc.value : null;
}

export async function deleteByKey(key) {
  const coll = await getCollection();
  return coll.deleteOne({ key });
}
