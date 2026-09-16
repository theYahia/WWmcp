/**
 * Tests for response formatters and quality code labels.
 */

import { describe, it, expect } from "vitest";
import {
  success,
  error,
  epochToDate,
  qcToConfidence,
  QC_ADDRESS,
  QC_GEO,
  QC_PHONE,
  COMPANY_STATUS,
} from "../src/lib/formatters.js";

describe("success()", () => {
  it("wraps data as JSON text content", () => {
    const result = success({ foo: "bar" });
    expect(result.content).toHaveLength(1);
    expect(result.content[0].type).toBe("text");
    expect(JSON.parse(result.content[0].text)).toEqual({ foo: "bar" });
  });

  it("does not include isError", () => {
    const result = success("ok");
    expect(result).not.toHaveProperty("isError");
  });

  it("handles null and undefined values", () => {
    const result = success({ a: null, b: undefined });
    const parsed = JSON.parse(result.content[0].text);
    expect(parsed.a).toBeNull();
    // JSON.stringify drops undefined
    expect(parsed).not.toHaveProperty("b");
  });
});

describe("error()", () => {
  it("returns isError: true", () => {
    const result = error("something went wrong");
    expect(result.isError).toBe(true);
    expect(result.content[0].text).toBe("something went wrong");
  });

  it("never includes stack traces or internal details", () => {
    const result = error("safe message");
    expect(result.content[0].text).not.toContain("at ");
    expect(result.content[0].text).not.toContain("node_modules");
  });
});

describe("epochToDate()", () => {
  it("converts epoch ms to ISO date", () => {
    expect(epochToDate(1029456000000)).toBe("2002-08-16");
  });

  it("returns null for null input", () => {
    expect(epochToDate(null)).toBeNull();
  });

  it("returns null for undefined input", () => {
    expect(epochToDate(undefined)).toBeNull();
  });

  it("returns null for invalid timestamp", () => {
    expect(epochToDate(NaN)).toBeNull();
  });
});

describe("qcToConfidence()", () => {
  it("maps 0 to high", () => expect(qcToConfidence(0)).toBe("high"));
  it("maps 1 to medium", () => expect(qcToConfidence(1)).toBe("medium"));
  it("maps 2 to low", () => expect(qcToConfidence(2)).toBe("low"));
  it("maps 3 to low", () => expect(qcToConfidence(3)).toBe("low"));
  it("maps 7 to low", () => expect(qcToConfidence(7)).toBe("low"));
});

describe("Quality code maps", () => {
  it("QC_ADDRESS covers codes 0-3", () => {
    expect(Object.keys(QC_ADDRESS)).toHaveLength(4);
    expect(QC_ADDRESS[0]).toContain("certainty");
    expect(QC_ADDRESS[3]).toContain("not recognized");
  });

  it("QC_GEO covers codes 0-5", () => {
    expect(Object.keys(QC_GEO)).toHaveLength(6);
    expect(QC_GEO[0]).toContain("Exact");
    expect(QC_GEO[5]).toContain("not available");
  });

  it("QC_PHONE covers common codes", () => {
    expect(QC_PHONE[0]).toContain("Valid");
    expect(QC_PHONE[2]).toContain("Invalid");
    expect(QC_PHONE[7]).toContain("Foreign");
  });

  it("COMPANY_STATUS covers all statuses", () => {
    expect(COMPANY_STATUS["ACTIVE"]).toContain("Active");
    expect(COMPANY_STATUS["LIQUIDATED"]).toContain("Liquidated");
    expect(COMPANY_STATUS["BANKRUPT"]).toContain("bankruptcy");
  });
});
