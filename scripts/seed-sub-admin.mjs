/**
 * Idempotent seed script: creates or verifies the predefined Sub Admin account.
 *
 * Credentials are read from environment variables (SUB_ADMIN_EMAIL,
 * SUB_ADMIN_INITIAL_PASSWORD). This script loads .env.local when run
 * directly with Node.
 *
 * Usage:
 *   node scripts/seed-sub-admin.mjs
 *
 * Reads MONGODB_URI, SUB_ADMIN_EMAIL, SUB_ADMIN_INITIAL_PASSWORD from .env.local.
 * Never logs plaintext passwords.
 */

import { MongoClient } from "mongodb";
import bcrypt from "bcryptjs";
import { config } from "dotenv";

config({ path: ".env.local" });

const MONGODB_URI = process.env.MONGODB_URI;
const SUB_ADMIN_EMAIL = process.env.SUB_ADMIN_EMAIL;
const SUB_ADMIN_PASSWORD = process.env.SUB_ADMIN_INITIAL_PASSWORD;
const SUB_ADMIN_NAME = "Sub Admin";
const SUB_ADMIN_ROLE = "admin";

if (!MONGODB_URI) {
  console.error("MONGODB_URI environment variable is required");
  process.exit(1);
}

if (!SUB_ADMIN_EMAIL) {
  console.error("SUB_ADMIN_EMAIL environment variable is required");
  process.exit(1);
}

if (!SUB_ADMIN_PASSWORD) {
  console.error("SUB_ADMIN_INITIAL_PASSWORD environment variable is required");
  process.exit(1);
}

async function seedSubAdmin() {
  const client = new MongoClient(MONGODB_URI);

  try {
    await client.connect();
    const db = client.db("wariseva");
    const admins = db.collection("admins");

    const existing = await admins.findOne({ email: SUB_ADMIN_EMAIL.toLowerCase() });

    if (existing) {
      console.log("Sub Admin account already exists.");
      console.log(`  Role: ${existing.role}`);
      console.log(`  Active: ${existing.isActive}`);
      console.log(`  Name: ${existing.name}`);

      // Ensure role and isActive are correct
      const updates = {};
      if (existing.role !== SUB_ADMIN_ROLE) {
        updates.role = SUB_ADMIN_ROLE;
      }
      if (existing.isActive !== true) {
        updates.isActive = true;
      }

      if (Object.keys(updates).length > 0) {
        updates.updatedAt = new Date();
        await admins.updateOne(
          { email: SUB_ADMIN_EMAIL.toLowerCase() },
          { $set: updates }
        );
        console.log("Fixed role/isActive to match expected values.");
      } else {
        console.log("Account state matches expected values. No changes needed.");
      }
    } else {
      console.log("Creating Sub Admin account...");
      const passwordHash = bcrypt.hashSync(SUB_ADMIN_PASSWORD, 12);
      await admins.insertOne({
        name: SUB_ADMIN_NAME,
        email: SUB_ADMIN_EMAIL.toLowerCase(),
        passwordHash,
        phone: null,
        role: SUB_ADMIN_ROLE,
        about: "Predefined Sub Admin account",
        isActive: true,
        lastLoginAt: null,
        createdAt: new Date(),
        updatedAt: new Date(),
      });
      console.log("Sub Admin created successfully.");
    }

    // Verify: confirm the account exists and password works
    const verify = await admins.findOne({ email: SUB_ADMIN_EMAIL.toLowerCase() });
    if (!verify) {
      console.error("Verification failed: account not found after seed.");
      process.exit(1);
    }
    const passwordOk = bcrypt.compareSync(SUB_ADMIN_PASSWORD, verify.passwordHash);
    if (!passwordOk) {
      console.error("Verification failed: stored password hash does not match.");
      process.exit(1);
    }
    console.log("Verification passed: password hash is valid.");

    const adminCount = await admins.countDocuments();
    console.log(`Total admins in database: ${adminCount}`);
  } catch (error) {
    console.error("Failed to seed sub admin:", error);
    process.exit(1);
  } finally {
    await client.close();
  }
}

seedSubAdmin();
