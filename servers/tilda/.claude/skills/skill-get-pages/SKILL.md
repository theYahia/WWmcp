---
name: skill-get-pages
description: Покажи все страницы сайта
argument-hint: <project_id>
allowed-tools:
  - mcp__tilda__get_projects
  - mcp__tilda__get_pages
---

# /skill-get-pages

## Algorithm

1. If project_id not given, call get_projects first
2. Call get_pages with the project_id
3. Format as table

## Output

| # | Title | Alias | Published |
|---|-------|-------|-----------|

## Examples

- /skill-get-pages
- /skill-get-pages 12345
- Покажи все страницы сайта
