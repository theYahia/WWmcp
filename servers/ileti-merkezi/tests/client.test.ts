import { describe, it, expect, vi, beforeEach, afterEach } from "vitest";
import { IletiMerkeziClient, MissingCredentialsError, readCredentials } from "../src/client.js";

function mockFetch(status: number, body: unknown) {
  const mock = vi.fn().mockResolvedValue({
    ok: status >= 200 && status < 300,
    status,
    statusText: String(status),
    text: () => Promise.resolve(typeof body === "string" ? body : JSON.stringify(body)),
    headers: new Headers(),
  });
  vi.stubGlobal("fetch", mock);
  return mock;
}

describe("IletiMerkeziClient", () => {
  const originalEnv = { ...process.env };

  beforeEach(() => {
    process.env["ILETIMERKEZI_API_KEY"] = "panel-key";
    process.env["ILETIMERKEZI_API_HASH"] = "panel-hash";
    delete process.env["ILETI_API_KEY"];
    delete process.env["ILETI_API_HASH"];
  });

  afterEach(() => {
    process.env = { ...originalEnv };
    vi.restoreAllMocks();
  });

  it("does not throw on construction without env vars (lazy init)", () => {
    delete process.env["ILETIMERKEZI_API_KEY"];
    delete process.env["ILETIMERKEZI_API_HASH"];
    expect(() => new IletiMerkeziClient()).not.toThrow();
  });

  it("throws MissingCredentialsError on first call when creds are absent", async () => {
    delete process.env["ILETIMERKEZI_API_KEY"];
    const client = new IletiMerkeziClient();
    await expect(client.call("/get-balance/json")).rejects.toThrow(MissingCredentialsError);
  });

  it("accepts the ILETI_* migration aliases", () => {
    delete process.env["ILETIMERKEZI_API_KEY"];
    delete process.env["ILETIMERKEZI_API_HASH"];
    process.env["ILETI_API_KEY"] = "legacy-key";
    process.env["ILETI_API_HASH"] = "legacy-hash";
    expect(readCredentials()).toEqual({ key: "legacy-key", hash: "legacy-hash" });
  });

  it("POSTs the request envelope with body-level authentication (no auth headers)", async () => {
    const fetchMock = mockFetch(200, { response: { status: { code: 200 } } });
    const client = new IletiMerkeziClient();
    await client.call("/send-sms/json", { order: { sender: "APITEST" } });

    const [url, init] = fetchMock.mock.calls[0];
    expect(url).toBe("https://api.iletimerkezi.com/v1/send-sms/json");
    expect(init.method).toBe("POST");
    expect(JSON.parse(init.body)).toEqual({
      request: {
        authentication: { key: "panel-key", hash: "panel-hash" },
        order: { sender: "APITEST" },
      },
    });
    const headers = new Headers(init.headers);
    expect(headers.get("X-API-Key")).toBeNull();
    expect(headers.get("X-API-Hash")).toBeNull();
  });

  it("returns 4xx bodies instead of throwing — they carry the API status code", async () => {
    mockFetch(401, { response: { status: { code: 401, message: "Unauthorized" } } });
    const client = new IletiMerkeziClient();
    const result = await client.call("/get-balance/json");
    expect(result.status).toBe(401);
    expect(result.body).toEqual({ response: { status: { code: 401, message: "Unauthorized" } } });
  });

  it("returns non-JSON error bodies as raw text", async () => {
    mockFetch(500, "<html>gateway</html>");
    const client = new IletiMerkeziClient();
    const result = await client.call("/get-balance/json");
    expect(result.status).toBe(500);
    expect(result.body).toBe("<html>gateway</html>");
  });

  it("does not retry a mutating POST on 5xx (no duplicate sends)", async () => {
    const fetchMock = mockFetch(503, { response: { status: { code: 503 } } });
    const client = new IletiMerkeziClient();
    await client.call("/send-sms/json", {});
    expect(fetchMock).toHaveBeenCalledTimes(1);
  });
});
