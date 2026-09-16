/**
 * Behavior tests for the ATI.su MCP tools.
 *
 * We capture each tool's config + callback via a fake server, parse inputs through
 * the declared inputSchema (so zod defaults apply exactly like the real SDK), then
 * invoke the handler against a mocked fetch.
 */

import { describe, it, expect, vi, beforeEach, afterEach } from "vitest";
import { z } from "zod";

import { registerFirmTools } from "../src/tools/firms.js";
import { registerLoadTools } from "../src/tools/loads.js";
import { registerTruckTools } from "../src/tools/trucks.js";
import { registerDictionaryTools, clearCityCache } from "../src/tools/dictionaries.js";
import { registerDistanceTools } from "../src/tools/distance.js";
import { resetAuthCache } from "../src/auth.js";

const mockFetch = vi.fn();

interface Captured {
  config: { inputSchema?: Record<string, z.ZodTypeAny>; annotations?: Record<string, unknown> };
  cb: (args: unknown, extra: unknown) => Promise<{
    isError?: boolean;
    structuredContent?: Record<string, unknown>;
    content: { type: string; text: string }[];
  }>;
}

function harness() {
  const tools = new Map<string, Captured>();
  const fakeServer = {
    registerTool(name: string, config: Captured["config"], cb: Captured["cb"]) {
      tools.set(name, { config, cb });
    },
  } as never;
  registerFirmTools(fakeServer);
  registerLoadTools(fakeServer);
  registerTruckTools(fakeServer);
  registerDictionaryTools(fakeServer);
  registerDistanceTools(fakeServer);

  return {
    names: () => [...tools.keys()],
    has: (n: string) => tools.has(n),
    annotations: (n: string) => tools.get(n)!.config.annotations,
    async call(name: string, args: Record<string, unknown> = {}) {
      const t = tools.get(name);
      if (!t) throw new Error(`tool ${name} not registered`);
      const parsed = z.object(t.config.inputSchema ?? {}).parse(args);
      return t.cb(parsed, {});
    },
  };
}

function res(status: number, body: unknown) {
  return {
    ok: status >= 200 && status < 300,
    status,
    headers: { get: () => null },
    text: async () => (body === undefined ? "" : JSON.stringify(body)),
    json: async () => body,
  };
}

beforeEach(() => {
  vi.stubGlobal("fetch", mockFetch);
  process.env.ATI_TOKEN = "test-token";
  resetAuthCache();
  clearCityCache();
});

afterEach(() => {
  vi.restoreAllMocks();
  delete process.env.ATI_TOKEN;
  delete process.env.ATI_ALLOW_WRITES;
  delete process.env.ATI_ENABLE_DISTANCE;
});

describe("registration", () => {
  it("registers the full real tool set", () => {
    const h = harness();
    for (const name of [
      "get_firm",
      "search_firms",
      "get_load",
      "list_my_loads",
      "search_loads_byboards",
      "create_load",
      "list_my_trucks",
      "get_truck",
      "list_body_types",
      "list_cargo_types",
      "resolve_city",
      "get_distance",
    ]) {
      expect(h.has(name)).toBe(true);
    }
  });

  it("marks create_load destructive and reads read-only", () => {
    const h = harness();
    expect(h.annotations("create_load")).toMatchObject({
      destructiveHint: true,
      readOnlyHint: false,
    });
    expect(h.annotations("get_firm")).toMatchObject({ readOnlyHint: true });
  });
});

describe("firms", () => {
  it("get_firm maps the real snake_case fields", async () => {
    mockFetch.mockResolvedValueOnce(
      res(200, { ati_id: 123, full_name: "ООО Тест", score: -2, claims_count: 4 }),
    );
    const r = await harness().call("get_firm", { ati_id: "123" });
    expect(mockFetch.mock.calls[0][0]).toBe("https://api.ati.su/v1.0/firms/123/summary");
    expect(r.structuredContent!.firm).toMatchObject({ ati_id: 123, score: -2, claims_count: 4 });
  });

  it("search_firms requires inn or phone", async () => {
    const r = await harness().call("search_firms", {});
    expect(r.isError).toBe(true);
    expect(r.content[0].text).toMatch(/inn or phone/i);
    expect(mockFetch).not.toHaveBeenCalled();
  });

  it("search_firms returns mapped firms for an INN", async () => {
    mockFetch.mockResolvedValueOnce(res(200, [{ ati_id: 7, inn: "7700000000" }]));
    const r = await harness().call("search_firms", { inn: "7700000000" });
    expect(r.structuredContent).toMatchObject({ total: 1 });
    expect((r.structuredContent!.firms as unknown[])[0]).toMatchObject({ ati_id: 7 });
  });
});

