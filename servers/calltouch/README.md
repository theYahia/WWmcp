# @theyahia/calltouch-mcp

MCP-сервер для API Calltouch — коллтрекинг, звонки, лиды, источники, теги, статистика. Stdio + Streamable HTTP.

[![npm](https://img.shields.io/npm/v/@theyahia/calltouch-mcp)](https://www.npmjs.com/package/@theyahia/calltouch-mcp)
[![License: MIT](https://img.shields.io/badge/License-MIT-yellow.svg)](https://opensource.org/licenses/MIT)

## Установка

### Claude Desktop

```json
{
  "mcpServers": {
    "calltouch": {
      "command": "npx",
      "args": ["-y", "@theyahia/calltouch-mcp"],
      "env": {
        "CALLTOUCH_TOKEN": "ваш_токен",
        "CALLTOUCH_SITE_ID": "ваш_site_id"
      }
    }
  }
}
```

### Claude Code

```bash
claude mcp add calltouch -e CALLTOUCH_TOKEN=ваш_токен -e CALLTOUCH_SITE_ID=ваш_site_id -- npx -y @theyahia/calltouch-mcp
```

### Smithery

[![smithery badge](https://smithery.ai/badge/@theyahia/calltouch-mcp)](https://smithery.ai/server/@theyahia/calltouch-mcp)

```bash
npx -y @smithery/cli install @theyahia/calltouch-mcp --client claude
```

### Streamable HTTP

```bash
npx @theyahia/calltouch-mcp --http
# POST http://localhost:3000/mcp
# GET  http://localhost:3000/health
```

Порт настраивается через `PORT=8080`.

## Авторизация

| Переменная | Описание |
|------------|----------|
| `CALLTOUCH_TOKEN` | API-токен из личного кабинета Calltouch (обязательно) |
| `CALLTOUCH_SITE_ID` | ID сайта в Calltouch (обязательно) |

Base URL: `https://api.calltouch.ru/calls-service/RestAPI/`

## Инструменты (5)

| Инструмент | Описание |
|------------|----------|
| `get_calls` | Список звонков с детализацией: номер, источник, длительность, UTM |
| `get_statistics` | Агрегированная статистика: всего, уникальных, целевых, пропущенных |
| `get_leads` | Список лидов: заявки с сайта, формы обратной связи |
| `get_sources` | Источники трафика: каналы, кампании, эффективность |
| `get_tags` | Теги звонков: категории и метки |

## Скиллы (2)

| Скилл | Описание |
|-------|----------|
| `skill_calls_today` | Звонки за сегодня — быстрый отчёт |
| `skill_sources` | Эффективность источников — топ по звонкам |

## Примеры запросов

```
Покажи все звонки за сегодня
Какая статистика звонков за последнюю неделю?
Какие лиды пришли за март?
Какие источники самые эффективные?
Покажи теги за этот месяц
```

## Разработка

```bash
npm install
npm test
npm run dev          # stdio
npm run dev:http     # HTTP на порту 3000
```

## Реферальная программа

Calltouch предлагает реферальную программу: **15% пожизненно** с каждого приведённого клиента.
Подробности: [calltouch.ru/partners](https://www.calltouch.ru/partners/)

## Лицензия

MIT
