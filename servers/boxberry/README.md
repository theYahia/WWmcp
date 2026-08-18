# boxberry-mcp

MCP-сервер для API Boxberry — поиск городов, пунктов выдачи, расчёт доставки, отслеживание, проверка индексов, услуги.

## Возможности (6 инструментов)

| Инструмент | Описание |
|---|---|
| `list_cities` | Список городов Boxberry с поиском по названию |
| `list_points` | Пункты выдачи в указанном городе |
| `calc_delivery` | Расчёт стоимости и сроков доставки |
| `track` | Отслеживание отправления по трек-номеру |
| `zip_check` | Проверка почтового индекса на зону доставки |
| `list_services` | Список оказанных услуг по отправлению |

## Быстрый старт (stdio)

```json
{
  "mcpServers": {
    "boxberry": {
      "command": "npx",
      "args": ["-y", "@theyahia/boxberry-mcp"],
      "env": {
        "BOXBERRY_API_TOKEN": "<YOUR_TOKEN>"
      }
    }
  }
}
```

## HTTP-транспорт (Streamable HTTP)

```bash
BOXBERRY_API_TOKEN=<TOKEN> npx @theyahia/boxberry-mcp --http
# Endpoint: http://localhost:3000/mcp
# Health:   http://localhost:3000/health
```

Порт настраивается через `PORT`:

```bash
PORT=8080 BOXBERRY_API_TOKEN=<TOKEN> npx @theyahia/boxberry-mcp --http
```

## Smithery

Файл `smithery.yaml` включён. Требует `BOXBERRY_API_TOKEN`.

## Переменные окружения

| Переменная | Обязательная | Описание |
|---|---|---|
| `BOXBERRY_API_TOKEN` | Да | API-токен из личного кабинета Boxberry |
| `PORT` | Нет | Порт для HTTP-транспорта (по умолчанию 3000) |

## Skills (Claude Code)

| Skill | Описание |
|---|---|
| `/skill-track <трек>` | Отследить посылку Boxberry |
| `/skill-calculate <город> <вес>` | Расчёт стоимости доставки |
| `/delivery <город> <вес>` | Полный цикл: город → ПВЗ → расчёт |

## Разработка

```bash
npm install
npm run build
npm test
BOXBERRY_API_TOKEN=<TOKEN> npm run dev
```

## Лицензия

MIT
