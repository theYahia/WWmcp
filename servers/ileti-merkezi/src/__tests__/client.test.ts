import { describe, it, expect, vi } from "vitest";
import { IletiMerkeziClient, MissingCredentialsError, readCredentials } from "../client.js";

interface QueuedResponse {
  status: number;
  body: unknown;
}

function fakeFetch(queue: QueuedResponse[]) {
  const calls: Array<{ url: string; options: RequestInit }> = [];
  const impl = vi.fn(async (url: string, options: RequestInit) => {
    calls.push({ url, options });
    const next = queue.shift() ?? { status: 200, body: { response: { status: { code: 200 } } } };
    return { status: next.status, text: async () => JSON.stringify(next.body) };
  }) as unknown as typeof fetch;
  return { impl, calls };
}

const creds = { key: "test-key", hash: "test-hash" };

describe("IletiMerkeziClient", () => {
  it("puts credentials in the JSON body (not headers) and POSTs to <base>/<path>", async () => {
    const { impl, calls } = fakeFetch([
      { status: 200, body: { response: { status: { code: 200 } } } },
    ]);
    const client = new IletiMerkeziClient(creds, { fetchImpl: impl });

    await client.call("/get-balance/json", {});

    expect(calls).toHaveLength(1);
    expect(calls[0].url).toBe("https://api.iletimerkezi.com/v1/get-balance/json");
    expect(calls[0].options.method).toBe("POST");
    const headers = calls[0].options.headers as Record<string, string>;
    expect(headers["Content-Type"]).toBe("application/json");
    // No legacy header-based auth.
    expect(headers["X-API-Key"]).toBeUndefined();
    expect(headers["X-API-Hash"]).toBeUndefined();

    const body = JSON.parse(calls[0].options.body as string);
    expect(body.request.authentication).toEqual({ key: "test-key", hash: "test-hash" });
  });

  it("merges the input fragment alongside authentication", async () => {
    const { impl, calls } = fakeFetch([{ status: 200, body: {} }]);
    const client = new IletiMerkeziClient(creds, { fetchImpl: impl });

    await client.call("/send-sms/json", { order: { sender: "APITEST" } });

    const body = JSON.parse(calls[0].options.body as string);
    expect(body.request.order).toEqual({ sender: "APITEST" });
    expect(body.request.authentication.key).toBe("test-key");
  });

  it("does NOT throw on a 4xx — returns status + parsed body", async () => {
    const errorBody = { response: { status: { code: 401, message: "auth failed" } } };
    const { impl } = fakeFetch([{ status: 401, body: errorBody }]);
    const client = new IletiMerkeziClient(creds, { fetchImpl: impl });

    const result = await client.call("/get-balance/json");
    expect(result.status).toBe(401);
    expect(result.body).toEqual(errorBody);
  });

  it("translates an AbortError into a clear timeout message", async () => {
    const impl = vi.fn(async () => {
      const err = new Error("aborted");
      err.name = "AbortError";
      throw err;
    }) as unknown as typeof fetch;
    const client = new IletiMerkeziClient(creds, { fetchImpl: impl });

    await expect(client.call("/get-balance/json")).rejects.toThrow(/timed out/);
  });
});

describe("readCredentials", () => {
  it("reads the primary ILETIMERKEZI_* names", () => {
    const c = readCredentials({
      ILETIMERKEZI_API_KEY: "k",
      ILETIMERKEZI_API_HASH: "h",
    } as NodeJS.ProcessEnv);
    expect(c).toEqual({ key: "k", hash: "h" });
  });

  it("accepts the ILETI_* aliases for migration", () => {
    const c = readCredentials({ ILETI_API_KEY: "k2", ILETI_API_HASH: "h2" } as NodeJS.ProcessEnv);
    expect(c).toEqual({ key: "k2", hash: "h2" });
  });

  it("throws MissingCredentialsError when either value is absent", () => {
    expect(() =>
      readCredentials({ ILETIMERKEZI_API_KEY: "only-key" } as NodeJS.ProcessEnv),
    ).toThrow(MissingCredentialsError);
    expect(() => readCredentials({} as NodeJS.ProcessEnv)).toThrow(/credentials missing/i);
  });
});
