import { z } from "zod";
import { parasutGet, parasutPost } from "../client.js";
import { json, jsonApiBody, listQuery, rel } from "../lib.js";
import type { ParasutListResult, ParasutResource, ToolDef } from "../types.js";

const sleep = (ms: number) => new Promise<void>((r) => setTimeout(r, ms));

// --- check_einvoice_inbox ---
const checkInboxSchema = z.object({
  vkn: z.string().describe("Recipient tax number (VKN) or TCKN to look up"),
});

/** Return the inbox record for a VKN, or undefined if not a registered e-Fatura user. */
async function lookupInbox(vkn: string): Promise<ParasutResource | undefined> {
  const qs = listQuery({ filters: { vkn } });
  const result = (await parasutGet(`/e_invoice_inboxes?${qs}`)) as ParasutListResult;
  return result.data?.[0];
}

async function checkInbox(p: z.infer<typeof checkInboxSchema>): Promise<string> {
  const inbox = await lookupInbox(p.vkn);
  return json({
    vkn: p.vkn,
    registered_for_einvoice: Boolean(inbox),
    recommended_document: inbox ? "e_invoice" : "e_archive",
    inbox: inbox ? { id: inbox.id, ...(inbox.attributes ?? {}) } : null,
  });
}

// --- get_trackable_job ---
const jobSchema = z.object({ id: z.string().describe("Trackable job ID") });

async function getTrackableJob(p: z.infer<typeof jobSchema>): Promise<string> {
  return json(await parasutGet(`/trackable_jobs/${p.id}`));
}

/** Poll a trackable job until it reaches a terminal state (done/error) or times out. */
async function pollJob(jobId: string, maxWaitMs = 20_000, intervalMs = 2_000): Promise<unknown> {
  let waited = 0;
  for (;;) {
    const result = (await parasutGet(`/trackable_jobs/${jobId}`)) as { data?: ParasutResource };
    const status = result.data?.attributes?.status;
    if (status === "done" || status === "error" || waited >= maxWaitMs) return result;
    await sleep(intervalMs);
    waited += intervalMs;
  }
}

function jobId(postResult: unknown): string | undefined {
  const id = (postResult as { data?: { id?: unknown } })?.data?.id;
  return typeof id === "string" ? id : undefined;
}

// --- create_e_invoice (primitive) ---
const createEInvoiceSchema = z.object({
  sales_invoice_id: z.string().describe("ID of an existing sales invoice to issue as an e-Fatura"),
  to: z.string().describe("Recipient e-Fatura inbox address (e_invoice_address from check_einvoice_inbox)"),
  scenario: z.enum(["basic", "commercial"]).default("basic").describe("e-Fatura scenario"),
  vat_exemption_reason_code: z.string().optional().describe("VAT exemption reason code (for 0% VAT items)"),
  vat_exemption_reason: z.string().optional().describe("VAT exemption reason text (when code is 250 or 350)"),
});

async function createEInvoice(p: z.infer<typeof createEInvoiceSchema>): Promise<unknown> {
  const body = jsonApiBody(
    "e_invoices",
    {
      scenario: p.scenario,
      to: p.to,
      vat_exemption_reason_code: p.vat_exemption_reason_code,
      vat_exemption_reason: p.vat_exemption_reason,
    },
    // NOTE: e_invoices use the relationship key `invoice` (not `sales_invoice`).
    { invoice: rel(p.sales_invoice_id, "sales_invoices") },
  );
  return parasutPost("/e_invoices", body);
}

// --- create_e_archive (primitive) ---
const internetSaleSchema = z
  .object({
    url: z.string().describe("Sale URL"),
    payment_type: z
      .enum(["KREDIKARTI/BANKAKARTI", "EFT/HAVALE", "KAPIDAODEME", "ODEMEARACISI"])
      .describe("Payment type"),
    payment_platform: z.string().optional().describe("Payment platform (e.g. iyzico, payu)"),
    payment_date: z.string().optional().describe("Payment date (YYYY-MM-DD)"),
  })
  .optional()
  .describe("Internet-sale info (required only when the sale was made online)");

