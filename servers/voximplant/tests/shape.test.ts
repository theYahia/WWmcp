import { describe, it, expect } from "vitest";
import { pick, orRaw, shapeAccountInfo } from "../src/lib/shape.js";

describe("shape.pick / orRaw", () => {
  it("pick keeps only present whitelisted keys", () => {
    expect(pick({ a: 1, b: 2, c: 3 }, ["a", "c", "z"])).toEqual({ a: 1, c: 3 });
  });
  it("orRaw falls back to raw only when shape is empty", () => {
    expect(orRaw({ a: 1 }, { a: 1, b: 2 })).toEqual({ a: 1 });
    expect(orRaw({}, { a: 1, b: 2 })).toEqual({ a: 1, b: 2 });
  });
});

describe("shapeAccountInfo — strict redaction", () => {
  const secretFields = ["api_key", "callback_salt", "callback_url", "access_entries", "account_custom_data"];

  it("strips secrets, keeps safe fields (nested under result)", () => {
    const raw = {
      result: {
        account_id: 1,
        account_name: "acme",
        balance: 42,
        currency: "RUB",
        api_key: "SECRET",
        callback_salt: "SALT",
        access_entries: ["x"],
        account_custom_data: "blob",
      },
    };
    const out = shapeAccountInfo(raw) as { result: Record<string, unknown> };
    expect(out.result.account_id).toBe(1);
    expect(out.result.balance).toBe(42);
    for (const f of secretFields) expect(out.result[f]).toBeUndefined();
    expect(JSON.stringify(out)).not.toContain("SECRET");
    expect(JSON.stringify(out)).not.toContain("SALT");
  });

  it("handles flat (non-nested) responses too", () => {
    const out = shapeAccountInfo({ account_id: 9, api_key: "SECRET" }) as { result: Record<string, unknown> };
    expect(out.result.account_id).toBe(9);
    expect(out.result.api_key).toBeUndefined();
  });

  it("never leaks even on unexpected shape (no orRaw fallback)", () => {
    const out = shapeAccountInfo({ weird: true, api_key: "SECRET" });
    expect(JSON.stringify(out)).not.toContain("SECRET");
    expect(out).toEqual({ result: {} });
  });
});
