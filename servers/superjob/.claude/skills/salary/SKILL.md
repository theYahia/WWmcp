---
name: salary
description: Зарплаты по специальности — анализ рынка через SuperJob
argument-hint: <специальность> [город]
allowed-tools:
  - mcp__superjob__search_vacancies
---

# /salary — Зарплаты по специальности

## Алгоритм

1. Вызови `search_vacancies` с keyword=специальность, town (если указан), count=100
2. Собери payment_from и payment_to из результатов
3. Рассчитай: минимум, максимум, медиану, среднюю
4. Покажи распределение и топ-5 вакансий по зарплате

## Примеры

```
/salary Python Москва
/salary менеджер по продажам СПб
/salary DevOps
```
