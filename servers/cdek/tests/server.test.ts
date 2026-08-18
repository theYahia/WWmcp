import { describe, it, expect, vi } from "vitest";

// Mock client to avoid env var requirements
vi.mock("../src/client.js", () => ({
  getClient: () => ({
    get: vi.fn(),
    post: vi.fn(),
    delete: vi.fn(),
  }),
}));

import { createServer, TOOL_COUNT } from "../src/server.js";

const EXPECTED_TOOLS = [
  "calculate_tariff",
  "calculate_tariff_list",
  "create_courier_pickup",
  "create_order",
  "create_webhook",
  "delete_order",
  "delete_webhook",
  "generate_barcode",
  "get_cities",
  "get_courier_pickup",
  "get_order",
  "get_regions",
  "list_delivery_points",
  "list_orders",
  "print_receipt",
  "track_shipment",
];

describe("MCP Server", () => {
  it(`registers ${TOOL_COUNT} tools with the expected names`, async () => {
    // TOOL_COUNT is the single source of truth — keep it in sync with the tool list.
    expect(EXPECTED_TOOLS).toHaveLength(TOOL_COUNT);

    const server = createServer();
    const { Client } = await import("@modelcontextprotocol/sdk/client/index.js");
    const { InMemoryTransport } = await import("@modelcontextprotocol/sdk/inMemory.js");

    const [clientTransport, serverTransport] = InMemoryTransport.createLinkedPair();
    const client = new Client({ name: "test-client", version: "1.0.0" });

    await Promise.all([
      server.connect(serverTransport),
      client.connect(clientTransport),
    ]);

    const { tools } = await client.listTools();
    expect(tools).toHaveLength(TOOL_COUNT);

    const names = tools.map(t => t.name).sort();
    expect(names).toEqual(EXPECTED_TOOLS);

    await client.close();
  });
});
