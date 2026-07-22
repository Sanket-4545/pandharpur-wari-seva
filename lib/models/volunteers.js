import { getDb } from "../db.js";
import {
  isValidEmail,
  isValidPhone,
  createTimestamps,
  updateTimestamp,
  generateVolunteerId,
  validateRequiredStrings,
  validateRequiredNumbers,
  validateEnum,
  validateArray,
} from "./helpers.js";

const COLLECTION = "volunteers";
const VALID_STATUSES = ["pending", "approved", "rejected"];
const VALID_BLOOD_GROUPS = ["A+", "A-", "B+", "B-", "AB+", "AB-", "O+", "O-"];
const VALID_SKILLS = ["first_aid", "crowd_mgmt", "translation", "logistics", "it_support"];
const VALID_LANGUAGES = ["marathi", "hindi", "english", "kannada", "telugu"];
const VALID_SHIFTS = ["morning", "afternoon", "evening", "night"];
const VALID_GENDERS = ["Male", "Female"];

export async function getCollection() {
  const db = await getDb();
  return db.collection(COLLECTION);
}

export async function ensureIndexes() {
  const coll = await getCollection();
  await coll.createIndex({ email: 1 }, { unique: true });
  await coll.createIndex({ volunteerId: 1 }, { unique: true });
  await coll.createIndex({ status: 1 });
  await coll.createIndex({ name: "text", college: "text" });
  await coll.createIndex({ createdAt: -1 });
}

export function validate(doc, { isUpdate = false } = {}) {
  if (!isUpdate) {
    validateRequiredStrings(doc, ["name", "email", "phone", "gender", "city", "college", "nssUnit", "bloodGroup", "emergencyPhone", "shift"]);
  }

  if (doc.email !== undefined && !isValidEmail(doc.email)) {
    throw new Error("Invalid email format");
  }
  if (doc.phone !== undefined && !isValidPhone(doc.phone)) {
    throw new Error("Phone must be a valid 10-digit number");
  }
  if (doc.emergencyPhone !== undefined && !isValidPhone(doc.emergencyPhone)) {
    throw new Error("Emergency phone must be a valid 10-digit number");
  }
  if (doc.age !== undefined) {
    if (typeof doc.age !== "number" || doc.age < 16 || doc.age > 80) {
      throw new Error("Age must be between 16 and 80");
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
        throw new Error(`Invalid skill: ${skill}`);
      }
    }
  }
  if (doc.languages) {
    for (const lang of doc.languages) {
      if (!VALID_LANGUAGES.includes(lang)) {
        throw new Error(`Invalid language: ${lang}`);
      }
    }
  }

  return true;
}

export function prepareForInsert(doc) {
  validate(doc);
  return {
    ...doc,
    status: doc.status || "pending",
    skills: doc.skills || [],
    languages: doc.languages || [],
    ...createTimestamps(),
  };
}

export function prepareForUpdate(doc) {
  const update = { ...doc };
  delete update._id;
  delete update.volunteerId;
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
  const volunteerId = generateVolunteerId(seq);
  const prepared = prepareForInsert({ ...doc, volunteerId });
  return coll.insertOne(prepared);
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

export async function updateStatus(volunteerId, newStatus) {
  if (!VALID_STATUSES.includes(newStatus)) {
    throw new Error(`Status must be one of: ${VALID_STATUSES.join(", ")}`);
  }
  const coll = await getCollection();
  return coll.updateOne(
    { volunteerId },
    { $set: { status: newStatus, updatedAt: new Date() } }
  );
}
