import { describe, it, expect, vi, beforeEach } from "vitest";
import type { ToolResult } from "../src/lib/formatters.js";

vi.mock("../src/client.js", () => ({
  voxGet: vi.fn(),
  voxPost: vi.fn(),
}));

import { voxGet, voxPost } from "../src/client.js";
const mockVoxGet = vi.mocked(voxGet);
const mockVoxPost = vi.mocked(voxPost);

/** Достаёт JSON из ToolResult.content[0].text. */
function parse(res: ToolResult): Record<string, unknown> {
  return JSON.parse(res.content[0].text);
}
/** ApiResult-успех. */
const ok = (data: unknown) => ({ data, error: null } as const);

beforeEach(() => {
  mockVoxGet.mockReset();
  mockVoxPost.mockReset();
});

describe("tools — existing (refactored)", () => {
  it("handleGetCallHistory passes correct params", async () => {
    mockVoxGet.mockResolvedValueOnce(ok({ result: [], total_count: 0 }));
    const { handleGetCallHistory } = await import("../src/tools/calls.js");
    const res = await handleGetCallHistory({
      from_date: "2025-01-01 00:00:00",
      to_date: "2025-01-02 00:00:00",
      count: 10,
      offset: 0,
    });
    expect(mockVoxGet).toHaveBeenCalledWith("GetCallHistory", {
      from_date: "2025-01-01 00:00:00",
      to_date: "2025-01-02 00:00:00",
      count: "10",
      offset: "0",
    });
    expect(parse(res)).toHaveProperty("total_count", 0);
  });

  it("handleGetUsers passes correct params", async () => {
    mockVoxGet.mockResolvedValueOnce(ok({ result: [{ user_id: 1 }] }));
    const { handleGetUsers } = await import("../src/tools/calls.js");
    const res = await handleGetUsers({ count: 5, offset: 0 });
    expect(mockVoxGet).toHaveBeenCalledWith("GetUsers", { count: "5", offset: "0" });
    expect((parse(res).result as unknown[])).toHaveLength(1);
  });

  it("handleSendSms uses POST (long body must not go in URL query)", async () => {
    mockVoxPost.mockResolvedValueOnce(ok({ result: 1 }));
    const { handleSendSms } = await import("../src/tools/calls.js");
    const res = await handleSendSms({
      source: "MyBrand",
      destination: "+79007654321",
      sms_body: "Test",
    });
    expect(mockVoxPost).toHaveBeenCalledWith("SendSmsMessage", {
      source: "MyBrand",
      destination: "+79007654321",
      sms_body: "Test",
    });
    expect(mockVoxGet).not.toHaveBeenCalled();
    expect(parse(res)).toHaveProperty("result", 1);
  });

  it("handleGetScenarios works + scenario_name filter", async () => {
    mockVoxGet.mockResolvedValueOnce(ok({ result: [{ scenario_id: 1 }] }));
    const { handleGetScenarios } = await import("../src/tools/scenarios.js");
    await handleGetScenarios({ count: 10, offset: 0 });
    expect(mockVoxGet).toHaveBeenCalledWith("GetScenarios", { count: "10", offset: "0" });

    mockVoxGet.mockResolvedValueOnce(ok({ result: [] }));
    await handleGetScenarios({ count: 10, offset: 0, scenario_name: "my-scenario" });
    expect(mockVoxGet).toHaveBeenLastCalledWith("GetScenarios", {
      count: "10",
      offset: "0",
      scenario_name: "my-scenario",
    });
  });

  it("handleGetRules works", async () => {
    mockVoxGet.mockResolvedValueOnce(ok({ result: [{ rule_id: 1 }] }));
    const { handleGetRules } = await import("../src/tools/rules.js");
    const res = await handleGetRules({ application_id: 42, count: 10, offset: 0 });
    expect(mockVoxGet).toHaveBeenCalledWith("GetRules", { application_id: "42", count: "10", offset: "0" });
    expect((parse(res).result as unknown[])).toHaveLength(1);
  });

  it("handleGetRecordings sets with_records=1 via GetCallHistory", async () => {
    mockVoxGet.mockResolvedValueOnce(ok({ result: [] }));
    const { handleGetRecordings } = await import("../src/tools/recordings.js");
    await handleGetRecordings({ from_date: "2025-01-01 00:00:00", to_date: "2025-01-02 00:00:00", count: 20, offset: 0 });
    expect(mockVoxGet).toHaveBeenCalledWith("GetCallHistory", {
      from_date: "2025-01-01 00:00:00",
      to_date: "2025-01-02 00:00:00",
      with_records: "1",
      count: "20",
      offset: "0",
    });
  });
});

