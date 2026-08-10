import { describe, it, expect, beforeEach, afterEach } from "vitest";
import { Client } from "@modelcontextprotocol/sdk/client/index.js";
import { InMemoryTransport } from "@modelcontextprotocol/sdk/inMemory.js";
import {
  createServer,
  getEnabledModules,
  countRegisteredTools,
  MODULE_TOOL_COUNTS,
} from "../src/server.js";

/** Реально зарегистрированные инструменты — через tools/list живого сервера. */
async function listRegisteredTools(): Promise<string[]> {
  const server = createServer();
  const [clientTransport, serverTransport] = InMemoryTransport.createLinkedPair();
  const client = new Client({ name: "test", version: "0" });
  await Promise.all([server.connect(serverTransport), client.connect(clientTransport)]);
  try {
    const { tools } = await client.listTools();
    return tools.map((t) => t.name);
  } finally {
    await client.close();
  }
}

describe("getEnabledModules", () => {
  const originalEnv = { ...process.env };
  afterEach(() => {
    process.env = { ...originalEnv };
  });

  it("default (no env var) enables all modules", () => {
    delete process.env["ONEC_SERVICES"];
    const modules = getEnabledModules();
    expect(modules.size).toBe(11);
    expect(modules.has("meta")).toBe(true);
    expect(modules.has("catalogs")).toBe(true);
    expect(modules.has("odata")).toBe(true);
    expect(modules.has("constants")).toBe(true);
    expect(modules.has("shortcuts")).toBe(true);
  });

  it('explicit "all" enables all modules', () => {
    process.env["ONEC_SERVICES"] = "all";
    expect(getEnabledModules().size).toBe(11);
  });

  it("partial filter enables meta + listed modules only", () => {
    process.env["ONEC_SERVICES"] = "catalogs,documents";
    const modules = getEnabledModules();
    expect(modules.size).toBe(3);
    expect(modules.has("meta")).toBe(true);
    expect(modules.has("catalogs")).toBe(true);
    expect(modules.has("documents")).toBe(true);
    expect(modules.has("odata")).toBe(false);
  });

  it("meta is always enabled (never filtered out)", () => {
    process.env["ONEC_SERVICES"] = "odata";
    const modules = getEnabledModules();
    expect(modules.has("meta")).toBe(true);
  });

  it("ignores unknown module names without throwing", () => {
    process.env["ONEC_SERVICES"] = "catalogs,bogus,documents";
    const modules = getEnabledModules();
    expect(modules.has("catalogs")).toBe(true);
    expect(modules.has("documents")).toBe(true);
    expect(modules.size).toBe(3);
  });
});

describe("countRegisteredTools", () => {
  const originalEnv = { ...process.env };
  afterEach(() => {
    process.env = { ...originalEnv };
  });

  it("default config = 34 tools (5 meta + 29 optional)", () => {
    delete process.env["ONEC_SERVICES"];
    expect(countRegisteredTools(getEnabledModules())).toBe(34);
  });

  it("ONEC_SERVICES=catalogs = 8 tools (5 meta + 3 catalog)", () => {
    process.env["ONEC_SERVICES"] = "catalogs";
    expect(countRegisteredTools(getEnabledModules())).toBe(8);
  });

  it("ONEC_SERVICES=documents = 12 tools (5 meta + 7 documents)", () => {
    process.env["ONEC_SERVICES"] = "documents";
    expect(countRegisteredTools(getEnabledModules())).toBe(12);
  });
});

/**
 * MODULE_TOOL_COUNTS — параллельный ручной список того, что регистрирует
 * createServer(). Ничто не заставляло их совпадать: можно было зарегистрировать
 * инструмент и забыть счётчик (или наоборот), и все остальные тесты остались бы
 * зелёными, а соврал бы только /health. Эти тесты закрывают весь класс дрейфа.
 */
describe("registration matches the counters", () => {
  const originalEnv = { ...process.env };
  afterEach(() => {
    process.env = { ...originalEnv };
  });

  it("every registered tool is counted by countRegisteredTools", async () => {
    delete process.env["ONEC_SERVICES"];
    delete process.env["ONEC_WRITE_MODE"];
    const names = await listRegisteredTools();
    expect(new Set(names).size).toBe(names.length); // имена уникальны
    expect(names.length).toBe(countRegisteredTools(getEnabledModules()));
  });

  it("counter still matches under a module filter", async () => {
    process.env["ONEC_SERVICES"] = "catalogs";
    delete process.env["ONEC_WRITE_MODE"];
    const names = await listRegisteredTools();
    expect(names.length).toBe(countRegisteredTools(getEnabledModules()));
    expect(names).toContain("get_catalogs");
    expect(names).not.toContain("get_report");
  });

  it("counter still matches with the write gate on", async () => {
    delete process.env["ONEC_SERVICES"];
    process.env["ONEC_WRITE_MODE"] = "approval";
    const names = await listRegisteredTools();
    expect(names).toContain("approve_write");
    expect(names).toContain("rollback_write");
    expect(names.length).toBe(countRegisteredTools(getEnabledModules()));
  });

  it("get_config_preset is registered even under a narrow module filter", async () => {
    process.env["ONEC_SERVICES"] = "catalogs";
    const names = await listRegisteredTools();
    // Инструмент офлайновый и не требует ONEC_BASE_URL — он в блоке meta,
    // а meta отфильтровать нельзя.
    expect(names).toContain("get_config_preset");
  });

  it("get_accounting_balance ships with the accounting module", async () => {
    process.env["ONEC_SERVICES"] = "accounting";
    const names = await listRegisteredTools();
    expect(names).toContain("get_accounting_register");
    expect(names).toContain("get_accounting_balance");
    expect(names.length).toBe(MODULE_TOOL_COUNTS.meta + MODULE_TOOL_COUNTS.accounting);
  });
});

describe("createServer", () => {
  const originalEnv = { ...process.env };
  beforeEach(() => {
    delete process.env["ONEC_SERVICES"];
  });
  afterEach(() => {
    process.env = { ...originalEnv };
  });

  it("returns a connectable McpServer instance", () => {
    const server = createServer();
    expect(server).toBeDefined();
    expect(typeof server.connect).toBe("function");
  });
});
