---
"@theyahia/1c-rest-mcp": minor
---

Expand 1c-rest-mcp from 9 to 26 tools, driven by confirmed RU search demand (Wordstat ~40k/mo for «1С api» + 467/mo for «mcp сервер для 1с»). All new tools are optional modules, filterable via `ONEC_SERVICES`; the existing 9 tools are unchanged.

- **documents**: `post_document`, `unpost_document` (OData bound actions Post/Unpost), `delete_document`
- **catalogs**: `create_catalog_item`, `update_catalog_item` (CRUD parity with documents)
- **registers**: `write_information_register`, `get_accumulation_balance` (virtual `Balance` method)
- **accounting** (new module): `get_accounting_register`
- **constants** (new module): `get_constant`, `set_constant`
- **shortcuts** (new module): `find_by_description`, `get_by_key`, `count_entities`, `set_deletion_mark`, `get_recent_documents`
- **meta**: `get_metadata` (raw EDMX), `describe_entity` (field list via sample record)

Inherits core security hardening: tool output sanitization and the SSRF origin guard now protect `get_report`. Write/posting tools follow the 1C OData 3.0 spec and should be validated against a target configuration's `$metadata`.
