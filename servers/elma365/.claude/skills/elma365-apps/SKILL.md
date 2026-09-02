---
name: elma365-apps
description: Управление элементами приложений и BPM-задачами в ELMA365
argument-hint: <действие> [namespace/code]
allowed-tools:
  - Bash
  - Read
---

# /elma365-apps — Работа с приложениями и задачами ELMA365

## Алгоритм

1. Вызови `get_app_items` для получения элементов приложения
2. Вызови `create_item` для создания нового элемента
3. Вызови `get_tasks` для получения BPM-задач

## Формат ответа

```
## Элементы приложения deals/crm_deals

Найдено: 25 элементов

1. Сделка с ООО Ромашка — В работе
2. ...
```

## Примеры

```
/elma365-apps элементы deals/crm_deals
/elma365-apps создать элемент hr/candidates
/elma365-apps задачи
```
