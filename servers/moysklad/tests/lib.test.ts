import { describe, it, expect, vi, beforeEach } from "vitest";

vi.mock("../src/client.js", () => ({
  moyskladGet: vi.fn(),
  moyskladPost: vi.fn(),
  moyskladPut: vi.fn(),
  moyskladDelete: vi.fn(),
}));

import { moyskladGet } from "../src/client.js";
import {
  rubToKop,
  kopToRub,
  meta,
  metaTypeFromHref,
  metaHref,
  buildFilter,
  position,
  formatList,
  documentFields,
  getDefaultPriceTypeHref,
  _resetPriceTypeCache,
} from "../src/lib.js";

const mockGet = moyskladGet as ReturnType<typeof vi.fn>;
beforeEach(() => {
  mockGet.mockReset();
  _resetPriceTypeCache();
});

describe("money conversion", () => {
  it("rubToKop rounds to integer kopecks", () => {
    expect(rubToKop(2500.5)).toBe(250050);
    expect(rubToKop(0.1 + 0.2)).toBe(30); // guards float drift
  });
  it("kopToRub returns rubles or null", () => {
    expect(kopToRub(150000)).toBe(1500);
    expect(kopToRub(undefined)).toBeNull();
    expect(kopToRub("x")).toBeNull();
  });
});

describe("meta references", () => {
  it("infers entity type from href", () => {
    expect(metaTypeFromHref("https://api.moysklad.ru/api/remap/1.2/entity/customerorder/abc")).toBe("customerorder");
    expect(metaTypeFromHref("https://api.moysklad.ru/api/remap/1.2/entity/store/s1")).toBe("store");
  });
  it("falls back to product when no entity type in path", () => {
    expect(metaTypeFromHref("https://api.moysklad.ru/state/s1")).toBe("product");
  });
  it("meta() uses explicit type when given", () => {
    const m = meta("https://api.moysklad.ru/state/s1", "state");
    expect(m.meta.type).toBe("state");
    expect(m.meta.mediaType).toBe("application/json");
  });
  it("metaHref extracts href", () => {
    expect(metaHref({ meta: { href: "h" } })).toBe("h");
    expect(metaHref({})).toBeUndefined();
    expect(metaHref(null)).toBeUndefined();
  });
});

describe("buildFilter", () => {
  it("joins conditions with ;", () => {
    expect(
      buildFilter([
        ["inn", "123"],
        ["phone", "+7"],
      ]),
    ).toBe("inn=123;phone=+7");
  });
  it("skips empty values and returns undefined when all empty", () => {
    expect(
      buildFilter([
        ["inn", ""],
        ["phone", ""],
      ]),
    ).toBeUndefined();
    expect(
      buildFilter([
        ["a", ""],
        ["b", "x"],
      ]),
    ).toBe("b=x");
  });
  it("supports custom operators", () => {
    expect(buildFilter([["moment", "2024-01-01", ">="]])).toBe("moment>=2024-01-01");
  });
  it("rejects values containing the ';' separator (injection guard)", () => {
    expect(() => buildFilter([["inn", "1;phone=2"]])).toThrow(/must not contain/);
  });
});

describe("position", () => {
  it("builds a position with inferred assortment type and kopeck price", () => {
    const p = position({
      assortment_href: "https://api.moysklad.ru/api/remap/1.2/entity/product/p1",
      quantity: 3,
      price_rubles: 10,
      discount: 5,
    });
    expect(p.quantity).toBe(3);
    expect((p.assortment as any).meta.type).toBe("product");
    expect(p.price).toBe(1000);
    expect(p.discount).toBe(5);
  });
  it("omits price when not provided", () => {
    const p = position({ assortment_href: "https://api.moysklad.ru/api/remap/1.2/entity/variant/v1", quantity: 1 });
    expect(p.price).toBeUndefined();
    expect((p.assortment as any).meta.type).toBe("variant");
  });
});

describe("formatList & documentFields", () => {
  it("formats a list envelope", () => {
    const out = JSON.parse(
      formatList({ meta: { size: 2 }, rows: [{ id: "a" }, { id: "b" }] }, "items", (r) => ({ id: r.id })),
    );
    expect(out.total).toBe(2);
    expect(out.items).toEqual([{ id: "a" }, { id: "b" }]);
  });
  it("documentFields converts sum and surfaces state name", () => {
    const d = documentFields({ id: "o1", name: "001", sum: 500000, state: { name: "Новый" } });
    expect(d.sum_rubles).toBe(5000);
    expect(d.state).toBe("Новый");
  });
});

describe("getDefaultPriceTypeHref", () => {
  it("returns the first price type href and caches it", async () => {
    mockGet.mockResolvedValue([{ meta: { href: "PT_HREF", type: "pricetype" } }]);
    expect(await getDefaultPriceTypeHref()).toBe("PT_HREF");
    expect(await getDefaultPriceTypeHref()).toBe("PT_HREF"); // cached
    expect(mockGet).toHaveBeenCalledTimes(1);
  });
  it("accepts a {rows} envelope", async () => {
    mockGet.mockResolvedValue({ rows: [{ meta: { href: "PT2" } }] });
    expect(await getDefaultPriceTypeHref()).toBe("PT2");
  });
  it("throws when no price type exists", async () => {
    mockGet.mockResolvedValue([]);
    await expect(getDefaultPriceTypeHref()).rejects.toThrow(/No price type/);
  });
});
