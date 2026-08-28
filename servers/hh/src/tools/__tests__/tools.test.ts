import { describe, it, expect, vi, beforeEach, afterEach } from "vitest";

// Mock the client module before importing tools.
vi.mock("../../client.js", () => ({
  hhGet: vi.fn(),
  HhApiError: class HhApiError extends Error {
    status: number;
    statusText: string;
    body?: string;
    constructor(status: number, statusText: string, body?: string) {
      super(`hh.ru HTTP ${status}: ${statusText}`);
      this.name = "HhApiError";
      this.status = status;
      this.statusText = statusText;
      this.body = body;
    }
  },
}));

import { hhGet, HhApiError } from "../../client.js";
import {
  handleSearchVacancies,
  handleGetVacancy,
  handleGetSimilarVacancies,
  getVacancySchema,
} from "../vacancies.js";
import {
  handleSearchEmployers,
  handleGetEmployer,
  handleGetEmployerVacancies,
} from "../employers.js";
import { handleSearchResumes, handleGetResume } from "../resumes.js";
import {
  handleGetAreas,
  handleGetAreasSubtree,
  handleGetProfessionalRoles,
  handleGetIndustries,
  handleGetMetro,
  handleGetDictionaries,
  handleValidateToken,
  handleSuggestPositions,
  handleSuggestCompanies,
  handleSuggestAreas,
} from "../references.js";
import { handleGetSalaryStatistics } from "../salary.js";

const mockHhGet = vi.mocked(hhGet);

beforeEach(() => {
  vi.clearAllMocks();
  delete process.env.HH_ACCESS_TOKEN;
});
afterEach(() => {
  delete process.env.HH_ACCESS_TOKEN;
});

function lastUrl(): string {
  return mockHhGet.mock.calls[mockHhGet.mock.calls.length - 1]![0] as string;
}

describe("search_vacancies", () => {
  const sample = {
    items: [
      {
        id: "123",
        name: "Python Developer",
        salary: { from: 200000, to: 300000, currency: "RUR", gross: false },
        employer: { id: "1", name: "Yandex" },
        area: { id: "1", name: "Москва" },
        snippet: { requirement: "<highlighttext>Python</highlighttext> 3+" },
        alternate_url: "https://hh.ru/vacancy/123",
      },
    ],
    found: 1,
    pages: 1,
    per_page: 20,
    page: 0,
  };

  it("builds the full filter surface and returns a compact summary by default", async () => {
    mockHhGet.mockResolvedValueOnce(sample);
    const result = await handleSearchVacancies({
      text: "python",
      area: 1,
      professional_role: 96,
      industry: "7",
      metro: "1.5",
      salary: 200000,
      currency: "RUR",
      experience: "between1And3",
      work_format: "REMOTE",
      period: 7,
      per_page: 20,
      page: 0,
    });
    const url = lastUrl();
    expect(url).toContain("/vacancies?");
    expect(url).toContain("text=python");
    expect(url).toContain("area=1");
    expect(url).toContain("professional_role=96");
    expect(url).toContain("industry=7");
    expect(url).toContain("work_format=REMOTE");
    expect(url).toContain("period=7");
    expect(url).toContain("salary=200000");
    expect(url).toContain("currency=RUR");
    // compact output, not raw JSON
    expect(result).toContain("Найдено вакансий: 1");
    expect(result).toContain("Python Developer");
    expect(result).toContain("Yandex");
    expect(() => JSON.parse(result)).toThrow();
  });

  it("returns raw JSON when raw:true", async () => {
    mockHhGet.mockResolvedValueOnce(sample);
    const result = await handleSearchVacancies({ raw: true, per_page: 20, page: 0 });
    expect(JSON.parse(result).items[0].name).toBe("Python Developer");
  });

  it("omits currency when no salary is given", async () => {
    mockHhGet.mockResolvedValueOnce({ items: [], found: 0, pages: 0, per_page: 20, page: 0 });
    await handleSearchVacancies({ text: "go", per_page: 20, page: 0 });
    const url = lastUrl();
    expect(url).not.toContain("currency=");
    expect(url).not.toContain("salary=");
  });

  it("rejects period together with date_from/date_to", async () => {
    await expect(
      handleSearchVacancies({ period: 7, date_from: "2026-01-01", per_page: 20, page: 0 }),
    ).rejects.toThrow(/mutually exclusive/);
    expect(mockHhGet).not.toHaveBeenCalled();
  });

  it("rejects pagination beyond the 2000-result depth cap", async () => {
    await expect(
      handleSearchVacancies({ per_page: 100, page: 20, raw: true }),
    ).rejects.toThrow(/2000/);
    expect(mockHhGet).not.toHaveBeenCalled();
  });
});

