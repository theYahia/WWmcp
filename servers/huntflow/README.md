# @theyahia/huntflow-mcp

MCP-сервер для HuntFlow ATS API — вакансии, кандидаты, резюме, этапы, справочники, аккаунты. **14 инструментов, 2 скилла.**

[![npm](https://img.shields.io/npm/v/@theyahia/huntflow-mcp)](https://www.npmjs.com/package/@theyahia/huntflow-mcp)
[![CI](https://github.com/theYahia/huntflow-mcp/actions/workflows/ci.yml/badge.svg)](https://github.com/theYahia/huntflow-mcp/actions/workflows/ci.yml)
[![License: MIT](https://img.shields.io/badge/License-MIT-yellow.svg)](https://opensource.org/licenses/MIT)

![Демонстрация: вопрос «какие вакансии открыты и по какой вилке» — агент вызывает list_vacancies и отвечает таблицей вакансий](./assets/demo.svg)

Часть серии [WWmcp](https://github.com/theYahia/WWmcp) (46 серверов).

## Установка

### Claude Desktop (stdio)
```json
{
  "mcpServers": {
    "huntflow": {
      "command": "npx",
      "args": ["-y", "@theyahia/huntflow-mcp"],
      "env": {
        "HUNTFLOW_TOKEN": "ваш-access-token",
        "HUNTFLOW_REFRESH_TOKEN": "ваш-refresh-token"
      }
    }
  }
}
```

### Streamable HTTP
```bash
HUNTFLOW_TOKEN=ваш-токен npx @theyahia/huntflow-mcp --http
# POST /mcp, GET /health на 127.0.0.1:3000 (PORT=...)
```

### Smithery
```bash
npx @smithery/cli install @theyahia/huntflow-mcp
```

## Получение токена

Настройки HuntFlow → вкладка **«API-токены» (API Tokens)** → создать токен. Выданная пара включает **access-токен** (живёт ~7 дней) и **refresh-токен** (~14 дней). Сервер автоматически обновляет access-токен через `POST /token/refresh` при истечении и **сохраняет ротированную пару** в файл состояния (`HUNTFLOW_TOKEN_FILE`), переживая рестарты. Если задать только `HUNTFLOW_TOKEN` без refresh — сервер проработает до истечения access-токена (~7 дней), затем потребуется новый токен.

## Переменные окружения

| Переменная | Обяз. | Описание |
|------------|:---:|----------|
| `HUNTFLOW_TOKEN` | да | Access-токен (Настройки → API-токены) |
| `HUNTFLOW_REFRESH_TOKEN` | нет | Refresh-токен — включает авто-обновление при 401 |
| `HUNTFLOW_TOKEN_FILE` | нет | Файл для хранения ротированной пары (по умолчанию `~/.huntflow-mcp/token.json`) |
| `HUNTFLOW_BASE_URL` | нет | По умолчанию `https://api.huntflow.ru/v2` |
| `HUNTFLOW_USER_AGENT` | нет | User-Agent (обязателен для API; есть дефолт) |
| `HUNTFLOW_TIMEOUT_MS` | нет | Таймаут запроса, мс (по умолчанию 10000) |
| `HUNTFLOW_DISABLE_RATELIMIT` | нет | `1` — отключить клиентский лимит 10 req/s |
| `PORT` | нет | Порт HTTP-сервера (по умолчанию 3000) |
| `HUNTFLOW_HTTP_HOST` | нет | Хост привязки HTTP (по умолчанию `127.0.0.1`) |
| `HUNTFLOW_HTTP_SECRET` | нет | Если задан — требует `Authorization: Bearer <secret>` на `/mcp` |
| `HUNTFLOW_ALLOWED_HOSTS` | нет | Список host:port для защиты от DNS-rebinding |

## Инструменты (14)

| Инструмент | Описание |
|------------|----------|
| `list_accounts` | Список доступных аккаунтов |
| `list_vacancies` | Список вакансий (фильтры `opened`/`state`/`mine`, пагинация) |
| `get_vacancy` | Полная информация о вакансии |
| `search_applicants` | Поиск кандидатов (`q` + фильтры vacancy/status/tag) |
| `list_vacancy_applicants` | Кандидаты, прикреплённые к конкретной вакансии |
| `get_applicant` | Полная информация о кандидате |
| `get_applicant_resumes` | Список резюме (external) кандидата |
| `get_resume` | Полное тело конкретного резюме (external) |
| `list_stages` | Этапы воронки подбора (статусы вакансий) |
| `list_coworkers` | Сотрудники/рекрутеры аккаунта |
| `list_sources` | Справочник источников кандидатов |
| `list_rejection_reasons` | Справочник причин отказа |
| `list_divisions` | Справочник подразделений |
| `list_tags` | Справочник тегов |

Списочные инструменты возвращают курированный набор полей (экономия токенов) + `structuredContent`; передайте `raw: true` для полного сырого ответа. Пагинация — параметры `page`/`count`.

## Скиллы (Prompts)

| Скилл | Описание |
|-------|----------|
| `skill-applicants` | Кандидаты на вакансию — таблица с этапами и сводкой |
| `skill-vacancy-stats` | Статистика по вакансии — воронка, сроки, конверсия |

## Разработка

```bash
npm install
npm test           # vitest
npm run typecheck  # tsc --noEmit
npm run lint       # eslint
npm run format     # prettier --write
npm run dev        # tsx src/index.ts
npm run build      # tsc
```

## Примеры запросов

Спросите ИИ:

- «Покажи открытые вакансии в HuntFlow» — `list_accounts`, затем `list_vacancies`
- «Кто из кандидатов прикреплён к вакансии и на каких этапах воронки» — `list_vacancy_applicants`, затем `list_stages`
- «Найди кандидата по email и покажи его резюме» — `search_applicants`, затем `get_applicant_resumes` и `get_resume`

## Лицензия
MIT

---

Часть монорепозитория [WWmcp](https://github.com/theYahia/WWmcp) · Telegram: [@vhodvai](https://t.me/vhodvai)