describe("tools — bug fixes", () => {
  it("get_account_info redacts api_key / callback_salt (security)", async () => {
    mockVoxGet.mockResolvedValueOnce(
      ok({ result: { account_id: 123, account_name: "acme", api_key: "SECRET-KEY", callback_salt: "SALT" } }),
    );
    const { handleGetAccountInfo } = await import("../src/tools/accounts.js");
    const res = await handleGetAccountInfo();
    expect(mockVoxGet).toHaveBeenCalledWith("GetAccountInfo", { return_live_balance: "true" });
    const parsed = parse(res) as { result: Record<string, unknown> };
    expect(parsed.result.account_id).toBe(123);
    expect(parsed.result.api_key).toBeUndefined();
    expect(parsed.result.callback_salt).toBeUndefined();
    // и в сыром тексте секрета быть не должно
    expect(res.content[0].text).not.toContain("SECRET-KEY");
    expect(res.content[0].text).not.toContain("SALT");
  });

  it("get_sms_history uses correct method casing GetSmsHistory (not GetSMSHistory)", async () => {
    mockVoxGet.mockResolvedValueOnce(ok({ result: [] }));
    const { handleGetSmsHistory } = await import("../src/tools/calls-management.js");
    await handleGetSmsHistory({ from_date: "2025-01-01 00:00:00", to_date: "2025-01-02 00:00:00", count: 20, offset: 0 });
    expect(mockVoxGet).toHaveBeenCalledWith("GetSmsHistory", expect.objectContaining({ from_date: "2025-01-01 00:00:00" }));
  });

  it("get_acd_state calls GetACDState (replaces nonexistent GetActiveSessions)", async () => {
    mockVoxGet.mockResolvedValueOnce(ok({ result: [] }));
    const { handleGetAcdState } = await import("../src/tools/calls-management.js");
    await handleGetAcdState({ acd_queue_id: "any" });
    expect(mockVoxGet).toHaveBeenCalledWith("GetACDState", { acd_queue_id: "any" });
  });

  it("start_call routes destination through script_custom_data via POST", async () => {
    mockVoxPost.mockResolvedValueOnce(ok({ result: { call_session_history_id: 1 } }));
    const { handleStartCall } = await import("../src/tools/calls-management.js");
    await handleStartCall({ rule_id: 7, destination: "+79001234567", caller_id: "+74950000000" });
    expect(mockVoxPost).toHaveBeenCalledTimes(1);
    const [method, query] = mockVoxPost.mock.calls[0] as [string, Record<string, string>];
    expect(method).toBe("StartScenarios");
    expect(query.rule_id).toBe("7");
    const custom = JSON.parse(query.script_custom_data) as Record<string, string>;
    expect(custom.destination).toBe("+79001234567");
    expect(custom.caller_id).toBe("+74950000000");
  });

  it("update_scenario uses POST (large script must not go in URL)", async () => {
    mockVoxPost.mockResolvedValueOnce(ok({ result: 1 }));
    const { handleUpdateScenario } = await import("../src/tools/scenarios.js");
    const script = "VoxEngine.addEventListener(/* ... */);".repeat(200);
    await handleUpdateScenario({ scenario_id: 5, script });
    expect(mockVoxPost).toHaveBeenCalledWith("SetScenarioInfo", { scenario_id: "5", script });
    expect(mockVoxGet).not.toHaveBeenCalled();
  });

  it("update_scenario rejects no-op (no script and no name) without calling API", async () => {
    const { handleUpdateScenario } = await import("../src/tools/scenarios.js");
    const res = await handleUpdateScenario({ scenario_id: 5 });
    expect(res.isError).toBe(true);
    expect(mockVoxPost).not.toHaveBeenCalled();
  });
});

describe("tools — new", () => {
  it("get_phone_numbers maps booleans to strings", async () => {
    mockVoxGet.mockResolvedValueOnce(ok({ result: [] }));
    const { handleGetPhoneNumbers } = await import("../src/tools/observability.js");
    await handleGetPhoneNumbers({ sms_supported: true, count: 50, offset: 0 });
    expect(mockVoxGet).toHaveBeenCalledWith("GetPhoneNumbers", { count: "50", offset: "0", sms_supported: "true" });
  });

  it("get_transaction_history passes date range", async () => {
    mockVoxGet.mockResolvedValueOnce(ok({ result: [] }));
    const { handleGetTransactionHistory } = await import("../src/tools/observability.js");
    await handleGetTransactionHistory({ from_date: "2025-01-01 00:00:00", to_date: "2025-02-01 00:00:00", count: 20, offset: 0 });
    expect(mockVoxGet).toHaveBeenCalledWith("GetTransactionHistory", {
      from_date: "2025-01-01 00:00:00",
      to_date: "2025-02-01 00:00:00",
      count: "20",
      offset: "0",
    });
  });

  it("send_a2p_sms joins recipients and uses POST", async () => {
    mockVoxPost.mockResolvedValueOnce(ok({ result: [] }));
    const { handleSendA2pSms } = await import("../src/tools/a2p.js");
    await handleSendA2pSms({ src_number: "BRAND", dst_numbers: ["+79001112233", "+79004445566"], text: "Hi" });
    expect(mockVoxPost).toHaveBeenCalledWith("A2PSendSms", {
      src_number: "BRAND",
      dst_numbers: "+79001112233;+79004445566",
      text: "Hi",
    });
  });
});

describe("tools — error propagation", () => {
  it("returns isError when client yields an error", async () => {
    mockVoxGet.mockResolvedValueOnce({ data: null, error: "Voximplant [403]: Forbidden" });
    const { handleGetUsers } = await import("../src/tools/calls.js");
    const res = await handleGetUsers({ count: 5, offset: 0 });
    expect(res.isError).toBe(true);
    expect(res.content[0].text).toContain("Forbidden");
  });
});
