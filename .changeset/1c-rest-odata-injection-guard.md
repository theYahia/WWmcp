---
"@theyahia/1c-rest-mcp": patch
---

Harden OData input handling against `$filter`/path injection.

- `get_document_by_number` now escapes single quotes in `number` (`escapeODataString`) so a quote can't break out of the OData string literal.
- `buildKeyedPath` validates `Ref_Key` as a GUID and throws a clear error otherwise — making injection through the key impossible for every keyed operation (post/unpost/delete/update document, update catalog item, `get_by_key`, `set_deletion_mark`). `update_document` now routes through `buildKeyedPath` instead of hand-building the keyed path.
- New shared zod field schemas (`refKeySchema`, `odataDate`, `odataDateTime`) validate Ref_Key/date inputs at the MCP boundary with actionable messages; applied to every `ref_key`, `get_document_by_number.date`, and `get_accumulation_balance.period`.
- Centralised the single-quote escaping that was duplicated inline in `find_by_description` and `get_accumulation_balance`.

Test coverage raised from 37 to 55 cases: all previously-untested handlers, the injection-escaping path, the GUID guard, and schema validation.
