---
name: balances
description: Остатки и обороты 1С — регистры накопления, бухгалтерские итоги, отчёты
argument-hint: "<регистр или счёт> [дата]"
---

# /balances — Остатки, обороты, сальдо

## Алгоритм — складские и товарные остатки

1. Найди имя регистра: `list_entities` с фильтром по регистрам накопления, либо возьми типовое имя из `get_config_preset`.
2. `get_accumulation_balance` (register_name, period, condition) — остатки регистра накопления на дату. Префикс AccumulationRegister_ опционален.
3. Обороты за период (выручка, себестоимость, прочие расходы) — `get_accumulation_balance` с table=Turnovers, start_period + end_period, dimensions (до каких измерений свернуть) и select. У регистров оборотов (ВыручкаИСебестоимостьПродаж) есть только Turnovers.
4. Нужны движения, а не итог — `get_register` (register_type: AccumulationRegister или InformationRegister, register_name, filter, select, top, skip, orderby).

## Алгоритм — бухгалтерские итоги

1. `get_accounting_balance` (register_name, table, period либо start_period + end_period, condition, account_condition, select, filter, orderby, top, skip) — сальдо и обороты по счетам. Обороты счёта с корреспонденцией — table=Turnovers, select только нужных полей (например, Account_Key, ExtDimension1, BalancedAccount_Key, СуммаTurnoverDr, СуммаTurnoverCr).
2. Проводки построчно — `get_accounting_register` (register_name, filter, select, top, orderby).
3. Готовый отчёт конфигурации, если он выведен в OData, — `get_report` (report_url).

## Алгоритм — сверка с документами

1. `get_documents` (document_type, filter по полю Date, top, orderby) — документы периода.
2. `get_document_lines` — табличная часть конкретного документа.
3. Расхождение остатка и документов почти всегда = непроведённые документы: отфильтруй по признаку Posted eq false.

## Важно

- **has_more: true в ответе = выборка обрезана.** Сумму, максимум и «всего» по ней не считать: либо страница дальше со skip: next_skip, либо сузить фильтр, либо `count_entities`.
- **Остатки и обороты без select легко упираются в лимит ответа** (~45 000 символов). Перечисляй в select только нужные поля; если всё равно `truncated` — разбей период по месяцам или листай top + skip с orderby. Страницы виртуальной таблицы без orderby инструмент не даёт: порядок строк иначе не стабилен.
- Даты в OData-фильтрах — литерал вида datetime'2026-08-01T00:00:00', без него 1С вернёт ошибку разбора.
- Итог на дату и сумма движений до даты — разные вещи; для «сколько лежит сейчас» бери `get_accumulation_balance`, а не сумму по `get_register`.

## Формат ответа

```
## Остатки на 2026-09-01

Регистр: ТоварыНаСкладах

| Номенклатура | Склад | Количество |
|--------------|-------|------------|
| Кружка синяя | Основной | 128 |

Записей вернулось: 100, has_more: true → выборка неполная, итог не считаю.
```

## Примеры

```
/balances ТоварыНаСкладах 2026-09-01
/balances сальдо по счёту 62 за август
/balances движения регистра ВзаиморасчётыСКонтрагентами
```
