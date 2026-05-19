import { describe, it, expect, beforeEach, afterEach } from "vitest";
import {
  createServer,
  getEnabledModules,
  countRegisteredTools,
} from "../src/server.js";

describe("getEnabledModules", () => {
  const originalEnv = { ...process.env };
  afterEach(() => {
    process.env = { ...originalEnv };
  });

  it("default (no env var) enables all modules", () => {
    delete process.env["ONEC_SERVICES"];
    const modules = getEnabledModules();
    expect(modules.size).toBe(8); // meta + 7 optional (catalogs, documents, registers, reports, odata, batch, changes)
    expect(modules.has("meta")).toBe(true);
    expect(modules.has("catalogs")).toBe(true);
    expect(modules.has("odata")).toBe(true);
    expect(modules.has("batch")).toBe(true);
    expect(modules.has("changes")).toBe(true);
  });

  it('explicit "all" enables all modules', () => {
    process.env["ONEC_SERVICES"] = "all";
    expect(getEnabledModules().size).toBe(8);
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

  it("default config = 14 tools (2 meta + 7 v3.0 + 5 v3.1 additions)", () => {
    // meta(2) + catalogs(1) + documents(3) + registers(1) + reports(1)
    // + odata(1) + batch(3) + changes(2) = 14
    delete process.env["ONEC_SERVICES"];
    expect(countRegisteredTools(getEnabledModules())).toBe(14);
  });

  it("ONEC_SERVICES=batch = 5 tools (2 meta + 3 batch)", () => {
    process.env["ONEC_SERVICES"] = "batch";
    expect(countRegisteredTools(getEnabledModules())).toBe(5);
  });

  it("ONEC_SERVICES=changes = 4 tools (2 meta + 2 changes)", () => {
    process.env["ONEC_SERVICES"] = "changes";
    expect(countRegisteredTools(getEnabledModules())).toBe(4);
  });

  it("ONEC_SERVICES=catalogs = 3 tools (2 meta + 1 catalog)", () => {
    process.env["ONEC_SERVICES"] = "catalogs";
    expect(countRegisteredTools(getEnabledModules())).toBe(3);
  });

  it("ONEC_SERVICES=documents = 5 tools (2 meta + 3 documents)", () => {
    process.env["ONEC_SERVICES"] = "documents";
    expect(countRegisteredTools(getEnabledModules())).toBe(5);
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
