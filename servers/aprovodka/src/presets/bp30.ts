import type { ConfigPreset } from "./types.js";

/**
 * 1С:Бухгалтерия предприятия 3.0 — курированная схема OData.
 *
 * confidence:"verified" — имя встречено в источнике из sources.
 * confidence:"common"   — типовое имя из практики, первоисточником здесь НЕ
 *   подтверждено: перед использованием прогнать list_entities/describe_entity.
 */
export const bp30: ConfigPreset = {
  id: "bp30",
  name: "1С:Бухгалтерия предприятия 3.0",
  aliases: ["бп", "бп3", "бп 3.0", "бухгалтерия", "buh", "accounting", "1c-accounting"],
  summary:
    "Регламентированный бухгалтерский и налоговый учёт. Центр тяжести — регистр бухгалтерии " +
    "Хозрасчетный (проводки) и план счетов; документы лишь порождают движения. " +
    "Почти любой вопрос «сколько денег / сколько должны» решается не выборкой документов, " +
    "а виртуальными таблицами Balance / BalanceAndTurnovers регистра бухгалтерии.",

  entities: [
    {
      name: "AccountingRegister_Хозрасчетный",
      kind: "accounting_register",
      ru: "Основной регистр бухгалтерии — все проводки (Дт/Кт). Остатки и обороты по счетам берутся с него.",
      fields: ["Period", "Recorder", "Active", "AccountDr_Key", "AccountCr_Key", "ExtDimension1", "ExtDimension2"],
      confidence: "verified",
    },
    {
      name: "ChartOfAccounts_Хозрасчетный",
      kind: "chart_of_accounts",
      ru: "План счетов бухучёта: 01, 10, 41, 50, 51, 60, 62, 68, 76, 90, 99 и т. д. Нужен, чтобы получить Ref_Key счёта для отбора.",
      fields: ["Code", "Description"],
      confidence: "common",
    },
    {
      name: "Catalog_Организации",
      kind: "catalog",
      ru: "Собственные организации (юрлица/ИП, по которым ведётся учёт).",
      fields: ["ИНН", "КПП", "Наименование"],
      confidence: "verified",
    },
    {
      name: "Catalog_Контрагенты",
      kind: "catalog",
      ru: "Контрагенты — покупатели и поставщики.",
      fields: ["ИНН", "КПП", "Телефон", "Факс", "Description", "Code"],
      confidence: "verified",
    },
    {
      name: "Catalog_ДоговорыКонтрагентов",
      kind: "catalog",
      ru: "Договоры с контрагентами. Обычно третье субконто на счетах расчётов (60/62).",
      confidence: "verified",
    },
    {
      name: "Catalog_Номенклатура",
      kind: "catalog",
      ru: "Номенклатура: товары, материалы, услуги. Иерархический — фильтровать IsFolder eq false.",
      fields: ["Code", "Description", "IsFolder", "Parent_Key"],
      confidence: "verified",
    },
    {
      name: "Catalog_ФизическиеЛица",
      kind: "catalog",
      ru: "Физлица (сотрудники, подотчётники, учредители). ⚠ персональные данные — 152-ФЗ.",
      fields: ["Пол", "Description"],
      confidence: "verified",
    },
    {
      name: "Catalog_Склады",
      kind: "catalog",
      ru: "Склады (места хранения).",
      confidence: "common",
    },
    {
      name: "Catalog_БанковскиеСчета",
      kind: "catalog",
      ru: "Банковские счета организаций и контрагентов; субконто счёта 51.",
      confidence: "common",
    },
    {
      name: "Document_ПоступлениеТоваровУслуг",
      kind: "document",
      ru: "Поступление товаров и услуг (приход от поставщика). Даёт проводки Дт 41/10/26 — Кт 60.",
      tabular: ["Товары", "Услуги"],
      confidence: "verified",
    },
    {
      name: "Document_РеализацияТоваровУслуг",
      kind: "document",
      ru: "Реализация товаров и услуг (продажа). Проводки Дт 62 — Кт 90.01, Дт 90.02 — Кт 41.",
      tabular: ["Товары", "Услуги"],
      confidence: "verified",
    },
    {
      name: "Document_СчетНаОплатуПокупателю",
      kind: "document",
      ru: "Счёт на оплату покупателю. Движений по регистру бухгалтерии НЕ делает — это преддокумент.",
      tabular: ["Товары"],
      confidence: "common",
    },
    {
      name: "Document_ПоступлениеНаРасчетныйСчет",
      kind: "document",
      ru: "Приход денег на расчётный счёт (Дт 51 — Кт 62).",
      confidence: "common",
    },
    {
      name: "Document_СписаниеСРасчетногоСчета",
      kind: "document",
      ru: "Списание денег с расчётного счёта (Дт 60/68 — Кт 51).",
      confidence: "common",
    },
    {
      name: "Document_ПриходныйКассовыйОрдер",
      kind: "document",
      ru: "ПКО — приход в кассу (Дт 50 — Кт 62/71).",
      confidence: "common",
    },
    {
      name: "Document_РасходныйКассовыйОрдер",
      kind: "document",
      ru: "РКО — расход из кассы (Дт 60/71 — Кт 50).",
      confidence: "common",
    },
    {
      name: "Document_СчетФактураВыданный",
      kind: "document",
      ru: "Счёт-фактура выданный; обычно вводится на основании реализации.",
      confidence: "common",
    },
    {
      name: "Document_АвансовыйОтчет",
      kind: "document",
      ru: "Авансовый отчёт подотчётного лица (счёт 71).",
      tabular: ["Товары", "Прочее"],
      confidence: "common",
    },
    {
      name: "InformationRegister_КурсыВалют",
      kind: "information_register",
      ru: "Курсы валют по датам. Периодический регистр сведений.",
      fields: ["Period", "Валюта_Key", "Курс", "Кратность"],
      confidence: "common",
    },
  ],

  examples: [
    {
      title: "Все проводки конкретного документа-регистратора",
      tool: "get_accounting_register",
      args: {
        register_name: "Хозрасчетный",
        filter:
          "Recorder eq cast(guid'a661f39a-61e7-4e2c-81fe-3a246777777c','Document_ПоступлениеТоваровУслуг')",
        orderby: "LineNumber",
      },
      note: "Ссылка составного типа — только через cast(), иначе выборка пустая.",
    },
    {
      title: "Проводки за период, свежие сверху",
      tool: "get_accounting_register",
      args: {
        register_name: "Хозрасчетный",
        filter:
          "Period ge datetime'2026-07-01T00:00:00' and Period lt datetime'2026-08-01T00:00:00' and Active eq true",
        orderby: "Period desc",
        top: 100,
      },
    },
    {
      title: "Найти контрагента по ИНН",
      tool: "get_catalogs",
      args: {
        catalog_name: "Catalog_Контрагенты",
        filter: "ИНН eq '7707083893' and DeletionMark eq false",
        select: "Ref_Key,Code,Description,ИНН,КПП",
      },
    },
    {
      title: "Найти контрагента по куску названия",
      tool: "find_by_description",
      args: { entity: "Catalog_Контрагенты", query: "Ромашка", top: 20 },
      note: "substringof — OData 3.0; contains() 1С не понимает.",
    },
    {
      title: "Реализации за квартал с суммами",
      tool: "get_documents",
      args: {
        document_type: "Document_РеализацияТоваровУслуг",
        filter:
          "Date ge datetime'2026-04-01T00:00:00' and Date lt datetime'2026-07-01T00:00:00' and Posted eq true",
        select: "Ref_Key,Number,Date,Контрагент_Key,СуммаДокумента",
        orderby: "Date desc",
      },
      note: "Имена реквизитов Контрагент_Key/СуммаДокумента здесь НЕ подтверждены первоисточником — сверить describe_entity.",
    },
    {
      title: "Строки (товары) конкретной реализации",
      tool: "get_document_lines",
      args: {
        document_type: "Document_РеализацияТоваровУслуг",
        ref_key: "01234567-89ab-cdef-0123-456789abcdef",
        tabular_section: "Товары",
      },
    },
    {
      title: "Последние 10 поступлений",
      tool: "get_recent_documents",
      args: { document_type: "Document_ПоступлениеТоваровУслуг", top: 10, posted_only: true },
    },
    {
      title: "Сколько документов реализации за год",
      tool: "count_entities",
      args: {
        entity: "Document_РеализацияТоваровУслуг",
        filter: "Date ge datetime'2026-01-01T00:00:00'",
      },
    },
    {
      title: "План счетов — коды и ссылки (чтобы отбирать проводки по счёту)",
      tool: "odata_query",
      args: { entity: "ChartOfAccounts_Хозрасчетный", select: "Ref_Key,Code,Description", top: 200 },
    },
    {
      title: "Обороты по счёту 51 за месяц — через записи регистра",
      tool: "get_accounting_register",
      args: {
        register_name: "Хозрасчетный",
        filter:
          "Period ge datetime'2026-06-01T00:00:00' and Period lt datetime'2026-07-01T00:00:00' and Active eq true",
        top: 1000,
      },
      note:
        "Виртуальные таблицы регистра бухгалтерии (Balance / BalanceAndTurnovers) текущими " +
        "инструментами не обёрнуты — см. pitfalls. Итог считать на стороне клиента по записям.",
    },
  ],

  pitfalls: [
    "Главный источник цифр — регистр Хозрасчетный, а НЕ суммы в документах. " +
      "Непроведённый документ в бухгалтерских итогах не участвует вовсе.",
    "Запись в AccountingRegister_*_RecordType недоступна (read-only, только GET) — по сообщениям " +
      "форума запись наборов идёт через *_RowType. Проверять до попытки писать проводки; " +
      "штатный путь — создать документ и провести его (post_document).",
    "Balance у регистра бухгалтерии ожидает AccountCondition; допускается пустое значение, " +
      "но параметр нужен (по статье-первоисточнику).",
    "Виртуальные таблицы регистра БУХГАЛТЕРИИ (Balance / Turnovers / BalanceAndTurnovers / " +
      "RecordsWithExtDimensions / ExtDimensions) обёрнуты инструментом get_accounting_balance " +
      "(с 4.1.0). Не путать с get_accumulation_balance — тот работает только с " +
      "AccumulationRegister_*. Через odata_query виртуальную таблицу по-прежнему не выразить: " +
      "он URL-кодирует '/' и скобки вызова.",
    "Активные и пассивные счета дают остатки разного знака: 50/51/41 — дебетовые, 60/62/76 — " +
      "по сути двусторонние. Складывать «в лоб» нельзя.",
    "Счета 90/91/99 закрываются реформацией — годовые остатки по ним не читаются как обычные.",
    "Субконто (ExtDimension1..3) — составной тип: и фильтр, и раскрытие требуют cast(); " +
      "$select по вложенному субконто отдаёт HTTP 400.",
    "Организаций в базе может быть несколько — почти любой отбор нужно сужать по организации, " +
      "иначе цифры смешаются между юрлицами.",
    "Хозрасчетный — типовое имя регистра; в доработанной базе оно может отличаться. " +
      "Первый шаг на незнакомой базе — list_entities(type=\"registers\", search=\"AccountingRegister\").",
  ],

  sources: [
    "https://1cfresh.com/articles/data_odata",
    "https://infostart.ru/1c/articles/2714438/",
    "https://forum.infostart.ru/forum9/topic282541/ — запись в регистр бухгалтерии через OData (_RecordType read-only)",
    "https://master1c8.ru/platforma-1s-predpriyatie-8/rukovodstvo-razrabottchika/glava-17-mehanizm-internet-servisov/7095/",
  ],
};
