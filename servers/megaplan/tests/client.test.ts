import { describe, it, expect, vi, beforeEach, afterEach } from "vitest";
import { megaplanGet, __resetAuth } from "../src/client.js";

const fetchMock = vi.fn();

function makeResponse(opts: { status?: number; body?: unknown; headers?: Record<string, string> } = {}): Response {
  const { status = 200, body = {}, headers = {} } = opts;
  const text = typeof body === "string" ? body : JSON.stringify(body);
  return {
    ok: status >= 200 && status < 300,
    status,
    headers: { get: (k: string) => headers[k.toLowerCase()] ?? null },
    json: async () => (typeof body === "string" ? JSON.parse(body) : body),
    text: async () => text,
  } as unknown as Response;
}

function authCalls(): unknown[][] {
  return fetchMock.mock.calls.filter((c) => String(c[0]).includes("/auth/access_token"));
}
function dataCalls(): unknown[][] {
  return fetchMock.mock.calls.filter((c) => !String(c[0]).includes("/auth/access_token"));
}

beforeEach(() => {
  __resetAuth();
  fetchMock.mockReset();
  vi.stubGlobal("fetch", fetchMock);
  vi.stubEnv("MEGAPLAN_DOMAIN", "test.megaplan.ru");
  vi.stubEnv("MEGAPLAN_TOKEN", "");
  vi.stubEnv("MEGAPLAN_LOGIN", "");
  vi.stubEnv("MEGAPLAN_PASSWORD", "");
});

afterEach(() => {
  vi.unstubAllEnvs();
  vi.unstubAllGlobals();
  vi.useRealTimers();
});

describe("env token mode", () => {
  beforeEach(() => vi.stubEnv("MEGAPLAN_TOKEN", "static-tok"));

  it("uses the static bearer token, serializes params as a JSON query, and never authenticates", async () => {
    fetchMock.mockResolvedValue(makeResponse({ body: { data: [] } }));
    const result = await megaplanGet("/task", { limit: 1 });
    expect(result).toEqual({ data: [] });
    expect(authCalls()).toHaveLength(0);
    const [url, opts] = fetchMock.mock.calls[0] as [string, RequestInit];
    expect(url).toBe(
      "https://test.megaplan.ru/api/v3/task?" + encodeURIComponent(JSON.stringify({ limit: 1 })),
    );
    expect((opts.headers as Record<string, string>).Authorization).toBe("Bearer static-tok");
  });

  it("throws on 401 without re-auth (a static token cannot refresh)", async () => {
    fetchMock.mockResolvedValue(makeResponse({ status: 401, body: { error: "no" } }));
    await expect(megaplanGet("/task")).rejects.toThrow(/401/);
    expect(fetchMock).toHaveBeenCalledTimes(1);
  });
});

describe("login/password mode", () => {
  beforeEach(() => {
    vi.stubEnv("MEGAPLAN_LOGIN", "user@example.com");
    vi.stubEnv("MEGAPLAN_PASSWORD", "secret");
  });

  it("authenticates with a form body, then calls with a Bearer token", async () => {
    fetchMock.mockImplementation(async (url: string) =>
      String(url).includes("/auth/access_token")
        ? makeResponse({ body: { access_token: "AAA" } })
        : makeResponse({ body: { data: [] } }),
    );
    await megaplanGet("/task", { limit: 1 });
    expect(authCalls()).toHaveLength(1);
    const authOpts = authCalls()[0][1] as RequestInit;
    expect(authOpts.method).toBe("POST");
    expect(String(authOpts.body)).toContain("grant_type=password");
    expect(String(authOpts.body)).toContain("username=user");
    expect((dataCalls()[0][1] as RequestInit).headers as Record<string, string>).toMatchObject({
      Authorization: "Bearer AAA",
    });
  });

  it("accepts the nested {data:{access_token}} response shape", async () => {
    fetchMock.mockImplementation(async (url: string) =>
      String(url).includes("/auth/access_token")
        ? makeResponse({ body: { data: { access_token: "NESTED" } } })
        : makeResponse({ body: { data: [] } }),
    );
    await megaplanGet("/task");
    expect((dataCalls()[0][1] as RequestInit).headers as Record<string, string>).toMatchObject({
      Authorization: "Bearer NESTED",
    });
  });

  it("collapses concurrent cold-start calls into a single authentication", async () => {
    fetchMock.mockImplementation(async (url: string) =>
      String(url).includes("/auth/access_token")
        ? makeResponse({ body: { access_token: "ONCE" } })
        : makeResponse({ body: { data: [] } }),
    );
    await Promise.all([megaplanGet("/a"), megaplanGet("/b"), megaplanGet("/c")]);
    expect(authCalls()).toHaveLength(1);
    expect(dataCalls()).toHaveLength(3);
  });

  it("re-authenticates and retries on a 401", async () => {
    let authN = 0;
    const dataStatuses = [401, 200];
    let dataN = 0;
    fetchMock.mockImplementation(async (url: string) => {
      if (String(url).includes("/auth/access_token")) {
        authN += 1;
        return makeResponse({ body: { access_token: `tok${authN}` } });
      }
      const status = dataStatuses[dataN++] ?? 200;
      return makeResponse({ status, body: status === 200 ? { data: [] } : { error: "expired" } });
    });
    const result = await megaplanGet("/task");
    expect(result).toEqual({ data: [] });
    expect(authN).toBe(2);
    expect(dataN).toBe(2);
  });

  it("shares a single re-authentication across concurrent 401s", async () => {
    let authN = 0;
    const dataStatuses = [401, 401, 200, 200];
    let dataN = 0;
    fetchMock.mockImplementation(async (url: string) => {
      if (String(url).includes("/auth/access_token")) {
        authN += 1;
        return makeResponse({ body: { access_token: `tok${authN}` } });
      }
      const status = dataStatuses[dataN++] ?? 200;
      return makeResponse({ status, body: status === 200 ? { data: [] } : { error: "expired" } });
    });
    const results = await Promise.all([megaplanGet("/a"), megaplanGet("/b")]);
    expect(results).toEqual([{ data: [] }, { data: [] }]);
    // 1 cold-start auth + 1 shared re-auth (not one re-auth per request) = 2.
    expect(authN).toBe(2);
  });
});

