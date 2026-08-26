import { getDb } from "../db.js";
import {
  isValidPhone,
  createTimestamps,
  updateTimestamp,
  generateHelpRequestId,
  insertOneWithRetry,
  getNextSequenceFor,
  validateRequiredStrings,
  validateEnum,
  sanitizeString,
} from "./helpers.js";
import { ValidationError } from "@/lib/api-helpers";

const COLLECTION = "help_requests";

const VALID_HELP_TYPES = [
  "Medical",
  "Water",
  "Food",
  "Direction",
  "Lost/Separated",
  "Emergency",
  "Other",
];

const VALID_STATUSES = [
  "Pending",
  "Accepted",
  "In Progress",
  "Completed",
  "Cancelled",
];

const ALLOWED_TRANSITIONS = {
  Pending: ["Accepted", "Cancelled"],
  Accepted: ["In Progress"],
  "In Progress": ["Completed"],
  Completed: [],
  Cancelled: [],
};

const TIMESTAMP_FIELDS = {
  Accepted: "acceptedAt",
  "In Progress": "startedAt",
  Completed: "completedAt",
  Cancelled: "cancelledAt",
};

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
  await coll.createIndex({ requestId: 1 }, { unique: true });
  await coll.createIndex({ status: 1 });
  await coll.createIndex({ createdAt: -1 });
  await coll.createIndex({ volunteerId: 1 });
}

export async function ensureIndexes() {
  await getCollection();
  await indexesEnsured;
}

export function validate(doc, { isUpdate = false } = {}) {
  if (!isUpdate) {
    validateRequiredStrings(doc, ["fullName", "contactNumber", "helpType"]);
  }

  if (doc.helpType !== undefined) {
    validateEnum(doc, "helpType", VALID_HELP_TYPES);
  }
  if (doc.status !== undefined) {
    validateEnum(doc, "status", VALID_STATUSES);
  }
  if (doc.contactNumber !== undefined) {
    const phone = String(doc.contactNumber).trim();
    if (!isValidPhone(phone)) {
      throw new ValidationError(
        "contactNumber must be a valid 10-digit Indian phone number"
      );
    }
  }
  if (doc.location !== undefined && doc.location !== null) {
    if (typeof doc.location !== "object" || Array.isArray(doc.location)) {
      throw new ValidationError("location must be an object with lat, lng, accuracy, and timestamp");
    }
  }

  return true;
}

export function prepareForInsert(doc) {
  validate(doc);
  return {
    requestId: doc.requestId,
    fullName: sanitizeString(doc.fullName, 200),
    contactNumber: String(doc.contactNumber).trim(),
    helpType: doc.helpType,
    message: doc.message ? sanitizeString(doc.message, 1000) : undefined,
    location: doc.location || null,
    status: doc.status || "Pending",
    volunteerId: undefined,
    acceptedAt: undefined,
    startedAt: undefined,
    completedAt: undefined,
    cancelledAt: undefined,
    ...createTimestamps(),
  };
}

export function prepareForUpdate(doc) {
  const update = { ...doc };
  delete update._id;
  delete update.requestId;
  delete update.createdAt;
  delete update.volunteerId;
  delete update.acceptedAt;
  delete update.startedAt;
  delete update.completedAt;
  delete update.cancelledAt;
  validate(doc, { isUpdate: true });
  return updateTimestamp(update);
}

export async function insertOne(doc) {
  const coll = await getCollection();
  return insertOneWithRetry(
    coll,
    generateHelpRequestId,
    prepareForInsert,
    doc,
    "requestId"
  );
}

export async function findByRequestId(requestId) {
  const coll = await getCollection();
  return coll.findOne({ requestId });
}

export async function findAll(filter = {}, sort = { createdAt: -1 }) {
  const coll = await getCollection();
  return coll.find(filter).sort(sort).toArray();
}

export async function updateStatus(requestId, newStatus) {
  if (!VALID_STATUSES.includes(newStatus)) {
    throw new ValidationError(
      `Status must be one of: ${VALID_STATUSES.join(", ")}`
    );
  }
  const coll = await getCollection();
  const doc = await coll.findOne({ requestId });
  if (!doc) {
    throw new ValidationError("Help request not found");
  }
  if (doc.status === newStatus) {
    return coll.updateOne(
      { requestId },
      { $set: { updatedAt: new Date() } }
    );
  }
  const allowed = ALLOWED_TRANSITIONS[doc.status];
  if (!allowed || !allowed.includes(newStatus)) {
    throw new ValidationError(
      `Invalid status transition from ${doc.status} to ${newStatus}`
    );
  }
  const setFields = { status: newStatus, updatedAt: new Date() };
  const tsField = TIMESTAMP_FIELDS[newStatus];
  if (tsField) {
    setFields[tsField] = new Date();
  }
  return coll.updateOne({ requestId }, { $set: setFields });
}

export async function acceptRequest(requestId, volunteerId) {
  const coll = await getCollection();
  const now = new Date();
  const result = await coll.findOneAndUpdate(
    { requestId, status: "Pending" },
    {
      $set: {
        status: "Accepted",
        volunteerId,
        acceptedAt: now,
        updatedAt: now,
      },
    },
    { returnDocument: "after" }
  );
  return result;
}
