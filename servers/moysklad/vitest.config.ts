import { defineConfig } from "vitest/config";

export default defineConfig({
  test: {
    globals: true,
    restoreMocks: true,
    coverage: {
      provider: "v8",
      reporter: ["text", "lcov"],
      include: ["src/**/*.ts"],
      // index.ts is transport/CLI wiring (stdio/http), exercised by the smoke
      // test but not meaningfully unit-coverable; version.ts is a trivial shim.
      exclude: ["src/index.ts", "src/version.ts"],
      thresholds: {
        lines: 85,
        statements: 80,
        functions: 80,
        branches: 55,
      },
    },
  },
});
