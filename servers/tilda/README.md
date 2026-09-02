# @theyahia/tilda-mcp

MCP-сервер для Tilda API — проекты, страницы, экспорт. **7 инструментов.** Stdio + HTTP.

[![npm](https://img.shields.io/npm/v/@theyahia/tilda-mcp)](https://www.npmjs.com/package/@theyahia/tilda-mcp)
[![License: MIT](https://img.shields.io/badge/License-MIT-yellow.svg)](https://opensource.org/licenses/MIT)

Часть серии [WWmcp](https://github.com/theYahia/WWmcp) (46 серверов) by [@theYahia](https://github.com/theYahia).

## Установка

### Claude Desktop

```json
{
  "mcpServers": {
    "tilda": {
      "command": "npx",
      "args": ["-y", "@theyahia/tilda-mcp"],
      "env": { "TILDA_PUBLIC_KEY": "your-public-key", "TILDA_SECRET_KEY": "your-secret-key" }
    }
  }
}
```

### Claude Code

```bash
claude mcp add tilda -e TILDA_PUBLIC_KEY=your-public-key -e TILDA_SECRET_KEY=your-secret-key -- npx -y @theyahia/tilda-mcp
```

### VS Code / Cursor

```json
{ "servers": { "tilda": { "command": "npx", "args": ["-y", "@theyahia/tilda-mcp"], "env": { "TILDA_PUBLIC_KEY": "your-public-key", "TILDA_SECRET_KEY": "your-secret-key" } } } }
```

### Streamable HTTP

```bash
TILDA_PUBLIC_KEY=xxx TILDA_SECRET_KEY=yyy npx @theyahia/tilda-mcp --http --port 3001
# Endpoint: http://localhost:3001/mcp  (stateless, CORS включён)
# Health:   http://localhost:3001/health  → {"status":"ok","tools":7}
```

HTTP-режим работает в **stateless**-режиме: на каждый POST создаётся свежий сервер+транспорт (подходит для чистой API-обёртки, поддерживает несколько клиентов без коллизий сессий). Принимает `POST`/`OPTIONS` на `/mcp`; прочие методы → `405`.

### Smithery

```bash
npx @smithery/cli install @theyahia/tilda-mcp
```

> Требуется `TILDA_PUBLIC_KEY` и `TILDA_SECRET_KEY`. Получите в [настройках аккаунта Tilda](https://tilda.cc/identity/apikeys/).

## Инструменты (7)

Полное покрытие всех 7 методов Tilda API.

| Инструмент | Метод API | Описание |
|------------|-----------|----------|
| `get_projects` | `getprojectslist` | Список проектов |
| `get_project_info` | `getprojectinfo` | Информация о проекте (домен, настройки экспорта). Опц. `webconfig=htaccess\|nginx` → пример конфига веб-сервера |
| `get_pages` | `getpageslist` | Список страниц проекта |
| `get_page` | `getpagefull` | Полная страница (HTML c `<head>`, CSS, JS; ссылки на Tilda CDN) |
| `get_page_body` | `getpage` | Только тело страницы (HTML без `<head>`; ссылки на CDN) — для быстрого чтения/preview |
| `get_page_export` | `getpagefullexport` | Экспорт полной страницы с локализованными ассетами `{from,to}` — для самостоятельного хостинга |
| `get_page_export_body` | `getpageexport` | Экспорт тела страницы с локализованными ассетами — для вставки в свой шаблон/CMS |

**Экономия контекста:** инструменты страниц (`get_page*`) принимают опц. `metadata_only: true` — вернуть только метаданные без `html`/`css`/`js` (полезно для больших страниц).

**Экспорт всего проекта:** отдельного метода нет — получите `get_pages`, затем по каждому `id` вызовите `get_page_export` (или `get_page_export_body`).

> **Лимит Tilda API:** 150 запросов в час. Клиент делает ретраи с экспоненциальной задержкой и учитывает заголовок `Retry-After`.

> **Безопасность:** Tilda API принимает ключи только как query-параметры (`publickey`/`secretkey`) — это особенность самого API. Сервер не логирует URL с ключами; держите ключи в env, не передавайте их в незашифрованные логи/прокси.

## Скиллы

| Скилл | Триггер |
|-------|---------|
| `/skill-get-pages` | Покажи все страницы сайта |
| `/skill-export-page` | Экспортируй страницу |

## Примеры

```
Покажи мои проекты в Tilda
Информация о проекте 12345 с конфигом nginx
Список страниц проекта 12345
Покажи содержимое страницы 67890
Покажи только метаданные страницы 67890
Экспортируй страницу 67890 для своего хостинга
Экспортируй тело страницы 67890 для вставки в шаблон
```

## Лицензия

MIT

---

Часть монорепозитория [WWmcp](https://github.com/theYahia/WWmcp) · Telegram: [@vhodvai](https://t.me/vhodvai)
