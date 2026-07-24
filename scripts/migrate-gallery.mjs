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
const COLLECTION = "gallery_images";

const GALLERY_IMAGES = [
  {
    imageId: "wari-01",
    imageUrl: "/images/Wari event 1.jpeg",
    category: "wari",
    titleKey: "about_page.timeline.alandi.title",
    order: 1,
    isActive: true,
  },
  {
    imageId: "wari-02",
    imageUrl: "/images/Wari event 2.jpeg",
    category: "wari",
    titleKey: "about_page.timeline.jejuri.title",
    order: 2,
    isActive: true,
  },
  {
    imageId: "wari-03",
    imageUrl: "/images/gallery_wari.png",
    category: "wari",
    titleKey: "about.image_alt",
    order: 3,
    isActive: true,
  },
  {
    imageId: "nss-01",
    imageUrl: "/images/nss_volunteers_seva.png",
    category: "nss",
    titleKey: "about.role",
    order: 1,
    isActive: true,
  },
  {
    imageId: "nss-02",
    imageUrl: "/images/NSS help 1.jpeg",
    category: "nss",
    titleKey: "about_page.medical_help",
    order: 2,
    isActive: true,
  },
  {
    imageId: "nss-03",
    imageUrl: "/images/NSS help 3.jpeg",
    category: "nss",
    titleKey: "about_page.crowd_management",
    order: 3,
    isActive: true,
  },
  {
    imageId: "medical-01",
    imageUrl: "/images/medical seva 1.jpeg",
    category: "medical",
    titleKey: "services.medical_assistance",
    order: 1,
    isActive: true,
  },
  {
    imageId: "medical-02",
    imageUrl: "/images/medical seva 2.jpeg",
    category: "medical",
    titleKey: "about_page.medical_help_desc",
    order: 2,
    isActive: true,
  },
  {
    imageId: "volunteers-01",
    imageUrl: "/images/Volunteers help 1.jpeg",
    category: "volunteers",
    titleKey: "stats.volunteers",
    order: 1,
    isActive: true,
  },
  {
    imageId: "volunteers-02",
    imageUrl: "/images/Volunteers help 2.avif",
    category: "volunteers",
    titleKey: "services.volunteer_support",
    order: 2,
    isActive: true,
  },
  {
    imageId: "pilgrims-01",
    imageUrl: "/images/Wari seva galler 1.jpeg",
    category: "pilgrims",
    titleKey: "stats.assisted",
    order: 1,
    isActive: true,
  },
  {
    imageId: "pilgrims-02",
    imageUrl: "/images/Wari seva galler 2.jpeg",
    category: "pilgrims",
    titleKey: "about_page.lost_found",
    order: 2,
    isActive: true,
  },
  {
    imageId: "events-01",
    imageUrl: "/images/Wari event 3.jpeg",
    category: "events",
    titleKey: "about_page.timeline.velapur.title",
    order: 1,
    isActive: true,
  },
  {
    imageId: "events-02",
    imageUrl: "/images/Wari event 4.webp",
    category: "events",
    titleKey: "about_page.timeline.pandharpur.title",
    order: 2,
    isActive: true,
  },
  {
    imageId: "events-03",
    imageUrl: "/images/Wari seva galler 3.jpeg",
    category: "events",
    titleKey: "cta.title",
    order: 3,
    isActive: true,
  },
];

async function migrate() {
  const client = new MongoClient(MONGODB_URI);

  try {
    await client.connect();
    console.log("Connected to MongoDB");

    const db = client.db(DB_NAME);
    const coll = db.collection(COLLECTION);

    // Create unique index on imageId
    await coll.createIndex({ imageId: 1 }, { unique: true });
    console.log("Created unique index on imageId");

    const existingCount = await coll.countDocuments({});
    console.log(`Existing gallery images documents: ${existingCount}`);

    let inserted = 0;
    let skipped = 0;
    for (const item of GALLERY_IMAGES) {
      const exists = await coll.findOne({ imageId: item.imageId });
      if (!exists) {
        const now = new Date();
        await coll.insertOne({
          ...item,
          createdAt: now,
          updatedAt: now,
        });
        console.log(`  Inserted: ${item.imageId} (${item.category})`);
        inserted++;
      } else {
        console.log(`  Skipped (already exists): ${item.imageId}`);
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