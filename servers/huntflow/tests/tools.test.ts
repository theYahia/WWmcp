import { describe, it, expect, vi, beforeEach } from "vitest";
import { tmpdir } from "node:os";
import { join } from "node:path";

// Mock fetch globally
const mockFetch = vi.fn();
vi.stubGlobal("fetch", mockFetch);

// Окружение до импорта модулей: токен, временный token-файл, без rate-limit/backoff.
process.env.HUNTFLOW_TOKEN = "test-token-123";
process.env.HUNTFLOW_TOKEN_FILE = join(tmpdir(), `hf-tools-test-${process.pid}.json`);
process.env.HUNTFLOW_DISABLE_RATELIMIT = "1";
process.env.HUNTFLOW_BACKOFF_MS = "0";

import { handleListVacancies, handleGetVacancy } from "../src/tools/vacancies.js";
import {
  handleSearchApplicants,
  handleGetApplicant,
  handleListVacancyApplicants,
} from "../src/tools/applicants.js";
import { handleGetApplicantResumes, handleGetResume } from "../src/tools/resumes.js";
import { handleListStages } from "../src/tools/stages.js";
import { handleListAccounts } from "../src/tools/accounts.js";
import { handleListCoworkers } from "../src/tools/coworkers.js";
import {
  handleListSources,
  handleListRejectionReasons,
  handleListDivisions,
  handleListTags,
} from "../src/tools/dictionaries.js";

function mockOk(data: unknown) {
  mockFetch.mockResolvedValueOnce({ ok: true, status: 200, json: async () => data });
}

const urlOf = (i = 0) => mockFetch.mock.calls[i][0] as string;
const items = (r: Record<string, unknown>) => r.items as Record<string, unknown>[];

beforeEach(() => {
  mockFetch.mockReset();
});

describe("list_vacancies", () => {
  it("строит путь с opened, count, page и курирует items", async () => {
    mockOk({ items: [{ id: 1, position: "Dev", extra_noise: "x" }], total: 1, page: 1 });
    const result = await handleListVacancies({ account_id: 42, opened: true, count: 10, page: 1 });
    expect(mockFetch).toHaveBeenCalledOnce();
    expect(urlOf()).toContain("/accounts/42/vacancies");
    expect(urlOf()).toContain("opened=true");
    expect(urlOf()).toContain("count=10");
    expect(urlOf()).toContain("page=1");
    expect(items(result)[0].position).toBe("Dev");
    expect(items(result)[0].extra_noise).toBeUndefined(); // курирование отбросило лишнее
  });

  it("использует базовый URL huntflow.ru", async () => {
    mockOk({ items: [] });
    await handleListVacancies({ account_id: 1, opened: true, count: 30, page: 1 });
    expect(urlOf()).toMatch(/^https:\/\/api\.huntflow\.ru\/v2/);
  });

  it("raw=true возвращает сырой ответ без курирования", async () => {
    mockOk({ items: [{ id: 1, position: "Dev", extra_noise: "x" }] });
    const result = await handleListVacancies({
      account_id: 1,
      opened: true,
      count: 30,
      page: 1,
      raw: true,
    });
    expect(items(result)[0].extra_noise).toBe("x");
  });
});

describe("get_vacancy", () => {
  it("бьёт в правильный путь и возвращает полный объект", async () => {
    mockOk({ id: 7, position: "QA", body: "<full>" });
    const result = (await handleGetVacancy({ account_id: 42, vacancy_id: 7 })) as Record<
      string,
      unknown
    >;
    expect(urlOf()).toContain("/accounts/42/vacancies/7");
    expect(result.position).toBe("QA");
    expect(result.body).toBe("<full>");
  });
});

describe("search_applicants", () => {
  it("использует /applicants/search и передаёт q", async () => {
    mockOk({ items: [{ id: 5, first_name: "Иван" }] });
    const result = await handleSearchApplicants({ account_id: 42, q: "Иван", count: 30, page: 1 });
    expect(urlOf()).toContain("/accounts/42/applicants/search");
    expect(urlOf()).toContain("q=%D0%98%D0%B2%D0%B0%D0%BD");
    expect(items(result)[0].first_name).toBe("Иван");
  });

  it("передаёт фильтры vacancy/status", async () => {
    mockOk({ items: [] });
    await handleSearchApplicants({ account_id: 42, vacancy: 9, status: 3, count: 30, page: 1 });
    expect(urlOf()).toContain("vacancy=9");
    expect(urlOf()).toContain("status=3");
  });
});

