/**
 * Batch operations for 1C OData REST API.
 *
 * IMPORTANT: 1C:Enterprise's built-in OData service does NOT natively support
 * the OData `$batch` endpoint (verified via 1C support / Infostart community
 * forum, 2026-05). Attempts to POST a multipart/mixed request to
 * `/odata/standard.odata/$batch` consistently return "Произошла ошибка
 * сервиса". See research note in README.md.
 *
 * To still give MCP callers a high-level "do N operations" surface, this
 * module implements **client-side parallel batching**:
 *
 *   - N OData requests are dispatched in parallel (cap = 5 by default)
 *   - Each request's success / failure is reported individually
 *   - Partial failure does NOT abort the batch — the caller decides
 *     whether to retry the failed subset
 *
 * This is intentionally a thin orchestration layer over the existing
 * `oneCPost` / `oneCPatch` / `oneCGet` primitives. It keeps full
 * compatibility with the v3.0.0 client and adds no server-side requirements.
 */

import { z } from "zod";
import { oneCGet, oneCPost, oneCPatch, buildODataPath, buildKeyedPath } from "../client.js";
import { normaliseEntity } from "../validation.js";

// ──────────────────────────────────────────────────────────────────────────
// Concurrency primitive — simple promise pool, no external deps
// ──────────────────────────────────────────────────────────────────────────

/**
 * Run an array of async tasks with bounded concurrency.
 * Returns results in the SAME order as input (failed tasks → null + error
 * is reported separately in the second array).
 */
async function runInPool<T, R>(
  items: T[],
  concurrency: number,
  fn: (item: T, index: number) => Promise<R>,
): Promise<Array<{ status: "fulfilled"; value: R } | { status: "rejected"; reason: unknown }>> {
  const results: Array<
    { status: "fulfilled"; value: R } | { status: "rejected"; reason: unknown }
  > = new Array(items.length);
  let cursor = 0;

  async function worker(): Promise<void> {
    while (true) {
      const i = cursor++;
      if (i >= items.length) return;
      try {
        const value = await fn(items[i]!, i);
        results[i] = { status: "fulfilled", value };
      } catch (reason) {
        results[i] = { status: "rejected", reason };
      }
    }
  }

  const workers = Array.from(
    { length: Math.min(concurrency, items.length) },
    () => worker(),
  );
  await Promise.all(workers);
  return results;
}

function errToString(e: unknown): string {
  if (e instanceof Error) return e.message;
  return String(e);
}

// ──────────────────────────────────────────────────────────────────────────
// batch_create_documents — create N documents in parallel
// ──────────────────────────────────────────────────────────────────────────

export const batchCreateDocumentsSchema = z.object({
  document_type: z
    .string()
    .describe("Type of all documents (e.g. Document_РеализацияТоваровУслуг). Same type for the whole batch."),
  documents: z
    .array(z.record(z.string(), z.unknown()))
    .min(1)
    .max(100)
    .describe("Array of document payloads (1..100). Each item is the same shape as `create_document.data`."),
  concurrency: z
    .number()
    .int()
    .min(1)
    .max(20)
    .default(5)
    .describe("Max parallel HTTP requests to 1C. Default 5 — safe for most 1C deployments."),
});

export interface BatchItemResult {
  index: number;
  status: "ok" | "error";
  data?: unknown;
  error?: string;
}

export interface BatchResultEnvelope {
  total: number;
  succeeded: number;
  failed: number;
  results: BatchItemResult[];
  /** Helper for the LLM: list of indexes that failed, ready for retry. */
  failed_indexes: number[];
  /** Note about 1C native batch support — surfaced so the LLM never assumes $batch exists. */
  note: string;
}

const NATIVE_BATCH_NOTE =
  "1C OData does not natively support the $batch endpoint. This tool dispatches " +
  "N parallel OData requests with a concurrency cap and returns per-item results.";

export async function handleBatchCreateDocuments(
  params: z.infer<typeof batchCreateDocumentsSchema>,
): Promise<string> {
  const path = buildODataPath(normaliseEntity("Document_", params.document_type), { $format: "json" });

  const results = await runInPool(
    params.documents,
    params.concurrency,
    (doc) => oneCPost(path, doc),
  );

  const items: BatchItemResult[] = results.map((r, i) =>
    r.status === "fulfilled"
      ? { index: i, status: "ok", data: r.value }
      : { index: i, status: "error", error: errToString(r.reason) },
  );

  const envelope: BatchResultEnvelope = {
    total: items.length,
    succeeded: items.filter((x) => x.status === "ok").length,
    failed: items.filter((x) => x.status === "error").length,
    results: items,
    failed_indexes: items.filter((x) => x.status === "error").map((x) => x.index),
    note: NATIVE_BATCH_NOTE,
  };
  return JSON.stringify(envelope, null, 2);
}

