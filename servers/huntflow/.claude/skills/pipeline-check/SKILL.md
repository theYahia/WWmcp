---
name: pipeline-check
description: Обзор открытых вакансий и кандидатов в HuntFlow ATS
argument-hint: <account_id>
allowed-tools:
  - Bash
  - Read
---

# /pipeline-check — Обзор рекрутинга

## Алгоритм

1. Вызови `list_vacancies` — все открытые вакансии
2. Покажи сводку: сколько вакансий, по каким позициям

## Примеры

```
/pipeline-check 12345
```
