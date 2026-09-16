---
name: base-discovery
description: Разведка незнакомой базы 1С — конфигурация, сущности, поля, объёмы
argument-hint: "[что ищем]"
---

# /base-discovery — Что за база 1С перед нами

Первое, что делает агент на чужой базе. Ничего не пишет.

## Алгоритм

1. `get_config_preset` — типовая конфигурация (УТ 11 / ERP 2 / БП 3.0 / ЗУП 3.1): подсказывает имена документов и регистров, не ходя в базу.
2. `list_entities` (type — фильтр по виду сущности, search — подстрока) — список доступных в OData сущностей: Catalog_*, Document_*, четыре вида регистров, ChartOf*, Constant_*, DocumentJournal_*, Report_*.
3. `describe_entity` (entity) — поля одной сущности по одной образцовой записи. Дешевле полного `get_metadata`; полный EDMX бери только когда нужны типы и связи.
4. `count_entities` (entity, filter) — сколько записей реально есть. Делай это **до** выгрузки: строить выводы по обрезанной выборке нельзя.
5. Точечный поиск: `find_by_description` (entity, query, top) по полю Description, `get_by_key` (entity, ref_key, select) по GUID.
6. Быстрый взгляд на данные: `get_catalogs` (catalog_name, filter, select, top, skip, orderby) и `get_documents` (document_type, filter, top, orderby). Произвольный запрос с $expand — `odata_query`.

## Важно

- Ответы `get_catalogs` / `get_documents` / `odata_query` — конверт с полями value, returned, has_more, next_skip. **has_more: true = выборка неполная**: итоги, суммы и «сколько всего» по ней считать нельзя. Либо страница дальше со skip: next_skip, либо сузить фильтр, либо `count_entities`.
- Префикс Catalog_ / Document_ можно опускать — оба варианта имени принимаются.
- Часть модулей может быть отключена через ONEC_SERVICES: если инструмента нет в списке доступных, это конфигурация сервера, а не ошибка запроса.

## Формат ответа

```
## База 1С

**Конфигурация**: Управление торговлей 11 (по get_config_preset)
**Сущностей в OData**: 214 (справочников 96, документов 78, регистров 34)

### Ключевые документы
| Сущность | Записей |
|----------|---------|
| Document_РеализацияТоваровУслуг | 41 205 |
| Document_ПоступлениеТоваровУслуг | 12 880 |

### Поля Catalog_Контрагенты
Ref_Key, Description, ИНН, КПП, ЮридическоеФизическоеЛицо, DeletionMark
```

## Примеры

```
/base-discovery
/base-discovery найди справочник контрагентов
/base-discovery поля документа реализации
```
