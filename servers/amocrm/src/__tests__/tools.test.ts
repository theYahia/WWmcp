import { describe, it, expect, vi, beforeEach } from "vitest";

// Mock fetch globally before importing modules
const mockFetch = vi.fn();
vi.stubGlobal("fetch", mockFetch);

// Set env vars before importing client
process.env.AMOCRM_SUBDOMAIN = "test-company";
process.env.AMOCRM_ACCESS_TOKEN = "test-token-123";

function mockOkResponse(data: unknown) {
  return {
    ok: true,
    status: 200,
    json: () => Promise.resolve(data),
    text: () => Promise.resolve(JSON.stringify(data)),
    headers: new Headers(),
  };
}

function mock204Response() {
  return {
    ok: true,
    status: 204,
    json: () => Promise.resolve({}),
    text: () => Promise.resolve(""),
    headers: new Headers(),
  };
}

beforeEach(() => {
  mockFetch.mockReset();
});

describe("leads tools", () => {
  it("handleListLeads builds correct URL with filters", async () => {
    const { handleListLeads } = await import("../tools/leads.js");

    const leadsResponse = {
      _embedded: { leads: [{ id: 1, name: "Test Lead", price: 10000 }] },
    };
    mockFetch.mockResolvedValueOnce(mockOkResponse(leadsResponse));

    const result = await handleListLeads({ query: "test", limit: 10, pipeline_id: 42 });
    const parsed = JSON.parse(result);

    expect(parsed._embedded.leads).toHaveLength(1);
    expect(parsed._embedded.leads[0].name).toBe("Test Lead");

    const calledUrl = new URL(mockFetch.mock.calls[0][0] as string);
    expect(calledUrl.pathname).toBe("/api/v4/leads");
    expect(calledUrl.searchParams.get("query")).toBe("test");
    expect(calledUrl.searchParams.get("limit")).toBe("10");
    expect(calledUrl.searchParams.get("filter[pipeline_id]")).toBe("42");
    expect(calledUrl.hostname).toBe("test-company.amocrm.ru");
  });

  it("handleGetLead fetches single lead by ID", async () => {
    const { handleGetLead } = await import("../tools/leads.js");

    const leadData = { id: 555, name: "Big Deal", price: 50000, status_id: 1 };
    mockFetch.mockResolvedValueOnce(mockOkResponse(leadData));

    const result = await handleGetLead({ lead_id: 555, with: ["contacts"] });
    const parsed = JSON.parse(result);

    expect(parsed.id).toBe(555);
    const calledUrl = new URL(mockFetch.mock.calls[0][0] as string);
    expect(calledUrl.pathname).toBe("/api/v4/leads/555");
    expect(calledUrl.searchParams.get("with")).toBe("contacts");
  });

  it("handleCreateLead sends POST with lead data", async () => {
    const { handleCreateLead } = await import("../tools/leads.js");

    const response = { _embedded: { leads: [{ id: 999 }] } };
    mockFetch.mockResolvedValueOnce(mockOkResponse(response));

    await handleCreateLead({ name: "New Deal", price: 25000, pipeline_id: 1 });

    const [url, opts] = mockFetch.mock.calls[0];
    expect(url).toContain("/api/v4/leads");
    expect(opts.method).toBe("POST");
    const body = JSON.parse(opts.body as string);
    expect(body[0].name).toBe("New Deal");
    expect(body[0].price).toBe(25000);
  });

  it("handleUpdateLead sends PATCH to correct endpoint", async () => {
    const { handleUpdateLead } = await import("../tools/leads.js");

    mockFetch.mockResolvedValueOnce(mockOkResponse({ id: 100, name: "Updated" }));

    await handleUpdateLead({ lead_id: 100, name: "Updated", price: 99000 });

    const [url, opts] = mockFetch.mock.calls[0];
    expect(url).toContain("/api/v4/leads/100");
    expect(opts.method).toBe("PATCH");
    const body = JSON.parse(opts.body as string);
    expect(body.name).toBe("Updated");
    expect(body.price).toBe(99000);
    expect(body.lead_id).toBeUndefined(); // lead_id should not be in body
  });
});

