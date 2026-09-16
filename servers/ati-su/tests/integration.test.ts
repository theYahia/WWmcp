/**
 * Integration tests that drive the tools through the REAL MCP SDK path
 * (McpServer + InMemoryTransport + Client) — so they exercise the SDK's
 * output-schema validation, which the fake-server unit harness cannot.
 *
 * Regression guard for: a 200 OK whose (unverified) wire field arrives with an
 * unexpected type must surface its data, not become a -32602 validation error.
 */

import { describe, it, expect, vi, beforeEach, afterEach } from "vitest";
import { Client } from "@modelcontextprotocol/sdk/client/index.js";
import { InMemoryTransport } from "@modelcontextprotocol/sdk/inMemory.js";
import { buildServer } from "../src/index.js";
import { resetAuthCache } from "../src/auth.js";

const mockFetch = vi.fn();

function res(status: number, body: unknown) {
  return {
    ok: status >= 200 && status < 300,
    status,
    headers: { get: () => null },
    text: async () => JSON.stringify(body),
    json: async () => body,
  };
}

async function connect() {
  const server = buildServer();
  const [clientTransport, serverTransport] = InMemoryTransport.createLinkedPair();
  const client = new Client({ name: "test-client", version: "1.0.0" });
  await Promise.all([server.connect(serverTransport), client.connect(clientTransport)]);
  return client;
}

beforeEach(() => {
  vi.stubGlobal("fetch", mockFetch);
  process.env.ATI_TOKEN = "test-token";
  resetAuthCache();
});

afterEach(() => {
  vi.restoreAllMocks();
  delete process.env.ATI_TOKEN;
});

describe("MCP SDK integration", () => {
  it("lists all 12 tools with annotations over the wire", async () => {
    const client = await connect();
    const { tools } = await client.listTools();
    expect(tools).toHaveLength(12);
    const create = tools.find((t) => t.name === "create_load");
    expect(create?.annotations?.destructiveHint).toBe(true);
    const firm = tools.find((t) => t.name === "get_firm");
    expect(firm?.annotations?.readOnlyHint).toBe(true);
    expect(tools.every((t) => t.outputSchema)).toBe(true);
  });

  it("returns data (not a -32602 error) when an API number arrives as a string", async () => {
    // score/claims_count typed as numbers in docs, but legacy v1.0 may send strings.
    mockFetch.mockResolvedValueOnce(
      res(200, { ati_id: 1, full_name: "ООО Тест", score: "bad", claims_count: "4" }),
    );
    const client = await connect();
    const r = (await client.callTool({ name: "get_firm", arguments: { ati_id: 1 } })) as {
      isError?: boolean;
      structuredContent?: { firm?: Record<string, unknown> };
    };
    expect(r.isError).toBeFalsy();
    expect(r.structuredContent!.firm).toMatchObject({ ati_id: 1, score: "bad" });
  });

  it("propagates a clean tool error (isError) without leaking the token", async () => {
    mockFetch.mockResolvedValueOnce(res(401, { Error: "access_denied" }));
    const client = await connect();
    const r = (await client.callTool({ name: "get_firm", arguments: { ati_id: 1 } })) as {
      isError?: boolean;
      content: { text: string }[];
    };
    expect(r.isError).toBe(true);
    expect(r.content[0].text).not.toContain("test-token");
  });
});
