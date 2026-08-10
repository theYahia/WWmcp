import type { ConfigPreset } from "./types.js";

/**
 * 1С:Управление торговлей 11 — курированная схема OData.
 *
 * confidence:"verified" — имя встречено в источнике из sources.
 * confidence:"common"   — типовое имя из практики, первоисточником здесь НЕ
 *   подтверждено: перед использованием прогнать list_entities/describe_entity.
 */
export const ut11: ConfigPreset = {
  id: "ut11",
  name: "1С:Управление торговлей 11",
  aliases: ["ут", "ут11", "ут 11", "торговля", "trade", "ut"],
  summary:
    "Оперативный торговый учёт: заказы, продажи, закупки, склад, взаиморасчёты. " +
    "Бухгалтерских проводок здесь нет — цифры живут в РЕГИСТРАХ НАКОПЛЕНИЯ, " +
    "и остатки берутся виртуальной таблицей Balance, а не суммированием документов. " +
    "Ключевое отличие от БП: два разных справочника контрагентов — Партнёры (кто с нами " +
    "работает по сути) и Контрагенты (юрлицо для документов).",

  entities: [
    {
      name: "AccumulationRegister_ТоварыНаСкладах",
      kind: "accumulation_register",
      ru: "Складские остатки товаров. Основной источник ответа «сколько есть на складе».",
      fields: ["Period", "Recorder", "RecordType", "Номенклатура_Key", "Склад_Key", "Количество"],
      confidence: "verified",
    },
    {
      name: "InformationRegister_РаспределениеЗапасов",
      kind: "information_register",
      ru: "Пришёл на смену удалённому регистру СвободныеОстатки (с УТ 11.5.7). Свободный остаток надо собирать самому: фильтровать по состоянию (ОстатокНаСкладе) и группировать по номенклатуре.",
      confidence: "verified",
    },
    {
      name: "AccumulationRegister_ТоварыОрганизаций",
      kind: "accumulation_register",
      ru: "Остатки товаров в разрезе организации (чьё юрлицо владеет запасом).",
      confidence: "common",
    },
    {
      name: "AccumulationRegister_РасчетыСКлиентами",
      kind: "accumulation_register",
      ru: "Дебиторская задолженность — сколько должны нам.",
      confidence: "common",
    },
    {
      name: "AccumulationRegister_РасчетыСПоставщиками",
      kind: "accumulation_register",
      ru: "Кредиторская задолженность — сколько должны мы.",
      confidence: "common",
    },
    {
      name: "AccumulationRegister_ДенежныеСредстваБезналичные",
      kind: "accumulation_register",
      ru: "Остатки на банковских счетах.",
      confidence: "common",
    },
    {
      name: "Catalog_Партнеры",
      kind: "catalog",
      ru: "Партнёры — управленческая сущность («с кем работаем»). У одного партнёра может быть несколько контрагентов-юрлиц.",
      confidence: "common",
    },
    {
      name: "Catalog_Контрагенты",
      kind: "catalog",
      ru: "Контрагенты — юрлица/ИП для документов и взаиморасчётов.",
      fields: ["ИНН", "КПП", "Партнер_Key"],
      confidence: "verified",
    },
    {
      name: "Catalog_СоглашенияСКлиентами",
      kind: "catalog",
      ru: "Соглашения с клиентами: условия продаж, вид цен, срок оплаты.",
      confidence: "common",
    },
    {
      name: "Catalog_Номенклатура",
      kind: "catalog",
      ru: "Номенклатура. Иерархическая — почти всегда нужен IsFolder eq false.",
      fields: ["Code", "Description", "IsFolder", "Parent_Key", "Артикул"],
      confidence: "verified",
    },
    {
      name: "Catalog_УпаковкиЕдиницыИзмерения",
      kind: "catalog",
      ru: "Упаковки и единицы измерения номенклатуры — нужны, чтобы правильно интерпретировать Количество.",
      confidence: "common",
    },
    {
      name: "Catalog_Склады",
      kind: "catalog",
      ru: "Склады и складские территории.",
      confidence: "common",
    },
    {
      name: "Catalog_Организации",
      kind: "catalog",
      ru: "Собственные организации.",
      fields: ["ИНН", "КПП"],
      confidence: "verified",
    },
    {
      name: "Document_ЗаказКлиента",
      kind: "document",
      ru: "Заказ клиента — ядро продажного цикла УТ. Имеет собственное состояние и признак «к отгрузке».",
      tabular: ["Товары"],
      confidence: "common",
    },
    {
      name: "Document_РеализацияТоваровУслуг",
      kind: "document",
      ru: "Реализация — фактическая отгрузка. Обычно вводится на основании заказа клиента.",
      tabular: ["Товары", "Услуги"],
      confidence: "verified",
    },
    {
      name: "Document_ЗаказПоставщику",
      kind: "document",
      ru: "Заказ поставщику — планируемая закупка.",
      tabular: ["Товары"],
      confidence: "common",
    },
    {
      name: "Document_ПриобретениеТоваровУслуг",
      kind: "document",
      ru: "Приобретение товаров и услуг — фактический приход от поставщика. В УТ 11 называется иначе, чем в БП (там — ПоступлениеТоваровУслуг).",
      tabular: ["Товары"],
      confidence: "common",
    },
    {
      name: "Document_ПеремещениеТоваров",
      kind: "document",
      ru: "Перемещение между складами.",
      tabular: ["Товары"],
      confidence: "common",
    },
    {
      name: "Document_ПоступлениеБезналичныхДенежныхСредств",
      kind: "document",
      ru: "Приход денег на счёт (оплата от клиента).",
      confidence: "common",
    },
    {
      name: "Document_СписаниеБезналичныхДенежныхСредств",
      kind: "document",
      ru: "Списание денег со счёта (оплата поставщику).",
      confidence: "common",
    },
    {
      name: "InformationRegister_ЦеныНоменклатуры",
      kind: "information_register",
      ru: "Цены номенклатуры по видам цен — периодический регистр сведений (срез последних).",
      fields: ["Period", "Номенклатура_Key", "ВидЦены_Key", "Цена"],
      confidence: "common",
    },
  ],

  examples: [
    {
      title: "Текущие остатки товаров на складах",
      tool: "get_accumulation_balance",
      args: { register_name: "ТоварыНаСкладах" },
      note: "Имя регистра БЕЗ префикса — инструмент сам добавит AccumulationRegister_.",
    },
    {
      title: "Остатки на конкретную дату по одному складу",
      tool: "get_accumulation_balance",
      args: {
        register_name: "ТоварыНаСкладах",
        period: "2026-07-01T00:00:00",
        condition: "Склад_Key eq guid'01234567-89ab-cdef-0123-456789abcdef'",
      },
      note: "В ответе ресурс придёт с суффиксом: КоличествоBalance.",
    },
    {
      title: "Движения по складу за месяц (приход/расход построчно)",
      tool: "get_register",
      args: {
        register_type: "AccumulationRegister",
        register_name: "ТоварыНаСкладах",
        filter:
          "Period ge datetime'2026-07-01T00:00:00' and Period lt datetime'2026-08-01T00:00:00'",
        orderby: "Period desc",
        top: 500,
      },
      note: "RecordType различает приход и расход (Receipt/Expense).",
    },
    {
      title: "Заказы клиентов за период",
      tool: "get_documents",
      args: {
        document_type: "Document_ЗаказКлиента",
        filter:
          "Date ge datetime'2026-07-01T00:00:00' and Date lt datetime'2026-08-01T00:00:00' and Posted eq true",
        orderby: "Date desc",
      },
    },
    {
      title: "Строки заказа клиента",
      tool: "get_document_lines",
      args: {
        document_type: "Document_ЗаказКлиента",
        ref_key: "01234567-89ab-cdef-0123-456789abcdef",
        tabular_section: "Товары",
      },
    },
    {
      title: "Найти партнёра по названию",
      tool: "find_by_description",
      args: { entity: "Catalog_Партнеры", query: "Ромашка", top: 20 },
      note: "Если ищете юрлицо для документа — искать надо в Catalog_Контрагенты.",
    },
    {
      title: "Активная номенклатура без групп",
      tool: "get_catalogs",
      args: {
        catalog_name: "Catalog_Номенклатура",
        filter: "IsFolder eq false and DeletionMark eq false",
        select: "Ref_Key,Code,Description",
        top: 500,
      },
    },
    {
      title: "Сколько реализаций за месяц",
      tool: "count_entities",
      args: {
        entity: "Document_РеализацияТоваровУслуг",
        filter: "Date ge datetime'2026-07-01T00:00:00' and Posted eq true",
      },
    },
    {
      title: "Последние 10 реализаций",
      tool: "get_recent_documents",
      args: { document_type: "Document_РеализацияТоваровУслуг", top: 10, posted_only: true },
    },
    {
      title: "Свежие изменения заказов клиентов (опрос вместо вебхука)",
      tool: "poll_changes_since",
      args: { entity: "Document_ЗаказКлиента", since: "2026-08-04T00:00:00", date_field: "Date" },
      note: "1С не умеет вебхуки — только периодический опрос. Имя поля-курсора сверить по describe_entity.",
    },
  ],

  pitfalls: [
    "Регистр накопления СвободныеОстатки УДАЛЁН начиная с УТ 11.5.7 (и ERP 2.5.7). " +
      "Вместо него — регистр сведений РаспределениеЗапасов, и свободный остаток нужно " +
      "собирать самому. Код, написанный по старым статьям, молча получит 404.",
    "Партнёры ≠ Контрагенты. Взаиморасчёты и документы идут по контрагенту, " +
      "управленческая аналитика и CRM — по партнёру. Перепутать = получить пустой ответ.",
    "Названия документов расходятся с БП 3.0: закупка в УТ — ПриобретениеТоваровУслуг, " +
      "в БП — ПоступлениеТоваровУслуг. Пресеты не взаимозаменяемы.",
    "Остатки НЕ считать суммированием документов: часть движений делают служебные " +
      "документы (корректировки, оприходования, пересортица). Только Balance().",
    "Заказ клиента живёт своим статусом/состоянием: Posted eq true не означает «отгружено». " +
      "Отгрузка — это отдельный документ реализации.",
    "Количество указано в единице хранения номенклатуры; штуки/коробки различает " +
      "справочник упаковок. Складывать разные упаковки нельзя.",
    "УТ 11.4 и 11.5 отличаются составом регистров. Перед серьёзной выборкой — " +
      "list_entities(search=\"AccumulationRegister\") на конкретной базе.",
  ],

  sources: [
    "https://tnsoft.ru/blog/udalen-registr-nakopleniya-svobodnyeostatki-chto-vmesto-nego/ — удаление СвободныеОстатки в УТ 11.5.7 / ERP 2.5.7",
    "https://examples.loginom.ru/integration-1c-odata/index.html — импорт из УТ 11.4 по OData: ТоварыНаСкладах, упаковки",
    "https://1cfresh.com/articles/data_odata",
    "https://master1c8.ru/platforma-1s-predpriyatie-8/rukovodstvo-razrabottchika/glava-17-mehanizm-internet-servisov/7188/",
  ],
};
