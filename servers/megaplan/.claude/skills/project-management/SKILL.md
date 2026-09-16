---
name: project-management
description: Manage Megaplan tasks and deals
argument-hint: <action> [details]
---

# /project-management — Megaplan Operations

## Algorithm

1. Use `get_tasks` (filter by status code(s) and `filter_responsible_id`) or `get_task` for one task.
2. Use `create_task` / `update_task` to add or edit tasks (deadlines, responsible).
3. Use `get_deals` / `get_deal` to browse the pipeline; `get_deal_programs` to find a `program_id`
   before `create_deal`.
4. Use `get_employees` to resolve responsible/employee IDs, `list_clients` for CRM contacts,
   and `get_current_user` to scope "my" tasks.

Notes:
- `filter_status` takes account-specific status **codes** (e.g. `filter_any`), not names.
- Lists are cursor-paginated: pass the returned `nextPageAfter` as `page_after`.

## Response Format

```
## Megaplan Tasks

### Active Tasks
1. Prepare proposal — Responsible: Ivan — Deadline: 2025-12-15
2. ...

### Deals Pipeline
1. New client contract — 500,000 RUB — Status: negotiation
```

## Examples

```
/project-management list my tasks
/project-management create task "Review contract" responsible 1000005
/project-management list deal pipelines
/project-management list deals
```
