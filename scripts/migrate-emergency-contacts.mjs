import { MongoClient } from "mongodb";
import fs from "fs";
import path from "path";
import { fileURLToPath } from "url";

const __dirname = path.dirname(fileURLToPath(import.meta.url));

function loadEnv(filePath) {
  const text = fs.readFileSync(filePath, "utf-8");
  const lines = text.split("\n");
  for (const line of lines) {
    const trimmed = line.trim();
    if (!trimmed || trimmed.startsWith("#")) continue;
    const eqIdx = trimmed.indexOf("=");
    if (eqIdx === -1) continue;
    const key = trimmed.slice(0, eqIdx).trim();
    const val = trimmed.slice(eqIdx + 1).trim();
    if (key === "MONGODB_URI") return val;
  }
  return null;
}

const envPath = path.resolve(__dirname, "..", ".env.local");
const MONGODB_URI = loadEnv(envPath);

if (!MONGODB_URI) {
  console.error("MONGODB_URI not found in .env.local");
  process.exit(1);
}

const DB_NAME = "wariseva";
const COLLECTION = "emergency_contacts";

const EMERGENCY_CONTACTS = [
  { contactId: "police", titleKey: "emergency_page.contacts.police.title", descKey: "emergency_page.contacts.police.desc", phoneNumber: "112 / 100", iconName: "Shield", colorClass: "bg-blue-50 text-blue-600 border-blue-100 hover:border-blue-300", category: "police", order: 1, isActive: true },
  { contactId: "ambulance", titleKey: "emergency_page.contacts.ambulance.title", descKey: "emergency_page.contacts.ambulance.desc", phoneNumber: "108 / 102", iconName: "HeartPulse", colorClass: "bg-red-50 text-red-600 border-red-100 hover:border-red-300", category: "ambulance", order: 2, isActive: true },
  { contactId: "medical", titleKey: "emergency_page.contacts.medical.title", descKey: "emergency_page.contacts.medical.desc", phoneNumber: "+91 98765 43210", iconName: "HeartPulse", colorClass: "bg-emerald-50 text-emerald-600 border-emerald-100 hover:border-emerald-300", category: "medical", order: 3, isActive: true },
  { contactId: "fire", titleKey: "emergency_page.contacts.fire.title", descKey: "emergency_page.contacts.fire.desc", phoneNumber: "101", iconName: "Flame", colorClass: "bg-orange-50 text-orange-600 border-orange-100 hover:border-orange-300", category: "fire", order: 4, isActive: true },
  { contactId: "nss", titleKey: "emergency_page.contacts.nss.title", descKey: "emergency_page.contacts.nss.desc", phoneNumber: "+91 22 2202 4444", iconName: "UserCheck", colorClass: "bg-purple-50 text-purple-600 border-purple-100 hover:border-purple-300", category: "nss", order: 5, isActive: true },
  { contactId: "women", titleKey: "emergency_page.contacts.women.title", descKey: "emergency_page.contacts.women.desc", phoneNumber: "1091", iconName: "ShieldAlert", colorClass: "bg-pink-50 text-pink-600 border-pink-100 hover:border-pink-300", category: "women", order: 6, isActive: true },
  { contactId: "child", titleKey: "emergency_page.contacts.child.title", descKey: "emergency_page.contacts.child.desc", phoneNumber: "1098", iconName: "Users", colorClass: "bg-teal-50 text-teal-600 border-teal-100 hover:border-teal-300", category: "child", order: 7, isActive: true },
  { contactId: "control", titleKey: "emergency_page.contacts.control.title", descKey: "emergency_page.contacts.control.desc", phoneNumber: "02186-223132", iconName: "Phone", colorClass: "bg-slate-100 text-slate-700 border-slate-200 hover:border-slate-350", category: "control_room", order: 8, isActive: true },
];

async function migrate() {
  const client = new MongoClient(MONGODB_URI);

  try {
    await client.connect();
    console.log("Connected to MongoDB");

    const db = client.db(DB_NAME);
    const coll = db.collection(COLLECTION);

    const existingCount = await coll.countDocuments({});
    console.log(`Existing emergency contacts documents: ${existingCount}`);

    let inserted = 0;
    let skipped = 0;
    for (const item of EMERGENCY_CONTACTS) {
      const exists = await coll.findOne({ contactId: item.contactId });
      if (!exists) {
        const now = new Date();
        await coll.insertOne({
          ...item,
          createdAt: now,
          updatedAt: now,
        });
        console.log(`  Inserted: ${item.contactId} (${item.iconName})`);
        inserted++;
      } else {
        console.log(`  Skipped (already exists): ${item.contactId}`);
        skipped++;
      }
    }

    console.log(`\nMigration complete. Inserted ${inserted} new items, skipped ${skipped}.`);
    console.log(`Total items in collection: ${await coll.countDocuments({})}`);
  } catch (err) {
    console.error("Migration failed:", err);
    process.exit(1);
  } finally {
    await client.close();
  }
}

migrate();