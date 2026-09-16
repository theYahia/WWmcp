# SuperJob MCP — поиск вакансий и работодателей через нейросеть

Если вы искали, как попросить ИИ подобрать вакансии на SuperJob под свои критерии, собрать выборку работодателей или следить за зарплатами в профессии без ручного листания сайта — это оно. **5 инструментов** поверх SuperJob.ru API: поиск вакансий, работодатели, справочники городов и профессий.

[![npm](https://img.shields.io/npm/v/@theyahia/superjob-mcp)](https://www.npmjs.com/package/@theyahia/superjob-mcp)
[![License: MIT](https://img.shields.io/badge/License-MIT-yellow.svg)](https://opensource.org/licenses/MIT)

Часть серии [Russian API MCP](https://github.com/theYahia/russian-mcp) (50 серверов) by [@theYahia](https://github.com/theYahia).

## Установка

### Claude Desktop (stdio)
```json
{
  "mcpServers": {
    "superjob": {
      "command": "npx",
      "args": ["-y", "@theyahia/superjob-mcp"],
      "env": {
        "SUPERJOB_SECRET_KEY": "ваш-ключ",
        "SUPERJOB_APP_ID": "ваш-app-id"
      }
    }
  }
}
```

### Claude Code
```bash
claude mcp add superjob -e SUPERJOB_SECRET_KEY=ваш-ключ -e SUPERJOB_APP_ID=ваш-app-id -- npx -y @theyahia/superjob-mcp
```

### Streamable HTTP
```bash
npx @theyahia/superjob-mcp --http --port=3000
```

### Smithery
```bash
npx -y @smithery/cli install @theyahia/superjob-mcp --client claude
```

## Переменные окружения

| Переменная | Обязательная | Описание |
|------------|-------------|----------|
| `SUPERJOB_SECRET_KEY` | Да | API secret key (получить на api.superjob.ru) |
| `SUPERJOB_APP_ID` | Нет | Application ID |
| `SUPERJOB_API_KEY` | Нет | Устаревший вариант (fallback для SECRET_KEY) |

## Инструменты (5)

| Инструмент | Описание |
|------------|----------|
| `search_vacancies` | Поиск вакансий по словам, городу, зарплате |
| `get_vacancy` | Полная информация о вакансии по ID |
| `search_employers` | Поиск работодателей по названию и городу |
| `get_towns` | Справочник городов (поиск, фильтр по стране) |
| `get_professions` | Справочник профессий и отраслей |

## Скиллы (Claude Code)

| Команда | Описание |
|---------|----------|
| `/find-job <специальность>` | Найди вакансии по специальности, городу, зарплате |
| `/salary <специальность>` | Анализ зарплат по специальности |

## Примеры

```
Найди вакансии Python в Москве от 200000
Покажи работодателей в IT в Санкт-Петербурге
Какие города есть в базе SuperJob?
Зарплаты по специальности DevOps
```

## Разработка

```bash
npm install
npm run build
npm test
```

## Лицензия
MIT

---

Telegram: [@vhodvai](https://t.me/vhodvai)
