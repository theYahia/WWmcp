---
name: project-management
description: Manage Megaplan tasks and deals
argument-hint: <action> [details]
---

# /project-management — Megaplan Operations

## Algorithm

1. Use `get_tasks` to list tasks with filters by status and responsible
2. Use `create_task` to add new tasks with deadlines
3. Use `get_deals` to browse deals pipeline

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
/project-management list tasks status active
/project-management create task "Review contract" responsible 1000005
/project-management list deals
```
