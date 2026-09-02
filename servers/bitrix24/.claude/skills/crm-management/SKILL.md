---
name: crm-management
description: Manage Bitrix24 CRM deals, contacts, and tasks
argument-hint: <action> [details]
allowed-tools:
  - Bash
  - Read
---

# /crm-management — Bitrix24 CRM Operations

## Algorithm

1. Use `get_deals` to list deals, filter by stage or responsible user
2. Use `create_deal` to add new deals with amount, stage, contacts
3. Use `get_contacts` to search contacts by name, phone, email
4. Use `create_task` to assign tasks with deadlines and priorities

## Response Format

```
## Bitrix24 CRM

### Deals (stage: NEW)
1. Deal Title — 500,000 RUB — Contact: John Doe
2. ...

### New Task Created
Title: Follow up with client
Responsible: User #5
Deadline: 2025-12-31
```

## Examples

```
/crm-management list deals stage NEW
/crm-management create deal "New partnership" 1000000
/crm-management search contacts "Ivanov"
/crm-management create task "Call client" responsible 5
```
