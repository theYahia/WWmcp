/**
 * E2E-смоук: собранный сервер поднимается по stdio, отвечает на initialize и
 * перечисляет инструменты. Ловит то, чего не видят модульные тесты — сломанный
 * shebang, упавший на старте импорт, обязательную переменную, которую сервер
 * требует раньше первого вызова инструмента.
 *
 * Требует `pnpm build` (turbo делает это сам: test:e2e зависит от build).
 * Наружу не ходит — ключи заглушечные, инструменты не вызываются.
 */
import { describe, it, expect } from "vitest";
import { resolve } from "node:path";
import { runSmokeTest } from "@theyahia/mcp-core/testing/smoke.js";
import { TOOL_COUNT } from "../../src/server.js";

const SERVER_PATH = resolve(import.meta.dirname, "../../dist/index.js");

/** Заглушки: сервер только поднимается, наружу не ходит. */
const ENV = {
  CHANGEME_API_KEY: "test",
};

describe("CHANGEME MCP E2E Smoke Test", () => {
  it(`поднимается и отдаёт ${TOOL_COUNT} инструментов`, async () => {
    const result = await runSmokeTest({
      serverPath: SERVER_PATH,
      expectedToolCount: TOOL_COUNT,
      env: ENV,
    });

    expect(result.connected).toBe(true);
    expect(result.toolCount).toBe(TOOL_COUNT);
    expect(result.errors).toHaveLength(0);
  }, 15_000);

  it("у каждого инструмента есть внятное описание и схема аргументов", async () => {
    const result = await runSmokeTest({
      serverPath: SERVER_PATH,
      expectedToolCount: TOOL_COUNT,
      env: ENV,
    });

    for (const tool of result.tools) {
      expect(tool.descriptionLength).toBeGreaterThanOrEqual(20);
      expect(tool.hasInputSchema).toBe(true);
    }
  }, 15_000);

  it("имена инструментов те, что заявлены", async () => {
    const result = await runSmokeTest({
      serverPath: SERVER_PATH,
      expectedToolCount: TOOL_COUNT,
      env: ENV,
    });

    // Дописывай сюда каждый новый инструмент: переименование в коде иначе
    // проходит молча и ломает скиллы, которые зовут инструмент по имени.
    expect(result.tools.map((t) => t.name).sort()).toEqual(["list_items"]);
  }, 15_000);
});
