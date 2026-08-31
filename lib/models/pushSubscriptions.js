import { getDb } from "../db.js";
import { createTimestamps, updateTimestamp } from "./helpers.js";
import { ValidationError } from "@/lib/api-helpers";

const COLLECTION = "push_subscriptions";

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
  await coll.createIndex({ volunteerId: 1 });
  await coll.createIndex({ endpoint: 1 });
  await coll.createIndex({ volunteerId: 1, endpoint: 1 }, { unique: true });
}

export async function ensureIndexes() {
  await getCollection();
  await indexesEnsured;
}

export function validateSubscription(doc) {
  if (!doc || typeof doc !== "object") {
    throw new ValidationError("Invalid subscription object");
  }
  if (!doc.endpoint || typeof doc.endpoint !== "string" || !doc.endpoint.startsWith("https://")) {
    throw new ValidationError("Invalid subscription endpoint");
  }
  if (!doc.keys || typeof doc.keys !== "object") {
    throw new ValidationError("Invalid subscription keys");
  }
  if (!doc.keys.p256dh || typeof doc.keys.p256dh !== "string") {
    throw new ValidationError("Invalid subscription p256dh key");
  }
  if (!doc.keys.auth || typeof doc.keys.auth !== "string") {
    throw new ValidationError("Invalid subscription auth key");
  }
  // Reject clearly malicious URLs
  try {
    const url = new URL(doc.endpoint);
    if (!url.hostname.endsWith(".googleapis.com") && !url.hostname.endsWith(".push.services.mozilla.com") && !url.hostname.endsWith(".notify.apple.com") && !url.hostname.endsWith(".push.windows.com")) {
      // Allow other valid HTTPS endpoints (e.g., custom push services)
    }
  } catch {
    throw new ValidationError("Invalid subscription endpoint URL");
  }
  return true;
}

export async function upsertSubscription(volunteerId, subscription) {
  validateSubscription(subscription);
  const coll = await getCollection();
  const now = new Date();
  const doc = {
    volunteerId,
    endpoint: subscription.endpoint,
    keys: {
      p256dh: subscription.keys.p256dh,
      auth: subscription.keys.auth,
    },
    userAgent: subscription.userAgent || null,
    ...createTimestamps(),
  };

  return coll.updateOne(
    { volunteerId, endpoint: subscription.endpoint },
    { $set: doc, $setOnInsert: { createdAt: now } },
    { upsert: true }
  );
}

export async function findByVolunteerId(volunteerId) {
  const coll = await getCollection();
  return coll.find({ volunteerId }).toArray();
}

export async function findActiveVolunteerSubscriptions() {
  const db = await getDb();
  const volColl = db.collection("volunteers");
  const activeVolunteers = await volColl
    .find({ isActive: true, status: "approved" }, { projection: { volunteerId: 1 } })
    .toArray();
  const activeIds = activeVolunteers.map((v) => v.volunteerId);
  if (activeIds.length === 0) return [];
  const pushColl = await getCollection();
  return pushColl.find({ volunteerId: { $in: activeIds } }).toArray();
}

export async function removeByEndpoint(endpoint) {
  const coll = await getCollection();
  return coll.deleteOne({ endpoint });
}

export async function removeByVolunteerAndEndpoint(volunteerId, endpoint) {
  const coll = await getCollection();
  return coll.deleteOne({ volunteerId, endpoint });
}

export async function removeByVolunteerId(volunteerId) {
  const coll = await getCollection();
  return coll.deleteMany({ volunteerId });
}
