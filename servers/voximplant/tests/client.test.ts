import { describe, it, expect, vi, beforeEach, afterEach } from "vitest";

// Тестируем клиент, мокая глобальный fetch. Клиент возвращает ApiResult (не бросает).
describe("client (voxGet / voxPost)", () => {
  const originalEnv = { ...process.env };

  beforeEach(() => {
    vi.resetModules();
    process.env.VOXIMPLANT_ACCOUNT_ID = "test-account-123";
    process.env.VOXIMPLANT_API_KEY = "test-key-456";
  });

  afterEach(() => {
    process.env = { ...originalEnv };
    vi.restoreAllMocks();
  });

  it("returns error-as-value (not throws) when env vars missing", async () => {
    delete process.env.VOXIMPLANT_ACCOUNT_ID;
    delete process.env.VOXIMPLANT_API_KEY;
    const { voxGet } = await import("../src/client.js");
    const res = await voxGet("GetAccountInfo");
    expect(res.data).toBeNull();
    expect(res.error).toContain("VOXIMPLANT_ACCOUNT_ID");
  });

  it("GET: calls correct URL with auth params in query string", async () => {
    const mockResponse = { api_version: "2024-04-10", result: [] };
    const fetchSpy = vi.spyOn(globalThis, "fetch").mockResolvedValueOnce(
      new Response(JSON.stringify(mockResponse), { status: 200 }),
    );

    const { voxGet } = await import("../src/client.js");
    const res = await voxGet("GetCallHistory", { count: "10" });

    expect(fetchSpy).toHaveBeenCalledOnce();
    const [url, init] = fetchSpy.mock.calls[0];
    expect(String(url)).toContain("https://api.voximplant.com/platform_api/GetCallHistory");
    expect(String(url)).toContain("account_id=test-account-123");
    expect(String(url)).toContain("api_key=test-key-456");
    expect(String(url)).toContain("count=10");
    expect((init as RequestInit | undefined)?.method ?? "GET").toBe("GET");
    expect(res).toEqual({ data: mockResponse, error: null });
  });

  it("POST: large payload goes into form body, NOT the URL (and api_key not in URL)", async () => {
    const fetchSpy = vi.spyOn(globalThis, "fetch").mockResolvedValueOnce(
      new Response(JSON.stringify({ result: 1 }), { status: 200 }),
    );

    const { voxPost } = await import("../src/client.js");
    const bigScript = "x".repeat(5000); // килобайты — в GET query не влезли бы
    await voxPost("SetScenarioInfo", { scenario_id: "1", script: bigScript });

    const [url, init] = fetchSpy.mock.calls[0];
    expect(String(url)).toBe("https://api.voximplant.com/platform_api/SetScenarioInfo");
    expect(String(url)).not.toContain("api_key");
    expect((init as RequestInit).method).toBe("POST");
    const body = (init as RequestInit).body as URLSearchParams;
    expect(body.get("script")).toBe(bigScript);
    expect(body.get("scenario_id")).toBe("1");
    expect(body.get("api_key")).toBe("test-key-456");
  });

  it("surfaces API error (HTTP 200 + error body) as value", async () => {
    vi.spyOn(globalThis, "fetch").mockResolvedValueOnce(
      new Response(JSON.stringify({ error: { msg: "Forbidden", code: 403 } }), { status: 200 }),
    );

    const { voxGet } = await import("../src/client.js");
    const res = await voxGet("GetAccountInfo");
    expect(res.data).toBeNull();
    expect(res.error).toContain("Forbidden");
  });

  it("retries on 429 then succeeds", async () => {
    const fetchSpy = vi.spyOn(globalThis, "fetch")
      .mockResolvedValueOnce(new Response("", { status: 429 }))
      .mockResolvedValueOnce(new Response(JSON.stringify({ result: "ok" }), { status: 200 }));

    const { voxGet } = await import("../src/client.js");
    const res = await voxGet("Test");
    expect(fetchSpy).toHaveBeenCalledTimes(2);
    expect(res).toEqual({ data: { result: "ok" }, error: null });
  });

  it("POST is NOT retried on 5xx (non-idempotent)", async () => {
    const fetchSpy = vi.spyOn(globalThis, "fetch").mockResolvedValue(
      new Response("", { status: 503 }),
    );
    const { voxPost } = await import("../src/client.js");
    const res = await voxPost("SendSmsMessage", { destination: "+79001234567" });
    expect(fetchSpy).toHaveBeenCalledTimes(1);
    expect(res.data).toBeNull();
    expect(res.error).toBeTruthy();
  });
});