describe("dictionaries", () => {
  it("list_body_types maps Id/Name to id/name", async () => {
    mockFetch.mockResolvedValueOnce(res(200, [{ Id: 1, Name: "Тент" }, { Id: 2, Name: "Реф" }]));
    const r = await harness().call("list_body_types");
    expect(r.structuredContent!.total).toBe(2);
    expect((r.structuredContent!.items as unknown[])[0]).toMatchObject({ id: 1, name: "Тент" });
  });

  it("resolve_city returns the city id", async () => {
    mockFetch.mockResolvedValueOnce(res(200, { city_id: 999, name: "Тест" }));
    const r = await harness().call("resolve_city", { name: "Тест" });
    expect(r.structuredContent).toMatchObject({ city_id: 999, resolved: true });
    expect(mockFetch.mock.calls[0][0]).toBe(
      "https://api.ati.su/v1.0/dictionaries/locations/parse",
    );
  });

  it("resolve_city errors when the city cannot be resolved", async () => {
    mockFetch.mockResolvedValueOnce(res(200, {}));
    const r = await harness().call("resolve_city", { name: "Нигдеград" });
    expect(r.isError).toBe(true);
  });
});

describe("loads", () => {
  it("get_load maps PascalCase v1.0 fields", async () => {
    mockFetch.mockResolvedValueOnce(
      res(200, { Id: 42, FirmId: 9, Cargo: { Weight: 10, Volume: 40 }, Loading: { CityId: 5 } }),
    );
    const r = await harness().call("get_load", { load_id: "42" });
    const load = r.structuredContent!.load as Record<string, unknown>;
    expect(load).toMatchObject({ id: 42, firm_id: 9 });
    expect(load.cargo).toMatchObject({ weight: 10, volume: 40 });
    expect(load.loading).toMatchObject({ city_id: 5 });
  });

  it("list_my_loads filters by contact_id client-side", async () => {
    mockFetch.mockResolvedValueOnce(
      res(200, [
        { Id: 1, ContactId1: 100 },
        { Id: 2, ContactId1: 200 },
        { Id: 3, ContactId2: 100 },
      ]),
    );
    const r = await harness().call("list_my_loads", { contact_id: 100, limit: 50 });
    expect(r.structuredContent!.total).toBe(2);
  });
});

describe("create_load write guard", () => {
  it("refuses when ATI_ALLOW_WRITES is unset", async () => {
    const r = await harness().call("create_load", {
      from_city: "1",
      to_city: "2",
      cargo_name: "x",
      weight_tons: 1,
      volume_m3: 1,
    });
    expect(r.isError).toBe(true);
    expect(r.content[0].text).toMatch(/ATI_ALLOW_WRITES/);
    expect(mockFetch).not.toHaveBeenCalled();
  });

  it("previews (dry_run) without POSTing when writes are enabled", async () => {
    process.env.ATI_ALLOW_WRITES = "1";
    const r = await harness().call("create_load", {
      from_city: "1",
      to_city: "2",
      cargo_name: "Песок",
      weight_tons: 8,
      volume_m3: 40,
    });
    expect(r.structuredContent!.status).toBe("dry_run");
    const ca = r.structuredContent!.cargo_application as Record<string, unknown>;
    expect(JSON.stringify(ca)).toContain('"city_id":1');
    expect(mockFetch).not.toHaveBeenCalled();
  });

  it("publishes to /v2/cargos when dry_run=false and confirm=true", async () => {
    process.env.ATI_ALLOW_WRITES = "1";
    mockFetch.mockResolvedValueOnce(res(200, { cargo_application_id: "uuid-1" }));
    const r = await harness().call("create_load", {
      from_city: "1",
      to_city: "2",
      cargo_name: "Песок",
      weight_tons: 8,
      volume_m3: 40,
      dry_run: false,
      confirm: true,
    });
    expect(r.structuredContent!.status).toBe("created");
    const [url, options] = mockFetch.mock.calls[0];
    expect(url).toBe("https://api.ati.su/v2/cargos");
    expect(options.method).toBe("POST");
    expect(JSON.parse(options.body)).toHaveProperty("cargo_application");
  });
});

describe("get_distance paid gate", () => {
  it("is disabled unless ATI_ENABLE_DISTANCE is set", async () => {
    const r = await harness().call("get_distance", { from_city: "1", to_city: "2" });
    expect(r.isError).toBe(true);
    expect(r.content[0].text).toMatch(/ATI_ENABLE_DISTANCE/);
    expect(mockFetch).not.toHaveBeenCalled();
  });

  it("computes km/hours from meters/seconds when enabled", async () => {
    process.env.ATI_ENABLE_DISTANCE = "1";
    mockFetch.mockResolvedValueOnce(res(200, { total_distance: 700000, travel_time: 36000 }));
    const r = await harness().call("get_distance", { from_city: "1", to_city: "2" });
    expect(mockFetch.mock.calls[0][0]).toBe("https://api.ati.su/gw/gis-rm/v1/distance");
    expect(r.structuredContent).toMatchObject({ distance_km: 700, travel_time_hours: 10 });
  });
});

describe("trucks", () => {
  it("list_my_trucks returns the fleet array", async () => {
    mockFetch.mockResolvedValueOnce(res(200, [{ id: "a" }, { id: "b" }]));
    const r = await harness().call("list_my_trucks", { limit: 50 });
    expect(r.structuredContent!.total).toBe(2);
  });
});
