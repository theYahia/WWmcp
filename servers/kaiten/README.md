# MCP-сервер для Kaiten — канбан-доски, карточки и спринты через ИИ

> 📦 Часть **[WWmcp — Emerging Markets MCP](https://github.com/theYahia/WWmcp)** — 46 MCP-серверов к незападным API (Бразилия / MENA / Залив / Юго-Восточная Азия / Африка / СНГ).

Если вы искали, как подключить Kaiten к нейросети, разобрать доску и двигать карточки не перетаскивая их мышкой — это оно. 63 инструмента: пространства, доски, колонки, дорожки, карточки с фильтрами, комментарии, участники, теги, чек-листы, дочерние карточки, внешние ссылки, блокировки, типы карточек, спринты, кастомные поля и пользователи. Пишете «перенеси всё из Review в Done и поставь дедлайн на пятницу» — переносит.

> MCP-сервер к API канбан-платформы **Kaiten**. **63 инструмента**: пространства, доски, колонки, дорожки, карточки (с богатыми фильтрами), комментарии, участники, теги, чек-листы, дочерние карточки, внешние ссылки, блокировки, типы карточек, спринты, кастомные поля и пользователи.

[![npm](https://img.shields.io/npm/v/@theyahia/kaiten-mcp)](https://www.npmjs.com/package/@theyahia/kaiten-mcp)
[![License: MIT](https://img.shields.io/badge/License-MIT-yellow.svg)](https://opensource.org/licenses/MIT)

Часть серии [WWmcp](https://github.com/theYahia/WWmcp) от [@theYahia](https://github.com/theYahia).

## Быстрый старт

### Claude Desktop

Добавьте в `claude_desktop_config.json`:

```json
{
  "mcpServers": {
    "kaiten": {
      "command": "npx",
      "args": ["-y", "@theyahia/kaiten-mcp"],
      "env": {
        "KAITEN_DOMAIN": "your-domain",
        "KAITEN_TOKEN": "your-api-token"
      }
    }
  }
}
```

### Claude Code

```bash
claude mcp add kaiten -e KAITEN_DOMAIN=your-domain -e KAITEN_TOKEN=your-token -- npx -y @theyahia/kaiten-mcp
```

### Cursor / Windsurf

```json
{
  "kaiten": {
    "command": "npx",
    "args": ["-y", "@theyahia/kaiten-mcp"],
    "env": { "KAITEN_DOMAIN": "your-domain", "KAITEN_TOKEN": "your-api-token" }
  }
}
```

## Авторизация

1. В Kaiten откройте **Профиль → API-токены** и создайте токен.
2. Запомните свой поддомен (например, `mycompany` из `mycompany.kaiten.ru`).

| Переменная        | Обяз.    | Описание                                                                                                                       |
| ----------------- | -------- | ----------------------------------------------------------------------------------------------------------------------------- |
| `KAITEN_DOMAIN`   | да\*     | Поддомен (`mycompany`) **или** полный хост (`mycompany.kaiten.io`). Голый поддомен разворачивается в `.kaiten.ru`.             |
| `KAITEN_TOKEN`    | да       | Bearer-токен из раздела Профиль → API-токены.                                                                                  |
| `KAITEN_BASE_URL` | нет      | Полный базовый URL API для **self-hosted / on-premise** Kaiten, например `https://kaiten.mycorp.ru/api/latest`. Перекрывает `KAITEN_DOMAIN`. |

\* `KAITEN_DOMAIN` обязателен, если не задан `KAITEN_BASE_URL`.

У токена должны быть права на те сущности, с которыми вы работаете: читающим инструментам нужны права просмотра, а создающим, изменяющим и удаляющим — права редактирования.

## Попробуйте этот промпт

> _«Создай задачу в колонке „In Progress“ доски „Sprint 23“, назначь @alex, добавь тег bug»_

Агент выстроит цепочку `list_spaces` → `list_boards` → `list_columns` → `create_card` → `list_users` → `add_card_member` → `add_card_tag`.

## Инструменты (63)

Количество считается по реестру при старте; точное число сервер пишет в лог при запуске.

### Пространства

`list_spaces` · `get_space` · `create_space` · `update_space` · `delete_space`

### Доски, колонки, дорожки

`list_boards` · `get_board` · `create_board` · `update_board` · `delete_board` · `list_columns` · `create_column` · `update_column` · `delete_column` · `list_lanes` · `create_lane` · `update_lane` · `delete_lane`

### Карточки

`list_cards` (богатые фильтры: доска/колонка/дорожка/пространство, поисковый запрос, тег, тип, владелец, ответственный, участники, состояния, условие, архив, ASAP, просрочка, сроки, сортировка) · `get_card` · `create_card` · `update_card` (заголовок, описание, владелец, срок, ASAP, размер) · `move_card` (колонка + дорожка) · `delete_card` · `get_card_location_history`

### Комментарии

`add_comment` · `list_comments` · `update_comment` · `delete_comment`

### Участники и теги карточек

`list_card_members` · `add_card_member` · `update_card_member_role` · `remove_card_member` · `list_card_tags` · `add_card_tag` · `remove_card_tag`

### Чек-листы

`create_checklist` · `get_checklist` · `update_checklist` · `remove_checklist` · `add_checklist_item` · `update_checklist_item` · `remove_checklist_item`

### Дочерние карточки, ссылки, блокировки

`list_card_children` · `add_card_child` · `remove_card_child` · `list_card_external_links` · `add_card_external_link` · `update_card_external_link` · `remove_card_external_link` · `list_card_blockers` · `block_card` · `update_card_blocker` · `unblock_card`

### Рабочее пространство и справочники

`list_tags` · `list_users` · `get_current_user` · `list_card_types` · `list_sprints` · `get_sprint_summary` · `list_custom_properties` · `get_custom_property` · `list_custom_property_select_values`

> Списочные инструменты возвращают **компактную проекцию** (только ключевые поля), чтобы не жечь токены на больших досках. Инструменты `get_*` и все мутации возвращают полный JSON API.

## HTTP-транспорт

По умолчанию сервер общается через stdio (для Claude Desktop и Claude Code). Чтобы запустить его как streamable-HTTP сервер:

```bash
kaiten-mcp --http 3000
# или
HTTP_PORT=3000 kaiten-mcp
```

- `GET /health` → `{ status, tools, version }`
- `POST /mcp` → эндпоинт MCP streamable-HTTP

CORS выключен по умолчанию: задайте `KAITEN_HTTP_CORS_ORIGIN` с разрешённым origin (эндпоинт действует от имени вашего токена, поэтому никакого дефолтного wildcard нет).

## Демо-промпты

```
Покажи все пространства, потом доски в пространстве 5
Покажи колонки и дорожки на доске 123
Создай карточку «Починить баг входа» на доске 123 в колонке 456
Поставь карточке 789 срок на следующую пятницу и пометь как ASAP
Добавь @alex в участники карточки 789 и повесь тег «bug»
Добавь к карточке 789 чек-лист «QA» с пунктами «написать тесты» и «выкатить»
Перенеси карточку 789 в колонку «Done»
Кто я? (get_current_user)
```

## Решение проблем

- **401 / ошибка авторизации** — проверьте, что `KAITEN_TOKEN` действителен и имеет права на нужную сущность. Сервер сообщает об ошибках авторизации явно.
- **`.kaiten.io` / self-hosted** — задайте `KAITEN_DOMAIN` как полный хост (`acme.kaiten.io`) или `KAITEN_BASE_URL` как полный базовый URL вашего API.
- **`list_boards` ничего не возвращает без `space_id`** — Kaiten отдаёт доски по пространствам; передайте `space_id` (это документированный путь).

## Что не вошло

Эти возможности есть в API Kaiten, но сознательно оставлены за рамками интерактивного ассистента: SCIM-провижининг, массовые импорты, фреймворк аддонов и управление подписками на вебхуки. Документы и итерации, а также записывающие операции по кастомным полям и типам карточек пока не вынесены (формат их запросов нужно подтвердить на живом инстансе) — заведите issue, если они вам нужны.

## Разработка

```bash
npm install
npm run dev        # запуск из исходников (tsx)
npm run build      # сборка в dist/
npm test           # vitest
npm run coverage   # vitest + покрытие
npm run lint       # eslint
npm run typecheck  # tsc --noEmit
```

## Справочник API

Официальная документация API Kaiten: <https://developers.kaiten.ru>

## Хорошо сочетается с

- **[planfix-mcp](https://github.com/theYahia/planfix-mcp)** — российский таск-трекер и CRM
- **[megaplan-mcp](https://github.com/theYahia/megaplan-mcp)** — российская all-in-one бизнес-платформа
- **[yandex-tracker-mcp](https://github.com/theYahia/yandex-tracker-mcp)** — трекер Яндекса в духе Jira

Все 46 серверов — в [каталоге WWmcp](https://github.com/theYahia/WWmcp).

## Лицензия

MIT

---

**Часть [WWmcp](https://github.com/theYahia/WWmcp)** — каталог MCP для развивающихся рынков. ⭐ Поставьте звезду каталогу, если серверы оказались полезны, и [заведите issue](https://github.com/theYahia/WWmcp/issues), если нужен сервер к ещё одному незападному API.

---

Часть [WWmcp](https://github.com/theYahia/WWmcp) · Telegram: [@vhodvai](https://t.me/vhodvai)
