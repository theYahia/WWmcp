import { describe, it, expect, vi, beforeEach } from "vitest";

// Mock the client module
vi.mock("../src/client.js", () => ({
  mangoPost: vi.fn(),
}));

const { mangoPost } = await import("../src/client.js");
const mockedPost = vi.mocked(mangoPost);

const {
  handleGetCalls,
  handleGetUsers,
  handleMakeCall,
  handleGetStats,
  handleGetRecording,
  handleSendSms,
} = await import("../src/tools/calls.js");

describe("tools", () => {
  beforeEach(() => {
    mockedPost.mockReset();
  });

  it("handleGetCalls sends correct params", async () => {
    mockedPost.mockResolvedValueOnce({ records: [] });
    const result = await handleGetCalls({ date_from: "1000", date_to: "2000", limit: 10 });
    const parsed = JSON.parse(result);
    expect(parsed.records).toEqual([]);
    expect(mockedPost).toHaveBeenCalledWith("stats/request", {
      date_from: "1000",
      date_to: "2000",
      limit: 10,
    });
  });

  it("handleGetUsers sends correct params", async () => {
    mockedPost.mockResolvedValueOnce({ users: [{ name: "Test" }] });
    const result = await handleGetUsers({ limit: 50 });
    const parsed = JSON.parse(result);
    expect(parsed.users).toHaveLength(1);
    expect(mockedPost).toHaveBeenCalledWith("config/users/request", { limit: 50 });
  });

  it("handleMakeCall sends callback command", async () => {
    mockedPost.mockResolvedValueOnce({ result: 1000 });
    const result = await handleMakeCall({ from: "101", to: "+79001234567" });
    const parsed = JSON.parse(result);
    expect(parsed.result).toBe(1000);
    expect(mockedPost).toHaveBeenCalledWith("commands/callback", expect.objectContaining({
      from: { extension: "101" },
      to_number: "+79001234567",
    }));
  });

  it("handleGetStats sends stats request", async () => {
    mockedPost.mockResolvedValueOnce({ records: [], total: 0 });
    const result = await handleGetStats({ date_from: "1000", date_to: "2000" });
    expect(JSON.parse(result).total).toBe(0);
  });

  it("handleGetRecording sends recording request", async () => {
    mockedPost.mockResolvedValueOnce({ url: "https://example.com/rec.mp3" });
    const result = await handleGetRecording({ recording_id: "rec123", action: "play" });
    expect(JSON.parse(result).url).toContain("rec.mp3");
  });

  it("handleSendSms sends sms command", async () => {
    mockedPost.mockResolvedValueOnce({ result: 1000 });
    const result = await handleSendSms({
      from_extension: "101",
      to_number: "+79001234567",
      text: "Тест",
    });
    expect(JSON.parse(result).result).toBe(1000);
    expect(mockedPost).toHaveBeenCalledWith("commands/sms", expect.objectContaining({
      from_extension: "101",
      to_number: "+79001234567",
      text: "Тест",
    }));
  });
});
