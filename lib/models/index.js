import { getDb } from "../db.js";

// Import all models
import * as Volunteers from "./volunteers.js";
import * as MissingPersons from "./missingPersons.js";
import * as LostItems from "./lostItems.js";
import * as Announcements from "./announcements.js";
import * as EmergencyContacts from "./emergencyContacts.js";
import * as GalleryImages from "./galleryImages.js";
import * as ContactMessages from "./contactMessages.js";
import * as Reports from "./reports.js";
import * as AnalyticsEvents from "./analyticsEvents.js";
import * as Services from "./services.js";
import * as Faq from "./faq.js";
import * as Admin from "./admin.js";
import * as Settings from "./settings.js";
import * as TimelineStops from "./timelineStops.js";

const COLLECTION_NAMES = [
  "volunteers",
  "missing_persons",
  "lost_items",
  "announcements",
  "emergency_contacts",
  "gallery_images",
  "contact_messages",
  "reports",
  "analytics_events",
  "services",
  "faq",
  "admins",
  "settings",
  "timeline_stops",
];

/**
 * Ensure all collection indexes exist.
 * Call this once at application startup or during deployment.
 */
export async function ensureAllIndexes() {
  const models = [
    Volunteers,
    MissingPersons,
    LostItems,
    Announcements,
    EmergencyContacts,
    GalleryImages,
    ContactMessages,
    Reports,
    AnalyticsEvents,
    Services,
    Faq,
    Admin,
    Settings,
    TimelineStops,
  ];

  const results = [];

  for (const model of models) {
    try {
      await model.ensureIndexes();
      results.push({ status: "ok" });
    } catch (error) {
      results.push({ status: "error", error: error.message });
    }
  }

  return results;
}

/**
 * Get database statistics (collection counts, sizes).
 */
export async function getDbStats() {
  const db = await getDb();

  const stats = {};
  for (const name of COLLECTION_NAMES) {
    const count = await db.collection(name).countDocuments();
    stats[name] = { count };
  }
  return stats;
}

/**
 * List all collections in the wariseva database.
 */
export async function listCollections() {
  const db = await getDb();
  const collections = await db.listCollections().toArray();
  return collections.map((c) => c.name);
}

export {
  Volunteers,
  MissingPersons,
  LostItems,
  Announcements,
  EmergencyContacts,
  GalleryImages,
  ContactMessages,
  Reports,
  AnalyticsEvents,
  Services,
  Faq,
  Admin,
  Settings,
  TimelineStops,
  COLLECTION_NAMES,
};
