import { describe, expect, it } from "vitest";
import { accountSchema, amountRubSchema, bikSchema, innSchema, isValidInn } from "./validation.js";

describe("validation", () => {
  it("validates BIK as 9 digits", () => {
    expect(bikSchema.safeParse("044525225").success).toBe(true);
    expect(bikSchema.safeParse("12345").success).toBe(false);
    expect(bikSchema.safeParse("04452522x").success).toBe(false);
  });

  it("validates INN with checksum", () => {
    expect(innSchema.safeParse("7707083893").success).toBe(true); // valid 10-digit
    expect(innSchema.safeParse("7707083894").success).toBe(false); // bad checksum
    expect(innSchema.safeParse("770708389").success).toBe(false); // wrong length
  });

  it("validates 12-digit INN checksum", () => {
    expect(isValidInn("500100732259")).toBe(true);
    expect(isValidInn("500100732251")).toBe(false);
  });

  it("validates account numbers as 20 digits", () => {
    expect(accountSchema.safeParse("40702810000000001234").success).toBe(true);
    expect(accountSchema.safeParse("123").success).toBe(false);
  });

  it("enforces a positive amount under the limit", () => {
    const schema = amountRubSchema(100_000);
    expect(schema.safeParse(50_000).success).toBe(true);
    expect(schema.safeParse(-1).success).toBe(false);
    expect(schema.safeParse(200_000).success).toBe(false);
  });
});
