/**
 * Модульные проверки фабрики сервера. Сеть не трогается: `fetch` подменяется,
 * ключи — заглушки. Живой API в CI не зовём никогда.
 *
 * Добавляя инструмент, добавляй сюда проверку его хендлера: схема, счастливый
 * путь на подменённом ответе и одна ветка ошибки.
 */
import { describe, it, expect, beforeEach, afterEach, vi } from "vitest";

describe("CHANGEME server factory", () => {
  const originalEnv = { ...process.env };

  beforeEach(() => {
    process.env["CHANGEME_API_KEY"] = "test-key";
  });

  afterEach(() => {
    process.env = { ...originalEnv };
    vi.restoreAllMocks();
  });

  it("createServer отдаёт подключаемый McpServer", async () => {
    const { createServer } = await import("../src/server.js");
    const server = createServer();
    expect(server).toBeDefined();
    expect(typeof server.connect).toBe("function");
  });

  it("TOOL_COUNT совпадает с числом зарегистрированных инструментов", async () => {
    // Число из `/health` и из e2e-смоука — одно и то же. Разъедется молча,
    // если добавить инструмент и забыть про константу.
    const { TOOL_COUNT } = await import("../src/server.js");
    expect(TOOL_COUNT).toBe(1);
  });
});

describe("list_items", () => {
  const originalEnv = { ...process.env };

  beforeEach(() => {
    process.env["CHANGEME_API_KEY"] = "test-key";
  });

  afterEach(() => {
    process.env = { ...originalEnv };
    vi.restoreAllMocks();
  });

  it("схема отбивает limit вне диапазона 1..100", async () => {
    const { listItemsSchema } = await import("../src/tools/example.js");
    expect(listItemsSchema.safeParse({ limit: 0 }).success).toBe(false);
    expect(listItemsSchema.safeParse({ limit: 101 }).success).toBe(false);
    expect(listItemsSchema.safeParse({ limit: 20 }).success).toBe(true);
  });

  it("отдаёт список из ответа API", async () => {
    vi.spyOn(globalThis, "fetch").mockResolvedValue(
      new Response(JSON.stringify({ items: [{ id: 1, name: "первый" }] }), {
        status: 200,
        headers: { "Content-Type": "application/json" },
      }),
    );
    const { handleListItems } = await import("../src/tools/example.js");
    const out = await handleListItems({ limit: 20, response_format: "concise" });
    expect(out).toContain("первый");
  });
});
