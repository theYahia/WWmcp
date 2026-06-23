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
    expect(modules.size).toBe(9);
    expect(modules.has("meta")).toBe(true);
    expect(modules.has("catalogs")).toBe(true);
    expect(modules.has("odata")).toBe(true);
    expect(modules.has("constants")).toBe(true);
    expect(modules.has("shortcuts")).toBe(true);
  });

  it('explicit "all" enables all modules', () => {
    process.env["ONEC_SERVICES"] = "all";
    expect(getEnabledModules().size).toBe(9);
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

  it("default config = 26 tools (4 meta + 22 optional)", () => {
    delete process.env["ONEC_SERVICES"];
    expect(countRegisteredTools(getEnabledModules())).toBe(26);
  });

  it("ONEC_SERVICES=catalogs = 7 tools (4 meta + 3 catalog)", () => {
    process.env["ONEC_SERVICES"] = "catalogs";
    expect(countRegisteredTools(getEnabledModules())).toBe(7);
  });

  it("ONEC_SERVICES=documents = 10 tools (4 meta + 6 documents)", () => {
    process.env["ONEC_SERVICES"] = "documents";
    expect(countRegisteredTools(getEnabledModules())).toBe(10);
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
