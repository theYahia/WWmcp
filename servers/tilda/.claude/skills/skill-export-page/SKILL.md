---
name: skill-export-page
description: Экспортируй страницу
argument-hint: <page_id>
allowed-tools:
  - mcp__tilda__get_page_export
  - mcp__tilda__get_page_export_body
  - mcp__tilda__get_pages
  - mcp__tilda__get_projects
---

# /skill-export-page

## Algorithm

1. If page_id not given, call get_projects then get_pages to find it
2. Choose the export variant:
   - `get_page_export` — full standalone page (HTML with `<head>`) for self-hosting
   - `get_page_export_body` — body only, to embed inside your own template/CMS
3. Return HTML, CSS, JS, and the image list (`{from, to}` localized assets)

## Examples

- /skill-export-page 67890
- Экспортируй страницу 67890
- Экспортируй тело страницы 67890 для вставки в шаблон
