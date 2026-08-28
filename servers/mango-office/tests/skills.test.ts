import { describe, it, expect, vi, beforeEach } from "vitest";

vi.mock("../src/client.js", () => ({
  mangoPost: vi.fn(),
}));

const { mangoPost } = await import("../src/client.js");
const mockedPost = vi.mocked(mangoPost);

const { skillCallHistory, skillStats } = await import("../src/skills/index.js");

describe("skills", () => {
  beforeEach(() => {
    mockedPost.mockReset();
  });

  describe("skillCallHistory", () => {
    it("returns message when no calls", async () => {
      mockedPost.mockResolvedValueOnce({ records: [] });
      const result = await skillCallHistory();
      expect(result).toBe("Сегодня звонков не было.");
    });

    it("formats calls list", async () => {
      mockedPost.mockResolvedValueOnce({
        records: [
          { from: "101", to: "+79001234567", duration: 120, disconnect_reason: 1110 },
          { from: "+79007654321", to: "102", duration: 0, disconnect_reason: 1100 },
        ],
      });
      const result = await skillCallHistory();
      expect(result).toContain("2 шт.");
      expect(result).toContain("101 → +79001234567");
      expect(result).toContain("отвечен");
      expect(result).toContain("пропущен");
    });
  });

  describe("skillStats", () => {
    it("returns zero stats when no calls", async () => {
      mockedPost.mockResolvedValueOnce({ records: [] });
      const result = await skillStats();
      expect(result).toContain("Всего: 0");
      expect(result).toContain("Отвечено: 0");
    });

    it("calculates stats correctly", async () => {
      mockedPost.mockResolvedValueOnce({
        records: [
          { duration: 60, disconnect_reason: 1110 },
          { duration: 120, disconnect_reason: 1110 },
          { duration: 0, disconnect_reason: 1100 },
        ],
      });
      const result = await skillStats();
      expect(result).toContain("Всего: 3");
      expect(result).toContain("Отвечено: 2");
      expect(result).toContain("Пропущено: 1");
      expect(result).toContain("Общая длительность: 180с");
      expect(result).toContain("Средняя длительность: 60с");
    });
  });
});
