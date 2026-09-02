# @theyahia/yandex-search-mcp

MCP server for **Yandex Cloud Search API** — Wordstat keyword research for the Russian market. 3 инструмента для сбора семантического ядра прямо из Claude.

[![npm](https://img.shields.io/npm/v/@theyahia/yandex-search-mcp)](https://www.npmjs.com/package/@theyahia/yandex-search-mcp)
[![License: MIT](https://img.shields.io/badge/License-MIT-yellow.svg)](https://opensource.org/licenses/MIT)

Часть серии [WWmcp](https://github.com/theYahia/WWmcp) by [@theYahia](https://github.com/theYahia).

> ⚠️ **Не путать с [yandex-wordstat-mcp](https://github.com/altrr2/yandex-tools-mcp)** (использует старый OAuth Wordstat API).  
> Этот сервер работает через **Yandex Cloud Search API** с `Api-Key` аутентификацией — без OAuth, без отдельной регистрации.

---

## Установка

### Claude Code

```bash
claude mcp add yandex-search \
  -e YANDEX_SEARCH_API_KEY=your_api_key \
  -e YANDEX_FOLDER_ID=your_folder_id \
  -- npx -y @theyahia/yandex-search-mcp
```

### Claude Desktop / Cursor

```json
{
  "mcpServers": {
    "yandex-search": {
      "command": "npx",
      "args": ["-y", "@theyahia/yandex-search-mcp"],
      "env": {
        "YANDEX_SEARCH_API_KEY": "your_api_key",
        "YANDEX_FOLDER_ID": "your_folder_id"
      }
    }
  }
}
```

---

## Авторизация

Нужны два параметра от **Yandex Cloud service account**:

| Переменная | Где взять |
|------------|-----------|
| `YANDEX_SEARCH_API_KEY` | Консоль Yandex Cloud → Сервисные аккаунты → API-ключи |
| `YANDEX_FOLDER_ID` | Консоль Yandex Cloud → Каталог → ID каталога |

Нужна роль `search-api.webSearch.user` на сервисном аккаунте.

---

## Инструменты (3)

| Инструмент | Описание | Quota |
|------------|----------|-------|
| `wordstat_top_requests` | Топ связанных запросов для фразы с месячным объёмом | 1 unit |
| `wordstat_regions` | Распределение спроса по регионам РФ + affinity index | 2 units |
| `wordstat_dynamics` | Месячный тренд объёма (работает для фраз >10K/мес) | 2 units |

---

## Примеры запросов

```
Покажи топ-30 запросов связанных с "купить смартфон" через Wordstat
Какие регионы России больше всего ищут "max бот"?
Покажи сезонность запроса "горнолыжный курорт" за 2022-2024
Собери семантическое ядро для категории "боты для бизнеса MAX"
Сравни региональный спрос для "gigachat" и "яндекс гпт"
```

---

## Ограничения API

- `wordstat_dynamics` возвращает данные только для высокочастотных запросов (>10 000 показов/мес). Для низкочастотников используйте `wordstat_top_requests`.
- `wordstat_regions` возвращает ID регионов — server автоматически преобразует топ-25 в читаемые названия.
- Yandex Cloud Search API: тарифы и квоты — [документация](https://cloud.yandex.ru/docs/search-api/pricing).

---

## Разработка

```bash
git clone https://github.com/theYahia/yandex-search-mcp
cd yandex-search-mcp
npm install
npm run dev   # stdio mode
```

---

## Лицензия

MIT

---

Часть монорепозитория [WWmcp](https://github.com/theYahia/WWmcp) · Telegram: [@vhodvai](https://t.me/vhodvai)
