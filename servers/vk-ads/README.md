# @theyahia/vk-ads-mcp

MCP-сервер для **VK Ads API v2** (`ads.vk.com/api/v2`) — кампании, группы объявлений, объявления, статистика, баланс. 8 инструментов.

[![npm](https://img.shields.io/npm/v/@theyahia/vk-ads-mcp)](https://www.npmjs.com/package/@theyahia/vk-ads-mcp)
[![License: MIT](https://img.shields.io/badge/License-MIT-yellow.svg)](https://opensource.org/licenses/MIT)

> Модель данных VK Ads: **`ad_plans` (кампании) → `ad_groups` (группы) → `banners` (объявления)**.
> Имена инструментов оставлены дружелюбными (`list_campaigns`, `list_ads`), но обращаются к реальным v2-ресурсам.

## Установка

### Claude Desktop

```json
{
  "mcpServers": {
    "vk-ads": {
      "command": "npx",
      "args": ["-y", "@theyahia/vk-ads-mcp"],
      "env": {
        "VK_ADS_TOKEN": "ваш_токен"
      }
    }
  }
}
```

### Claude Code

```bash
claude mcp add vk-ads -e VK_ADS_TOKEN=ваш_токен -- npx -y @theyahia/vk-ads-mcp
```

## Авторизация

| Переменная | Обязательна | Назначение |
|---|---|---|
| `VK_ADS_TOKEN` | ✅ | OAuth2 Bearer access_token VK Ads API |
| `VK_ADS_CLIENT_ID` | — | для авто-обновления токена (refresh) |
| `VK_ADS_CLIENT_SECRET` | — | для авто-обновления токена (refresh) |
| `VK_ADS_REFRESH_TOKEN` | — | для авто-обновления токена (refresh) |

`access_token` живёт ~1 день. Если заданы все три refresh-переменные, сервер на `401` сам обновит токен
через `grant_type=refresh_token`. Иначе — обновляйте `VK_ADS_TOKEN` вручную.

**Кабинет выбирается токеном, а не параметром.** В VK Ads v2 нет `account_id` в запросах: агентство/менеджер
получает отдельный per-client токен (`agency_client_credentials`) и подписывает им запросы нужного кабинета.

## Инструменты (8)

| Инструмент | Метод | Описание |
|------------|-------|----------|
| `list_campaigns` | `GET /ad_plans.json` | Кампании (ad_plans), фильтр по статусу, авто-пагинация |
| `create_campaign` | `POST /ad_plans.json` | Создать кампанию: `name`, `objective`, `budget_limit`, `budget_limit_day` |
| `update_campaign` | `POST /ad_plans/{id}.json` | Обновить: `name`/бюджет/`action` (activate/stop/delete) |
| `list_ad_groups` | `GET /ad_groups.json` | Группы объявлений с таргетингом (delivery), фильтр по кампаниям |
| `list_ads` | `GET /banners.json` | Объявления (banners), фильтр по группам, авто-пагинация |
| `create_ad` | `POST /banners.json` | Создать объявление: `ad_group_id`, `textblocks`, `urls`, `content` |
| `get_statistics` | `GET /statistics/{type}/{period}.json` | Показы (`shows`), клики, расход; `period` = day/summary |
| `get_account` | `GET /user.json` | Кабинет и баланс (нужен scope `read_payments`) |

Все инструменты используют MCP-аннотации (`readOnlyHint`/`destructiveHint`/`idempotentHint`), а read-инструменты —
`outputSchema` + `structuredContent` для типизированного и компактного ответа. Списки пагинируются автоматически
(до 200 объектов; больше — флаг `truncated` в ответе).

## Примеры запросов

```
Покажи активные кампании
Создай кампанию "Осенняя акция" с целью traffic и бюджетом 50000
Останови кампанию 12345
Какие группы объявлений в кампании 12345?
Статистика кампании 12345 за январь 2026 по дням
Покажи баланс кабинета
```

## Миграция 1.x → 2.0 (breaking)

Версия 1.x обращалась к **легаси** API (`/campaigns.json`, `/ads.json`, плоский `/statistics.json`, `account_id`,
числовые статусы) и фактически не работала против `ads.vk.com/api/v2`. В 2.0 переписан весь API-слой:

- `account_id` **удалён** из всех инструментов — кабинет задаётся токеном.
- `update_campaign`: вместо `status: 1/0` → `action: activate|stop|delete` (строковые статусы `active/blocked/deleted`).
- Бюджет: `all_limit` → `budget_limit` / `budget_limit_day` (валюта кабинета, не копейки).
- `create_campaign`: `type` → `objective` (цель кампании).
- `create_ad`: вместо `{ad_format,title,description,link_url}` → `{ad_group_id, textblocks, urls, content}`.
- `get_statistics`: `ids_type`/`period=week|month|overall` → `object_type` и `period=day|summary` в пути URL.
- `list_targeting_groups` → **`list_ad_groups`** (таргетинг живёт на группе объявлений).
- `get_budget` → **`get_account`** (баланс читается из `/user.json`).

## Точность API

Эндпоинты и поля подтверждены официальной документацией `target.vk.ru` и 5 независимыми рабочими клиентами.
Несколько деталей помечены в коде `// VERIFY:` (единицы бюджета, поле баланса, полный enum `objective`, путь update)
и требуют подтверждения живым токеном — см. **[`docs/VERIFICATION.md`](docs/VERIFICATION.md)** (~10 минут).

## Возможный follow-up (вне текущего объёма)

Массовые действия (`mass_action`), список клиентов агентства (`agency/clients`), загрузка креативов
(`upload_creative`), состояние лимитов (`throttling`), справочники таргетинга (`regions`/`interests`),
конверсии и remarketing-аудитории.

## Разработка

```bash
npm install
npm run build      # tsc
npm test           # vitest
npm run dev        # tsx src/index.ts (читает .env — см. .env.example)
```

## Лицензия

MIT
