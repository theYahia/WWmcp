# Typed-config presets (Фаза 2) — УТ 11 / БП 3.0 / ЗУП 3.1 / ERP 2

Дата: 2026-08-04. Пакет: `@theyahia/aprovodka@4.0.0`.
Тезис ROADMAP Фаза 2: «оно уже знает 1С:Бухгалтерию» — курированные схемы, русские описания, готовые примеры запросов из коробки.

## Что сделано

Пресеты = **данные** (TS-модули, ноль I/O, ноль новых зависимостей) + **один тонкий загрузчик** + **один инструмент**. Общие точки регистрации (`src/server.ts`, `MODULE_TOOL_COUNTS`) НЕ тронуты — подключение описано ниже одной строкой.

## Файлы

| Файл | Что |
|---|---|
| `src/presets/types.ts` | Типы: `ConfigPreset`, `PresetEntity`, `PresetExample`, `Confidence` |
| `src/presets/common.ts` | Платформенное знание, общее для всех конфигураций: префиксы сущностей, стандартные поля, литералы OData, табличные части, виртуальные таблицы регистров, 11 ловушек платформы |
| `src/presets/bp30.ts` | 1С:Бухгалтерия предприятия 3.0 — 19 сущностей, 10 примеров, 9 ловушек |
| `src/presets/ut11.ts` | 1С:Управление торговлей 11 — 21 сущность, 10 примеров, 7 ловушек |
| `src/presets/zup31.ts` | 1С:ЗУП 3.1 — 18 сущностей, 10 примеров, 7 ловушек |
| `src/presets/erp2.ts` | 1С:ERP УП 2 — 13 сущностей, 8 примеров, 6 ловушек (надстройка над `ut11`, торговый контур не дублируется) |
| `src/presets/index.ts` | Загрузчик: `PRESETS`, `listPresets()`, `getPreset(id\|alias)`, `getPresetWithCommon()` |
| `src/tools/presets.ts` | Инструмент `get_config_preset` + `registerPresetTools(server)` |
| `tests/presets.test.ts` | 14 тестов |

## Точка подключения (одна, не сделана намеренно)

В `src/server.ts`, внутри `createServer()`:

```ts
import { registerPresetTools } from "./tools/presets.js";
// …
registerPresetTools(server);   // рядом с блоками if (modules.has(...))
```

Опционально, если пресеты должны выключаться через `ONEC_SERVICES`:
* в `MODULE_TOOL_COUNTS` добавить `presets: 1`;
* в `OPTIONAL_MODULES` добавить `"presets"`;
* обернуть вызов в `if (modules.has("presets"))`.

Инструмент не ходит в сеть и не требует `ONEC_BASE_URL` — его можно оставить всегда включённым, как блок `meta`. Тогда правки в `MODULE_TOOL_COUNTS` нужна только одна: счётчик `meta: 4` → `5` (иначе `/health` покажет 32 вместо 33).

## Инструмент

`get_config_preset(config?)`

* без `config` → список пресетов (id, имя, синонимы, счётчики);
* с `config` (id **или синоним**: `бухгалтерия`, `ут`, `зуп`, `erp`, `accounting`, `trade`, `payroll`…) → сущности + примеры + ловушки конфигурации **плюс** блок `platform` (общее знание из `common.ts`) плюс `how_to_read`;
* неизвестный `config` → JSON с ошибкой и списком доступных, без исключения.

Один инструмент вместо двух (`list` + `get`) — список это тот же вызов без аргумента.

## Анти-фабрикация: поле `confidence`

Каждая сущность помечена:

* **`verified`** — имя встречено в источнике из `sources` этого пресета;
* **`common`** — типовое имя из практики, первоисточником в этой сборке **не подтверждено**.

Это же правило продублировано в ответе инструмента (`how_to_read`), чтобы модель не считала пресет гарантией.

Подтверждено первоисточниками (`verified`): БП 3.0 — 8 из 19, УТ 11 — 6 из 21, ERP 2 — 2 из 13, ЗУП 3.1 — **0 из 18**. Итого 16 из 71.

**ЗУП 3.1 — самый слабый пресет.** Публичных примеров OData-запросов к ЗУП в открытом доступе почти нет: все имена помечены `common`, а первые два примера в пресете — это `list_entities` для проверки реальных имён на конкретной базе. Это заявлено прямо в `summary` и `sources` пресета.

## Источники (прочитаны 2026-08-04)

