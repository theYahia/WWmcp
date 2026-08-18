import { z } from "zod";
import { retailCrmGet, retailCrmPostRaw } from "../client.js";
import { ok, runTool, type ToolResult } from "../format/index.js";
import { pageField, limitField } from "./common.js";

// ── files_list ───────────────────────────────────────────────
export const filesListSchema = z.object({
  filter_order_id: z.number().int().optional().describe("Filter files attached to an order"),
  filter_customer_id: z.number().int().optional().describe("Filter files attached to a customer"),
  filter_filename: z.string().optional().describe("Filter by filename (partial match)"),
  page: pageField,
  limit: limitField,
});

export async function handleFilesList(params: z.infer<typeof filesListSchema>): Promise<ToolResult> {
  return runTool(async () => {
    const query: Record<string, string> = { page: String(params.page), limit: String(params.limit) };
    if (params.filter_order_id !== undefined) query["filter[orderIds][]"] = String(params.filter_order_id);
    if (params.filter_customer_id !== undefined) query["filter[customerIds][]"] = String(params.filter_customer_id);
    if (params.filter_filename) query["filter[filename]"] = params.filter_filename;
    const result = await retailCrmGet("/files", query);
    return ok(result);
  });
}

// ── files_get (metadata) ─────────────────────────────────────
export const filesGetSchema = z.object({
  id: z.number().int().describe("File ID to fetch metadata for"),
});

export async function handleFilesGet(params: z.infer<typeof filesGetSchema>): Promise<ToolResult> {
  return runTool(async () => {
    const result = await retailCrmGet(`/files/${params.id}`);
    return ok(result);
  });
}

// ── files_upload (multipart) ─────────────────────────────────
export const filesUploadSchema = z.object({
  filename: z.string().describe("Filename for the uploaded file"),
  content: z.string().describe("File content (UTF-8 text, or base64 when base64=true)"),
  base64: z.boolean().optional().describe("Set true if `content` is base64-encoded binary"),
  content_type: z.string().optional().describe("MIME type (default application/octet-stream)"),
});

export async function handleFilesUpload(params: z.infer<typeof filesUploadSchema>): Promise<ToolResult> {
  return runTool(async () => {
    // RetailCRM /files/upload expects the raw bytes as the request body under
    // Content-Type: application/octet-stream — NOT multipart/form-data.
    const bytes = params.base64
      ? Uint8Array.from(Buffer.from(params.content, "base64"))
      : params.content;
    const path = `/files/upload?filename=${encodeURIComponent(params.filename)}`;
    const result = await retailCrmPostRaw(path, bytes, params.content_type ?? "application/octet-stream");
    return ok(result);
  });
}
