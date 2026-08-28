import { describe, it, expect, vi, beforeEach, afterEach } from "vitest";
import { kaspiGet } from "../src/client.js";

// core's BaseHttpClient reads the body via response.text() and parses JSON itself.
function okResponse(data: unknown) {
  return {
    ok: true,
    text: () => Promise.resolve(JSON.stringify(data)),
    headers: new Map(),
  };
}

describe("kaspiGet", () => {
  const originalEnv = { ...process.env };

  beforeEach(() => {
    process.env["KASPI_API_KEY"] = "test-api-key";
  });

  afterEach(() => {
    process.env = { ...originalEnv };
    vi.restoreAllMocks();
    vi.unstubAllGlobals();
  });

  it("throws with a KASPI_API_KEY hint when the env var is missing", async () => {
    delete process.env["KASPI_API_KEY"];
    await expect(kaspiGet("/orders")).rejects.toThrow("KASPI_API_KEY");
  });

  it("sends Authorization: Bearer and JSON:API content headers", async () => {
    const fetchMock = vi.fn().mockResolvedValue(okResponse({ data: [] }));
    vi.stubGlobal("fetch", fetchMock);

    await kaspiGet("/orders");

    const [url, init] = fetchMock.mock.calls[0];
    expect(url).toBe("https://kaspi.kz/shop/api/v2/orders");
    const headers = new Headers(init.headers);
    expect(headers.get("Authorization")).toBe("Bearer test-api-key");
    expect(headers.get("Accept")).toBe("application/vnd.api+json");
    expect(headers.get("Content-Type")).toBe("application/vnd.api+json");
  });

  it("appends params as a query string", async () => {
    const fetchMock = vi.fn().mockResolvedValue(okResponse({ data: [] }));
    vi.stubGlobal("fetch", fetchMock);

    await kaspiGet("/orders", { "page[number]": "0", "page[size]": "20" });

    const url = fetchMock.mock.calls[0][0] as string;
    expect(url).toContain("page%5Bnumber%5D=0");
    expect(url).toContain("page%5Bsize%5D=20");
  });

  it("rebuilds the client when KASPI_API_KEY changes", async () => {
    const fetchMock = vi.fn().mockResolvedValue(okResponse({ data: [] }));
    vi.stubGlobal("fetch", fetchMock);

    await kaspiGet("/orders");
    process.env["KASPI_API_KEY"] = "second-key";
    await kaspiGet("/orders");

    const first = new Headers(fetchMock.mock.calls[0][1].headers);
    const second = new Headers(fetchMock.mock.calls[1][1].headers);
    expect(first.get("Authorization")).toBe("Bearer test-api-key");
    expect(second.get("Authorization")).toBe("Bearer second-key");
  });

  it("surfaces a non-2xx response as an ApiError with the status", async () => {
    const fetchMock = vi.fn().mockResolvedValue({
      ok: false,
      status: 404,
      statusText: "Not Found",
      text: () => Promise.resolve("{}"),
      headers: new Map(),
    });
    vi.stubGlobal("fetch", fetchMock);

    await expect(kaspiGet("/orders/nope")).rejects.toMatchObject({
      name: "ApiError",
      status: 404,
    });
  });
});
