import { defineConfig } from "vitest/config";

export default defineConfig({
  test: {
    globals: true,
    environment: "node",
    // Юнит-тесты лежат в src/__tests__; tests/e2e требует dist и гоняется отдельным конфигом.
    include: ["src/**/*.test.ts"],
  },
});
