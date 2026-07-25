import { MongoClient } from "mongodb";
import { config } from "dotenv";

config({ path: ".env.local" });

const uri = process.env.MONGODB_URI;
if (!uri) {
  throw new Error("Please define the MONGODB_URI environment variable in .env.local");
}

const timelineStops = [
  {
    stopId: "alandi",
    order: 1,
    dayRange: "Day 1 - 2",
    color: "bg-primary border-primary/30 text-white",
    titleKey: "about_page.timeline.alandi.title",
    descriptionKey: "about_page.timeline.alandi.desc",
    isActive: true,
  },
  {
    stopId: "pune",
    order: 2,
    dayRange: "Day 3 - 4",
    color: "bg-secondary border-secondary/30 text-white",
    titleKey: "about_page.timeline.pune.title",
    descriptionKey: "about_page.timeline.pune.desc",
    isActive: true,
  },
  {
    stopId: "saswad",
    order: 3,
    dayRange: "Day 5 - 6",
    color: "bg-emerald-600 border-emerald-650/30 text-white",
    titleKey: "about_page.timeline.saswad.title",
    descriptionKey: "about_page.timeline.saswad.desc",
    isActive: true,
  },
  {
    stopId: "jejuri",
    order: 4,
    dayRange: "Day 7 - 8",
    color: "bg-amber-500 border-amber-550/30 text-white",
    titleKey: "about_page.timeline.jejuri.title",
    descriptionKey: "about_page.timeline.jejuri.desc",
    isActive: true,
  },
  {
    stopId: "lonand",
    order: 5,
    dayRange: "Day 9 - 12",
    color: "bg-orange-600 border-orange-650/30 text-white",
    titleKey: "about_page.timeline.lonand.title",
    descriptionKey: "about_page.timeline.lonand.desc",
    isActive: true,
  },
  {
    stopId: "velapur",
    order: 6,
    dayRange: "Day 13 - 15",
    color: "bg-purple-600 border-purple-650/30 text-white",
    titleKey: "about_page.timeline.velapur.title",
    descriptionKey: "about_page.timeline.velapur.desc",
    isActive: true,
  },
  {
    stopId: "wakhari",
    order: 7,
    dayRange: "Day 16 - 17",
    color: "bg-rose-600 border-rose-650/30 text-white",
    titleKey: "about_page.timeline.wakhari.title",
    descriptionKey: "about_page.timeline.wakhari.desc",
    isActive: true,
  },
  {
    stopId: "pandharpur",
    order: 8,
    dayRange: "Day 18 - 21",
    color: "bg-primary border-primary/30 text-white",
    titleKey: "about_page.timeline.pandharpur.title",
    descriptionKey: "about_page.timeline.pandharpur.desc",
    isActive: true,
  },
];

async function seedTimelineStops() {
  const client = new MongoClient(uri);
  
  try {
    await client.connect();
    console.log("Connected to MongoDB");
    
    const db = client.db("wariseva");
    const collection = db.collection("timeline_stops");

    // Ensure indexes
    await collection.createIndex({ stopId: 1 }, { unique: true });
    await collection.createIndex({ order: 1 });

    for (const stop of timelineStops) {
      const existing = await collection.findOne({ stopId: stop.stopId });
      if (existing) {
        console.log(`Stop ${stop.stopId} already exists, skipping...`);
        continue;
      }

      const doc = {
        ...stop,
        createdAt: new Date(),
        updatedAt: new Date(),
      };

      const result = await collection.insertOne(doc);
      console.log(`Inserted ${stop.stopId} with _id: ${result.insertedId}`);
    }

    console.log("Timeline stops seeding complete!");
  } catch (err) {
    console.error("Seeding failed:", err);
    throw err;
  } finally {
    await client.close();
  }
}

seedTimelineStops()
  .then(() => process.exit(0))
  .catch(() => process.exit(1));