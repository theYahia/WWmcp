import { describe, it, expect, beforeAll, afterAll } from "vitest";
import type { AddressInfo } from "node:net";
import type { Server } from "node:http";

process.env.YOOKASSA_SHOP_ID = "test_shop";
process.env.YOOKASSA_SECRET_KEY = "test_key";

import { createHttpServer, countRegisteredTools } from "../src/index.js";

const TOKEN = "test-secret-token";
const ALLOWED_ORIGIN = "https://app.example.com";

let server: Server;
let base: string;
let toolCount: number;
// Mutated after listen() once the ephemeral port is known (the transport reads it per request).
const allowedHosts: string[] = [];

beforeAll(async () => {
  toolCount = await countRegisteredTools();
  server = createHttpServer({
    authToken: TOKEN,
    allowedHosts,
    allowedOrigins: [ALLOWED_ORIGIN],
    toolCount,
  });
  await new Promise<void>((resolve) => server.listen(0, "127.0.0.1", resolve));
  const port = (server.address() as AddressInfo).port;
  allowedHosts.push(`127.0.0.1:${port}`, `localhost:${port}`);
  base = `http://127.0.0.1:${port}`;
});

afterAll(async () => {
  await new Promise<void>((resolve) => server.close(() => resolve()));
});

function mcpInitBody() {
  return JSON.stringify({
    jsonrpc: "2.0",
    id: 1,
    method: "initialize",
    params: { protocolVersion: "2025-06-18", capabilities: {}, clientInfo: { name: "t", version: "0" } },
  });
}

describe("HTTP transport", () => {
  it("GET /health returns ok with the real tool count", async () => {
    const res = await fetch(`${base}/health`);
    expect(res.status).toBe(200);
    const body = await res.json();
    expect(body.status).toBe("ok");
    expect(body.server).toBe("yookassa-mcp");
    expect(body.tools).toBe(toolCount);
  });

  it("OPTIONS echoes an allow-listed Origin", async () => {
    const res = await fetch(`${base}/mcp`, { method: "OPTIONS", headers: { Origin: ALLOWED_ORIGIN } });
    expect(res.status).toBe(204);
    expect(res.headers.get("access-control-allow-origin")).toBe(ALLOWED_ORIGIN);
  });

  it("OPTIONS does NOT echo a non-allow-listed Origin (no wildcard CORS)", async () => {
    const res = await fetch(`${base}/mcp`, { method: "OPTIONS", headers: { Origin: "https://evil.example" } });
    expect(res.status).toBe(204);
    expect(res.headers.get("access-control-allow-origin")).toBeNull();
  });

  it("POST /mcp without a token is rejected with 401", async () => {
    const res = await fetch(`${base}/mcp`, {
      method: "POST",
      headers: { "Content-Type": "application/json", Accept: "application/json, text/event-stream" },
      body: mcpInitBody(),
    });
    expect(res.status).toBe(401);
    expect(res.headers.get("www-authenticate")).toBe("Bearer");
  });

  it("POST /mcp with a wrong token is rejected with 401", async () => {
    const res = await fetch(`${base}/mcp`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Accept: "application/json, text/event-stream",
        Authorization: "Bearer wrong-token",
      },
      body: mcpInitBody(),
    });
    expect(res.status).toBe(401);
  });

  it("POST /mcp with the correct token reaches the MCP transport (initialize succeeds)", async () => {
    const res = await fetch(`${base}/mcp`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Accept: "application/json, text/event-stream",
        Authorization: `Bearer ${TOKEN}`,
      },
      body: mcpInitBody(),
    });
    expect(res.status).not.toBe(401);
    expect(res.status).not.toBe(404);
    expect(res.status).not.toBe(405);
    expect(res.status).toBe(200);
  });

  it("GET /mcp returns 405 (stateless endpoint, POST only)", async () => {
    const res = await fetch(`${base}/mcp`, { method: "GET", headers: { Authorization: `Bearer ${TOKEN}` } });
    expect(res.status).toBe(405);
    expect(res.headers.get("allow")).toBe("POST");
  });

  it("unknown path returns 404", async () => {
    const res = await fetch(`${base}/nope`);
    expect(res.status).toBe(404);
  });
});
