import { getDb } from "../db.js";
import {
  isValidEmail,
  isValidPhone,
  createTimestamps,
  updateTimestamp,
  generateVolunteerId,
  insertOneWithRetry,
  getNextSequenceFor,
  validateRequiredStrings,
  validateRequiredNumbers,
  validateEnum,
  validateArray,
} from "./helpers.js";
import { hashPassword, comparePassword as comparePwd } from "../password.js";
import { ValidationError } from "@/lib/api-helpers";

const COLLECTION = "volunteers";
const VALID_STATUSES = ["pending", "approved", "rejected", "inactive"];
const VALID_BLOOD_GROUPS = ["A+", "A-", "B+", "B-", "AB+", "AB-", "O+", "O-"];
const VALID_SKILLS = ["first_aid", "crowd_mgmt", "translation", "logistics", "it_support"];
const VALID_LANGUAGES = ["marathi", "hindi", "english", "kannada", "telugu"];
const VALID_SHIFTS = ["morning", "afternoon", "evening", "night"];
const VALID_GENDERS = ["Male", "Female"];

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
  await coll.createIndex({ email: 1 }, { unique: true });
  await coll.createIndex({ volunteerId: 1 }, { unique: true });
  await coll.createIndex({ status: 1 });
  await coll.createIndex({ name: "text", college: "text" });
  await coll.createIndex({ createdAt: -1 });
}

export async function ensureIndexes() {
  await getCollection();
  await indexesEnsured;
}

export function validate(doc, { isUpdate = false } = {}) {
  if (!isUpdate) {
    validateRequiredStrings(doc, ["name", "email", "phone", "gender", "city", "college", "nssUnit", "bloodGroup", "emergencyPhone", "shift"]);
  }

  if (doc.email !== undefined && !isValidEmail(doc.email)) {
    throw new ValidationError("Invalid email format");
  }
  if (doc.phone !== undefined && !isValidPhone(doc.phone)) {
    throw new ValidationError("Phone must be a valid 10-digit number");
  }
  if (doc.emergencyPhone !== undefined && !isValidPhone(doc.emergencyPhone)) {
    throw new ValidationError("Emergency phone must be a valid 10-digit number");
  }
  if (doc.age !== undefined) {
    if (typeof doc.age !== "number" || doc.age < 16 || doc.age > 80) {
      throw new ValidationError("Age must be between 16 and 80");
    }
  }
  validateEnum(doc, "status", VALID_STATUSES);
  validateEnum(doc, "gender", VALID_GENDERS);
  validateEnum(doc, "bloodGroup", VALID_BLOOD_GROUPS);
  validateEnum(doc, "shift", VALID_SHIFTS);
  validateArray(doc, "skills");
  validateArray(doc, "languages");

  if (doc.skills) {
    for (const skill of doc.skills) {
      if (!VALID_SKILLS.includes(skill)) {
        throw new ValidationError(`Invalid skill: ${skill}`);
      }
    }
  }
  if (doc.languages) {
    for (const lang of doc.languages) {
      if (!VALID_LANGUAGES.includes(lang)) {
        throw new ValidationError(`Invalid language: ${lang}`);
      }
    }
  }

  return true;
}

export function prepareForInsert(doc) {
  validate(doc);
  return {
    volunteerId: doc.volunteerId,
    name: String(doc.name).trim(),
    email: String(doc.email).trim().toLowerCase(),
    phone: String(doc.phone).trim(),
    gender: doc.gender,
    age: doc.age,
    city: String(doc.city).trim(),
    college: String(doc.college).trim(),
    nssUnit: String(doc.nssUnit).trim(),
    bloodGroup: doc.bloodGroup,
    emergencyPhone: String(doc.emergencyPhone).trim(),
    shift: doc.shift,
    skills: doc.skills || [],
    languages: doc.languages || [],
    status: doc.status || "pending",
    passwordHash: doc.passwordHash ? hashPassword(doc.passwordHash) : null,
    isActive: doc.isActive !== undefined ? doc.isActive : true,
    lastLoginAt: null,
    ...createTimestamps(),
  };
}

export function prepareForUpdate(doc) {
  const update = { ...doc };
  delete update._id;
  delete update.volunteerId;
  delete update.createdAt;
  delete update.passwordHash;
  delete update.lastLoginAt;
  validate(doc, { isUpdate: true });
  return updateTimestamp(update);
}

export async function getNextSequence() {
  const coll = await getCollection();
  return getNextSequenceFor(coll, "volunteerId");
}

export async function insertOne(doc) {
  const coll = await getCollection();
  return insertOneWithRetry(coll, generateVolunteerId, prepareForInsert, doc, "volunteerId");
}

export async function findById(volunteerId) {
  const coll = await getCollection();
  return coll.findOne({ volunteerId });
}

export async function findByEmail(email) {
  const coll = await getCollection();
  return coll.findOne({ email: email.toLowerCase() });
}

export async function findAll(filter = {}, sort = { createdAt: -1 }) {
  const coll = await getCollection();
  return coll.find(filter).sort(sort).toArray();
}

export function comparePassword(volunteer, plaintextPassword) {
  if (!volunteer || !volunteer.passwordHash) return false;
  return comparePwd(plaintextPassword, volunteer.passwordHash);
}

export async function setLastLogin(volunteerId) {
  const coll = await getCollection();
  return coll.updateOne(
    { volunteerId },
    { $set: { lastLoginAt: new Date(), updatedAt: new Date() } }
  );
}

/**
 * SECURITY: Returns volunteer document WITHOUT passwordHash.
 */
export function sanitizeVolunteer(volunteer) {
  if (!volunteer) return null;
  const { passwordHash, ...safe } = volunteer;
  return safe;
}

export function sanitizeVolunteers(volunteers) {
  return volunteers.map(sanitizeVolunteer);
}

export async function updateStatus(volunteerId, newStatus) {
  if (!VALID_STATUSES.includes(newStatus)) {
    throw new ValidationError(`Status must be one of: ${VALID_STATUSES.join(", ")}`);
  }
  const coll = await getCollection();
  return coll.updateOne(
    { volunteerId },
    { $set: { status: newStatus, updatedAt: new Date() } }
  );
}

export async function setPassword(volunteerId, newPassword) {
  if (!newPassword || typeof newPassword !== "string") {
    throw new ValidationError("Password is required");
  }
  if (newPassword.length < 8 || newPassword.length > 64) {
    throw new ValidationError("Password must be between 8 and 64 characters");
  }
  const coll = await getCollection();
  const hashed = hashPassword(newPassword);
  return coll.updateOne(
    { volunteerId },
    { $set: { passwordHash: hashed, updatedAt: new Date() } }
  );
}
