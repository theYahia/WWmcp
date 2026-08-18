import { describe, it, expect, beforeAll, afterAll } from "vitest";
import request from "supertest";
import type { Server } from "node:http";
import { startHttpServer } from "../src/http.js";
import { createServer } from "../src/index.js";

const TOKEN = "test-secret";

describe("HTTP transport security", () => {
  let server: Server;

  beforeAll(async () => {
    process.env.MCP_HTTP_TOKEN = TOKEN;
    server = await startHttpServer(createServer, 0);
  });

  afterAll(() => {
    server?.close();
    delete process.env.MCP_HTTP_TOKEN;
  });

  it("serves /health without auth", async () => {
    const res = await request(server).get("/health");
    expect(res.status).toBe(200);
    expect(res.body).toMatchObject({ status: "ok", tools: 18, prompts: 2 });
    expect(res.body.sessions).toBe(0);
  });

  it("rejects POST /mcp without a token", async () => {
    const res = await request(server).post("/mcp").send({ jsonrpc: "2.0", id: 1, method: "ping" });
    expect(res.status).toBe(401);
  });

  it("rejects POST /mcp with a wrong token", async () => {
    const res = await request(server).post("/mcp").set("Authorization", "Bearer nope").send({});
    expect(res.status).toBe(401);
  });

  it("passes auth but 400s GET /mcp without a session", async () => {
    const res = await request(server).get("/mcp").set("Authorization", `Bearer ${TOKEN}`);
    // Not 401 -> auth passed; 400 -> our no-session guard (before touching the transport).
    expect(res.status).toBe(400);
  });
});

describe("HTTP fail-closed", () => {
  it("refuses to start --http without MCP_HTTP_TOKEN", async () => {
    const saved = process.env.MCP_HTTP_TOKEN;
    delete process.env.MCP_HTTP_TOKEN;
    await expect(startHttpServer(createServer, 0)).rejects.toThrow(/MCP_HTTP_TOKEN/);
    if (saved !== undefined) process.env.MCP_HTTP_TOKEN = saved;
  });
});
