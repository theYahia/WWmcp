---
name: task-triage
description: Triage Megaplan tasks — overdue work, load per employee, comment to unblock
argument-hint: "[employee id] [status]"
---

# /task-triage — Task triage

## Algorithm

1. Call `get_employees` with an optional search or filter_department_id to map employee IDs
   to names. Megaplan tasks reference people by ID — without this the report is unreadable.
2. Call `get_tasks` with filter_status (account-specific status **codes**, e.g.
   `["filter_any"]` — not names), optionally filter_responsible_id and limit (max 100).
   Lists are cursor-paginated: pass the returned `nextPageAfter` back as `page_after` until
   a short page comes back — do not report a total you have not paged to.
3. Bucket the tasks: overdue (deadline in the past), due today, due this week, no deadline.
   A task with no deadline is a finding, not a blank cell.
4. Count per responsible_id to show load. Flag anyone holding a disproportionate share of
   the overdue bucket.
5. For any task the user wants context on, call `get_task` with the task ID for the full
   record and `get_comments` with subject_type = task and subject_id = that ID for the thread.
6. To unblock or chase, call `create_comment` with subject_type = task, subject_id and
   content. Confirm the wording with the user before posting — comments notify people.

## Response format

```
## Megaplan task triage

**Open tasks**: 148 · **Overdue**: 31 · **No deadline**: 22

### Overdue by owner
| Employee | Overdue | Oldest |
|----------|---------|--------|
| Ivan Petrov (1000005) | 12 | 41 days |
| Anna Sidorova (1000011) | 4 | 9 days |

### Oldest overdue
1. #4412 "Prepare Q3 proposal" — Ivan Petrov — due 2026-07-24
2. #4488 "Vendor contract review" — Anna Sidorova — due 2026-08-25

### No deadline (22)
These will never surface in a deadline report — assign dates or close them.
```

## Notes

- Deadlines are ISO with offset, e.g. 2026-12-31T23:59:59+03:00. Compare against today
  before calling anything overdue.
- filter_status takes status codes, which depend on the account's configuration. If a filter
  returns nothing, fetch unfiltered and group client-side rather than guessing a code.
- Tool output is a compact summary by default; pass `raw: true` for the untouched API JSON.
- `create_task` covers missing work — it needs name and responsible_id, with optional
  description, deadline and parent_id for a subtask. `update_task` reassigns or re-dates an
  existing one; `get_current_user` scopes the report to "my tasks".

## Examples

```
/task-triage
/task-triage 1000005 active
/task-triage overdue only
```
