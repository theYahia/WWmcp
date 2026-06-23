---
"@theyahia/1c-rest-mcp": minor
---

Add `get_document_lines` — read a document's tabular section (строки / табличная часть, e.g. Товары, Услуги) by `Ref_Key` via OData `$expand`. Previously tabular rows were only reachable through a hand-written `$expand` in `odata_query`/`get_documents`. The tabular-section name is configuration-specific; discover it with `get_metadata` / `describe_entity`.
