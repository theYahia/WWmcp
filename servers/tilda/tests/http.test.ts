import { describe, it, expect, beforeAll, afterAll } from "vitest";
import type { Server } from "node:http";
import { Client } from "@modelcontextprotocol/sdk/client/index.js";
import { StreamableHTTPClientTransport } from "@modelcontextprotocol/sdk/client/streamableHttp.js";
import { startHttpMode, TOOL_COUNT } from "../src/server.js";

let server: Server;
let baseUrl: string;

beforeAll(async () => {
  server = await startHttpMode(0); // port 0 → OS-assigned ephemeral port
  const addr = server.address();
  const port = typeof addr === "object" && addr ? addr.port : 0;
  baseUrl = `http://127.0.0.1:${port}`;
});

afterAll(async () => {
  await new Promise<void>((resolve) => server.close(() => resolve()));
});

describe("HTTP transport (stateless)", () => {
  it("GET /health reports the tool count", async () => {
    const res = await fetch(`${baseUrl}/health`);
    expect(res.status).toBe(200);
    expect(await res.json()).toEqual({ status: "ok", tools: TOOL_COUNT });
  });

  it("OPTIONS /mcp returns 204 with CORS headers", async () => {
    const res = await fetch(`${baseUrl}/mcp`, { method: "OPTIONS" });
    expect(res.status).toBe(204);
    expect(res.headers.get("access-control-allow-origin")).toBe("*");
  });

  it("POST /mcp with malformed JSON returns 400 (does not hang)", async () => {
    const res = await fetch(`${baseUrl}/mcp`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: "{ this is not json",
    });
    expect(res.status).toBe(400);
  });

  it("GET /mcp returns 405 with an Allow header", async () => {
    const res = await fetch(`${baseUrl}/mcp`, { method: "GET" });
    expect(res.status).toBe(405);
    expect(res.headers.get("allow")).toContain("POST");
  });

  it("initialize + tools/list works over a stateless SDK client", async () => {
    const transport = new StreamableHTTPClientTransport(new URL(`${baseUrl}/mcp`));
    const client = new Client({ name: "http-test", version: "0.0.0" });
    await client.connect(transport);
    const { tools } = await client.listTools();
    expect(tools).toHaveLength(TOOL_COUNT);
    await client.close();
  });
});
