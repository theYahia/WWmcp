# MCP-сервер для TGStat — аналитика Telegram-каналов через ИИ

> 🌍 Часть **[WWmcp](https://github.com/theYahia/WWmcp)** — коллекции из 46 MCP-серверов для развивающихся рынков (Россия, СНГ, MENA, Gulf, SE Asia, Africa). Единственная коллекция MCP, покрывающая не-западные API.

Если вы искали, как выгрузить статистику Telegram-канала не копируя её руками из TGStat, сравнить каналы перед закупкой рекламы или отследить упоминания бренда — это оно. 20 инструментов: поиск каналов и постов, динамика подписчиков и охватов, ERR, упоминания, тренды ключевых слов, сравнение каналов. Спрашиваете «сравни эти три канала по ERR за месяц» — получаете таблицу, а не десять вкладок.

[![npm](https://img.shields.io/npm/v/@theyahia/tgstat-mcp)](https://www.npmjs.com/package/@theyahia/tgstat-mcp)
[![CI](https://github.com/theYahia/WWmcp/actions/workflows/ci.yml/badge.svg)](https://github.com/theYahia/WWmcp/actions/workflows/ci.yml)
[![License: MIT](https://img.shields.io/badge/License-MIT-yellow.svg)](https://opensource.org/licenses/MIT)

## Установка

### 1. Получите токен

`TGSTAT_TOKEN` — API-ключ TGStat. Зарегистрируйтесь и получите токен на [api.tgstat.ru](https://api.tgstat.ru/) (нужен доступ к **Stat API** и/или **Search API** — разные инструменты требуют разных пакетов). Текущую квоту и срок пакета смотрите инструментом `get_usage`.

### 2. Подключите сервер

**Claude Desktop** (`claude_desktop_config.json`):

```json
{
  "mcpServers": {
    "tgstat": {
      "command": "npx",
      "args": ["-y", "@theyahia/tgstat-mcp"],
      "env": {
        "TGSTAT_TOKEN": "ваш_токен"
      }
    }
  }
}
```

**Claude Code:**

```bash
claude mcp add tgstat -e TGSTAT_TOKEN=ваш_токен -- npx -y @theyahia/tgstat-mcp
```

## Инструменты (20)

### Каналы

| Инструмент | Описание |
|------------|----------|
| `search_channels` | Поиск каналов по запросу с фильтрами категории / языка / страны / типа |
| `get_channel` | Профиль канала: подписчики, категория, индекс цитирования (ci_index), отметка РКН |
| `get_channel_stats` | Статистика: средний охват поста, ERR%, дневной охват |
| `get_channel_mentions` | Где канал упоминают / репостят другие каналы и чаты |
| `compare_channels` | Сравнение каналов (2–10) по подписчикам, охвату и ERR — таблицей |

### Посты

| Инструмент | Описание |
|------------|----------|
| `get_channel_posts` | Последние посты канала с просмотрами; фильтр по датам и пагинация |
| `get_post` | Детали поста: просмотры, репосты, реакции, текст |
| `search_posts` | Полнотекстовый поиск постов с фильтрами типа / категории / языка / страны / дат |
| `get_post_stats` | Динамика вовлечённости поста во времени |

### Метрики (динамика во времени)

| Инструмент | Описание |
|------------|----------|
| `get_channel_subscribers` | История числа подписчиков (group: hour/day/week/month) |
| `get_channel_views` | История суммарных просмотров постов |
| `get_channel_avg_reach` | История среднего охвата поста |
| `get_channel_err` | История ERR (engagement rate by reach) |
| `get_channel_forwards` | Посты других каналов, репостнувшие контент канала |

### Ключевые слова

| Инструмент | Описание |
|------------|----------|
| `get_word_mentions` | Динамика упоминаний слова/фразы по периодам (упоминания + просмотры) |
| `get_word_mentions_by_channels` | Разбивка упоминаний слова по каналам |

### Справочники

| Инструмент | Описание |
|------------|----------|
| `list_categories` | Коды категорий каналов (для фильтра `category`) |
| `list_countries` | Коды стран (для фильтра `country`) |
| `list_languages` | Коды языков (для фильтра `language`) |

### Использование

| Инструмент | Описание |
|------------|----------|
| `get_usage` | Квота и лимиты API: израсходовано запросов / каналов / слов, срок пакета |

## Формат вывода

Ответы **курируются**: возвращаются только релевантные поля (подписчики, охваты, ERR, текст-сниппет, ссылки), даты — в ISO. Это экономит токены контекста и упрощает ответы модели. Даты в фильтрах указываются как `YYYY-MM-DD` и автоматически конвертируются в Unix-таймстемпы, которых требует API.

## Примеры запросов

```
Найди Telegram-каналы про маркетинг на русском
Какая статистика у @durov — подписчики, средний охват, ERR?
Покажи рост подписчиков @vc_ru по неделям за последние 3 месяца
Сравни каналы @rbc_news, @kommersant и @vedomosti по охвату и ERR
Найди посты про AI за январь 2026
Построй динамику упоминаний слова «нейросети» по месяцам
Кто упоминает канал @thebell_io?
Сколько у меня осталось запросов в TGStat API?
```

## WWmcp — связки с соседними серверами

TGStat закрывает аналитику; соседние серверы из [WWmcp](https://github.com/theYahia/WWmcp) — действие:

- [`vk-ads-mcp`](https://github.com/theYahia/vk-ads-mcp) — рекламные кампании VK Ads
- [`sendpulse-mcp`](https://github.com/theYahia/sendpulse-mcp) · [`unisender-mcp`](https://github.com/theYahia/unisender-mcp) — email-рассылки

Пример сценария: *«Найди топ финтех-каналы в Telegram (tgstat), оцени их ERR, выбери три с лучшим охватом и подготовь email-анонс через unisender»*.

## Разработка

```bash
npm install
npm run build      # компиляция в dist/
npm run typecheck  # проверка типов, включая тесты
npm test           # vitest
```

## ⭐ Поддержать

Если сервер полезен — поставьте звезду этому репозиторию и [WWmcp](https://github.com/theYahia/WWmcp). Это помогает другим найти коллекцию серверов для не-западных API.

## Лицензия

MIT

---

Часть [WWmcp](https://github.com/theYahia/WWmcp) · Telegram: [@vhodvai](https://t.me/vhodvai)