describe("list_vacancy_applicants", () => {
  it("ищет кандидатов с фильтром по вакансии", async () => {
    mockOk({ items: [{ id: 5, first_name: "Пётр" }] });
    const result = await handleListVacancyApplicants({
      account_id: 42,
      vacancy_id: 9,
      count: 30,
      page: 1,
    });
    expect(urlOf()).toContain("/accounts/42/applicants/search");
    expect(urlOf()).toContain("vacancy=9");
    expect(items(result)[0].first_name).toBe("Пётр");
  });
});

describe("get_applicant", () => {
  it("бьёт в правильный путь", async () => {
    mockOk({ id: 7, first_name: "Мария", last_name: "К" });
    const result = (await handleGetApplicant({ account_id: 42, applicant_id: 7 })) as Record<
      string,
      unknown
    >;
    expect(urlOf()).toContain("/accounts/42/applicants/7");
    expect(result.first_name).toBe("Мария");
  });
});

describe("get_applicant_resumes", () => {
  it("берёт external[] из объекта кандидата (без endpoint /externals)", async () => {
    mockOk({ id: 7, external: [{ id: 1, auth_type: "HH" }] });
    const result = await handleGetApplicantResumes({ account_id: 42, applicant_id: 7 });
    expect(urlOf()).toContain("/accounts/42/applicants/7");
    expect(urlOf()).not.toContain("/externals");
    expect(items(result)[0].auth_type).toBe("HH");
  });
});

describe("get_resume", () => {
  it("бьёт в /externals/{id}", async () => {
    mockOk({ id: 5, auth_type: "HH", data: {} });
    await handleGetResume({ account_id: 42, applicant_id: 7, external_id: 5 });
    expect(urlOf()).toContain("/accounts/42/applicants/7/externals/5");
  });
});

describe("list_stages", () => {
  it("использует /vacancies/statuses (множественное число)", async () => {
    mockOk({ items: [{ id: 1, name: "Новый", order: 0 }] });
    const result = await handleListStages({ account_id: 42 });
    expect(urlOf()).toContain("/accounts/42/vacancies/statuses");
    expect(items(result)[0].name).toBe("Новый");
  });
});

describe("list_accounts", () => {
  it("бьёт в /accounts", async () => {
    mockOk({ items: [{ id: 1, name: "TestCo", nick: "tc" }] });
    const result = await handleListAccounts({});
    expect(urlOf()).toContain("/accounts");
    expect(items(result)[0].name).toBe("TestCo");
  });
});

describe("справочники и сотрудники", () => {
  it("list_coworkers → /coworkers", async () => {
    mockOk({ items: [{ id: 1, name: "Рекрутер" }] });
    await handleListCoworkers({ account_id: 42, count: 30, page: 1 });
    expect(urlOf()).toContain("/accounts/42/coworkers");
  });
  it("list_sources → /applicants/sources", async () => {
    mockOk({ items: [] });
    await handleListSources({ account_id: 42 });
    expect(urlOf()).toContain("/accounts/42/applicants/sources");
  });
  it("list_rejection_reasons → /rejection_reasons", async () => {
    mockOk({ items: [] });
    await handleListRejectionReasons({ account_id: 42 });
    expect(urlOf()).toContain("/accounts/42/rejection_reasons");
  });
  it("list_divisions → /divisions", async () => {
    mockOk({ items: [] });
    await handleListDivisions({ account_id: 42 });
    expect(urlOf()).toContain("/accounts/42/divisions");
  });
  it("list_tags → /tags", async () => {
    mockOk({ items: [] });
    await handleListTags({ account_id: 42 });
    expect(urlOf()).toContain("/accounts/42/tags");
  });
});

describe("заголовки запроса", () => {
  it("шлёт Bearer-токен и обязательный User-Agent", async () => {
    mockOk({ items: [] });
    await handleListAccounts({});
    const opts = mockFetch.mock.calls[0][1] as RequestInit;
    const headers = opts.headers as Record<string, string>;
    expect(headers["Authorization"]).toBe("Bearer test-token-123");
    expect(headers["User-Agent"]).toMatch(/huntflow-mcp/);
  });
});