// ──────────────────────────────────────────────────────────────────────────
// batch_update_catalog_items — patch N catalog items in parallel
// ──────────────────────────────────────────────────────────────────────────

export const batchUpdateCatalogItemsSchema = z.object({
  catalog_name: z
    .string()
    .describe("Catalog entity name (e.g. Catalog_Номенклатура)."),
  updates: z
    .array(
      z.object({
        ref_key: z.string().describe("Ref_Key (GUID) of the item to update."),
        data: z
          .record(z.string(), z.unknown())
          .describe("Fields to update — same shape as `update_document.data`."),
      }),
    )
    .min(1)
    .max(100)
    .describe("Array of (ref_key, data) tuples (1..100)."),
  concurrency: z
    .number()
    .int()
    .min(1)
    .max(20)
    .default(5)
    .describe("Max parallel HTTP requests. Default 5."),
});

export async function handleBatchUpdateCatalogItems(
  params: z.infer<typeof batchUpdateCatalogItemsSchema>,
): Promise<string> {
  const results = await runInPool(
    params.updates,
    params.concurrency,
    (u) => {
      // buildKeyedPath (not buildODataPath) so the (guid'…') tuple stays
      // structural — buildODataPath would percent-encode it — and the GUID
      // is validated per-item (a bad key fails just that item, not the batch).
      const path = buildKeyedPath(normaliseEntity("Catalog_", params.catalog_name), u.ref_key, undefined, { $format: "json" });
      return oneCPatch(path, u.data);
    },
  );

  const items: BatchItemResult[] = results.map((r, i) =>
    r.status === "fulfilled"
      ? { index: i, status: "ok", data: r.value }
      : { index: i, status: "error", error: errToString(r.reason) },
  );

  const envelope: BatchResultEnvelope = {
    total: items.length,
    succeeded: items.filter((x) => x.status === "ok").length,
    failed: items.filter((x) => x.status === "error").length,
    results: items,
    failed_indexes: items.filter((x) => x.status === "error").map((x) => x.index),
    note: NATIVE_BATCH_NOTE,
  };
  return JSON.stringify(envelope, null, 2);
}

// ──────────────────────────────────────────────────────────────────────────
// batch_query — run N OData GET queries in parallel
// ──────────────────────────────────────────────────────────────────────────

export const batchQuerySchema = z.object({
  queries: z
    .array(
      z.object({
        entity: z.string().describe("OData entity (e.g. Catalog_Номенклатура)."),
        filter: z.string().optional().describe("$filter clause."),
        select: z.string().optional().describe("$select clause."),
        expand: z.string().optional().describe("$expand clause."),
        top: z.number().int().min(1).max(5000).default(100),
        skip: z.number().int().min(0).default(0),
        orderby: z.string().optional(),
      }),
    )
    .min(1)
    .max(50)
    .describe("Array of OData GET specs (1..50). Each runs as a separate HTTP request."),
  concurrency: z
    .number()
    .int()
    .min(1)
    .max(20)
    .default(5)
    .describe("Max parallel HTTP requests. Default 5."),
});

export async function handleBatchQuery(
  params: z.infer<typeof batchQuerySchema>,
): Promise<string> {
  const results = await runInPool(
    params.queries,
    params.concurrency,
    (q) => {
      const query: Record<string, string> = {
        $format: "json",
        $top: String(q.top),
      };
      if (q.skip) query["$skip"] = String(q.skip);
      if (q.filter) query["$filter"] = q.filter;
      if (q.select) query["$select"] = q.select;
      if (q.expand) query["$expand"] = q.expand;
      if (q.orderby) query["$orderby"] = q.orderby;
      const path = buildODataPath(q.entity, query);
      return oneCGet(path);
    },
  );

  const items: BatchItemResult[] = results.map((r, i) =>
    r.status === "fulfilled"
      ? { index: i, status: "ok", data: r.value }
      : { index: i, status: "error", error: errToString(r.reason) },
  );

  const envelope: BatchResultEnvelope = {
    total: items.length,
    succeeded: items.filter((x) => x.status === "ok").length,
    failed: items.filter((x) => x.status === "error").length,
    results: items,
    failed_indexes: items.filter((x) => x.status === "error").map((x) => x.index),
    note:
      "1C OData does not support $batch. Queries are dispatched in parallel " +
      "with a concurrency cap. There is no server-side join — combine the per-item " +
      "results client-side.",
  };
  return JSON.stringify(envelope, null, 2);
}
