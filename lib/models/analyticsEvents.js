import { getDb } from "../db.js";
import { createTimestamps, validateRequiredStrings, validateEnum } from "./helpers.js";

const COLLECTION = "analytics_events";
const VALID_EVENT_TYPES = ["volunteer", "missing", "lost_found", "emergency", "gallery", "announcement"];
const VALID_STATUSES = ["pending", "active", "claimed", "resolved", "success", "published"];

export async function getCollection() {
  const db = await getDb();
  return db.collection(COLLECTION);
}

export async function ensureIndexes() {
  const coll = await getCollection();
  await coll.createIndex({ eventType: 1, createdAt: -1 });
  await coll.createIndex({ createdAt: -1 });
  await coll.createIndex({ status: 1 });
}

export function validate(doc) {
  validateRequiredStrings(doc, ["eventType"]);
  validateEnum(doc, "eventType", VALID_EVENT_TYPES);
  validateEnum(doc, "status", VALID_STATUSES);
  return true;
}

export function prepareForInsert(doc) {
  validate(doc);
  return {
    ...doc,
    titleArgs: doc.titleArgs || {},
    metadata: doc.metadata || {},
    ...createTimestamps(),
  };
}

export async function insertOne(doc) {
  const coll = await getCollection();
  const prepared = prepareForInsert(doc);
  return coll.insertOne(prepared);
}

export async function findRecent(limit = 50, sort = { createdAt: -1 }) {
  const coll = await getCollection();
  return coll.find().sort(sort).limit(limit).toArray();
}

export async function findByType(eventType, sort = { createdAt: -1 }) {
  const coll = await getCollection();
  return coll.find({ eventType }).sort(sort).toArray();
}

export async function findAll(filter = {}, sort = { createdAt: -1 }) {
  const coll = await getCollection();
  return coll.find(filter).sort(sort).toArray();
}
