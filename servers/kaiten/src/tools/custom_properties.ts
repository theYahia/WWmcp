import { z } from "zod";
import { kaitenGet } from "../client.js";
import { buildQuery, json } from "../lib.js";
import type { ToolDef } from "../types.js";

// Custom properties live at the company level. These are read-only: creating /
// updating properties involves complex typed value schemas (select/catalog/
// vote) that aren't exposed here to avoid guessing request shapes.

// --- list_custom_properties ---
export const listCustomPropertiesSchema = z.object({
  query: z.string().optional().describe("Text search over property names"),
  include_values: z.boolean().optional().describe("Include property values"),
  limit: z.number().int().optional().describe("Max results"),
  offset: z.number().int().optional().describe("Pagination offset"),
});

export async function handleListCustomProperties(params: z.infer<typeof listCustomPropertiesSchema>): Promise<string> {
  const qs = buildQuery({
    query: params.query,
    include_values: params.include_values,
    limit: params.limit,
    offset: params.offset,
  });
  return json(await kaitenGet(`/company/custom-properties${qs}`));
}

// --- get_custom_property ---
export const getCustomPropertySchema = z.object({
  property_id: z.number().int().describe("Custom property ID"),
});

export async function handleGetCustomProperty(params: z.infer<typeof getCustomPropertySchema>): Promise<string> {
  return json(await kaitenGet(`/company/custom-properties/${params.property_id}`));
}

// --- list_custom_property_select_values ---
export const listSelectValuesSchema = z.object({
  property_id: z.number().int().describe("Custom property ID (select/catalog type)"),
});

export async function handleListSelectValues(params: z.infer<typeof listSelectValuesSchema>): Promise<string> {
  return json(await kaitenGet(`/company/custom-properties/${params.property_id}/select-values`));
}

export const tools: ToolDef[] = [
  {
    name: "list_custom_properties",
    description: "List company custom properties (read-only).",
    schema: listCustomPropertiesSchema,
    handler: handleListCustomProperties,
  },
  {
    name: "get_custom_property",
    description: "Get a single custom property by ID (read-only).",
    schema: getCustomPropertySchema,
    handler: handleGetCustomProperty,
  },
  {
    name: "list_custom_property_select_values",
    description: "List the select/catalog values of a custom property (read-only).",
    schema: listSelectValuesSchema,
    handler: handleListSelectValues,
  },
];
