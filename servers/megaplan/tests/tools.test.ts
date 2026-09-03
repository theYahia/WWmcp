import { describe, it, expect, vi, beforeEach } from "vitest";

// Mock the client module before importing tools.
vi.mock("../src/client.js", () => ({
  megaplanGet: vi.fn(),
  megaplanPost: vi.fn(),
}));

import { megaplanGet, megaplanPost } from "../src/client.js";
import {
  handleGetTasks,
  handleGetTask,
  handleCreateTask,
  handleUpdateTask,
  getTaskSchema,
} from "../src/tools/tasks.js";
import { getCommentsSchema } from "../src/tools/comments.js";
import { handleGetDeals, handleGetDeal, handleCreateDeal, handleUpdateDeal } from "../src/tools/deals.js";
import { handleGetProjects, handleGetProject } from "../src/tools/projects.js";
import { handleGetEmployees } from "../src/tools/employees.js";
import { handleGetComments, handleCreateComment } from "../src/tools/comments.js";
import { handleGetDealPrograms, handleGetDealProgram } from "../src/tools/programs.js";
import { handleListClients, handleGetClient } from "../src/tools/contractors.js";
import { handleGetCurrentUser } from "../src/tools/me.js";
import { buildListQuery, toDateTime, toMoney } from "../src/query.js";

const mockGet = vi.mocked(megaplanGet);
const mockPost = vi.mocked(megaplanPost);

beforeEach(() => {
  vi.clearAllMocks();
  mockGet.mockResolvedValue({ data: [], meta: {} });
  mockPost.mockResolvedValue({ data: { id: "1" } });
});

/** Last query object passed to megaplanGet. */
function lastGetQuery(): any {
  return mockGet.mock.calls.at(-1)![1];
}

describe("buildListQuery", () => {
  it("returns just limit when there are no filters", () => {
    expect(buildListQuery({ entity: "Task", limit: 25 })).toEqual({ limit: 25 });
  });

  it("builds a FilterTermEnum for status (value is an array of codes)", () => {
    const q = buildListQuery({ entity: "Task", limit: 10, status: "filter_any" });
    expect(q.filter).toMatchObject({ contentType: "TaskFilter" });
    const term = (q.filter as any).config.termGroup.terms[0];
    expect(term).toEqual({
      contentType: "FilterTermEnum",
      field: "status",
      comparison: "equals",
      value: ["filter_any"],
    });
  });

  it("builds a FilterTermRef for reference filters", () => {
    const q = buildListQuery({
      entity: "Task",
      limit: 10,
      refs: [{ field: "responsible", contentType: "Employee", id: "emp1" }],
    });
    const term = (q.filter as any).config.termGroup.terms[0];
    expect(term).toEqual({
      contentType: "FilterTermRef",
      field: "responsible",
      comparison: "equals",
      value: [{ id: "emp1", contentType: "Employee" }],
    });
  });

  it("maps search to a top-level q and pageAfter to a cursor link-entity", () => {
    const q = buildListQuery({ entity: "Deal", limit: 5, search: "abc", pageAfter: "d9" });
    expect(q.q).toBe("abc");
    expect(q.pageAfter).toEqual({ contentType: "Deal", id: "d9" });
  });
});

describe("value object helpers", () => {
  it("toDateTime wraps an ISO string", () => {
    expect(toDateTime("2025-12-31T23:59:59+03:00")).toEqual({
      contentType: "DateTime",
      value: "2025-12-31T23:59:59+03:00",
    });
  });
  it("toMoney wraps a number with currency", () => {
    expect(toMoney(100)).toEqual({ contentType: "Money", value: 100, currency: "RUB" });
    expect(toMoney(50, "USD")).toEqual({ contentType: "Money", value: 50, currency: "USD" });
  });
});

describe("get_tasks", () => {
  it("calls /task with a v3 filter object (no filter[...] params, no offset)", async () => {
    await handleGetTasks({ limit: 10, filter_status: "filter_any", filter_responsible_id: "emp1" });
    expect(mockGet).toHaveBeenCalledWith("/task", expect.objectContaining({ limit: 10 }));
    const q = lastGetQuery();
    expect(q.offset).toBeUndefined();
    expect(q["filter[status]"]).toBeUndefined();
    const terms = q.filter.config.termGroup.terms;
    expect(terms).toContainEqual(expect.objectContaining({ field: "status", value: ["filter_any"] }));
    expect(terms).toContainEqual(
      expect.objectContaining({ field: "responsible", value: [{ id: "emp1", contentType: "Employee" }] }),
    );
  });

  it("maps search to q and page_after to a cursor", async () => {
    await handleGetTasks({ limit: 25, search: "urgent", page_after: "t5" });
    const q = lastGetQuery();
    expect(q.q).toBe("urgent");
    expect(q.pageAfter).toEqual({ contentType: "Task", id: "t5" });
  });

  it("returns a compact summary by default", async () => {
    mockGet.mockResolvedValue({ meta: { totalCount: 1 }, data: [{ id: "7", name: "A", status: { name: "open" } }] });
    const out = JSON.parse(await handleGetTasks({ limit: 25 }));
    expect(out).toMatchObject({ total: 1, count: 1, nextPageAfter: "7" });
    expect(out.items[0]).toMatchObject({ id: "7", name: "A", status: "open" });
  });
});

