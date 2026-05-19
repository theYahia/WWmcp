/**
 * Shared client-side parallel batching primitives for MoySklad MCP.
 *
 * MoySklad's REST API does not document a single "POST many" multipart batch
 * endpoint of the OData $batch shape. The platform DOES accept arrays on some
 * entity endpoints for create/update, but the contract is not uniform across
 * all entities (products vs. counterparties vs. customer orders behave
 * differently w.r.t. partial-success reporting).
 *
 * To give MCP callers a consistent "do N operations" surface without
 * fabricating endpoint behaviour, every batch tool in this server uses
 * **client-side parallel batching** on top of the existing single-entity
 * primitives (`moyskladPost`, `moyskladPut`, `moyskladGet`):
 *
 *   - N requests dispatched in parallel (default cap = 5)
 *   - Each request's success / failure reported per item
 *   - Partial failure does NOT abort the batch
 *   - The shared RateLimitedClient (45 req / 3s token bucket) already shields
 *     MoySklad from overload regardless of `concurrency` value chosen
 *
 * This mirrors the pattern used in @theyahia/1c-rest-mcp (see batch.ts there)
 * and keeps `concurrency * tools` well below the token bucket headroom.
 */

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
  /** Note about batch semantics — surfaced so the LLM never assumes server-side atomicity. */
  note: string;
}

export const BATCH_NOTE_CLIENT_SIDE =
  "MoySklad MCP dispatches batch ops as N parallel HTTP requests with a concurrency cap. " +
  "Results are reported per item; partial failure is normal and not retried automatically. " +
  "The shared token-bucket rate limiter (45 req / 3s) prevents server overload.";

type PoolResult<T> =
  | { status: "fulfilled"; value: T }
  | { status: "rejected"; reason: unknown };

/**
 * Run an array of async tasks with bounded concurrency.
 * Returns results in the SAME order as input.
 */
export async function runInPool<TItem, TValue>(
  items: TItem[],
  concurrency: number,
  fn: (item: TItem, index: number) => Promise<TValue>,
): Promise<Array<PoolResult<TValue>>> {
  const results: Array<PoolResult<TValue>> = new Array(items.length);
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

  const workerCount = Math.min(concurrency, items.length);
  const workers = Array.from({ length: workerCount }, () => worker());
  await Promise.all(workers);
  return results;
}

function errToString(e: unknown): string {
  if (e instanceof Error) return e.message;
  return String(e);
}

/** Wrap pool results into a JSON-serialisable envelope for the LLM. */
export function buildBatchEnvelope<T>(
  results: Array<PoolResult<T>>,
  note: string = BATCH_NOTE_CLIENT_SIDE,
): BatchResultEnvelope {
  const items: BatchItemResult[] = results.map((r, i) =>
    r.status === "fulfilled"
      ? { index: i, status: "ok", data: r.value }
      : { index: i, status: "error", error: errToString(r.reason) },
  );
  return {
    total: items.length,
    succeeded: items.filter((x) => x.status === "ok").length,
    failed: items.filter((x) => x.status === "error").length,
    results: items,
    failed_indexes: items.filter((x) => x.status === "error").map((x) => x.index),
    note,
  };
}
