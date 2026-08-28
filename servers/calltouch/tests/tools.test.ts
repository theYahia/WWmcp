import { describe, it, expect } from "vitest";
import { getCallsSchema } from "../src/tools/calls.js";
import { getStatisticsSchema } from "../src/tools/statistics.js";
import { getLeadsSchema } from "../src/tools/leads.js";
import { getSourcesSchema } from "../src/tools/sources.js";
import { getTagsSchema } from "../src/tools/tags.js";

describe("Zod schemas", () => {
  it("getCallsSchema validates correct input", () => {
    const result = getCallsSchema.safeParse({
      date_from: "01/01/2025",
      date_to: "31/01/2025",
    });
    expect(result.success).toBe(true);
  });

  it("getCallsSchema validates with optional fields", () => {
    const result = getCallsSchema.safeParse({
      date_from: "01/01/2025",
      date_to: "31/01/2025",
      page: 2,
      limit: 100,
      source: "google",
    });
    expect(result.success).toBe(true);
  });

  it("getCallsSchema rejects missing required fields", () => {
    const result = getCallsSchema.safeParse({ date_from: "01/01/2025" });
    expect(result.success).toBe(false);
  });

  it("getStatisticsSchema validates correct input", () => {
    const result = getStatisticsSchema.safeParse({
      date_from: "01/01/2025",
      date_to: "31/01/2025",
    });
    expect(result.success).toBe(true);
  });

  it("getStatisticsSchema validates with group_by", () => {
    const result = getStatisticsSchema.safeParse({
      date_from: "01/01/2025",
      date_to: "31/01/2025",
      group_by: "week",
    });
    expect(result.success).toBe(true);
  });

  it("getLeadsSchema validates correct input", () => {
    const result = getLeadsSchema.safeParse({
      date_from: "01/03/2025",
      date_to: "31/03/2025",
    });
    expect(result.success).toBe(true);
  });

  it("getLeadsSchema validates with pagination", () => {
    const result = getLeadsSchema.safeParse({
      date_from: "01/03/2025",
      date_to: "31/03/2025",
      page: 1,
      limit: 25,
    });
    expect(result.success).toBe(true);
  });

  it("getSourcesSchema validates correct input", () => {
    const result = getSourcesSchema.safeParse({
      date_from: "01/01/2025",
      date_to: "31/01/2025",
    });
    expect(result.success).toBe(true);
  });

  it("getTagsSchema validates correct input", () => {
    const result = getTagsSchema.safeParse({
      date_from: "01/01/2025",
      date_to: "31/01/2025",
    });
    expect(result.success).toBe(true);
  });

  it("getTagsSchema rejects empty input", () => {
    const result = getTagsSchema.safeParse({});
    expect(result.success).toBe(false);
  });
});
