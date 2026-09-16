import { describe, it, expect, vi, beforeEach } from "vitest";

// Mock fetch globally before imports
const mockFetch = vi.fn();
vi.stubGlobal("fetch", mockFetch);

function mockApiResponse(data: unknown) {
  mockFetch.mockResolvedValueOnce({
    ok: true,
    // core's BaseHttpClient reads the body via text(), not json()
    text: () => Promise.resolve(JSON.stringify(data)),
    status: 200,
  });
}

describe("client", () => {
  beforeEach(() => {
    vi.resetModules();
    mockFetch.mockReset();
    process.env.SUPERJOB_SECRET_KEY = "test-key-123";
    process.env.SUPERJOB_APP_ID = "test-app-id";
  });

  it("throws when no API key", async () => {
    delete process.env.SUPERJOB_SECRET_KEY;
    delete process.env.SUPERJOB_API_KEY;
    const { sjGet } = await import("../src/client.js");
    await expect(sjGet("/vacancies/")).rejects.toThrow("SUPERJOB_SECRET_KEY");
  });

  it("sends correct headers", async () => {
    mockApiResponse({ objects: [] });
    const { sjGet } = await import("../src/client.js");
    await sjGet("/vacancies/");
    expect(mockFetch).toHaveBeenCalledWith(
      "https://api.superjob.ru/2.0/vacancies/",
      expect.objectContaining({
        headers: expect.objectContaining({
          "X-Api-App-Id": "test-key-123",
          "X-Api-App-Secret": "test-app-id",
        }),
      })
    );
  });

  it("falls back to SUPERJOB_API_KEY", async () => {
    delete process.env.SUPERJOB_SECRET_KEY;
    process.env.SUPERJOB_API_KEY = "legacy-key";
    mockApiResponse({ ok: true });
    const { sjGet } = await import("../src/client.js");
    await sjGet("/test/");
    expect(mockFetch).toHaveBeenCalledWith(
      expect.any(String),
      expect.objectContaining({
        headers: expect.objectContaining({ "X-Api-App-Id": "legacy-key" }),
      })
    );
  });
});

describe("search_vacancies", () => {
  beforeEach(() => {
    mockFetch.mockReset();
    process.env.SUPERJOB_SECRET_KEY = "test-key";
  });

  it("builds query string correctly", async () => {
    mockApiResponse({ objects: [], total: 0, more: false });
    const { handleSearchVacancies } = await import("../src/tools/vacancies.js");
    const result = await handleSearchVacancies({
      keyword: "Python",
      town: 4,
      payment_from: 200000,
      count: 10,
    });
    const parsed = JSON.parse(result);
    expect(parsed).toHaveProperty("total", 0);

    const url = mockFetch.mock.calls[0][0] as string;
    expect(url).toContain("keyword=Python");
    expect(url).toContain("town=4");
    expect(url).toContain("payment_from=200000");
    expect(url).toContain("count=10");
  });
});

describe("get_vacancy", () => {
  beforeEach(() => {
    mockFetch.mockReset();
    process.env.SUPERJOB_SECRET_KEY = "test-key";
  });

  it("fetches by id", async () => {
    mockApiResponse({ id: 12345, profession: "Разработчик" });
    const { handleGetVacancy } = await import("../src/tools/vacancies.js");
    const result = await handleGetVacancy({ id: 12345 });
    expect(JSON.parse(result)).toHaveProperty("id", 12345);
    expect(mockFetch.mock.calls[0][0]).toContain("/vacancies/12345/");
  });
});

describe("search_employers", () => {
  beforeEach(() => {
    mockFetch.mockReset();
    process.env.SUPERJOB_SECRET_KEY = "test-key";
  });

  it("builds employer query", async () => {
    mockApiResponse({ objects: [], total: 0 });
    const { handleSearchEmployers } = await import("../src/tools/employers.js");
    const result = await handleSearchEmployers({ keyword: "Яндекс", count: 5, page: 0 });
    expect(JSON.parse(result)).toHaveProperty("total", 0);
    const url = mockFetch.mock.calls[0][0] as string;
    expect(url).toContain("/employers/");
    expect(url).toContain("keyword=");
  });
});

describe("get_towns", () => {
  beforeEach(() => {
    mockFetch.mockReset();
    process.env.SUPERJOB_SECRET_KEY = "test-key";
  });

  it("fetches towns with keyword", async () => {
    mockApiResponse({ objects: [{ id: 4, title: "Москва" }] });
    const { handleGetTowns } = await import("../src/tools/towns.js");
    const result = await handleGetTowns({ keyword: "Москва", all: false });
    expect(JSON.parse(result).objects[0].title).toBe("Москва");
    expect(mockFetch.mock.calls[0][0]).toContain("/towns/");
  });
});

describe("get_professions", () => {
  beforeEach(() => {
    mockFetch.mockReset();
    process.env.SUPERJOB_SECRET_KEY = "test-key";
  });

  it("fetches catalogues", async () => {
    mockApiResponse([{ id: 1, title: "IT" }]);
    const { handleGetProfessions } = await import("../src/tools/professions.js");
    const result = await handleGetProfessions({ keyword: "IT" });
    expect(JSON.parse(result)[0].title).toBe("IT");
    expect(mockFetch.mock.calls[0][0]).toContain("/catalogues/");
  });
});

describe("createServer", () => {
  it("creates server with 5 tools", async () => {
    // server.ts, not index.ts: the entry point starts the stdio transport on import
    const { createServer, TOOL_COUNT } = await import("../src/server.js");
    const server = createServer();
    expect(server).toBeDefined();
    expect(TOOL_COUNT).toBe(5);
  });
});
