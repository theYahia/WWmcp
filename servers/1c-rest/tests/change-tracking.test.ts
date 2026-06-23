import { describe, it, expect, vi, beforeEach, afterEach } from "vitest";
import {
  handlePollChangesSince,
  handleListSubscriptions,
} from "../src/tools/change-tracking.js";
import { resetClient } from "../src/client.js";

describe("poll_changes_since", () => {
  const originalEnv = { ...process.env };

  beforeEach(() => {
    process.env["ONEC_BASE_URL"] = "http://localhost:8080/base";
    process.env["ONEC_LOGIN"] = "admin";
    process.env["ONEC_PASSWORD"] = "secret";
    resetClient();
  });

  afterEach(() => {
    process.env = { ...originalEnv };
    vi.restoreAllMocks();
    resetClient();
  });

  it("builds OData $filter on the configured date_field", async () => {
    const fetchMock = vi.fn().mockResolvedValue({
      ok: true,
      text: () => Promise.resolve(JSON.stringify({ value: [] })),
      headers: new Map(),
    });
    vi.stubGlobal("fetch", fetchMock);

    await handlePollChangesSince({
      entity: "Document_РеализацияТоваровУслуг",
      since: "2026-05-19T00:00:00",
      date_field: "Date",
      top: 100,
    });
    const [url] = fetchMock.mock.calls[0];
    expect(url).toMatch(/\$filter=Date(%20|%2B|\+| )ge(%20| )datetime/);
    expect(url).toContain("2026-05-19T00%3A00%3A00");
    expect(url).toMatch(/\$orderby=Date(%20|\+| )asc/);
  });

  it("returns rows + next_cursor = max(date_field)", async () => {
    const rows = [
      { Ref_Key: "a", Date: "2026-05-19T10:00:00" },
      { Ref_Key: "b", Date: "2026-05-19T12:00:00" },
      { Ref_Key: "c", Date: "2026-05-19T11:00:00" },
    ];
    vi.stubGlobal(
      "fetch",
      vi.fn().mockResolvedValue({
        ok: true,
        text: () => Promise.resolve(JSON.stringify({ value: rows })),
        headers: new Map(),
      }),
    );

    const result = await handlePollChangesSince({
      entity: "Document_Test",
      since: "2026-05-19T00:00:00",
      date_field: "Date",
      top: 100,
    });
    const parsed = JSON.parse(result) as {
      count: number; next_cursor: string | null; has_more: boolean;
    };
    expect(parsed.count).toBe(3);
    expect(parsed.next_cursor).toBe("2026-05-19T12:00:00"); // max
    expect(parsed.has_more).toBe(false); // 3 < top 100
  });

  it("has_more=true when count == top (suggests pagination)", async () => {
    const rows = Array.from({ length: 5 }, (_, i) => ({
      Ref_Key: `r${i}`,
      Date: `2026-05-19T${String(i).padStart(2, "0")}:00:00`,
    }));
    vi.stubGlobal(
      "fetch",
      vi.fn().mockResolvedValue({
        ok: true,
        text: () => Promise.resolve(JSON.stringify({ value: rows })),
        headers: new Map(),
      }),
    );

    const result = await handlePollChangesSince({
      entity: "Document_Test",
      since: "2026-05-19T00:00:00",
      date_field: "Date",
      top: 5,
    });
    const parsed = JSON.parse(result) as { has_more: boolean; count: number };
    expect(parsed.count).toBe(5);
    expect(parsed.has_more).toBe(true);
  });

  it("supports custom date_field (e.g. ModificationDate for catalogs)", async () => {
    const fetchMock = vi.fn().mockResolvedValue({
      ok: true,
      text: () => Promise.resolve(JSON.stringify({ value: [] })),
      headers: new Map(),
    });
    vi.stubGlobal("fetch", fetchMock);

    await handlePollChangesSince({
      entity: "Catalog_Foo",
      since: "2026-05-19T00:00:00",
      date_field: "ModificationDate",
      top: 100,
    });
    const [url] = fetchMock.mock.calls[0];
    expect(url).toContain("ModificationDate");
  });

  it("returns null next_cursor when no rows", async () => {
    vi.stubGlobal(
      "fetch",
      vi.fn().mockResolvedValue({
        ok: true,
        text: () => Promise.resolve(JSON.stringify({ value: [] })),
        headers: new Map(),
      }),
    );
    const result = await handlePollChangesSince({
      entity: "Document_Test",
      since: "2026-05-19T00:00:00",
      date_field: "Date",
      top: 100,
    });
    const parsed = JSON.parse(result) as { count: number; next_cursor: string | null };
    expect(parsed.count).toBe(0);
    expect(parsed.next_cursor).toBeNull();
  });

  it("envelope surfaces the no-webhook caveat", async () => {
    vi.stubGlobal(
      "fetch",
      vi.fn().mockResolvedValue({
        ok: true,
        text: () => Promise.resolve(JSON.stringify({ value: [] })),
        headers: new Map(),
      }),
    );
    const result = await handlePollChangesSince({
      entity: "Document_Test",
      since: "2026-05-19T00:00:00",
      date_field: "Date",
      top: 100,
    });
    const parsed = JSON.parse(result) as { note: string };
    expect(parsed.note).toMatch(/does not support webhooks/i);
  });
});

describe("list_subscriptions", () => {
  it("returns supported=false and empty list (no webhooks in 1C)", async () => {
    const result = await handleListSubscriptions({});
    const parsed = JSON.parse(result) as {
      supported: boolean;
      subscriptions: unknown[];
      workarounds: string[];
    };
    expect(parsed.supported).toBe(false);
    expect(parsed.subscriptions).toEqual([]);
    expect(parsed.workarounds.length).toBeGreaterThan(0);
    expect(parsed.workarounds.join(" ")).toMatch(/poll_changes_since/);
  });

  it("does NOT make any HTTP request (pure metadata response)", async () => {
    const fetchMock = vi.fn();
    vi.stubGlobal("fetch", fetchMock);
    await handleListSubscriptions({});
    expect(fetchMock).not.toHaveBeenCalled();
  });
});
