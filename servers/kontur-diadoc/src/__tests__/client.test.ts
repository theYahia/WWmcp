import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import { DiadocError, authenticate, clearToken, diadocGet, diadocPost } from "../client.js";

/** Build a minimal fetch Response stand-in. */
function res(status: number, body = "", statusText = ""): Response {
  return {
    ok: status >= 200 && status < 300,
    status,
    statusText,
    text: async () => body,
  } as unknown as Response;
}

const fetchMock = vi.fn();

beforeEach(() => {
  vi.stubGlobal("fetch", fetchMock);
  fetchMock.mockReset();
  clearToken();
  process.env.DIADOC_API_CLIENT_ID = "dev-key-123";
  process.env.DIADOC_LOGIN = "user@example.com";
  process.env.DIADOC_PASSWORD = "secret";
  delete process.env.DIADOC_CLIENT_ID;
  delete process.env.DIADOC_BASE_URL;
});

afterEach(() => {
  vi.unstubAllGlobals();
  vi.useRealTimers();
});

describe("authenticate", () => {
  it("POSTs to /V3/Authenticate?type=password with the DiadocAuth header and trims the token", async () => {
    fetchMock.mockResolvedValueOnce(res(200, "  TOKEN-xyz  "));
    const token = await authenticate();
    expect(token).toBe("TOKEN-xyz");

    const [url, init] = fetchMock.mock.calls[0];
    expect(url).toContain("/V3/Authenticate?type=password");
    expect(init.method).toBe("POST");
    expect(init.headers.Authorization).toBe("DiadocAuth ddauth_api_client_id=dev-key-123");
    expect(JSON.parse(init.body)).toEqual({ login: "user@example.com", password: "secret" });
  });

  it("caches the token across calls", async () => {
    fetchMock.mockResolvedValueOnce(res(200, "TOKEN-1"));
    await authenticate();
    await authenticate();
    expect(fetchMock).toHaveBeenCalledTimes(1);
  });

  it("throws a clear error when credentials are missing", async () => {
    delete process.env.DIADOC_API_CLIENT_ID;
    await expect(authenticate()).rejects.toThrow(/Missing required Diadoc credentials/);
  });
});

describe("diadocGet", () => {
  it("sends the ddauth_token in the Authorization header and parses JSON", async () => {
    fetchMock
      .mockResolvedValueOnce(res(200, "TOKEN-1"))
      .mockResolvedValueOnce(res(200, JSON.stringify({ ok: true })));

    const result = await diadocGet("/GetX", { a: "1" });
    expect(result).toEqual({ ok: true });

    const [url, init] = fetchMock.mock.calls[1];
    expect(url).toContain("/GetX?a=1");
    expect(init.headers.Authorization).toBe(
      "DiadocAuth ddauth_api_client_id=dev-key-123,ddauth_token=TOKEN-1",
    );
  });

  it("re-authenticates once and retries on 401", async () => {
    fetchMock
      .mockResolvedValueOnce(res(200, "TOKEN-1")) // initial auth
      .mockResolvedValueOnce(res(401, "expired")) // GET -> 401
      .mockResolvedValueOnce(res(200, "TOKEN-2")) // re-auth
      .mockResolvedValueOnce(res(200, JSON.stringify({ ok: true }))); // GET retry

    const result = await diadocGet("/GetX");
    expect(result).toEqual({ ok: true });
    expect(fetchMock).toHaveBeenCalledTimes(4);
    expect(fetchMock.mock.calls[3][1].headers.Authorization).toContain("ddauth_token=TOKEN-2");
  });

  it("throws DiadocError carrying the status and detail on a 4xx", async () => {
    fetchMock
      .mockResolvedValueOnce(res(200, "TOKEN-1"))
      .mockResolvedValueOnce(res(400, "bad request detail", "Bad Request"));

    const error = (await diadocGet("/GetX").catch((e) => e)) as DiadocError;
    expect(error).toBeInstanceOf(DiadocError);
    expect(error.status).toBe(400);
    expect(error.message).toContain("bad request detail");
  });

  it("backs off and retries on 5xx, then succeeds", async () => {
    vi.useFakeTimers();
    fetchMock
      .mockResolvedValueOnce(res(200, "TOKEN-1"))
      .mockResolvedValueOnce(res(500, "", "Server Error"))
      .mockResolvedValueOnce(res(200, JSON.stringify({ ok: true })));

    const pending = diadocGet("/GetX");
    await vi.runAllTimersAsync();
    await expect(pending).resolves.toEqual({ ok: true });
  });
});

describe("diadocPost", () => {
  it("does not retry a 5xx — the document may already have been sent", async () => {
    fetchMock
      .mockResolvedValueOnce(res(200, "TOKEN-1"))
      .mockResolvedValueOnce(res(500, "", "Server Error"));

    const error = (await diadocPost("/V3/PostMessage", {}).catch((e) => e)) as DiadocError;
    expect(error).toBeInstanceOf(DiadocError);
    expect(error.status).toBe(500);
    expect(fetchMock).toHaveBeenCalledTimes(2);
  });
});