describe("get_vacancy", () => {
  it("formats a compact detail and encodes the id", async () => {
    mockHhGet.mockResolvedValueOnce({
      id: "456",
      name: "Senior Dev",
      employer: { id: "1", name: "Acme" },
      area: { id: "1", name: "Москва" },
      key_skills: [{ name: "Go" }],
      description: "<p>Great job</p>",
      alternate_url: "https://hh.ru/vacancy/456",
    });
    const result = await handleGetVacancy({ vacancy_id: "456" });
    expect(mockHhGet).toHaveBeenCalledWith("/vacancies/456");
    expect(result).toContain("Senior Dev");
    expect(result).toContain("Go");
    expect(result).toContain("Great job");
  });

  it("rejects a non-numeric vacancy id at the schema level", () => {
    expect(getVacancySchema.safeParse({ vacancy_id: "abc" }).success).toBe(false);
    expect(getVacancySchema.safeParse({ vacancy_id: "123" }).success).toBe(true);
  });
});

describe("get_similar_vacancies", () => {
  it("hits the similar endpoint", async () => {
    mockHhGet.mockResolvedValueOnce({ items: [], found: 0, pages: 0, per_page: 10, page: 0 });
    await handleGetSimilarVacancies({ vacancy_id: "456", per_page: 10, page: 0 });
    expect(lastUrl()).toContain("/vacancies/456/similar_vacancies");
  });
});

describe("employers", () => {
  it("search_employers builds query and formats output", async () => {
    mockHhGet.mockResolvedValueOnce({
      items: [{ id: "1740", name: "Yandex", open_vacancies: 500, alternate_url: "u" }],
      found: 1,
      pages: 1,
      per_page: 20,
      page: 0,
    });
    const result = await handleSearchEmployers({ text: "Yandex", per_page: 20, page: 0 });
    expect(lastUrl()).toContain("text=Yandex");
    expect(result).toContain("Yandex");
    expect(result).toContain("id=1740");
  });

  it("get_employer fetches by id (raw)", async () => {
    mockHhGet.mockResolvedValueOnce({ id: "1740", name: "Yandex" });
    const result = await handleGetEmployer({ employer_id: "1740", raw: true });
    expect(mockHhGet).toHaveBeenCalledWith("/employers/1740");
    expect(JSON.parse(result).name).toBe("Yandex");
  });

  it("get_employer_vacancies lists active vacancies", async () => {
    mockHhGet.mockResolvedValueOnce({ items: [], found: 0, pages: 0, per_page: 20, page: 0 });
    await handleGetEmployerVacancies({ employer_id: "1740", per_page: 20, page: 0 });
    expect(lastUrl()).toContain("/employers/1740/vacancies/active");
  });
});

describe("resumes (token-gated)", () => {
  it("search_resumes fails fast without a token", async () => {
    await expect(handleSearchResumes({ text: "python", per_page: 20, page: 0 })).rejects.toThrow(
      /HH_ACCESS_TOKEN/,
    );
    expect(mockHhGet).not.toHaveBeenCalled();
  });

  it("search_resumes works with a token set", async () => {
    process.env.HH_ACCESS_TOKEN = "t";
    mockHhGet.mockResolvedValueOnce({ items: [], found: 0, pages: 0, per_page: 20, page: 0 });
    await handleSearchResumes({ text: "java", professional_role: 96, per_page: 20, page: 0 });
    const url = lastUrl();
    expect(url).toContain("/resumes?");
    expect(url).toContain("professional_role=96");
  });

  it("get_resume fails fast without a token", async () => {
    await expect(handleGetResume({ resume_id: "abc123" })).rejects.toThrow(/HH_ACCESS_TOKEN/);
  });

  it("get_resume fetches with a token (raw)", async () => {
    process.env.HH_ACCESS_TOKEN = "t";
    mockHhGet.mockResolvedValueOnce({ id: "abc123", title: "Backend Dev" });
    const result = await handleGetResume({ resume_id: "abc123", raw: true });
    expect(mockHhGet).toHaveBeenCalledWith("/resumes/abc123");
    expect(JSON.parse(result).title).toBe("Backend Dev");
  });
});

