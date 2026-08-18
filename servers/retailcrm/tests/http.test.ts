import { describe, it, expect, beforeAll, afterAll } from "vitest";
import type { AddressInfo } from "node:net";
import type { Server } from "node:http";
import { createHttpServer } from "../src/index.js";

let server: Server;
let base: string;

beforeAll(async () => {
  process.env.RETAILCRM_DOMAIN = "testshop.retailcrm.ru";
  process.env.RETAILCRM_API_KEY = "test-key";
  process.env.RETAILCRM_DNS_PROTECTION = "off"; // tests bind to an ephemeral port
  server = createHttpServer(0);
  await new Promise<void>((resolve) => server.listen(0, "127.0.0.1", resolve));
  const port = (server.address() as AddressInfo).port;
  base = `http://127.0.0.1:${port}`;
});

afterAll(async () => {
  await new Promise<void>((resolve) => server.close(() => resolve()));
});

function initBody(id: number) {
  return JSON.stringify({
    jsonrpc: "2.0",
    id,
    method: "initialize",
    params: { protocolVersion: "2024-11-05", capabilities: {}, clientInfo: { name: "smoke", version: "1" } },
  });
}

const MCP_HEADERS = {
  "Content-Type": "application/json",
  Accept: "application/json, text/event-stream",
};

describe("HTTP transport", () => {
  it("GET /health returns version + tool count", async () => {
    const res = await fetch(`${base}/health`);
    expect(res.status).toBe(200);
    const json = await res.json();
    expect(json.status).toBe("ok");
    expect(json.tools).toBeGreaterThan(30);
  });

  it("GET /mcp is 405 (stateless rejects non-POST)", async () => {
    const res = await fetch(`${base}/mcp`);
    expect(res.status).toBe(405);
  });

  it("unknown route is 404", async () => {
    const res = await fetch(`${base}/nope`);
    expect(res.status).toBe(404);
  });

  it("POST /mcp initialize returns the server info", async () => {
    const res = await fetch(`${base}/mcp`, { method: "POST", headers: MCP_HEADERS, body: initBody(1) });
    expect(res.status).toBe(200);
    const text = await res.text();
    expect(text).toContain("retailcrm-mcp");
    expect(text).toContain("protocolVersion");
  });

  it("handles concurrent initialize requests without cross-bleed", async () => {
    const [a, b] = await Promise.all([
      fetch(`${base}/mcp`, { method: "POST", headers: MCP_HEADERS, body: initBody(11) }).then(r => r.text()),
      fetch(`${base}/mcp`, { method: "POST", headers: MCP_HEADERS, body: initBody(22) }).then(r => r.text()),
    ]);
    // Each response carries its own request id — proves per-request isolation.
    expect(a).toContain('"id":11');
    expect(b).toContain('"id":22');
  });
});
