import { describe, it, expect, vi } from "vitest";
import { Client } from "@modelcontextprotocol/sdk/client/index.js";
import { InMemoryTransport } from "@modelcontextprotocol/sdk/inMemory.js";
import { createServer, TOOL_COUNT } from "../src/server.js";
import { toolDefinitions } from "../src/tools.js";
import { HOSTS, type WBClient } from "../src/client.js";

function mockClient(): WBClient {
  return {
    get: vi.fn().mockResolvedValue({ ok: true }),
    post: vi.fn().mockResolvedValue({ ok: true }),
    put: vi.fn().mockResolvedValue({ ok: true }),
    patch: vi.fn().mockResolvedValue({ ok: true }),
    request: vi.fn().mockResolvedValue({ ok: true }),
    pollUntil: vi.fn(),
  } as unknown as WBClient;
}

async function connectedClient(wb: WBClient) {
  const server = createServer(wb);
  const [clientTransport, serverTransport] = InMemoryTransport.createLinkedPair();
  const client = new Client({ name: "test", version: "0.0.0" });
  await Promise.all([client.connect(clientTransport), server.connect(serverTransport)]);
  return { client, server };
}

describe("createServer", () => {
  it("registers all tools without throwing", () => {
    expect(() => createServer(mockClient())).not.toThrow();
    expect(TOOL_COUNT).toBe(Object.keys(toolDefinitions).length);
  });

  it("advertises every tool with a valid input schema via tools/list", async () => {
    const { client, server } = await connectedClient(mockClient());
    try {
      const { tools } = await client.listTools();
      expect(tools).toHaveLength(TOOL_COUNT);
      for (const tool of tools) {
        expect(tool.name).toBeTruthy();
        expect(tool.description).toBeTruthy();
        expect(tool.inputSchema).toBeDefined();
        expect(tool.inputSchema.type).toBe("object");
      }
      const names = tools.map((t) => t.name);
      expect(names).toContain("list_products");
      expect(names).toContain("get_balance");
    } finally {
      await server.close();
    }
  });

  it("routes a tools/call to the correct host and returns its result", async () => {
    const wb = mockClient();
    const { client, server } = await connectedClient(wb);
    try {
      const res = await client.callTool({ name: "get_warehouses", arguments: {} });
      expect(wb.get).toHaveBeenCalledWith(HOSTS.marketplace, "/api/v3/offices");
      expect(res.isError).toBeFalsy();
    } finally {
      await server.close();
    }
  });

  it("validates tool inputs (rejects out-of-range values before the handler runs)", async () => {
    const wb = mockClient();
    const { client, server } = await connectedClient(wb);
    try {
      const res = await client.callTool({ name: "get_product", arguments: { nmIDs: [] } });
      expect(res.isError).toBe(true);
      expect(wb.post).not.toHaveBeenCalled();
    } finally {
      await server.close();
    }
  });

  it("surfaces handler errors as MCP error results", async () => {
    const wb = mockClient();
    (wb.get as ReturnType<typeof vi.fn>).mockRejectedValueOnce(new Error("WB API down"));
    const { client, server } = await connectedClient(wb);
    try {
      const res = (await client.callTool({ name: "get_warehouses", arguments: {} })) as {
        isError?: boolean;
        content: Array<{ type: string; text: string }>;
      };
      expect(res.isError).toBe(true);
      expect(res.content[0].text).toContain("WB API down");
    } finally {
      await server.close();
    }
  });
});
