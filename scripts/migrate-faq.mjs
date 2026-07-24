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
const COLLECTION = "faq";

const FAQ_ITEMS = [
  { questionKey: "faq_page.q1", answerKey: "faq_page.a1", order: 1, category: "general", isActive: true },
  { questionKey: "faq_page.q2", answerKey: "faq_page.a2", order: 2, category: "general", isActive: true },
  { questionKey: "faq_page.q3", answerKey: "faq_page.a3", order: 3, category: "general", isActive: true },
  { questionKey: "faq_page.q4", answerKey: "faq_page.a4", order: 4, category: "general", isActive: true },
  { questionKey: "faq_page.q5", answerKey: "faq_page.a5", order: 5, category: "general", isActive: true },
  { questionKey: "faq_page.q6", answerKey: "faq_page.a6", order: 6, category: "general", isActive: true },
];

async function migrate() {
  const client = new MongoClient(MONGODB_URI);

  try {
    await client.connect();
    console.log("Connected to MongoDB");

    const db = client.db(DB_NAME);
    const coll = db.collection(COLLECTION);

    const existingCount = await coll.countDocuments({});
    console.log(`Existing FAQ documents: ${existingCount}`);

    let inserted = 0;
    for (const item of FAQ_ITEMS) {
      const exists = await coll.findOne({ questionKey: item.questionKey });
      if (!exists) {
        const now = new Date();
        await coll.insertOne({
          ...item,
          createdAt: now,
          updatedAt: now,
        });
        console.log(`  Inserted: ${item.questionKey}`);
        inserted++;
      } else {
        console.log(`  Skipped (already exists): ${item.questionKey}`);
      }
    }

    console.log(`\nMigration complete. Inserted ${inserted} new items.`);
    console.log(`Total items in collection: ${await coll.countDocuments({})}`);
  } catch (err) {
    console.error("Migration failed:", err);
    process.exit(1);
  } finally {
    await client.close();
  }
}

migrate();