| URL | Что подтвердил |
|---|---|
| `https://1cfresh.com/articles/data_odata` | Полная таблица префиксов (включая `CalculationRegister_`, `ChartOfAccounts_`), стандартные поля (`Ref_Key`, `DataVersion`, `DeletionMark`, `Predefined`, `IsFolder`, `Parent_Key`, `Posted`…), формат табличных частей `Document_X_ИмяТЧ` и навигация `Document_X(guid'…')/ИмяТЧ`, `Catalog_Организации`, `Catalog_Номенклатура`, `Catalog_ФизическиеЛица` + реквизит `Пол` |
| `https://master1c8.ru/…/glava-17-mehanizm-internet-servisov/7188/` | Регистры накопления: `Balance(Condition, Dimensions, Period)`, `Turnovers(Condition, Dimensions, StartPeriod, EndPeriod)`, `BalanceAndTurnovers`; суффиксы результата `…Balance`, `…OpeningBalance`, `…ClosingBalance`, `…Turnover`, `…Receipt`, `…Expense`; измерения как `<Измерение>_Key` |
| `https://master1c8.ru/…/glava-17-mehanizm-internet-servisov/7095/` | Регистры бухгалтерии: `RecordsWithExtDimensions`, `Turnovers`, `Balance`, `BalanceAndTurnovers`, `ExtDimensions`; поля `Period`, `LineNumber`, `Active`, `AccountDr_Key`, `AccountCr_Key` |
| `https://infostart.ru/1c/articles/2714438/` | Реальные запросы к регистру бухгалтерии + грабли: `$select` не работает с `Balance`/`BalanceAndTurnovers`; `Balance` ожидает `AccountCondition`; `ExtDimension*` через `$select` → HTTP 400; смешение знаков активных/пассивных счетов; счета 90/91/99 |
| `https://tnsoft.ru/blog/udalen-registr-nakopleniya-svobodnyeostatki-chto-vmesto-nego/` | Регистр `СвободныеОстатки` **удалён в УТ 11.5.7 и ERP 2.5.7**, замена — `РегистрСведений.РаспределениеЗапасов` |
| `https://examples.loginom.ru/integration-1c-odata/index.html` (через выдачу) | Импорт из УТ 11.4 по OData: остатки регистра `ТоварыНаСкладах`, справочник упаковок/единиц измерения |
| `https://forum.infostart.ru/forum9/topic282541/` (через выдачу) | `AccountingRegister_Хозрасчетный`; `…_RecordType` доступен только на чтение, наборы записей — через `…_RowType` |
| выдача по `Catalog_Контрагенты` / `Document_ПоступлениеТоваровУслуг` | Реквизиты `ИНН`, `Телефон`, `Факс`; `Recorder eq cast(guid'…','Document_ПоступлениеТоваровУслуг')`; `Catalog_ДоговорыКонтрагентов` |

**НЕ подтверждено, помечено `TODO` в коде:** точное имя виртуальной таблицы оборотов Дт/Кт регистра бухгалтерии (`DrCrTurnover` или `DrCrTurnovers`) — источник даёт обе формы, в `common.ts` стоит явный TODO «сверить по `get_metadata`».

## Найдено при чтении кода (не выдумано — проверено по `src/`)

1. **Гэп инструментов.** Виртуальные таблицы регистра **бухгалтерии** (`Balance`/`Turnovers`/`BalanceAndTurnovers`) ни одним из 32 инструментов не обёрнуты. `odata_query` их выразить не может — `buildODataPath` кодирует `/` и скобки через `encodeURIComponent`. `get_accumulation_balance` работает только с `AccumulationRegister_*`. Записано в ловушки `bp30`; кандидат в отдельный инструмент `get_accounting_balance`.
2. **Асимметрия аргументов.** `get_catalogs.catalog_name` и `get_documents.document_type` ждут **полное** имя (`Catalog_Контрагенты`), а `get_register.register_name` / `get_accumulation_balance.register_name` / `get_accounting_register.register_name` — имя **без префикса**. На этом легко ошибиться; в тест добавлена проверка обоих правил по всем примерам пресетов (первая версия примеров именно на этом и падала).
3. **`list_entities` с `type`-фильтром знает только** `Catalog_`, `Document_`, `AccumulationRegister_`, `InformationRegister_`, `Report_` (`src/tools/metadata.ts`, `prefixMap`). Для `AccountingRegister_`, `CalculationRegister_`, `ChartOfAccounts_`, `Constant_` нужен `type="all"`. Критично для ЗУП (весь расчёт зарплаты — в `CalculationRegister_*`). Записано в ловушки `common` и `zup31`.

## Тесты — реальный вывод

```
$ npx vitest run tests/presets.test.ts

 RUN  v4.1.2 D:/Yahia/active/wwmcps/WWmcp/servers/aprovodka

 Test Files  1 passed (1)
      Tests  14 passed (14)
   Start at  14:17:45
   Duration  1.80s (transform 385ms, setup 0ms, import 952ms, tests 32ms, environment 0ms)
```

Полный прогон пакета (вместе с файлами параллельного агента):

```
$ npx vitest run

 Test Files  8 passed (8)
      Tests  119 passed (119)
   Duration  3.13s
```

`npx tsc --noEmit` — чисто.

Что проверяет тест: загрузку всех четырёх пресетов · уникальность id и синонимов · поиск по синониму без учёта регистра и пробелов · соответствие имени сущности префиксу своего вида · отсутствие дублей имён · наличие русского описания и `confidence` · **что каждый `example.tool` — реально зарегистрированный инструмент** · **что аргументы примеров совпадают с формой схем** (полное имя vs имя без префикса, отсутствие `/` и скобок в `odata_query.entity`) · три ветки самого инструмента (без `config`, с `config`, неизвестный `config`).

## Что НЕ сделано (осознанно)

* **MCP resources / prompts на пресетах** — инструмента достаточно; ресурсы поддерживает не каждый клиент.
* **Автоподбор пресета по базе** (угадать конфигурацию по `list_entities`) — заманчиво, но ошибка угадывания дороже одного лишнего вопроса пользователю. Добавлять, когда появится запрос.
* **Параметры `section` / `search` у инструмента** — пресет целиком это 4-8 КБ JSON, фильтровать пока нечего.
* **Заполнение `common`-имён до `verified`** — упирается в доступ к ИТС и/или к живым базам УТ/ЗУП/ERP. Дешёвый путь: один прогон `list_entities` + `describe_entity` на реальной базе каждой конфигурации переводит десятки имён в `verified` за один заход.
