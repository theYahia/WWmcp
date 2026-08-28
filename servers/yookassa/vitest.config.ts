import { defineConfig } from "vitest/config";

export default defineConfig({
  test: {
    globals: true,
    environment: "node",
    testTimeout: 10_000,
    exclude: ["node_modules/**", "dist/**"],
  },
});
