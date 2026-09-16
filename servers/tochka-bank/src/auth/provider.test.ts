import { mkdtempSync, readFileSync, rmSync, writeFileSync } from "node:fs";
import { tmpdir } from "node:os";
import { join } from "node:path";
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import { OAuthAuthProvider } from "./provider.js";

const cfg = {
  clientId: "cid",
  clientSecret: "secret",
  baseUrl: "https://enter.tochka.com/uapi",
};

function tokenRes(json: unknown): Response {
  return {
    ok: true,
    status: 200,
    headers: { get: () => null },
    json: async () => json,
    text: async () => JSON.stringify(json),
  } as unknown as Response;
}

describe("OAuthAuthProvider", () => {
  let dir: string;
  let store: string;

  beforeEach(() => {
    dir = mkdtempSync(join(tmpdir(), "tochka-"));
    store = join(dir, "tokens.json");
    vi.restoreAllMocks();
    process.env.TOCHKA_REFRESH_TOKEN = undefined;
    delete process.env.TOCHKA_REFRESH_TOKEN;
  });

  afterEach(() => {
    rmSync(dir, { recursive: true, force: true });
  });

  it("caches the access token across calls (single refresh)", async () => {
    writeFileSync(store, JSON.stringify({ refreshToken: "r1" }));
    const fm = vi
      .spyOn(globalThis, "fetch")
      .mockResolvedValue(tokenRes({ access_token: "a1", expires_in: 3600, refresh_token: "r2" }));
    const provider = new OAuthAuthProvider(cfg, store);

    expect(await provider.getAccessToken()).toBe("a1");
    expect(await provider.getAccessToken()).toBe("a1");
    expect(fm).toHaveBeenCalledTimes(1);
  });

  it("rotates and persists the refresh token", async () => {
    writeFileSync(store, JSON.stringify({ refreshToken: "r1" }));
    vi.spyOn(globalThis, "fetch").mockResolvedValue(
      tokenRes({ access_token: "a1", expires_in: 3600, refresh_token: "r2" }),
    );
    const provider = new OAuthAuthProvider(cfg, store);

    await provider.getAccessToken();

    const saved = JSON.parse(readFileSync(store, "utf8"));
    expect(saved.refreshToken).toBe("r2");
    expect(saved.accessToken).toBe("a1");
  });

  it("collapses concurrent refreshes into one request", async () => {
    writeFileSync(store, JSON.stringify({ refreshToken: "r1" }));
    const fm = vi
      .spyOn(globalThis, "fetch")
      .mockResolvedValue(tokenRes({ access_token: "a1", expires_in: 3600 }));
    const provider = new OAuthAuthProvider(cfg, store);

    const [t1, t2] = await Promise.all([provider.getAccessToken(), provider.getAccessToken()]);

    expect(t1).toBe("a1");
    expect(t2).toBe("a1");
    expect(fm).toHaveBeenCalledTimes(1);
  });

  it("uses TOCHKA_REFRESH_TOKEN when the store is empty", async () => {
    process.env.TOCHKA_REFRESH_TOKEN = "env-refresh";
    let sentBody = "";
    vi.spyOn(globalThis, "fetch").mockImplementation(async (_url, init) => {
      sentBody = (init as RequestInit).body?.toString() ?? "";
      return tokenRes({ access_token: "a1", expires_in: 3600 });
    });
    const provider = new OAuthAuthProvider(cfg, store);

    expect(await provider.getAccessToken()).toBe("a1");
    expect(sentBody).toContain("env-refresh");
  });

  it("throws a helpful error when no refresh token exists", async () => {
    const provider = new OAuthAuthProvider(cfg, store);
    await expect(provider.getAccessToken()).rejects.toThrow(/auth/i);
  });

  it("reuses a still-valid persisted access token without refreshing", async () => {
    writeFileSync(
      store,
      JSON.stringify({
        refreshToken: "r1",
        accessToken: "cached",
        accessTokenExpiresAt: Date.now() + 3_600_000,
      }),
    );
    const fm = vi.spyOn(globalThis, "fetch");
    const provider = new OAuthAuthProvider(cfg, store);

    expect(await provider.getAccessToken()).toBe("cached");
    expect(fm).not.toHaveBeenCalled();
  });
});
