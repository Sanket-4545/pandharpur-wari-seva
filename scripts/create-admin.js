/**
 * One-time bootstrap: creates the first super admin using the existing
 * Admin model methods (lib/models/admin.js) and bcrypt hashing (lib/password.js).
 *
 * Usage:
 *   node scripts/create-admin.js --email admin@example.com --password "change-me-123"
 *   ADMIN_EMAIL=... ADMIN_PASSWORD=... node scripts/create-admin.js
 *
 * Reads MONGODB_URI from .env.local. Refuses to overwrite an existing admin.
 */

"use strict";

const path = require("node:path");
const { pathToFileURL } = require("node:url");
const { register } = require("node:module");
const { config } = require("dotenv");

const ROOT_DIR = path.resolve(__dirname, "..");
config({ path: path.join(ROOT_DIR, ".env.local") });

// The admin model imports lib/api-helpers via the "@/" alias, which plain
// Node cannot resolve. Register a resolution hook that maps "@/" to the
// project root before importing the model.
const hooksModule = `
import path from "node:path";
import fs from "node:fs";
import { pathToFileURL } from "node:url";
const root = ${JSON.stringify(ROOT_DIR)};
export async function resolve(specifier, context, nextResolve) {
  if (specifier.startsWith("@/")) {
    const target = path.join(root, specifier.slice(2));
    const resolved = fs.existsSync(target) ? target : target + ".js";
    return nextResolve(pathToFileURL(resolved).href, context);
  }
  return nextResolve(specifier, context);
}
`;
const hooksUrl = "data:text/javascript," + encodeURIComponent(hooksModule);
register(hooksUrl, { parentURL: pathToFileURL(__filename).href });

function parseArgs(argv) {
  const args = { email: null, password: null, name: null, dryRun: false };
  for (let i = 0; i < argv.length; i++) {
    switch (argv[i]) {
      case "--email":
        args.email = argv[++i];
        break;
      case "--password":
        args.password = argv[++i];
        break;
      case "--name":
        args.name = argv[++i];
        break;
      case "--dry-run":
        args.dryRun = true;
        break;
    }
  }
  return args;
}

async function main() {
  const { Admin } = await import("../lib/models/admin.js");

  if (!process.env.MONGODB_URI) {
    console.error("MONGODB_URI is missing. Set it in .env.local.");
    process.exit(1);
  }

  const cli = parseArgs(process.argv.slice(2));
  const email = (cli.email || process.env.ADMIN_EMAIL || "").toLowerCase().trim();
  const password = cli.password || process.env.ADMIN_PASSWORD || "";
  const name = (cli.name || process.env.ADMIN_NAME || "Super Admin").trim();

  if (!email) {
    console.error("Email is required: pass --email or set ADMIN_EMAIL.");
    process.exit(1);
  }

  const total = await Admin.getCollection().then((c) => c.countDocuments({}));

  if (cli.dryRun) {
    const existing = await Admin.findByEmail(email);
    console.log(
      `dry-run: admins total=${total}, email "${email}" exists=${!!existing}`
    );
    return;
  }

  if (!password) {
    console.error(
      "Password is required: pass --password or set ADMIN_PASSWORD (min 8 characters)."
    );
    process.exit(1);
  }
  if (password.length < 8) {
    console.error("Password must be at least 8 characters.");
    process.exit(1);
  }

  const existing = await Admin.findByEmail(email);
  if (existing) {
    console.error(
      `An admin with email "${email}" already exists. This bootstrap creates only the first admin.`
    );
    process.exit(1);
  }

  await Admin.ensureIndexes();

  await Admin.insertOne({
    name,
    email,
    passwordHash: password, // raw password; the model hashes it via bcrypt (12 rounds)
    role: "super_admin",
    about: "Initial super administrator created by bootstrap script",
  });

  const created = await Admin.findByEmail(email);
  const passwordOk = Admin.comparePassword(created, password);

  if (!passwordOk) {
    console.error("Bootstrap failed verification: stored password could not be verified.");
    process.exit(1);
  }

  console.log(`Created super admin "${created.email}" (${created.name}, id=${created._id}).`);
  console.log("You can now log in at /login.");
}

main().catch((err) => {
  console.error("Bootstrap failed:", err);
  process.exit(1);
});
