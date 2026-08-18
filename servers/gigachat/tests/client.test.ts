import { describe, it, expect, vi, beforeEach, afterEach } from "vitest";
import { GigaChatAuthStrategy } from "../src/client.js";

/** Covers the one piece of logic this server owns: Sber's non-RFC OAuth handshake. */

function tokenResponse(token: string, expiresAt: number): Response {
  return {
    ok: true,
    status: 200,
    statusText: "OK",
    json: async () => ({ access_token: token, expires_at: expiresAt }),
    text: async () => "",
  } as unknown as Response;
}

const FAR_FUTURE = Date.now() + 30 * 60_000;

describe("GigaChatAuthStrategy", () => {
  const originalEnv = { ...process.env };
  let fetchMock: ReturnType<typeof vi.fn>;

  beforeEach(() => {
    process.env.GIGACHAT_AUTH_KEY = "base64-key";
    delete process.env.GIGACHAT_SCOPE;
    fetchMock = vi.fn(async () => tokenResponse("tok-1", FAR_FUTURE));
    vi.stubGlobal("fetch", fetchMock);
  });

  afterEach(() => {
    vi.unstubAllGlobals();
    process.env = { ...originalEnv };
  });

  it("sends Basic auth key, RqUID and the scope body Sber requires", async () => {
    await new GigaChatAuthStrategy().getToken();

    expect(fetchMock).toHaveBeenCalledTimes(1);
    const [url, init] = fetchMock.mock.calls[0] as [string, RequestInit];
    expect(url).toBe("https://ngw.devices.sberbank.ru:9443/api/v2/oauth");
    const headers = init.headers as Record<string, string>;
    expect(headers.Authorization).toBe("Basic base64-key");
    expect(headers.RqUID).toMatch(/^[0-9a-f-]{36}$/);
    expect(init.body).toBe("scope=GIGACHAT_API_PERS");
  });

  it("honours GIGACHAT_SCOPE for B2B/CORP accounts", async () => {
    process.env.GIGACHAT_SCOPE = "GIGACHAT_API_B2B";
    await new GigaChatAuthStrategy().getToken();
    const [, init] = fetchMock.mock.calls[0] as [string, RequestInit];
    expect(init.body).toBe("scope=GIGACHAT_API_B2B");
  });

  it("caches the token, and refetches after invalidate()", async () => {
    const auth = new GigaChatAuthStrategy();
    await auth.getToken();
    await auth.getToken();
    expect(fetchMock).toHaveBeenCalledTimes(1);

    auth.invalidate();
    await auth.getToken();
    expect(fetchMock).toHaveBeenCalledTimes(2);
  });

  it("refetches a token that expires inside the 60s safety buffer", async () => {
    fetchMock.mockResolvedValue(tokenResponse("tok-short", Date.now() + 10_000));
    const auth = new GigaChatAuthStrategy();
    await auth.getToken();
    await auth.getToken();
    expect(fetchMock).toHaveBeenCalledTimes(2);
  });

  it("deduplicates concurrent refreshes into one token request", async () => {
    const auth = new GigaChatAuthStrategy();
    await Promise.all([auth.getToken(), auth.getToken(), auth.getToken()]);
    expect(fetchMock).toHaveBeenCalledTimes(1);
  });

  it("applies the token as a Bearer header without dropping existing ones", async () => {
    const init = await new GigaChatAuthStrategy().authenticate({
      headers: { Accept: "application/json" },
    });
    const headers = new Headers(init.headers);
    expect(headers.get("authorization")).toBe("Bearer tok-1");
    expect(headers.get("accept")).toBe("application/json");
  });

  it("fails loudly when GIGACHAT_AUTH_KEY is missing", async () => {
    delete process.env.GIGACHAT_AUTH_KEY;
    await expect(new GigaChatAuthStrategy().getToken()).rejects.toThrow(
      /GIGACHAT_AUTH_KEY/,
    );
    expect(fetchMock).not.toHaveBeenCalled();
  });

  it("surfaces an OAuth rejection as an ApiError carrying the status", async () => {
    fetchMock.mockResolvedValue({
      ok: false,
      status: 401,
      statusText: "Unauthorized",
      text: async () => "bad key",
    } as unknown as Response);

    await expect(new GigaChatAuthStrategy().getToken()).rejects.toMatchObject({
      status: 401,
    });
  });
});
