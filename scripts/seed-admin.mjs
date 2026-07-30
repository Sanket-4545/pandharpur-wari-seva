import { MongoClient } from "mongodb";
import bcrypt from "bcryptjs";
import { config } from "dotenv";

config({ path: ".env.local" });

const MONGODB_URI = process.env.MONGODB_URI;
const ADMIN_EMAIL = process.env.ADMIN_EMAIL || "admin@wariportal.org";
const ADMIN_PASSWORD = process.env.ADMIN_PASSWORD;
const ADMIN_NAME = process.env.ADMIN_NAME || "Super Admin";
const ADMIN_ROLE = "super_admin";

if (!MONGODB_URI) {
  console.error("MONGODB_URI environment variable is required");
  process.exit(1);
}

if (!ADMIN_PASSWORD) {
  console.error("ADMIN_PASSWORD environment variable is required");
  process.exit(1);
}

async function seedAdmin() {
  const client = new MongoClient(MONGODB_URI);

  try {
    await client.connect();
    const db = client.db("wariseva");
    const admins = db.collection("admins");

    const existing = await admins.findOne({ email: ADMIN_EMAIL.toLowerCase() });
    if (existing) {
      console.log(`Admin with email "${ADMIN_EMAIL}" already exists. Updating password...`);
      const passwordHash = bcrypt.hashSync(ADMIN_PASSWORD, 12);
      await admins.updateOne(
        { email: ADMIN_EMAIL.toLowerCase() },
        {
          $set: {
            passwordHash,
            name: ADMIN_NAME,
            role: ADMIN_ROLE,
            isActive: true,
            updatedAt: new Date(),
          },
        }
      );
      console.log("Admin password updated successfully.");
    } else {
      console.log(`Creating new admin: ${ADMIN_EMAIL}`);
      const passwordHash = bcrypt.hashSync(ADMIN_PASSWORD, 12);
      await admins.insertOne({
        name: ADMIN_NAME,
        email: ADMIN_EMAIL.toLowerCase(),
        passwordHash,
        phone: null,
        role: ADMIN_ROLE,
        about: "Initial super admin created during setup",
        isActive: true,
        lastLoginAt: null,
        createdAt: new Date(),
        updatedAt: new Date(),
      });
      console.log("Admin created successfully.");
    }

    const adminCount = await admins.countDocuments();
    console.log(`Total admins in database: ${adminCount}`);
  } catch (error) {
    console.error("Failed to seed admin:", error);
    process.exit(1);
  } finally {
    await client.close();
  }
}

seedAdmin();