describe("retries, timeout, and parsing", () => {
  beforeEach(() => {
    vi.stubEnv("MEGAPLAN_TOKEN", "tok");
    vi.useFakeTimers();
  });

  it("retries a transient network TypeError then succeeds", async () => {
    fetchMock
      .mockRejectedValueOnce(new TypeError("fetch failed"))
      .mockResolvedValueOnce(makeResponse({ body: { data: [] } }));
    const p = megaplanGet("/task");
    await vi.advanceTimersByTimeAsync(2000);
    await expect(p).resolves.toEqual({ data: [] });
    expect(fetchMock).toHaveBeenCalledTimes(2);
  });

  it("honors Retry-After on 429", async () => {
    fetchMock
      .mockResolvedValueOnce(makeResponse({ status: 429, headers: { "retry-after": "2" } }))
      .mockResolvedValueOnce(makeResponse({ body: { ok: true } }));
    const p = megaplanGet("/task");
    await vi.advanceTimersByTimeAsync(1000);
    expect(fetchMock).toHaveBeenCalledTimes(1); // retry-after said 2s
    await vi.advanceTimersByTimeAsync(1500);
    await expect(p).resolves.toEqual({ ok: true });
    expect(fetchMock).toHaveBeenCalledTimes(2);
  });

  it("retries 5xx with backoff and throws after exhausting retries", async () => {
    fetchMock.mockResolvedValue(makeResponse({ status: 503, body: "busy" }));
    const p = megaplanGet("/task").catch((e) => e);
    await vi.advanceTimersByTimeAsync(10000);
    const err = await p;
    expect(String(err)).toMatch(/503/);
    expect(fetchMock).toHaveBeenCalledTimes(3);
  });

  it("aborts a hung request on timeout and retries", async () => {
    fetchMock.mockImplementationOnce(
      (_url: string, opts: RequestInit) =>
        new Promise<Response>((_resolve, reject) => {
          opts.signal?.addEventListener("abort", () =>
            reject(new DOMException("aborted", "AbortError")),
          );
        }),
    );
    fetchMock.mockResolvedValueOnce(makeResponse({ body: { data: [] } }));
    const p = megaplanGet("/task");
    await vi.advanceTimersByTimeAsync(15000); // trip the timeout
    await vi.advanceTimersByTimeAsync(2000); // then the backoff before retry
    await expect(p).resolves.toEqual({ data: [] });
    expect(fetchMock).toHaveBeenCalledTimes(2);
  });

  it("returns null for 204 and throws on a non-JSON 2xx body", async () => {
    fetchMock.mockResolvedValueOnce(makeResponse({ status: 204 }));
    await expect(megaplanGet("/task")).resolves.toBeNull();

    fetchMock.mockResolvedValueOnce(makeResponse({ status: 200, body: "<html>oops</html>" }));
    await expect(megaplanGet("/task")).rejects.toThrow(/non-JSON/);
  });
});

describe("domain validation", () => {
  it("rejects a domain with a path or credentials", async () => {
    vi.stubEnv("MEGAPLAN_TOKEN", "tok");
    vi.stubEnv("MEGAPLAN_DOMAIN", "evil.com/@x");
    await expect(megaplanGet("/task")).rejects.toThrow(/MEGAPLAN_DOMAIN/);
    expect(fetchMock).not.toHaveBeenCalled();
  });

  it("expands a bare subdomain to <name>.megaplan.ru", async () => {
    vi.stubEnv("MEGAPLAN_TOKEN", "tok");
    vi.stubEnv("MEGAPLAN_DOMAIN", "acme");
    fetchMock.mockResolvedValue(makeResponse({ body: { data: [] } }));
    await megaplanGet("/task");
    expect(String(fetchMock.mock.calls[0][0])).toBe("https://acme.megaplan.ru/api/v3/task");
  });
});
