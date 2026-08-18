import { describe, it, expect, vi } from "vitest";

// index.ts calls runServer() at import time — neutralize the stdio transport
// and the process.exit in its .catch() so importing it in a test is inert.
vi.mock("@modelcontextprotocol/sdk/server/stdio.js", () => ({
  StdioServerTransport: vi.fn(),
}));

vi.spyOn(process, "exit").mockImplementation((() => {}) as any);

describe("tkassa server factory", () => {
  it("createServer returns a connectable McpServer with 16 tools", async () => {
    const { createServer, TOOL_COUNT } = await import("../src/index.js");
    const server = createServer();
    expect(server).toBeDefined();
    expect(typeof server.connect).toBe("function");
    expect(TOOL_COUNT).toBe(16);

    const names = Object.keys((server as any)._registeredTools).sort();
    expect(names).toEqual([
      "add_customer",
      "cancel_payment",
      "charge_payment",
      "confirm_payment",
      "create_sbp_qr",
      "find_instrument",
      "get_card_list",
      "get_customer",
      "get_invest_portfolio",
      "get_payment_state",
      "get_sbp_qr_state",
      "init_payment",
      "refund_payment",
      "remove_card",
      "remove_customer",
      "send_closing_receipt",
    ]);
  });
});
