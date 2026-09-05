import { defineConfig } from "vitest/config";

export default defineConfig({
  test: {
    include: ["tests/e2e/**/*.test.ts"],
    // Шаблон не содержит e2e-тестов: они появляются вместе с сервером.
    // Без этого флага vitest падает на пустом наборе и роняет весь turbo test:e2e.
    passWithNoTests: true,
    testTimeout: 20_000,
    hookTimeout: 15_000,
  },
});
