import { z } from "zod";
import { getClient } from "../client.js";
import type { ToolDescriptor } from "../lib/tool.js";

// --- create_link ----------------------------------------------------------
export const createLinkSchema = z.object({
  amount: z
    .number()
    .int()
    .positive()
    .describe("Amount in centavos as an integer (e.g. 10000 = ₱100.00)."),
  description: z
    .string()
    .describe("Description shown to the payer on the link's checkout page."),
  remarks: z.string().optional().describe("Internal note (NOT shown to the payer)."),
  currency: z.string().default("PHP").describe("ISO currency code."),
});

export async function handleCreateLink(
  params: z.infer<typeof createLinkSchema>,
): Promise<string> {
  const body = {
    data: {
      attributes: {
        amount: params.amount,
        description: params.description,
        currency: params.currency,
        ...(params.remarks ? { remarks: params.remarks } : {}),
      },
    },
  };
  const result = await getClient().request("POST", "/links", body, {
    moneyMoving: true,
  });
  return JSON.stringify(result, null, 2);
}

// --- get_link (by id OR reference_number) ---------------------------------
export const getLinkSchema = z.object({
  link_id: z.string().optional().describe("Link ID (link_...)."),
  reference_number: z
    .string()
    .optional()
    .describe("Human-friendly reference number printed on the link."),
});

export async function handleGetLink(
  params: z.infer<typeof getLinkSchema>,
): Promise<string> {
  const client = getClient();
  if (params.link_id) {
    const result = await client.request(
      "GET",
      "/links/" + encodeURIComponent(params.link_id),
    );
    return JSON.stringify(result, null, 2);
  }
  if (params.reference_number) {
    const qs = "?reference_number=" + encodeURIComponent(params.reference_number);
    const result = await client.request("GET", "/links" + qs);
    return JSON.stringify(result, null, 2);
  }
  throw new Error("Provide either link_id or reference_number.");
}

// --- archive_link ---------------------------------------------------------
export const archiveLinkSchema = z.object({
  link_id: z.string().describe("Link ID (link_...)."),
  archived: z
    .boolean()
    .default(true)
    .describe("true to archive the link, false to unarchive it."),
});

export async function handleArchiveLink(
  params: z.infer<typeof archiveLinkSchema>,
): Promise<string> {
  const action = params.archived ? "archive" : "unarchive";
  const result = await getClient().request(
    "POST",
    `/links/${encodeURIComponent(params.link_id)}/${action}`,
  );
  return JSON.stringify(result, null, 2);
}

export const linksDescriptors: ToolDescriptor[] = [
  {
    name: "create_link",
    title: "Create Payment Link",
    description:
      "Create a PayMongo Payment Link (no-code shareable checkout). Returns a checkout_url and reference_number.",
    inputSchema: createLinkSchema.shape,
    annotations: { destructiveHint: true, openWorldHint: true },
    handler: handleCreateLink,
  },
  {
    name: "get_link",
    title: "Get Payment Link",
    description:
      "Retrieve a Payment Link by link_id, or look it up by reference_number.",
    inputSchema: getLinkSchema.shape,
    annotations: { readOnlyHint: true, idempotentHint: true, openWorldHint: true },
    handler: handleGetLink,
  },
  {
    name: "archive_link",
    title: "Archive / Unarchive Payment Link",
    description: "Archive or unarchive a Payment Link.",
    inputSchema: archiveLinkSchema.shape,
    annotations: { idempotentHint: true, openWorldHint: true },
    handler: handleArchiveLink,
  },
];
