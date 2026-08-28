import { describe, it, expect, vi, beforeEach, afterEach } from "vitest";

describe("planfixRequest", () => {
  const origApiKey = process.env.PLANFIX_API_KEY;
  const origToken = process.env.PLANFIX_TOKEN;
  const origAccount = process.env.PLANFIX_ACCOUNT;

  beforeEach(() => {
    vi.resetModules();
    process.env.PLANFIX_API_KEY = "test-api-key";
    process.env.PLANFIX_ACCOUNT = "testaccount";
    delete process.env.PLANFIX_TOKEN;
  });

  afterEach(() => {
    if (origApiKey !== undefined) process.env.PLANFIX_API_KEY = origApiKey; else delete process.env.PLANFIX_API_KEY;
    if (origToken !== undefined) process.env.PLANFIX_TOKEN = origToken; else delete process.env.PLANFIX_TOKEN;
    if (origAccount !== undefined) process.env.PLANFIX_ACCOUNT = origAccount; else delete process.env.PLANFIX_ACCOUNT;
    vi.restoreAllMocks();
    vi.useRealTimers();
  });

  it("throws when no auth env is set", async () => {
    delete process.env.PLANFIX_API_KEY;
    delete process.env.PLANFIX_TOKEN;

    const { planfixRequest } = await import("../src/client.js");
    await expect(planfixRequest("GET", "task/1")).rejects.toThrow("Не задан ключ авторизации");
  });

  it("throws when PLANFIX_ACCOUNT is missing", async () => {
    delete process.env.PLANFIX_ACCOUNT;

    const { planfixRequest } = await import("../src/client.js");
    await expect(planfixRequest("GET", "task/1")).rejects.toThrow("PLANFIX_ACCOUNT");
  });

  it("uses PLANFIX_ACCOUNT for base URL", async () => {
    const mockResponse = new Response(JSON.stringify({ id: 1 }), { status: 200 });
    const fetchMock = vi.fn().mockResolvedValue(mockResponse);
    vi.stubGlobal("fetch", fetchMock);

    const { planfixRequest } = await import("../src/client.js");
    await planfixRequest("GET", "task/1");

    expect(fetchMock).toHaveBeenCalledWith(
      expect.stringContaining("testaccount.planfix.com/rest/task/1"),
      expect.any(Object),
    );
  });

  it("sends Authorization header with Bearer token", async () => {
    const mockResponse = new Response(JSON.stringify({ ok: true }), { status: 200 });
    const fetchMock = vi.fn().mockResolvedValue(mockResponse);
    vi.stubGlobal("fetch", fetchMock);

    const { planfixRequest } = await import("../src/client.js");
    await planfixRequest("POST", "task/list", { offset: 0 });

    const callArgs = fetchMock.mock.calls[0];
    expect(new Headers(callArgs[1].headers).get("Authorization")).toBe("Bearer test-api-key");
    expect(callArgs[1].method).toBe("POST");
  });

  it("falls back to PLANFIX_TOKEN if PLANFIX_API_KEY not set", async () => {
    delete process.env.PLANFIX_API_KEY;
    process.env.PLANFIX_TOKEN = "legacy-token";

    const mockResponse = new Response(JSON.stringify({}), { status: 200 });
    const fetchMock = vi.fn().mockResolvedValue(mockResponse);
    vi.stubGlobal("fetch", fetchMock);

    const { planfixRequest } = await import("../src/client.js");
    await planfixRequest("GET", "task/1");

    const callArgs = fetchMock.mock.calls[0];
    expect(new Headers(callArgs[1].headers).get("Authorization")).toBe("Bearer legacy-token");
  });

  it("throws on non-retryable HTTP errors", async () => {
    const mockResponse = new Response("Forbidden", { status: 403, statusText: "Forbidden" });
    const fetchMock = vi.fn().mockResolvedValue(mockResponse);
    vi.stubGlobal("fetch", fetchMock);

    const { planfixRequest } = await import("../src/client.js");
    await expect(planfixRequest("GET", "task/1")).rejects.toThrow("HTTP 403");
  });

  it("throws on {result:'fail'} body even at HTTP 200", async () => {
    const failBody = JSON.stringify({ result: "fail", code: 1000, error: "Task not found by id 1" });
    const mockResponse = new Response(failBody, { status: 200 });
    const fetchMock = vi.fn().mockResolvedValue(mockResponse);
    vi.stubGlobal("fetch", fetchMock);

    const { planfixRequest } = await import("../src/client.js");
    await expect(planfixRequest("GET", "task/1")).rejects.toThrow("Planfix API error 1000: Task not found by id 1");
    expect(fetchMock).toHaveBeenCalledTimes(1); // non-22 fail is not retried
  });

  it("retries on logical rate-limit code 22, then succeeds", async () => {
    vi.useFakeTimers();
    const fail = () => new Response(JSON.stringify({ result: "fail", code: 22, error: "rate limit" }), { status: 200 });
    const ok = () => new Response(JSON.stringify({ result: "success", id: 7 }), { status: 200 });
    const fetchMock = vi.fn().mockResolvedValueOnce(fail()).mockResolvedValueOnce(ok());
    vi.stubGlobal("fetch", fetchMock);

    const { planfixRequest } = await import("../src/client.js");
    const promise = planfixRequest("POST", "task/list", {});
    await vi.runAllTimersAsync();

    await expect(promise).resolves.toMatchObject({ result: "success", id: 7 });
    expect(fetchMock).toHaveBeenCalledTimes(2);
  });

  it("preserves a meaningful trailing slash (e.g. task/)", async () => {
    const mockResponse = new Response(JSON.stringify({ result: "success", id: 5 }), { status: 200 });
    const fetchMock = vi.fn().mockResolvedValue(mockResponse);
    vi.stubGlobal("fetch", fetchMock);

    const { planfixRequest } = await import("../src/client.js");
    await planfixRequest("POST", "task/", { name: "x" });

    expect(fetchMock).toHaveBeenCalledWith(
      expect.stringMatching(/\/rest\/task\/$/),
      expect.any(Object),
    );
  });
});
