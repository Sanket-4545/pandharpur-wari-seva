import { defineConfig } from "vitest/config";
import { fileURLToPath } from "node:url";

const __dirname = fileURLToPath(new URL(".", import.meta.url));

export default defineConfig({
  test: {
    // Use Node.js environment for server-side code testing
    environment: "node",
    // Match test files
    include: ["**/*.{test,spec}.{js,mjs}"],
    // Exclude build output and node_modules
    exclude: ["node_modules", "dist", ".next", "out"],
    // Run tests sequentially to avoid MongoDB connection conflicts
    sequence: {
      concurrent: false,
    },
    // Fail closed on missing configuration
    passWithNoTests: false,
  },
  // Ensure ESM resolution for .js files
  resolve: {
    extensions: [".js", ".mjs"],
    alias: {
      "@": __dirname,
    },
  },
});
