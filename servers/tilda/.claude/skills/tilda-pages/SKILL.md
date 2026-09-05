---
name: tilda-pages
description: Получение проектов и страниц из Tilda
argument-hint: <действие> [id]
allowed-tools:
  - mcp__tilda__get_projects
  - mcp__tilda__get_project_info
  - mcp__tilda__get_pages
  - mcp__tilda__get_page
  - mcp__tilda__get_page_body
---

# /tilda-pages — Работа с проектами и страницами Tilda

## Алгоритм

1. Вызови `get_projects` для получения списка проектов
2. Вызови `get_pages` для получения страниц проекта
3. Вызови `get_page` (полная страница c `<head>`) или `get_page_body` (только тело) для содержимого
   - Для большой страницы передай `metadata_only: true`, чтобы не тянуть весь HTML/CSS/JS

## Формат ответа

```
## Проекты Tilda

1. Мой сайт (ID: 12345) — mysite.com
2. ...

### Страницы проекта 12345
1. Главная — /index
2. О нас — /about
```

## Примеры

```
/tilda-pages проекты
/tilda-pages страницы проекта 12345
/tilda-pages страница 67890
```
