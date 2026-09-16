import { defineConfig } from "vitest/config";

export default defineConfig({
  test: {
    globals: true,
    environment: "node",
    include: ["tests/**/*.test.ts"],
    // vitest 4: restoreAllMocks() больше не сбрасывает vi.fn() — общий mockFetch копил вызовы между тестами
    mockReset: true,
    coverage: {
      include: ["src/**/*.ts"],
      exclude: ["src/index.ts"],
    },
  },
});
