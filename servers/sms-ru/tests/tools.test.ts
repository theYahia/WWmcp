import { describe, it, expect, vi, beforeEach } from "vitest";

// Mock fetch globally before importing modules
const mockFetch = vi.fn();
vi.stubGlobal("fetch", mockFetch);

// Set API key
process.env.SMS_RU_API_ID = "test-api-key";

import {
  handleSendSms,
  handleCheckStatus,
  handleGetBalance,
  handleGetCost,
  handleGetSenders,
} from "../src/tools/sms.js";

// BaseHttpClient ядра читает тело через response.text() и сам парсит JSON.
function fakeResponse(body: unknown, status = 200) {
  return Promise.resolve({
    ok: status >= 200 && status < 300,
    status,
    statusText: "OK",
    text: () => Promise.resolve(JSON.stringify(body)),
    headers: new Headers(),
  });
}

beforeEach(() => {
  mockFetch.mockReset();
});

describe("send_sms", () => {
  it("sends SMS and returns result", async () => {
    const body = {
      status: "OK",
      status_code: 100,
      sms: { "79001234567": { status: "OK", status_code: 100, sms_id: "abc123" } },
      balance: 500,
    };
    mockFetch.mockReturnValueOnce(fakeResponse(body));

    const result = JSON.parse(await handleSendSms({ to: "79001234567", msg: "Привет" }));
    expect(result.status).toBe("OK");
    expect(result.sms["79001234567"].sms_id).toBe("abc123");

    const url = mockFetch.mock.calls[0][0] as string;
    expect(url).toContain("sms/send");
    expect(url).toContain("to=79001234567");
    expect(url).toContain("api_id=test-api-key");
  });

  it("includes optional from parameter", async () => {
    mockFetch.mockReturnValueOnce(fakeResponse({ status: "OK", status_code: 100 }));
    await handleSendSms({ to: "79001234567", msg: "Hi", from: "MyApp" });

    const url = mockFetch.mock.calls[0][0] as string;
    expect(url).toContain("from=MyApp");
  });
});

describe("check_status", () => {
  it("checks SMS status", async () => {
    const body = {
      status: "OK",
      status_code: 100,
      sms: { "abc123": { status: "OK", status_code: 100, status_text: "Доставлено" } },
    };
    mockFetch.mockReturnValueOnce(fakeResponse(body));

    const result = JSON.parse(await handleCheckStatus({ sms_id: "abc123" }));
    expect(result.sms["abc123"].status_text).toBe("Доставлено");

    const url = mockFetch.mock.calls[0][0] as string;
    expect(url).toContain("sms/status");
    expect(url).toContain("sms_id=abc123");
  });
});

describe("get_balance", () => {
  it("returns balance", async () => {
    const body = { status: "OK", status_code: 100, balance: 1234.56 };
    mockFetch.mockReturnValueOnce(fakeResponse(body));

    const result = JSON.parse(await handleGetBalance({}));
    expect(result.balance).toBe(1234.56);

    const url = mockFetch.mock.calls[0][0] as string;
    expect(url).toContain("my/balance");
  });
});

describe("get_cost", () => {
  it("calculates SMS cost", async () => {
    const body = { status: "OK", status_code: 100, total_cost: 2.5, total_sms: 1 };
    mockFetch.mockReturnValueOnce(fakeResponse(body));

    const result = JSON.parse(await handleGetCost({ to: "79001234567", msg: "Тест" }));
    expect(result.total_cost).toBe(2.5);

    const url = mockFetch.mock.calls[0][0] as string;
    expect(url).toContain("sms/cost");
    expect(url).toContain("to=79001234567");
  });
});

describe("get_senders", () => {
  it("returns senders list", async () => {
    const body = { status: "OK", status_code: 100, senders: ["MyApp", "TestCo"] };
    mockFetch.mockReturnValueOnce(fakeResponse(body));

    const result = JSON.parse(await handleGetSenders({}));
    expect(result.senders).toEqual(["MyApp", "TestCo"]);

    const url = mockFetch.mock.calls[0][0] as string;
    expect(url).toContain("my/senders");
  });
});

describe("client retries", () => {
  it("retries on 500", async () => {
    mockFetch
      .mockReturnValueOnce(fakeResponse(null, 500))
      .mockReturnValueOnce(fakeResponse({ status: "OK", status_code: 100, balance: 100 }));

    const result = JSON.parse(await handleGetBalance({}));
    expect(result.balance).toBe(100);
    expect(mockFetch).toHaveBeenCalledTimes(2);
  });

  it("does not retry send_sms on 500 (a repeat would send a second paid SMS)", async () => {
    mockFetch.mockReturnValue(fakeResponse(null, 500));

    await expect(handleSendSms({ to: "79001234567", msg: "Hi" })).rejects.toThrow("HTTP 500");
    expect(mockFetch).toHaveBeenCalledTimes(1);
  });

  it("throws without API key", async () => {
    const saved = process.env.SMS_RU_API_ID;
    delete process.env.SMS_RU_API_ID;
    // Need to re-import to test, but the check is in smsRuGet at call time
    const { smsRuGet } = await import("../src/client.js");
    await expect(smsRuGet("test")).rejects.toThrow("SMS_RU_API_ID");
    process.env.SMS_RU_API_ID = saved;
  });
});