describe("get_task", () => {
  it("GETs /task/:id with no query", async () => {
    mockGet.mockResolvedValue({ data: { id: "t1", name: "X" } });
    await handleGetTask({ id: "t1" });
    expect(mockGet).toHaveBeenCalledWith("/task/t1");
  });
});

describe("create_task", () => {
  it("posts required fields with contentType Task", async () => {
    await handleCreateTask({ name: "Test", responsible_id: "emp1", parent_type: "Task" });
    expect(mockPost).toHaveBeenCalledWith(
      "/task",
      expect.objectContaining({
        contentType: "Task",
        name: "Test",
        responsible: { id: "emp1", contentType: "Employee" },
      }),
    );
  });

  it("wraps deadline as a DateTime object and supports project parents", async () => {
    await handleCreateTask({
      name: "D",
      responsible_id: "emp2",
      deadline: "2025-12-31T23:59:59+03:00",
      parent_id: "pr1",
      parent_type: "Project",
    });
    expect(mockPost).toHaveBeenCalledWith(
      "/task",
      expect.objectContaining({
        deadline: { contentType: "DateTime", value: "2025-12-31T23:59:59+03:00" },
        parent: { id: "pr1", contentType: "Project" },
      }),
    );
  });
});

describe("update_task", () => {
  it("POSTs only changed fields to /task/:id", async () => {
    await handleUpdateTask({ id: "t1", name: "renamed", status: "done" });
    expect(mockPost).toHaveBeenCalledWith(
      "/task/t1",
      expect.objectContaining({ contentType: "Task", name: "renamed", status: "done" }),
    );
  });
});

describe("get_deals", () => {
  it("calls /deal with a DealFilter ref term", async () => {
    await handleGetDeals({ limit: 25, filter_responsible_id: "emp1" });
    const q = lastGetQuery();
    expect(q.filter.contentType).toBe("DealFilter");
    expect(q.filter.config.termGroup.terms).toContainEqual(
      expect.objectContaining({ field: "responsible", value: [{ id: "emp1", contentType: "Employee" }] }),
    );
  });
});

describe("get_deal", () => {
  it("GETs /deal/:id", async () => {
    mockGet.mockResolvedValue({ data: { id: "d1" } });
    await handleGetDeal({ id: "d1" });
    expect(mockGet).toHaveBeenCalledWith("/deal/d1");
  });
});

describe("create_deal", () => {
  it("uses Program contentType, Money price, and ContractorHuman contact", async () => {
    await handleCreateDeal({
      name: "New deal",
      program_id: "prog1",
      amount: 50000,
      currency: "RUB",
      contact_id: "c1",
      contact_type: "human",
    });
    expect(mockPost).toHaveBeenCalledWith(
      "/deal",
      expect.objectContaining({
        contentType: "Deal",
        name: "New deal",
        program: { id: "prog1", contentType: "Program" },
        price: { contentType: "Money", value: 50000, currency: "RUB" },
        contact: { id: "c1", contentType: "ContractorHuman" },
      }),
    );
  });

  it("uses ContractorCompany when contact_type is company", async () => {
    await handleCreateDeal({
      name: "Org deal",
      program_id: "prog1",
      currency: "RUB",
      contact_id: "c2",
      contact_type: "company",
    });
    expect(mockPost).toHaveBeenCalledWith(
      "/deal",
      expect.objectContaining({ contact: { id: "c2", contentType: "ContractorCompany" } }),
    );
  });
});

describe("update_deal", () => {
  it("POSTs to /deal/:id with price Money", async () => {
    await handleUpdateDeal({ id: "d1", amount: 100, currency: "USD" });
    expect(mockPost).toHaveBeenCalledWith(
      "/deal/d1",
      expect.objectContaining({ contentType: "Deal", price: { contentType: "Money", value: 100, currency: "USD" } }),
    );
  });
});

