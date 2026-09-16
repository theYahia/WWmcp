import { describe, it, expect, vi, beforeEach } from "vitest";
import type { ToolResult } from "../src/lib/formatters.js";

vi.mock("../src/client.js", () => ({
  voxGet: vi.fn(),
  voxPost: vi.fn(),
}));

import { voxGet } from "../src/client.js";
const mockVoxGet = vi.mocked(voxGet);

function parse(res: ToolResult): Record<string, unknown> {
  return JSON.parse(res.content[0].text);
}
const ok = (data: unknown) => ({ data, error: null } as const);

beforeEach(() => mockVoxGet.mockReset());

describe("skills", () => {
  it("skill-call-history returns 24h summary", async () => {
    mockVoxGet.mockResolvedValueOnce(ok({ result: [{ call_id: 1 }, { call_id: 2 }], total_count: 2 }));
    const { skillCallHistory } = await import("../src/skills/call-history.js");
    const result = parse(await skillCallHistory.run());
    expect(result.title).toBe("История звонков (24ч)");
    expect(result.total_count).toBe(2);
    expect(result.calls).toHaveLength(2);
  });

  it("skill-account-info returns account data WITHOUT leaking api_key", async () => {
    mockVoxGet.mockResolvedValueOnce(ok({ result: { account_id: 123, account_name: "test", api_key: "SECRET" } }));
    const { skillAccountInfo } = await import("../src/skills/account-info.js");
    const res = await skillAccountInfo.run();
    const result = parse(res) as { title: string; result: Record<string, unknown> };
    expect(result.title).toBe("Информация об аккаунте Voximplant");
    expect(result.result.account_id).toBe(123);
    expect(result.result.api_key).toBeUndefined();
    expect(res.content[0].text).not.toContain("SECRET");
  });
});
