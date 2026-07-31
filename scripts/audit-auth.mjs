/**
 * Audit script: diagnose why POST /api/auth/login returns 401.
 * Inspects the admins collection, findByEmail() logic, and password hashes.
 * Does NOT modify any data.
 *
 * Usage (from project root):
 *   node scripts/audit-auth.mjs
 */

import path from "node:path";
import { MongoClient } from "mongodb";
import bcrypt from "bcryptjs";
import { config } from "dotenv";

const ROOT_DIR = process.cwd();
config({ path: path.join(ROOT_DIR, ".env.local") });

function mask(str, keep = 4) {
  if (!str) return "(none)";
  if (str.length <= keep * 2) return "***";
  return str.slice(0, keep) + "..." + str.slice(-keep);
}

function maskEmail(email) {
  if (!email) return "(none)";
  const [user, domain] = email.split("@");
  if (!domain) return email.slice(0, 2) + "***";
  return user.slice(0, 2) + "***@" + domain;
}

async function main() {
  console.log("=== AUTH AUDIT ===\n");

  console.log("Environment:");
  console.log(`  MONGODB_URI set: ${!!process.env.MONGODB_URI}`);
  console.log(`  ADMIN_EMAIL set: ${!!process.env.ADMIN_EMAIL}`);
  console.log(`  ADMIN_PASSWORD set: ${!!process.env.ADMIN_PASSWORD}`);
  console.log(`  ADMIN_EMAIL value: ${maskEmail(process.env.ADMIN_EMAIL)}`);
  console.log("");

  const MONGODB_URI = process.env.MONGODB_URI;
  if (!MONGODB_URI) {
    console.error("MONGODB_URI is not set in .env.local. Aborting.");
    process.exit(1);
  }

  const client = new MongoClient(MONGODB_URI);
  await client.connect();
  const db = client.db("wariseva");
  const coll = db.collection("admins");

  try {
    const collections = await db.listCollections({ name: "admins" }).toArray();
    console.log(`admins collection exists: ${collections.length > 0}`);

    const total = await coll.countDocuments();
    console.log(`admins documents: ${total}`);

    const allDbs = await client.db().admin().listDatabases();
    console.log("");
    console.log("Databases on this MongoDB instance:");
    for (const d of allDbs.databases) {
      const db2 = client.db(d.name);
      const names = (await db2.listCollections().toArray()).map((x) => x.name);
      console.log(`  ${d.name}: ${names.join(", ") || "(empty)"}`);
    }
    console.log("");

    if (!collections.length) {
      console.log("!! admins collection is MISSING. Admin.findByEmail() always returns");
      console.log("!! null, so POST /api/auth/login always hits route.js:28 -> 401.");
      console.log("");
      console.log("!! No admin was ever seeded, or seeding targeted a different database.");
      return;
    }

    const indexes = await coll.listIndexes().toArray();
    console.log("admins indexes:");
    for (const idx of indexes) {
      console.log(`  - name=${idx.name} key=${JSON.stringify(idx.key)} unique=${!!idx.unique}`);
    }
    console.log("");

    const all = await coll.find({}).toArray();
    for (const admin of all) {
      console.log(`Admin document (id=${admin._id}):`);
      console.log(`  name: ${admin.name}`);
      console.log(`  email (stored): ${maskEmail(admin.email)}`);
      console.log(`  role: ${admin.role}`);
      console.log(`  isActive: ${admin.isActive}`);
      console.log(`  lastLoginAt: ${admin.lastLoginAt || "(never)"}`);
      console.log(`  createdAt: ${admin.createdAt}`);
      const hash = admin.passwordHash;
      console.log(`  passwordHash present: ${!!hash}`);
      console.log(`  passwordHash type: ${typeof hash}`);
      console.log(`  passwordHash prefix (masked): ${hash ? mask(hash, 6) : "(none)"}`);
      console.log(`  passwordHash length: ${hash ? hash.length : 0}`);
      if (hash) {
        const looksValid =
          typeof hash === "string" && /^\$2[aby]\$\d{2}\$[./A-Za-z0-9]{53}$/.test(hash);
        console.log(`  valid bcrypt format: ${looksValid}`);
        if (looksValid) {
          console.log(`  bcrypt cost: ${Number(hash.split("$")[2])}`);
        }
        if (typeof hash !== "string") {
          console.log(`  !! passwordHash is NOT a string (raw: ${JSON.stringify(hash)})`);
        }
      }
      console.log("");
    }

    const targetEmail = (process.env.ADMIN_EMAIL || "").toLowerCase().trim();
    if (!targetEmail) {
      console.log("ADMIN_EMAIL is not set; skipping findByEmail() test.");
    } else {
      const found = await coll.findOne({ email: targetEmail });
      console.log(`findByEmail("${maskEmail(targetEmail)}") -> ${found ? "FOUND" : "NOT FOUND"}`);
      if (found) {
        console.log(`  found _id: ${found._id}`);
        const storedHash = found.passwordHash;
        const plain = process.env.ADMIN_PASSWORD || "";
        if (!plain) {
          console.log("  ADMIN_PASSWORD not set; skipping password compare test.");
        } else if (typeof storedHash !== "string") {
          console.log(`  bcrypt.compare skipped: stored hash is ${typeof storedHash}`);
        } else {
          let rawCompare = null;
          try {
            rawCompare = bcrypt.compareSync(plain, storedHash);
          } catch (e) {
            rawCompare = `ERROR: ${e.message}`;
          }
          console.log(`  bcrypt.compare(ADMIN_PASSWORD, storedHash): ${rawCompare}`);
          const rehash = bcrypt.hashSync(plain, 12);
          const doubleHash = bcrypt.compareSync(rehash, storedHash);
          console.log(`  bcrypt.compare(bcrypt(password), storedHash) [double-hash check]: ${doubleHash}`);
        }
      }
    }

    console.log("");
    console.log("=== END AUDIT ===");
    console.log("");
    console.log("Login route 401 paths (app/api/auth/login/route.js:26-34):");
    console.log("  1. Admin.findByEmail(email) returned null -> 401");
    console.log("  2. Admin.comparePassword(admin, password) false -> 401");
    console.log("  3. Note: findByEmail lowercases the input and queries { email: email.toLowerCase() }");
  } catch (err) {
    console.error("Audit failed:", err);
    process.exitCode = 1;
  } finally {
    await client.close();
  }
}

main();