describe("references", () => {
  it("get_areas flattens the tree to id — name", async () => {
    mockHhGet.mockResolvedValueOnce([
      { id: "113", name: "Россия", areas: [{ id: "1", name: "Москва" }] },
    ]);
    const result = await handleGetAreas();
    expect(result).toContain("113 — Россия");
    expect(result).toContain("1 — Москва");
  });

  it("get_areas_subtree fetches a single node", async () => {
    mockHhGet.mockResolvedValueOnce({ id: "113", name: "Россия", areas: [] });
    const result = await handleGetAreasSubtree({ area_id: "113" });
    expect(mockHhGet).toHaveBeenCalledWith("/areas/113");
    expect(result).toContain("113 — Россия");
  });

  it("get_professional_roles flattens categories and roles", async () => {
    mockHhGet.mockResolvedValueOnce({
      categories: [{ id: "11", name: "IT", roles: [{ id: "96", name: "Программист" }] }],
    });
    const result = await handleGetProfessionalRoles();
    expect(mockHhGet).toHaveBeenCalledWith("/professional_roles");
    expect(result).toContain("96 — Программист");
  });

  it("get_industries flattens groups", async () => {
    mockHhGet.mockResolvedValueOnce([
      { id: "7", name: "IT", industries: [{ id: "7.538", name: "Системная интеграция" }] },
    ]);
    const result = await handleGetIndustries();
    expect(mockHhGet).toHaveBeenCalledWith("/industries");
    expect(result).toContain("7.538 — Системная интеграция");
  });

  it("get_metro builds the city path", async () => {
    mockHhGet.mockResolvedValueOnce({ lines: [] });
    await handleGetMetro({ city_id: "1" });
    expect(mockHhGet).toHaveBeenCalledWith("/metro/1");
  });

  it("get_dictionaries fetches the bundle", async () => {
    mockHhGet.mockResolvedValueOnce({ currency: [], experience: [] });
    await handleGetDictionaries();
    expect(mockHhGet).toHaveBeenCalledWith("/dictionaries");
  });

  it("suggest_positions formats matches", async () => {
    mockHhGet.mockResolvedValueOnce({ items: [{ id: "96", text: "Программист" }] });
    const result = await handleSuggestPositions({ text: "прог" });
    expect(lastUrl()).toContain("/suggests/professional_roles");
    expect(result).toContain("Программист (id=96)");
  });

  it("suggest_companies and suggest_areas hit the right endpoints", async () => {
    mockHhGet.mockResolvedValueOnce({ items: [] });
    await handleSuggestCompanies({ text: "yan" });
    expect(lastUrl()).toContain("/suggests/companies");
    mockHhGet.mockResolvedValueOnce({ items: [] });
    await handleSuggestAreas({ text: "mos" });
    expect(lastUrl()).toContain("/suggests/areas");
  });
});

describe("validate_token", () => {
  it("reports public-only mode without a token", async () => {
    const result = await handleValidateToken();
    expect(result).toContain("не задан");
    expect(mockHhGet).not.toHaveBeenCalled();
  });

  it("reports a valid token and role via /me", async () => {
    process.env.HH_ACCESS_TOKEN = "t";
    mockHhGet.mockResolvedValueOnce({
      id: "9",
      email: "hr@acme.io",
      first_name: "HR",
      is_employer: true,
    });
    const result = await handleValidateToken();
    expect(mockHhGet).toHaveBeenCalledWith("/me");
    expect(result).toContain("Токен валиден");
    expect(result).toContain("employer");
  });

  it("reports an invalid token on 403", async () => {
    process.env.HH_ACCESS_TOKEN = "bad";
    mockHhGet.mockRejectedValueOnce(new HhApiError(403, "Forbidden"));
    const result = await handleValidateToken();
    expect(result).toContain("недействителен");
  });
});

describe("salary statistics (client-side distribution)", () => {
  it("samples vacancies and computes a distribution", async () => {
    // call 1: total (per_page=1)  → found 1000
    mockHhGet.mockResolvedValueOnce({ found: 1000, items: [{}], pages: 1000, per_page: 1, page: 0 });
    // call 2: sample (label=with_salary) → a handful of salaried vacancies
    mockHhGet.mockResolvedValueOnce({
      found: 580,
      pages: 6,
      per_page: 100,
      page: 0,
      items: [
        { salary: { from: 100000, to: 200000, currency: "RUR" } },
        { salary: { from: 150000, currency: "RUR" } },
        { salary: { from: 200000, to: 300000, currency: "RUR" } },
        { salary: { to: 250000, currency: "RUR" } },
      ],
    });
    const result = await handleGetSalaryStatistics({
      professional_role_id: 96,
      area_id: 1,
      sample_pages: 1,
    });
    const firstUrl = mockHhGet.mock.calls[0]![0] as string;
    const secondUrl = mockHhGet.mock.calls[1]![0] as string;
    expect(firstUrl).toContain("professional_role=96");
    expect(firstUrl).toContain("area=1");
    expect(secondUrl).toContain("label=with_salary");
    expect(result).toContain("Медиана");
    expect(result).toContain("Смещённая оценка");
  });

  it("returns the stats object with raw:true", async () => {
    mockHhGet.mockResolvedValueOnce({ found: 100, items: [{}] });
    mockHhGet.mockResolvedValueOnce({
      found: 50,
      items: [
        { salary: { from: 100000, currency: "RUR" } },
        { salary: { from: 300000, currency: "RUR" } },
      ],
    });
    const result = await handleGetSalaryStatistics({
      professional_role_id: 96,
      raw: true,
      sample_pages: 1,
    });
    const stats = JSON.parse(result);
    expect(stats.median).toBe(200000);
    expect(stats.currency).toBe("RUR");
    expect(stats.sample_size).toBe(2);
  });

  it("throws when no salaried vacancies are found", async () => {
    mockHhGet.mockResolvedValueOnce({ found: 0, items: [] });
    mockHhGet.mockResolvedValueOnce({ found: 0, items: [] });
    await expect(
      handleGetSalaryStatistics({ professional_role_id: 96, sample_pages: 1 }),
    ).rejects.toThrow(/Нет вакансий/);
  });
});
