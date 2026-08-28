import { describe, it, expect, vi, beforeEach, afterEach } from "vitest";
import { exolvePost, resetClient } from "../src/client.js";

describe("mts-exolve client", () => {
  const originalEnv = { ...process.env };

  beforeEach(() => {
    process.env["MTS_EXOLVE_TOKEN"] = "test-token";
    resetClient();
  });

  afterEach(() => {
    process.env = { ...originalEnv };
    vi.restoreAllMocks();
    resetClient();
  });

  it("posts to the Exolve base URL with Bearer auth", async () => {
    const fetchMock = vi.fn().mockResolvedValue({
      ok: true,
      text: () => Promise.resolve(JSON.stringify({ message_id: "m-1" })),
      headers: new Map(),
    });
    vi.stubGlobal("fetch", fetchMock);

    const result = await exolvePost("/sms/send", {
      number: "79001234567",
      destination: "79007654321",
      text: "привет",
    });

    const [url, opts] = fetchMock.mock.calls[0];
    expect(url).toBe("https://api.exolve.ru/v1/sms/send");
    expect(opts.method).toBe("POST");
    expect(new Headers(opts.headers).get("Authorization")).toBe("Bearer test-token");
    expect(JSON.parse(opts.body).text).toBe("привет");
    expect(result).toEqual({ message_id: "m-1" });
  });

  it("throws an actionable error when MTS_EXOLVE_TOKEN is missing", async () => {
    delete process.env["MTS_EXOLVE_TOKEN"];
    resetClient();
    await expect(exolvePost("/sms/send", {})).rejects.toThrow("MTS_EXOLVE_TOKEN");
  });
});
