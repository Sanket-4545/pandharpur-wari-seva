import { getDb } from "../db.js";
import { isValidEmail, createTimestamps, updateTimestamp, validateRequiredStrings, validateEnum } from "./helpers.js";

const COLLECTION = "admins";
const VALID_ROLES = ["super_admin", "admin", "coordinator"];

export async function getCollection() {
  const db = await getDb();
  return db.collection(COLLECTION);
}

export async function ensureIndexes() {
  const coll = await getCollection();
  await coll.createIndex({ email: 1 }, { unique: true });
  await coll.createIndex({ role: 1 });
}

/**
 * Validates an admin document for insertion.
 * NOTE: passwordHash is required for insert but is NOT validated here.
 * It should be a bcrypt hash created at the API/auth layer.
 */
export function validate(doc, { isUpdate = false, requirePassword = false } = {}) {
  if (!isUpdate || requirePassword) {
    validateRequiredStrings(doc, ["name", "email", "passwordHash"]);
  }

  if (doc.email !== undefined && !isValidEmail(doc.email)) {
    throw new Error("Invalid email format");
  }
  validateEnum(doc, "role", VALID_ROLES);

  return true;
}

export function prepareForInsert(doc) {
  validate(doc, { requirePassword: true });
  return {
    name: doc.name.trim(),
    email: doc.email.toLowerCase().trim(),
    passwordHash: doc.passwordHash,
    phone: doc.phone || null,
    role: doc.role || "admin",
    about: doc.about || null,
    isActive: doc.isActive !== undefined ? doc.isActive : true,
    lastLoginAt: null,
    ...createTimestamps(),
  };
}

export function prepareForUpdate(doc) {
  const update = { ...doc };
  delete update._id;
  delete update.email;
  delete update.createdAt;
  delete update.passwordHash;
  validate(doc, { isUpdate: true });
  return updateTimestamp(update);
}

export async function insertOne(doc) {
  const coll = await getCollection();
  const prepared = prepareForInsert(doc);
  return coll.insertOne(prepared);
}

export async function findByEmail(email) {
  const coll = await getCollection();
  return coll.findOne({ email: email.toLowerCase() });
}

export async function findAll(filter = {}, sort = { createdAt: -1 }) {
  const coll = await getCollection();
  return coll.find(filter).sort(sort).toArray();
}

export async function updateById(_id, doc) {
  const coll = await getCollection();
  const update = prepareForUpdate(doc);
  return coll.updateOne({ _id }, { $set: update });
}

export async function setLastLogin(_id) {
  const coll = await getCollection();
  return coll.updateOne(
    { _id },
    { $set: { lastLoginAt: new Date(), updatedAt: new Date() } }
  );
}

export async function deleteById(_id) {
  const coll = await getCollection();
  return coll.deleteOne({ _id });
}

/**
 * SECURITY: Returns admin document WITHOUT passwordHash.
 */
export function sanitizeAdmin(admin) {
  if (!admin) return null;
  const { passwordHash, ...safe } = admin;
  return safe;
}

export function sanitizeAdmins(admins) {
  return admins.map(sanitizeAdmin);
}
