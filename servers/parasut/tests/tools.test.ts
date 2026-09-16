import { describe, it, expect, vi, beforeEach, afterEach } from "vitest";
import { z } from "zod";
import type { ToolDef } from "../src/types.js";

const mockFetch = vi.fn();
(global as any).fetch = mockFetch;

import { _reset } from "../src/client.js";
import { tools as contactTools } from "../src/tools/contacts.js";
import { tools as salesInvoiceTools } from "../src/tools/sales_invoices.js";
import { tools as purchaseBillTools } from "../src/tools/purchase_bills.js";
import { tools as eDocumentTools } from "../src/tools/e_documents.js";

const ENV = {
  PARASUT_CLIENT_ID: "cid",
  PARASUT_CLIENT_SECRET: "csecret",
  PARASUT_USERNAME: "me@example.com",
  PARASUT_PASSWORD: "pw",
  PARASUT_COMPANY_ID: "12345",
};

const okJson = (obj: unknown) => ({ ok: true, json: async () => obj });
const okText = (obj: unknown) => ({ ok: true, headers: new Headers(), text: async () => JSON.stringify(obj) });
function mockToken() {
  mockFetch.mockResolvedValueOnce(okJson({ access_token: "a", token_type: "bearer", expires_in: 7200, refresh_token: "r" }));
}

function callTo(substr: string) {
  return mockFetch.mock.calls.find((c) => String(c[0]).includes(substr));
}
function bodyOf(call: any[]): any {
  return JSON.parse(call[1].body);
}
async function run(tools: ToolDef[], name: string, input: Record<string, unknown>): Promise<string> {
  const t = tools.find((x) => x.name === name);
  if (!t) throw new Error(`tool ${name} not found`);
  const parsed = (t.schema as z.ZodTypeAny).parse(input);
  return t.handler(parsed);
}

beforeEach(() => {
  vi.clearAllMocks();
  _reset();
  Object.assign(process.env, ENV);
});
afterEach(() => {
  for (const k of Object.keys(ENV)) delete process.env[k as keyof typeof ENV];
});

describe("create_sales_invoice", () => {
  it("defaults vat_rate to 20 and currency to TRL, and builds JSON:API details", async () => {
    mockToken();
    mockFetch.mockResolvedValueOnce(okText({ data: { id: "1", type: "sales_invoices", attributes: {} } }));

    await run(salesInvoiceTools, "create_sales_invoice", {
      contact_id: "5",
      issue_date: "2026-01-01",
      items: [{ product_id: "7", quantity: 2, unit_price: 100 }],
    });

    const body = bodyOf(callTo("/sales_invoices")!);
    expect(body.data.type).toBe("sales_invoices");
    expect(body.data.attributes.item_type).toBe("invoice");
    expect(body.data.attributes.currency).toBe("TRL");
    expect(body.data.relationships.contact.data).toEqual({ id: "5", type: "contacts" });
    const detail = body.data.relationships.details.data[0];
    expect(detail.attributes.vat_rate).toBe(20); // <- the outdated 18 is gone
    expect(detail.relationships.product.data).toEqual({ id: "7", type: "products" });
  });
});

describe("list_sales_invoices date filter (fixes one-sided '...')", () => {
  async function urlFor(input: Record<string, unknown>): Promise<string> {
    mockToken();
    mockFetch.mockResolvedValueOnce(okText({ data: [] }));
    await run(salesInvoiceTools, "list_sales_invoices", input);
    return decodeURIComponent(String(callTo("/sales_invoices")![0]));
  }

  it("emits a from...to range when both bounds are present", async () => {
    expect(await urlFor({ issue_date_from: "2026-01-01", issue_date_to: "2026-12-31" })).toContain(
      "filter[issue_date]=2026-01-01...2026-12-31",
    );
  });
  it("emits exact match (no trailing '...') when only 'from' is present", async () => {
    const url = await urlFor({ issue_date_from: "2026-01-01" });
    expect(url).toContain("filter[issue_date]=2026-01-01");
    expect(url).not.toContain("2026-01-01...");
  });
  it("emits no date filter when neither bound is present", async () => {
    expect(await urlFor({})).not.toContain("filter[issue_date]");
  });
});

