import { getDb } from "../db.js";
import { isValidEmail, isValidPhone, createTimestamps, validateRequiredStrings } from "./helpers.js";

const COLLECTION = "contact_messages";

export async function getCollection() {
  const db = await getDb();
  return db.collection(COLLECTION);
}

export async function ensureIndexes() {
  const coll = await getCollection();
  await coll.createIndex({ createdAt: -1 });
  await coll.createIndex({ isRead: 1 });
}

export function validate(doc) {
  validateRequiredStrings(doc, ["name", "email", "phone", "message"]);

  if (!isValidEmail(doc.email)) {
    throw new Error("Invalid email format");
  }
  if (!isValidPhone(doc.phone)) {
    throw new Error("Phone must be a valid 10-digit number");
  }
  if (typeof doc.message === "string" && doc.message.trim().length < 10) {
    throw new Error("Message must be at least 10 characters long");
  }

  return true;
}

export function prepareForInsert(doc) {
  validate(doc);
  return {
    name: doc.name.trim(),
    email: doc.email.toLowerCase().trim(),
    phone: doc.phone.trim(),
    message: doc.message.trim(),
    isRead: false,
    readAt: null,
    ...createTimestamps(),
  };
}

export async function insertOne(doc) {
  const coll = await getCollection();
  const prepared = prepareForInsert(doc);
  return coll.insertOne(prepared);
}

export async function findUnread(sort = { createdAt: -1 }) {
  const coll = await getCollection();
  return coll.find({ isRead: false }).sort(sort).toArray();
}

export async function findAll(filter = {}, sort = { createdAt: -1 }) {
  const coll = await getCollection();
  return coll.find(filter).sort(sort).toArray();
}

export async function markAsRead(_id) {
  const coll = await getCollection();
  return coll.updateOne(
    { _id },
    { $set: { isRead: true, readAt: new Date(), updatedAt: new Date() } }
  );
}

export async function deleteById(_id) {
  const coll = await getCollection();
  return coll.deleteOne({ _id });
}
