---
"@theyahia/1c-rest-mcp": minor
---

Add batch operations + change-tracking + improved 1C error parsing.

**New tools (5):**

- `batch_create_documents` — create N documents (1..100) in parallel with concurrency cap and per-item success/failure reporting.
- `batch_update_catalog_items` — PATCH N catalog items by `Ref_Key` in parallel.
- `batch_query` — run N OData GET queries (1..50) in parallel.
- `poll_changes_since` — pull-mode change tracking using `$filter` on a date field; returns `next_cursor` for the next poll.
- `list_subscriptions` — explicit no-op that documents the absence of native 1C webhooks and points the LLM at the polling tool.

**Improved 1C error parsing** (`src/lib/errors.ts`):

- Detects 10 common 1C error categories from Russian error messages: `object_not_found`, `field_required`, `type_mismatch`, `permission_denied`, `posting_failed`, `deletion_locked`, `invalid_guid`, `session_locked`, `validation_failed`, `unknown`.
- Extracts messages from both JSON `odata.error` envelopes and XML Atom envelopes.
- Enriches every error thrown by `oneCGet` / `oneCPost` / `oneCPatch` / `oneCDelete` with an English recovery suggestion that the LLM can act on.

**Research notes:**

- 1C OData does **not** support the `$batch` multipart endpoint — verified via [Infostart community](https://forum.infostart.ru/forum15/topic272942/). Batch ops are implemented as client-side parallel dispatch with concurrency cap.
- 1C OData has **no** webhook or event-subscription mechanism. Only polling is possible. `list_subscriptions` is shipped as an explicit no-op to prevent LLMs from hallucinating subscribe flows.

**Tests:** 32 → 62 (added 30 tests across 3 new files: `batch.test.ts`, `error-parsing.test.ts`, `change-tracking.test.ts`).

**Backwards compatibility:** fully backward-compatible. All 9 existing tools, env vars, and module names unchanged. New modules (`batch`, `changes`) registered by default and filterable via `ONEC_SERVICES`.
