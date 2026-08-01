import { getDb } from "../db.js";
import {
  createTimestamps,
  updateTimestamp,
  validateRequiredStrings,
  validateEnum,
  generateImageId,
} from "./helpers.js";

const COLLECTION = "gallery_images";
const VALID_CATEGORIES = ["wari", "nss", "medical", "volunteers", "pilgrims", "events"];

export async function getCollection() {
  const db = await getDb();
  return db.collection(COLLECTION);
}

export async function ensureIndexes() {
  const coll = await getCollection();
  await coll.createIndex({ imageId: 1 }, { unique: true });
  await coll.createIndex({ category: 1 });
  await coll.createIndex({ createdAt: -1 });
}

export function validate(doc) {
  validateRequiredStrings(doc, ["imageId", "imageUrl", "category", "titleKey"]);
  validateEnum(doc, "category", VALID_CATEGORIES);
  return true;
}

export function prepareForInsert(doc) {
  const withId = { ...doc, imageId: doc.imageId || generateImageId() };
  validate(withId);
  return {
    ...withId,
    ...createTimestamps(),
  };
}

export function prepareForUpdate(doc) {
  const update = { ...doc };
  delete update._id;
  delete update.imageId;
  delete update.createdAt;
  validateRequiredStrings(update, ["imageUrl", "category", "titleKey"]);
  validateEnum(update, "category", VALID_CATEGORIES);
  return updateTimestamp(update);
}

export async function insertOne(doc) {
  const coll = await getCollection();
  const prepared = prepareForInsert(doc);
  return coll.insertOne(prepared);
}

export async function findByCategory(category, sort = { createdAt: -1 }) {
  const coll = await getCollection();
  return coll.find({ category }).sort(sort).toArray();
}

export async function findAll(filter = {}, sort = { createdAt: -1 }) {
  const coll = await getCollection();
  return coll.find(filter).sort(sort).toArray();
}

export async function findActive(sort = { createdAt: -1 }) {
  const coll = await getCollection();
  return coll.find({ isActive: true }).sort(sort).toArray();
}

export async function deleteById(_id) {
  const coll = await getCollection();
  return coll.deleteOne({ _id });
}