describe("get_projects / get_project", () => {
  it("calls /project for a list", async () => {
    await handleGetProjects({ limit: 10, search: "alpha" });
    expect(mockGet).toHaveBeenCalledWith("/project", expect.objectContaining({ limit: 10, q: "alpha" }));
  });
  it("GETs /project/:id", async () => {
    mockGet.mockResolvedValue({ data: { id: "pr1" } });
    await handleGetProject({ id: "pr1" });
    expect(mockGet).toHaveBeenCalledWith("/project/pr1");
  });
});

describe("get_employees", () => {
  it("calls /employee with a department ref filter", async () => {
    await handleGetEmployees({ limit: 25, filter_department_id: "dep1" });
    const q = lastGetQuery();
    expect(q.filter.config.termGroup.terms).toContainEqual(
      expect.objectContaining({ field: "department", value: [{ id: "dep1", contentType: "Department" }] }),
    );
  });
});

describe("comments", () => {
  it("get_comments uses the PLURAL /comments path", async () => {
    await handleGetComments({ subject_type: "task", subject_id: "t1", limit: 25 });
    expect(mockGet).toHaveBeenCalledWith("/task/t1/comments", expect.objectContaining({ limit: 25 }));
    expect(lastGetQuery().offset).toBeUndefined();
  });

  it("create_comment posts {contentType, content} with no subject to the plural path", async () => {
    mockPost.mockResolvedValue({ data: { id: "c1" } });
    await handleCreateComment({ subject_type: "deal", subject_id: "d1", content: "Hello" });
    expect(mockPost).toHaveBeenCalledWith("/deal/d1/comments", { contentType: "Comment", content: "Hello" });
    const body = mockPost.mock.calls.at(-1)![1] as any;
    expect(body.text).toBeUndefined();
    expect(body.subject).toBeUndefined();
  });
});

describe("deal programs", () => {
  it("get_deal_programs lists /program", async () => {
    await handleGetDealPrograms({ limit: 25 });
    expect(mockGet).toHaveBeenCalledWith("/program", expect.objectContaining({ limit: 25 }));
  });
  it("get_deal_program gets /program/:id", async () => {
    mockGet.mockResolvedValue({ data: { id: "p1", name: "Sales" } });
    await handleGetDealProgram({ id: "p1" });
    expect(mockGet).toHaveBeenCalledWith("/program/p1");
  });
});

describe("clients (contractors)", () => {
  it("list_clients hits contractorHuman / contractorCompany by type", async () => {
    await handleListClients({ type: "human", limit: 25 });
    expect(mockGet).toHaveBeenCalledWith("/contractorHuman", expect.objectContaining({ limit: 25 }));
    await handleListClients({ type: "company", limit: 25 });
    expect(mockGet).toHaveBeenCalledWith("/contractorCompany", expect.objectContaining({ limit: 25 }));
  });
  it("get_client gets the typed entity by id", async () => {
    mockGet.mockResolvedValue({ data: { id: "c1", name: "Acme" } });
    await handleGetClient({ type: "company", id: "c1" });
    expect(mockGet).toHaveBeenCalledWith("/contractorCompany/c1");
  });
});

describe("get_current_user", () => {
  it("formats the current employee when available", async () => {
    mockGet.mockResolvedValue({ data: { id: "e1", name: "Me" } });
    const out = JSON.parse(await handleGetCurrentUser({}));
    expect(out).toMatchObject({ id: "e1", name: "Me" });
  });

  it("returns a helpful message on 404 instead of throwing", async () => {
    mockGet.mockRejectedValue(new Error("Megaplan HTTP 404: not found"));
    const out = JSON.parse(await handleGetCurrentUser({}));
    expect(out.error).toContain("get_employees");
  });

  it("rethrows non-404 errors", async () => {
    mockGet.mockRejectedValue(new Error("Megaplan HTTP 500: boom"));
    await expect(handleGetCurrentUser({})).rejects.toThrow(/500/);
  });
});

describe("id validation (path-traversal guard)", () => {
  it("rejects ids with path separators", () => {
    expect(getTaskSchema.safeParse({ id: "../employee/current" }).success).toBe(false);
    expect(getTaskSchema.safeParse({ id: "1/2" }).success).toBe(false);
    expect(
      getCommentsSchema.safeParse({ subject_type: "task", subject_id: "1/../2", limit: 25 }).success,
    ).toBe(false);
  });

  it("accepts normal ids", () => {
    expect(getTaskSchema.safeParse({ id: "1000005" }).success).toBe(true);
  });
});
