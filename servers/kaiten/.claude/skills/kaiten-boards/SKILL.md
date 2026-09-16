---
name: kaiten-boards
description: Управление пространствами, досками и карточками в Kaiten
argument-hint: <действие> [параметры]
allowed-tools:
  - mcp__kaiten__list_spaces
  - mcp__kaiten__list_boards
  - mcp__kaiten__list_columns
  - mcp__kaiten__list_lanes
  - mcp__kaiten__list_cards
  - mcp__kaiten__create_card
  - mcp__kaiten__update_card
  - mcp__kaiten__move_card
  - mcp__kaiten__delete_card
  - mcp__kaiten__add_comment
  - mcp__kaiten__add_card_member
  - mcp__kaiten__add_card_tag
  - mcp__kaiten__create_checklist
---

# /kaiten-boards — Управление канбан-досками Kaiten

## Алгоритм

1. `list_spaces` — получить список пространств.
2. `list_boards` (с `space_id`) — доски в пространстве.
3. `list_columns` / `list_lanes` (с `board_id`) — колонки и дорожки доски.
4. `list_cards` — карточки с фильтрами (board_id, column_id, query, tag, owner_id, states…).
5. `create_card` / `update_card` / `move_card` / `delete_card` — действия над карточкой.
6. `add_comment`, `add_card_member`, `add_card_tag`, `create_checklist` — детали карточки.

## Формат ответа

```
## Доски Kaiten

### Доска: Разработка
Колонки: Бэклог | В работе | Готово
- Карточка 1 — В работе — Иванов
- ...
```

## Примеры

```
/kaiten-boards список пространств
/kaiten-boards доски в пространстве 5
/kaiten-boards карточки на доске 123
/kaiten-boards создать "Новая задача" на доске 123 колонка 456
/kaiten-boards назначить пользователя 42 на карточку 789 и тег bug
```
