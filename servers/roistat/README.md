# @theyahia/roistat-mcp

MCP-сервер для API Roistat — маркетинговая аналитика, лиды, рекламные каналы, затраты, интеграции. Требуется API-ключ и ID проекта.

[![npm](https://img.shields.io/npm/v/@theyahia/roistat-mcp)](https://www.npmjs.com/package/@theyahia/roistat-mcp)
[![License: MIT](https://img.shields.io/badge/License-MIT-yellow.svg)](https://opensource.org/licenses/MIT)

## Установка

### Claude Desktop

```json
{
  "mcpServers": {
    "roistat": {
      "command": "npx",
      "args": ["-y", "@theyahia/roistat-mcp"],
      "env": {
        "ROISTAT_API_KEY": "ваш_ключ",
        "ROISTAT_PROJECT_ID": "ваш_id_проекта"
      }
    }
  }
}
```

### Claude Code

```bash
claude mcp add roistat \
  -e ROISTAT_API_KEY=ваш_ключ \
  -e ROISTAT_PROJECT_ID=ваш_id_проекта \
  -- npx -y @theyahia/roistat-mcp
```

### Streamable HTTP

```bash
HTTP_PORT=3000 npx @theyahia/roistat-mcp --http
# POST /mcp — MCP endpoint
# GET  /health — health check
```

### Smithery

Конфиг в `smithery.yaml`. Требуемые параметры: `ROISTAT_API_KEY`, `ROISTAT_PROJECT_ID`.

## Авторизация

| Переменная | Обязательна | Описание |
|------------|-------------|----------|
| `ROISTAT_API_KEY` | Да | API-ключ проекта Roistat |
| `ROISTAT_PROJECT_ID` | Да | ID проекта в Roistat |

Base URL: `https://cloud.roistat.com/api/v1/`

## Инструменты (6)

| Инструмент | Описание |
|------------|----------|
| `get_analytics` | Аналитика: визиты, заявки, выручка, ROI по источникам |
| `get_visits` | Список визитов с источниками и UTM-метками |
| `get_leads` | Лиды (заявки) с фильтрацией по статусам |
| `get_channels` | Эффективность рекламных каналов: ROI, CPL, выручка |
| `get_costs` | Затраты на рекламу с группировкой по периодам |
| `get_integrations` | Список подключённых интеграций (CRM, аналитика) |

## Скиллы (Prompts)

| Скилл | Описание |
|-------|----------|
| `skill-analytics` | Аналитика за период — сводка по ключевым метрикам с топ-3 источниками |
| `skill-channels` | Эффективность рекламных каналов — сравнение ROI, рекомендации по бюджету |

## Примеры запросов

```
Какой ROI у рекламных каналов за последний месяц?
Покажи визиты за сегодня
Сколько лидов пришло за неделю?
Какие интеграции подключены?
Сравни затраты по каналам за март
```

## Реферальная программа Roistat

| Тип | Комиссия |
|-----|----------|
| Юридические лица | 25% от оплат клиента |
| ИП | 50% от оплат клиента |

Подробнее: [roistat.com/referral](https://roistat.com/referral/)

## Разработка

```bash
pnpm install        # из корня монорепозитория
pnpm test           # Vitest
pnpm dev            # stdio (tsx)
pnpm start:http     # HTTP-сервер (порт из HTTP_PORT, по умолчанию 3000)
```

## Лицензия

MIT
