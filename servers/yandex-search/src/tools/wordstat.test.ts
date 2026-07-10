import { describe, it, expect, vi, beforeEach } from "vitest";

const cloudPost = vi.fn();
vi.mock("../client.js", () => ({ cloudPost: (...a: unknown[]) => cloudPost(...a) }));

const { handleWordstatTopRequests } = await import("./wordstat.js");

describe("handleWordstatTopRequests", () => {
  beforeEach(() => cloudPost.mockReset());

  // Регресс: тело без num_phrases → API отвечает
  // «num_phrases: Value must be in the range of 1 to 2000» (HTTP 400).
  it("шлёт num_phrases = limit", async () => {
    cloudPost.mockResolvedValue({ results: [{ phrase: "mcp для 1с", count: "612" }] });
    await handleWordstatTopRequests({ phrase: "1с mcp", limit: 8 });

    const [path, body] = cloudPost.mock.calls[0];
    expect(path).toBe("/v2/wordstat/topRequests");
    expect(body).toEqual({ phrase: "1с mcp", num_phrases: 8 });
  });

  it("пустой ответ → человекочитаемое сообщение, не падение", async () => {
    cloudPost.mockResolvedValue({ results: [] });
    await expect(handleWordstatTopRequests({ phrase: "щьжкх", limit: 5 })).resolves.toMatch(/не нашёл/);
  });

  // Регресс: у нулевой частотности API отдаёт 200 вообще без поля results → .slice() кидал TypeError.
  it("ответ без поля results → сообщение, не TypeError", async () => {
    cloudPost.mockResolvedValue({});
    await expect(handleWordstatTopRequests({ phrase: "ночной рой агентов", limit: 3 })).resolves.toMatch(/не нашёл/);
  });
});
