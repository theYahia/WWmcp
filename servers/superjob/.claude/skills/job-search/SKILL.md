---
name: find-job
description: Найди вакансии на SuperJob по специальности, городу и зарплате
argument-hint: <специальность> [город] [зарплата от]
allowed-tools:
  - mcp__superjob__get_towns
  - mcp__superjob__search_vacancies
---

# /find-job — Найди вакансии на SuperJob

## Алгоритм

1. Определи город (если указан) через get_towns с keyword
2. Вызови search_vacancies с keyword, town ID, payment_from
3. Для каждой вакансии покажи: название, компания, зарплата, город, ссылка
4. Если вакансий > 20, предложи уточнить фильтры

## Примеры

/find-job Python Москва 200000
/find-job менеджер
/find-job React разработчик Санкт-Петербург
