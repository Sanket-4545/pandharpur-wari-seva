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
const COLLECTION = "services";

const SERVICE_ITEMS = [
  { serviceId: "emergency", titleKey: "services.emergency_help", descriptionKey: "services.emergency_help_desc", iconName: "ShieldAlert", colorClass: "bg-red-50 text-red-600 border-red-100 hover:border-red-300", order: 1, category: "general", isActive: true },
  { serviceId: "missing", titleKey: "services.missing_persons", descriptionKey: "services.missing_persons_desc", iconName: "UserMinus", colorClass: "bg-amber-50 text-amber-600 border-amber-100 hover:border-amber-300", order: 2, category: "general", isActive: true },
  { serviceId: "lost", titleKey: "services.lost_found", descriptionKey: "services.lost_found_desc", iconName: "Briefcase", colorClass: "bg-blue-50 text-blue-600 border-blue-100 hover:border-blue-300", order: 3, category: "general", isActive: true },
  { serviceId: "medical", titleKey: "services.medical_assistance", descriptionKey: "services.medical_assistance_desc", iconName: "HeartPulse", colorClass: "bg-emerald-50 text-emerald-600 border-emerald-100 hover:border-emerald-300", order: 4, category: "general", isActive: true },
  { serviceId: "volunteer", titleKey: "services.volunteer_support", descriptionKey: "services.volunteer_support_desc", iconName: "Users", colorClass: "bg-purple-50 text-purple-600 border-purple-100 hover:border-purple-300", order: 5, category: "general", isActive: true },
  { serviceId: "info", titleKey: "services.info_center", descriptionKey: "services.info_center_desc", iconName: "HelpCircle", colorClass: "bg-sky-50 text-sky-600 border-sky-100 hover:border-sky-300", order: 6, category: "general", isActive: true },
  { serviceId: "food_water", titleKey: "services.food_water", descriptionKey: "services.food_water_desc", iconName: "Utensils", colorClass: "bg-orange-50 text-orange-600 border-orange-100 hover:border-orange-300", order: 7, category: "general", isActive: true },
  { serviceId: "rest_area", titleKey: "services.rest_area", descriptionKey: "services.rest_area_desc", iconName: "Tent", colorClass: "bg-rose-50 text-rose-600 border-rose-100 hover:border-rose-300", order: 8, category: "general", isActive: true },
  { serviceId: "traffic", titleKey: "services.traffic_updates", descriptionKey: "services.traffic_updates_desc", iconName: "Navigation", colorClass: "bg-teal-50 text-teal-600 border-teal-100 hover:border-teal-300", order: 9, category: "general", isActive: true },
  { serviceId: "police", titleKey: "services.police_assistance", descriptionKey: "services.police_assistance_desc", iconName: "Shield", colorClass: "bg-indigo-50 text-indigo-600 border-indigo-100 hover:border-indigo-300", order: 10, category: "general", isActive: true },
];

async function migrate() {
  const client = new MongoClient(MONGODB_URI);

  try {
    await client.connect();
    console.log("Connected to MongoDB");

    const db = client.db(DB_NAME);
    const coll = db.collection(COLLECTION);

    const existingCount = await coll.countDocuments({});
    console.log(`Existing services documents: ${existingCount}`);

    let inserted = 0;
    let skipped = 0;
    for (const item of SERVICE_ITEMS) {
      const exists = await coll.findOne({ serviceId: item.serviceId });
      if (!exists) {
        const now = new Date();
        await coll.insertOne({
          ...item,
          createdAt: now,
          updatedAt: now,
        });
        console.log(`  Inserted: ${item.serviceId} (${item.iconName})`);
        inserted++;
      } else {
        console.log(`  Skipped (already exists): ${item.serviceId}`);
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
