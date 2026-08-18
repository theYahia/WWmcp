import { describe, it, expect } from "vitest";
import {
  formatList,
  formatEntity,
  formatTask,
  formatDeal,
  formatComment,
  formatEmployee,
} from "../src/format.js";

describe("formatList", () => {
  it("unwraps {meta, data} into a compact summary with a cursor", () => {
    const raw = {
      meta: { totalCount: 2 },
      data: [
        { id: 1, name: "A", status: { name: "open" } },
        { id: 2, name: "B", status: "closed" },
      ],
    };
    const out = JSON.parse(formatList(raw, formatTask));
    expect(out.total).toBe(2);
    expect(out.count).toBe(2);
    expect(out.nextPageAfter).toBe("2");
    expect(out.items[0]).toMatchObject({ id: "1", name: "A", status: "open" });
    expect(out.items[1]).toMatchObject({ id: "2", status: "closed" });
  });

  it("passes through raw JSON when raw=true", () => {
    const raw = { meta: {}, data: [] };
    expect(JSON.parse(formatList(raw, formatTask, true))).toEqual(raw);
  });

  it("is defensive about a missing envelope", () => {
    const out = JSON.parse(formatList(undefined, formatTask));
    expect(out).toMatchObject({ total: 0, count: 0, items: [], nextPageAfter: null });
  });
});

describe("formatEntity", () => {
  it("unwraps {data} and formats a single entity", () => {
    const out = JSON.parse(formatEntity({ data: { id: 9, name: "X" } }, formatTask));
    expect(out).toMatchObject({ id: "9", name: "X" });
  });

  it("accepts an already-unwrapped entity", () => {
    const out = JSON.parse(formatEntity({ id: 9, name: "X" }, formatTask));
    expect(out.id).toBe("9");
  });
});

describe("entity formatters", () => {
  it("formatDeal renders Money and ref fields", () => {
    const out = formatDeal({
      id: 5,
      name: "Big",
      price: { value: 1000, currency: "RUB" },
      responsible: { id: 3, name: "Ivan" },
      contractor: { id: 7, name: "Acme" },
    });
    expect(out).toMatchObject({
      id: "5",
      price: "1000 RUB",
      responsible: "Ivan",
      contractor: "Acme",
    });
  });

  it("formatTask reads a DateTime deadline value", () => {
    const out = formatTask({ id: 1, deadline: { contentType: "DateTime", value: "2025-01-01T00:00:00+03:00" } });
    expect(out.deadline).toBe("2025-01-01T00:00:00+03:00");
  });

  it("formatComment falls back from content to text", () => {
    expect(formatComment({ id: 1, text: "legacy" }).content).toBe("legacy");
    expect(formatComment({ id: 1, content: "new" }).content).toBe("new");
  });

  it("formatEmployee derives a name from a ref when absent", () => {
    expect(formatEmployee({ id: 4, name: "Jane", email: "j@x.io" })).toMatchObject({
      id: "4",
      name: "Jane",
      email: "j@x.io",
    });
  });
});