describe("create_contact", () => {
  it("sends account_type (required) and contact_type person/company — not the old customer/supplier mix-up", async () => {
    mockToken();
    mockFetch.mockResolvedValueOnce(okText({ data: { id: "2", type: "contacts" } }));

    await run(contactTools, "create_contact", { name: "Acme", account_type: "customer" });

    const body = bodyOf(callTo("/contacts")!);
    expect(body.data.type).toBe("contacts");
    expect(body.data.attributes.account_type).toBe("customer");
    expect(body.data.attributes.contact_type).toBe("company"); // default, valid enum (person|company)
  });
});

describe("create_purchase_bill", () => {
  it("includes the Parasut-required total_vat and due_date", async () => {
    mockToken();
    mockFetch.mockResolvedValueOnce(okText({ data: { id: "3", type: "purchase_bills" } }));

    await run(purchaseBillTools, "create_purchase_bill", {
      supplier_id: "8",
      issue_date: "2026-01-01",
      due_date: "2026-02-01",
      net_total: 100,
      total_vat: 20,
    });

    const body = bodyOf(callTo("/purchase_bills")!);
    expect(body.data.attributes.total_vat).toBe(20);
    expect(body.data.attributes.due_date).toBe("2026-02-01");
    expect(body.data.relationships.supplier.data).toEqual({ id: "8", type: "contacts" });
  });
});

describe("record_sales_invoice_payment", () => {
  it("POSTs a payments resource to the invoice's /payments sub-route", async () => {
    mockToken();
    mockFetch.mockResolvedValueOnce(okText({ data: { id: "p1", type: "payments" } }));

    await run(salesInvoiceTools, "record_sales_invoice_payment", {
      invoice_id: "9",
      account_id: "4",
      amount: 50,
      date: "2026-01-01",
    });

    const call = callTo("/sales_invoices/9/payments")!;
    expect(call[1].method).toBe("POST");
    const body = bodyOf(call);
    expect(body.data.type).toBe("payments");
    expect(body.data.attributes.account_id).toBe(4); // coerced to integer
  });
});

describe("issue_e_document (inbox check -> branch)", () => {
  it("issues an e_invoice (relationship key 'invoice') when the recipient is a registered e-Fatura user", async () => {
    mockToken();
    mockFetch.mockResolvedValueOnce(
      okText({ data: [{ id: "i1", type: "e_invoice_inboxes", attributes: { e_invoice_address: "urn:mail:x" } }] }),
    );
    mockFetch.mockResolvedValueOnce(okText({ data: { id: "job1", type: "trackable_jobs", attributes: { status: "done" } } }));
    mockFetch.mockResolvedValueOnce(okText({ data: { id: "job1", type: "trackable_jobs", attributes: { status: "done" } } }));

    const out = JSON.parse(await run(eDocumentTools, "issue_e_document", { sales_invoice_id: "5", recipient_vkn: "111" }));
    expect(out.document_type).toBe("e_invoice");

    const body = bodyOf(callTo("/e_invoices")!);
    expect(body.data.type).toBe("e_invoices");
    expect(body.data.relationships.invoice.data).toEqual({ id: "5", type: "sales_invoices" });
    expect(body.data.attributes.to).toBe("urn:mail:x");
  });

  it("issues an e_archive (relationship key 'sales_invoice') when the recipient is NOT registered", async () => {
    mockToken();
    mockFetch.mockResolvedValueOnce(okText({ data: [] })); // empty inbox -> not registered
    mockFetch.mockResolvedValueOnce(okText({ data: { id: "job2", type: "trackable_jobs", attributes: { status: "done" } } }));
    mockFetch.mockResolvedValueOnce(okText({ data: { id: "job2", type: "trackable_jobs", attributes: { status: "done" } } }));

    const out = JSON.parse(await run(eDocumentTools, "issue_e_document", { sales_invoice_id: "5", recipient_vkn: "111" }));
    expect(out.document_type).toBe("e_archive");

    const body = bodyOf(callTo("/e_archives")!);
    expect(body.data.relationships.sales_invoice.data).toEqual({ id: "5", type: "sales_invoices" });
  });
});