const createEArchiveSchema = z.object({
  sales_invoice_id: z.string().describe("ID of an existing sales invoice to issue as an e-Arşiv"),
  vat_exemption_reason_code: z.string().optional().describe("VAT exemption reason code"),
  vat_exemption_reason: z.string().optional().describe("VAT exemption reason text"),
  internet_sale: internetSaleSchema,
});

async function createEArchive(p: z.infer<typeof createEArchiveSchema>): Promise<unknown> {
  const body = jsonApiBody(
    "e_archives",
    {
      vat_exemption_reason_code: p.vat_exemption_reason_code,
      vat_exemption_reason: p.vat_exemption_reason,
      internet_sale: p.internet_sale,
    },
    // NOTE: e_archives use the relationship key `sales_invoice`.
    { sales_invoice: rel(p.sales_invoice_id, "sales_invoices") },
  );
  return parasutPost("/e_archives", body);
}

// --- issue_e_document (smart flow) ---
const issueSchema = z.object({
  sales_invoice_id: z.string().describe("ID of an existing sales invoice to officialize as an e-document"),
  recipient_vkn: z.string().describe("Recipient tax number (VKN/TCKN) — used to decide e-Fatura vs e-Arşiv"),
  scenario: z.enum(["basic", "commercial"]).default("basic").describe("e-Fatura scenario (used only for e-Fatura)"),
  wait: z.boolean().default(true).describe("Poll the async job until it finishes (~up to 20s)"),
});

async function issueEDocument(p: z.infer<typeof issueSchema>): Promise<string> {
  const inbox = await lookupInbox(p.recipient_vkn);

  let documentType: "e_invoice" | "e_archive";
  let postResult: unknown;
  if (inbox) {
    documentType = "e_invoice";
    const to = String(inbox.attributes?.e_invoice_address ?? "");
    postResult = await createEInvoice({ sales_invoice_id: p.sales_invoice_id, to, scenario: p.scenario });
  } else {
    documentType = "e_archive";
    postResult = await createEArchive({ sales_invoice_id: p.sales_invoice_id });
  }

  const id = jobId(postResult);
  const job = id && p.wait ? await pollJob(id) : postResult;

  return json({
    document_type: documentType,
    reason: inbox
      ? "Recipient is a registered e-Fatura user → issued as e-Fatura (e_invoice)."
      : "Recipient is NOT a registered e-Fatura user → issued as e-Arşiv (e_archive).",
    inbox: inbox ? { id: inbox.id, ...(inbox.attributes ?? {}) } : null,
    job,
    hint: id
      ? "If status is not yet 'done'/'error', call get_trackable_job with the job id to check again."
      : undefined,
  });
}

export const tools: ToolDef[] = [
  {
    name: "check_einvoice_inbox",
    description:
      "Check whether a recipient (by VKN/TCKN) is registered for e-Fatura. Drives the e-Fatura vs e-Arşiv choice.",
    schema: checkInboxSchema,
    handler: checkInbox,
  },
  {
    name: "issue_e_document",
    description:
      "Officialize an existing sales invoice as an e-document: looks up the recipient's e-Fatura inbox by VKN, " +
      "issues an e-Fatura if registered or an e-Arşiv otherwise, and (by default) waits for the async job.",
    schema: issueSchema,
    handler: issueEDocument,
  },
  {
    name: "create_e_invoice",
    description:
      "Low-level: issue a sales invoice as an e-Fatura to a known inbox address (`to`). Prefer issue_e_document.",
    schema: createEInvoiceSchema,
    handler: async (p) => json(await createEInvoice(p)),
  },
  {
    name: "create_e_archive",
    description: "Low-level: issue a sales invoice as an e-Arşiv (for recipients not registered for e-Fatura).",
    schema: createEArchiveSchema,
    handler: async (p) => json(await createEArchive(p)),
  },
  {
    name: "get_trackable_job",
    description: "Poll the status of an async e-document job (status: running | done | error).",
    schema: jobSchema,
    handler: getTrackableJob,
  },
];
