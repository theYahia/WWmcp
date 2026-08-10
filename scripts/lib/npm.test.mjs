import { describe, it, expect } from "vitest";
import { countToolsInBundle } from "./npm.mjs";

// The fleet registers tools four different ways. These fixtures are reduced
// from real published bundles; if a heuristic drifts, these fail loudly rather
// than the catalog quietly publishing a wrong tool count.
describe("countToolsInBundle", () => {
  it("counts classic server.tool() calls", () => {
    const code = `server.tool("get_deals", "d", {}, cb); server.tool("create_deal", "d", {}, cb);`;
    expect(countToolsInBundle(code).tools).toBe(2);
  });

  it("counts registerTool() calls", () => {
    expect(countToolsInBundle(`s.registerTool("list_items", {}, cb)`).tools).toBe(1);
  });

  it("counts a name/description definition table", () => {
    const code = `const T=[{name:"get_stock",description:"x"},{name:"create_order",description:"y"}];`;
    expect(countToolsInBundle(code).tools).toBe(2);
  });

  it("counts keyed object literals but not their schema properties", () => {
    // The `cursor` and `limit` properties must NOT be counted as tools even
    // though the next tool's inputSchema sits within their lookahead window.
    const code = `
      export const toolDefinitions = {
        list_products: {
          description: "List seller products",
          inputSchema: { type: "object", properties: {
            limit: { type: "integer", description: "Number of cards" },
            cursor: { type: "string", description: "Pagination cursor" },
          } },
        },
        get_product: {
          description: "Get one product",
          inputSchema: { type: "object", properties: {
            nm_id: { type: "integer", description: "Article" },
          } },
        },
      };`;
    const r = countToolsInBundle(code);
    expect(r.names).toEqual(["get_product", "list_products"]);
  });

  it("falls back to a declared toolCount when nothing is registered inline", () => {
    const r = countToolsInBundle(`runServer({ toolCount: 7 })`);
    expect(r).toMatchObject({ tools: 7, method: "declared" });
  });

  it("flags a declared count that disagrees with what actually ships", () => {
    const r = countToolsInBundle(`server.tool("a_tool","d",{},cb); runServer({toolCount: 12})`);
    expect(r).toMatchObject({ tools: 1, declared: 12, mismatch: true });
  });
});
