/**
 * Change tracking / polling for 1C OData REST API.
 *
 * IMPORTANT: 1C:Enterprise's built-in OData service has NO native webhook
 * or event-subscription mechanism. There is no `subscribe_to_event` or
 * push-style notification. The only way to react to changes is to poll.
 *
 * 1C platform DOES expose `DataVersion` (a binary timestamp incremented on
 * every modification) on most entities, plus the standard `Date` /
 * `ModificationDate` fields on documents. We use these as cursors.
 *
 * Two tools are exposed:
 *
 *   - `poll_changes_since(entity, since_date)` — pull-mode polling
 *     against a `Date` / `ModificationDate` field. Returns rows + a
 *     suggested next cursor.
 *
 *   - `list_subscriptions` — clearly documents that 1C does NOT support
 *     subscriptions. Returns empty list + an explanatory note. This
 *     prevents LLMs from hallucinating webhook setup steps.
 *
 * Rationale for shipping the `list_subscriptions` no-op: many LLMs will
 * confidently propose `subscribe_to_event(...)` when asked "watch this
 * 1C entity". By making the absence explicit and tool-visible we redirect
 * them to the poll-based approach.
 */

import { z } from "zod";
import { oneCGet, buildODataPath } from "../client.js";

// ──────────────────────────────────────────────────────────────────────────
// poll_changes_since — pull recently-modified rows since a cursor
// ──────────────────────────────────────────────────────────────────────────

export const pollChangesSinceSchema = z.object({
  entity: z
    .string()
    .describe(
      "OData entity to poll (e.g. Document_РеализацияТоваровУслуг, Catalog_Номенклатура).",
    ),
  since: z
    .string()
    .describe(
      "ISO timestamp cursor (YYYY-MM-DDTHH:mm:ss). Rows with `Date` >= since are returned. " +
      "On first poll, pass a recent timestamp. Subsequent polls should use `next_cursor` " +
      "from the previous response.",
    ),
  date_field: z
    .string()
    .default("Date")
    .describe(
      "Name of the date field to filter on. Defaults to `Date` (works for most documents). " +
      "For catalogs/registers without `Date`, override with e.g. `ModificationDate` or similar. " +
      "Note: 1C metadata is per-config — verify field exists via `list_entities` / a sample query.",
    ),
  top: z
    .number()
    .int()
    .min(1)
    .max(1000)
    .default(100)
    .describe("Max rows per poll. Default 100. Use $top on follow-up polls for paging."),
  select: z
    .string()
    .optional()
    .describe("Optional $select to limit returned fields."),
});

export interface PollChangesEnvelope {
  entity: string;
  since: string;
  date_field: string;
  count: number;
  rows: unknown[];
  /** Cursor for the next poll: max(date_field) across returned rows + 1ms. */
  next_cursor: string | null;
  /** True if hit the `top` limit — more rows likely available. */
  has_more: boolean;
  note: string;
}

const POLL_NOTE =
  "1C does not support webhooks or push notifications. This is poll-based " +
  "change tracking using OData $filter on a date field. To stay current, call " +
  "this tool periodically (e.g. every 60s) with `next_cursor` from the previous response.";

function tryGetDate(row: unknown, field: string): string | null {
  if (!row || typeof row !== "object") return null;
  const v = (row as Record<string, unknown>)[field];
  if (typeof v === "string") return v;
  return null;
}

export async function handlePollChangesSince(
  params: z.infer<typeof pollChangesSinceSchema>,
): Promise<string> {
  const filter = `${params.date_field} ge datetime'${params.since}'`;
  const query: Record<string, string> = {
    $format: "json",
    $top: String(params.top),
    $filter: filter,
    $orderby: `${params.date_field} asc`,
  };
  if (params.select) query["$select"] = params.select;

  const path = buildODataPath(params.entity, query);
  const result = (await oneCGet(path)) as { value?: unknown[] } | null;
  const rows = result?.value ?? [];

  // Compute next cursor — max date across returned rows.
  let maxDate: string | null = null;
  for (const r of rows) {
    const d = tryGetDate(r, params.date_field);
    if (d && (!maxDate || d > maxDate)) maxDate = d;
  }

  const envelope: PollChangesEnvelope = {
    entity: params.entity,
    since: params.since,
    date_field: params.date_field,
    count: rows.length,
    rows,
    next_cursor: maxDate,
    has_more: rows.length >= params.top,
    note: POLL_NOTE,
  };
  return JSON.stringify(envelope, null, 2);
}

// ──────────────────────────────────────────────────────────────────────────
// list_subscriptions — explicit no-op that documents the absence of webhooks
// ──────────────────────────────────────────────────────────────────────────

export const listSubscriptionsSchema = z.object({});

export async function handleListSubscriptions(
  _params: z.infer<typeof listSubscriptionsSchema>,
): Promise<string> {
  const envelope = {
    supported: false,
    subscriptions: [],
    reason:
      "1C:Enterprise's built-in OData REST service does not implement webhook " +
      "subscriptions (no event-grid, no $batch, no change-feed endpoint). The platform " +
      "exposes only synchronous CRUD over OData 3.0.",
    workarounds: [
      "Use `poll_changes_since` to pull recently-modified rows on a schedule.",
      "Configure a custom 1C HTTP-service handler that pushes to your endpoint " +
        "(see `get_report` for arbitrary /hs/... routes — requires server-side 1C development).",
      "For real-time event streaming, integrate 1C with an external message broker " +
        "(e.g. RabbitMQ) via a custom 1C subscription handler — outside this MCP's scope.",
    ],
    note:
      "This tool exists to prevent LLMs from hallucinating webhook-setup steps. " +
      "If your use-case requires push notifications, use `poll_changes_since` instead.",
  };
  return JSON.stringify(envelope, null, 2);
}
