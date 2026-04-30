import { describe, it, expect, vi, beforeEach, afterEach } from "vitest";
import { fawaterakGet, fawaterakPost, resetClient } from "../src/client.js";

describe("fawaterak client", () => {
  const originalEnv = { ...process.env };

  beforeEach(() => {
    process.env["FAWATERAK_API_KEY"] = "test-key";
    process.env["FAWATERAK_SANDBOX"] = "true";
    resetClient();
  });

  afterEach(() => {
    process.env = { ...originalEnv };
    vi.restoreAllMocks();
    resetClient();
  });

  it("uses staging URL when sandbox=true", async () => {
    const fetchMock = vi.fn().mockResolvedValue({
      ok: true,
      text: () => Promise.resolve(JSON.stringify({ data: [] })),
      headers: new Map(),
    });
    vi.stubGlobal("fetch", fetchMock);

    await fawaterakGet("/getPaymentMethods");
    expect(fetchMock.mock.calls[0][0]).toBe("https://staging.fawaterk.com/api/v2/getPaymentMethods");
  });

  it("uses production URL when sandbox not set", async () => {
    delete process.env["FAWATERAK_SANDBOX"];
    resetClient();
    const fetchMock = vi.fn().mockResolvedValue({
      ok: true,
      text: () => Promise.resolve(JSON.stringify({})),
      headers: new Map(),
    });
    vi.stubGlobal("fetch", fetchMock);

    await fawaterakGet("/getPaymentMethods");
    expect(fetchMock.mock.calls[0][0]).toBe("https://app.fawaterk.com/api/v2/getPaymentMethods");
  });

  it("sends Bearer auth header", async () => {
    const fetchMock = vi.fn().mockResolvedValue({
      ok: true,
      text: () => Promise.resolve(JSON.stringify({})),
      headers: new Map(),
    });
    vi.stubGlobal("fetch", fetchMock);

    await fawaterakGet("/x");
    expect(new Headers(fetchMock.mock.calls[0][1].headers).get("Authorization")).toBe("Bearer test-key");
  });

  it("fawaterakPost serializes body", async () => {
    const fetchMock = vi.fn().mockResolvedValue({
      ok: true,
      text: () => Promise.resolve(JSON.stringify({ invoice_id: "inv_001" })),
      headers: new Map(),
    });
    vi.stubGlobal("fetch", fetchMock);

    await fawaterakPost("/createInvoiceLink", { cartTotal: "50" });
    const [, opts] = fetchMock.mock.calls[0];
    expect(opts.method).toBe("POST");
    expect(JSON.parse(opts.body)).toEqual({ cartTotal: "50" });
  });

  it("throws when FAWATERAK_API_KEY missing", async () => {
    delete process.env["FAWATERAK_API_KEY"];
    resetClient();
    await expect(fawaterakGet("/x")).rejects.toThrow("FAWATERAK_API_KEY");
  });
});
