import { describe, it, expect } from "vitest";
import {
  clampPageSize,
  dateRangeFilter,
  flattenResource,
  formatList,
  jsonApiBody,
  listQuery,
  MAX_PAGE_SIZE,
} from "../src/lib.js";

describe("dateRangeFilter (fixes the one-sided '...' bug)", () => {
  it("builds a range when both bounds are present", () => {
    expect(dateRangeFilter("2026-01-01", "2026-12-31")).toBe("2026-01-01...2026-12-31");
  });
  it("collapses to exact-match when only 'from' is given (no trailing '...')", () => {
    expect(dateRangeFilter("2026-01-01", undefined)).toBe("2026-01-01");
  });
  it("collapses to exact-match when only 'to' is given", () => {
    expect(dateRangeFilter(undefined, "2026-12-31")).toBe("2026-12-31");
  });
  it("returns undefined when neither bound is given", () => {
    expect(dateRangeFilter(undefined, undefined)).toBeUndefined();
  });
});

describe("clampPageSize (Parasut hard-cap of 25)", () => {
  it("clamps above the max", () => expect(clampPageSize(100)).toBe(MAX_PAGE_SIZE));
  it("keeps a valid size", () => expect(clampPageSize(10)).toBe(10));
  it("floors at 1", () => expect(clampPageSize(0)).toBe(1));
});

describe("listQuery", () => {
  it("emits page[number]/page[size] and bracketed filters, clamping size", () => {
    const qs = listQuery({ page: 2, pageSize: 50, filters: { name: "Acme", account_type: "customer" } });
    const decoded = decodeURIComponent(qs);
    expect(decoded).toContain("page[number]=2");
    expect(decoded).toContain("page[size]=25"); // clamped
    expect(decoded).toContain("filter[name]=Acme");
    expect(decoded).toContain("filter[account_type]=customer");
  });
  it("omits empty filters", () => {
    const qs = listQuery({ filters: { name: undefined, code: "" } });
    expect(qs).toBe("");
  });
});

describe("jsonApiBody", () => {
  it("wraps type/attributes and strips undefined", () => {
    const body = jsonApiBody("contacts", { name: "A", email: undefined }, { contact: { data: { id: "1", type: "x" } } });
    expect(body).toEqual({
      data: { type: "contacts", attributes: { name: "A" }, relationships: { contact: { data: { id: "1", type: "x" } } } },
    });
  });
  it("omits attributes when all are undefined", () => {
    const body = jsonApiBody("payments", { foo: undefined });
    expect(body).toEqual({ data: { type: "payments" } });
  });
});

describe("formatList / flattenResource", () => {
  it("flattens rows and surfaces pagination meta", () => {
    const raw = {
      data: [{ id: "1", type: "contacts", attributes: { name: "Acme" } }],
      meta: { current_page: 1, total_pages: 3, total_count: 70 },
    };
    const out = JSON.parse(formatList(raw, "contacts"));
    expect(out.total_count).toBe(70);
    expect(out.total_pages).toBe(3);
    expect(out.contacts[0]).toEqual({ id: "1", type: "contacts", name: "Acme" });
  });
  it("flattenResource merges id/type with attributes", () => {
    expect(flattenResource({ id: "9", type: "products", attributes: { name: "X" } })).toEqual({
      id: "9",
      type: "products",
      name: "X",
    });
  });
});
