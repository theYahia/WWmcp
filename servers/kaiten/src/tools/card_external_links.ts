import { z } from "zod";
import { kaitenDelete, kaitenGet, kaitenPatch, kaitenPost } from "../client.js";
import { json } from "../lib.js";
import type { ToolDef } from "../types.js";

// --- list_card_external_links ---
export const listExternalLinksSchema = z.object({
  card_id: z.number().int().describe("Card ID"),
});

export async function handleListExternalLinks(params: z.infer<typeof listExternalLinksSchema>): Promise<string> {
  return json(await kaitenGet(`/cards/${params.card_id}/external-links`));
}

// --- add_card_external_link (POST { url, description? }) ---
export const addExternalLinkSchema = z.object({
  card_id: z.number().int().describe("Card ID"),
  url: z.string().describe("Link URL"),
  description: z.string().optional().describe("Link description"),
});

export async function handleAddExternalLink(params: z.infer<typeof addExternalLinkSchema>): Promise<string> {
  const body: Record<string, unknown> = { url: params.url };
  if (params.description !== undefined) body.description = params.description;
  return json(await kaitenPost(`/cards/${params.card_id}/external-links`, body));
}

// --- update_card_external_link ---
export const updateExternalLinkSchema = z.object({
  card_id: z.number().int().describe("Card ID"),
  link_id: z.number().int().describe("External link ID"),
  url: z.string().optional().describe("New URL"),
  description: z.string().optional().describe("New description"),
});

export async function handleUpdateExternalLink(params: z.infer<typeof updateExternalLinkSchema>): Promise<string> {
  const body: Record<string, unknown> = {};
  if (params.url !== undefined) body.url = params.url;
  if (params.description !== undefined) body.description = params.description;
  return json(await kaitenPatch(`/cards/${params.card_id}/external-links/${params.link_id}`, body));
}

// --- remove_card_external_link ---
export const removeExternalLinkSchema = z.object({
  card_id: z.number().int().describe("Card ID"),
  link_id: z.number().int().describe("External link ID to remove"),
});

export async function handleRemoveExternalLink(params: z.infer<typeof removeExternalLinkSchema>): Promise<string> {
  return json(await kaitenDelete(`/cards/${params.card_id}/external-links/${params.link_id}`));
}

export const tools: ToolDef[] = [
  {
    name: "list_card_external_links",
    description: "List external links attached to a card.",
    schema: listExternalLinksSchema,
    handler: handleListExternalLinks,
  },
  {
    name: "add_card_external_link",
    description: "Attach an external link (URL) to a card.",
    schema: addExternalLinkSchema,
    handler: handleAddExternalLink,
  },
  {
    name: "update_card_external_link",
    description: "Update an external link's URL or description.",
    schema: updateExternalLinkSchema,
    handler: handleUpdateExternalLink,
  },
  {
    name: "remove_card_external_link",
    description: "Remove an external link from a card.",
    schema: removeExternalLinkSchema,
    handler: handleRemoveExternalLink,
  },
];