describe("contacts tools", () => {
  it("handleListContacts builds correct URL", async () => {
    const { handleListContacts } = await import("../tools/contacts.js");

    mockFetch.mockResolvedValueOnce(
      mockOkResponse({ _embedded: { contacts: [{ id: 1, name: "John" }] } }),
    );

    const result = await handleListContacts({ query: "John", limit: 5 });
    const parsed = JSON.parse(result);
    expect(parsed._embedded.contacts[0].name).toBe("John");

    const calledUrl = new URL(mockFetch.mock.calls[0][0] as string);
    expect(calledUrl.searchParams.get("query")).toBe("John");
    expect(calledUrl.searchParams.get("limit")).toBe("5");
  });
});

describe("tasks tools", () => {
  it("handleCreateTask sends correct payload", async () => {
    const { handleCreateTask } = await import("../tools/tasks.js");

    mockFetch.mockResolvedValueOnce(mockOkResponse({ _embedded: { tasks: [{ id: 77 }] } }));

    await handleCreateTask({
      text: "Call client",
      entity_id: 100,
      entity_type: "leads",
      complete_till: 1700000000,
      task_type_id: 1,
    });

    const [url, opts] = mockFetch.mock.calls[0];
    expect(url).toContain("/api/v4/tasks");
    const body = JSON.parse(opts.body as string);
    expect(body[0].text).toBe("Call client");
    expect(body[0].task_type_id).toBe(1);
  });

  it("handleCompleteTask sends PATCH with is_completed", async () => {
    const { handleCompleteTask } = await import("../tools/tasks.js");

    mockFetch.mockResolvedValueOnce(mockOkResponse({ id: 77, is_completed: true }));

    await handleCompleteTask({ task_id: 77, result_text: "Done, client agreed" });

    const [url, opts] = mockFetch.mock.calls[0];
    expect(url).toContain("/api/v4/tasks/77");
    expect(opts.method).toBe("PATCH");
    const body = JSON.parse(opts.body as string);
    expect(body.is_completed).toBe(true);
    expect(body.result.text).toBe("Done, client agreed");
  });
});

describe("companies tools", () => {
  it("handleCreateCompany sends POST", async () => {
    const { handleCreateCompany } = await import("../tools/companies.js");

    mockFetch.mockResolvedValueOnce(mockOkResponse({ _embedded: { companies: [{ id: 50 }] } }));

    await handleCreateCompany({ name: "Acme Corp" });

    const [url, opts] = mockFetch.mock.calls[0];
    expect(url).toContain("/api/v4/companies");
    expect(opts.method).toBe("POST");
  });
});

describe("account tool", () => {
  it("handleGetAccount includes with params", async () => {
    const { handleGetAccount } = await import("../tools/account.js");

    mockFetch.mockResolvedValueOnce(
      mockOkResponse({ id: 1, name: "Test Account", current_user_id: 10 }),
    );

    const result = await handleGetAccount({ with: ["task_types", "users_groups"] });
    const parsed = JSON.parse(result);
    expect(parsed.name).toBe("Test Account");

    const calledUrl = new URL(mockFetch.mock.calls[0][0] as string);
    expect(calledUrl.searchParams.get("with")).toBe("task_types,users_groups");
  });
});

describe("client auth", () => {
  it("uses Bearer token from env", async () => {
    const { handleListPipelines } = await import("../tools/pipelines.js");

    mockFetch.mockResolvedValueOnce(
      mockOkResponse({ _embedded: { pipelines: [] } }),
    );

    await handleListPipelines();

    const [, opts] = mockFetch.mock.calls[0];
    expect(opts.headers.Authorization).toBe("Bearer test-token-123");
  });
});

describe("schema validation", () => {
  it("listLeadsSchema accepts valid input", async () => {
    const { listLeadsSchema } = await import("../tools/leads.js");
    const result = listLeadsSchema.safeParse({ query: "test", limit: 50, pipeline_id: 1 });
    expect(result.success).toBe(true);
  });

  it("listLeadsSchema rejects limit > 250", async () => {
    const { listLeadsSchema } = await import("../tools/leads.js");
    const result = listLeadsSchema.safeParse({ limit: 500 });
    expect(result.success).toBe(false);
  });

  it("createLeadSchema requires name", async () => {
    const { createLeadSchema } = await import("../tools/leads.js");
    const result = createLeadSchema.safeParse({});
    expect(result.success).toBe(false);
  });
});
