import type { ConfigPreset } from "./types.js";

/**
 * 1С:ERP Управление предприятием 2 — курированная схема OData.
 *
 * ERP 2 построена на прикладной базе УТ 11: торговый и складской контур
 * совпадают почти дословно, сверху добавлены производство, регламентированный
 * учёт и казначейство. Поэтому пресет НЕ дублирует торговую часть — он ссылается
 * на пресет ut11 и описывает только надстройку.
 */
export const erp2: ConfigPreset = {
  id: "erp2",
  name: "1С:ERP Управление предприятием 2",
  aliases: ["erp", "ерп", "1c:erp", "управление предприятием"],
  summary:
    "Комплексная система: торговля и склад (как в УТ 11) + производство + " +
    "регламентированный учёт + казначейство и бюджетирование в одной базе. " +
    "Торговый контур брать из пресета ut11 — имена там совпадают; " +
    "здесь описано только то, чего в УТ 11 нет.",

  entities: [
    {
      name: "AccumulationRegister_ТоварыНаСкладах",
      kind: "accumulation_register",
      ru: "Складские остатки — так же, как в УТ 11 (общая прикладная база).",
      confidence: "verified",
    },
    {
      name: "InformationRegister_РаспределениеЗапасов",
      kind: "information_register",
      ru: "Замена удалённого регистра СвободныеОстатки — с ERP 2.5.7 (и УТ 11.5.7).",
      confidence: "verified",
    },
    {
      name: "AccountingRegister_Хозрасчетный",
      kind: "accounting_register",
      ru: "Регистр бухгалтерии — регламентированный контур внутри ERP. Работать так же, как в БП 3.0 (см. пресет bp30).",
      confidence: "common",
    },
    {
      name: "ChartOfAccounts_Хозрасчетный",
      kind: "chart_of_accounts",
      ru: "План счетов регламентированного учёта.",
      confidence: "common",
    },
    {
      name: "Document_ЗаказНаПроизводство2_2",
      kind: "document",
      ru: "Заказ на производство. Суффикс 2_2 — версия подсистемы производства; в разных релизах ERP встречаются документы и без суффикса, и с другим.",
      tabular: ["Продукция"],
      confidence: "common",
    },
    {
      name: "Document_ЭтапПроизводства2_2",
      kind: "document",
      ru: "Этап производства — единица планирования и учёта выпуска.",
      confidence: "common",
    },
    {
      name: "Document_ПроизводствоБезЗаказа",
      kind: "document",
      ru: "Выпуск продукции без заказа (упрощённая схема).",
      confidence: "common",
    },
    {
      name: "Catalog_РесурсныеСпецификации",
      kind: "catalog",
      ru: "Ресурсные спецификации — что и из чего производится (аналог BOM + маршрут).",
      confidence: "common",
    },
    {
      name: "Catalog_ВидыРабочихЦентров",
      kind: "catalog",
      ru: "Виды рабочих центров — производственные мощности для планирования этапов.",
      confidence: "common",
    },
    {
      name: "Catalog_СтатьиРасходов",
      kind: "catalog",
      ru: "Статьи расходов — аналитика управленческого учёта затрат.",
      confidence: "common",
    },
    {
      name: "Catalog_СтатьиДвиженияДенежныхСредств",
      kind: "catalog",
      ru: "Статьи ДДС — аналитика казначейства и отчёта о движении денежных средств.",
      confidence: "common",
    },
    {
      name: "AccumulationRegister_ЗатратыНаВыпуск",
      kind: "accumulation_register",
      ru: "Затраты, отнесённые на выпуск продукции (себестоимость).",
      confidence: "common",
    },
    {
      name: "AccumulationRegister_ДенежныеСредстваБезналичные",
      kind: "accumulation_register",
      ru: "Остатки безналичных денежных средств (казначейство).",
      confidence: "common",
    },
  ],

  examples: [
    {
      title: "Шаг 0 — какие производственные документы вообще есть в этой базе",
      tool: "list_entities",
      args: { type: "documents", search: "Производств" },
      note: "Суффиксы версий подсистемы (2_2 и др.) различаются по релизам — сначала смотреть, потом запрашивать.",
    },
    {
      title: "Складские остатки (как в УТ 11)",
      tool: "get_accumulation_balance",
      args: { register_name: "ТоварыНаСкладах" },
    },
    {
      title: "Заказы на производство за месяц",
      tool: "get_documents",
      args: {
        document_type: "Document_ЗаказНаПроизводство2_2",
        filter:
          "Date ge datetime'2026-07-01T00:00:00' and Date lt datetime'2026-08-01T00:00:00' and Posted eq true",
        orderby: "Date desc",
      },
      note: "Имя типа документа подтвердить шагом 0 — confidence=common.",
    },
    {
      title: "Продукция в заказе на производство",
      tool: "get_document_lines",
      args: {
        document_type: "Document_ЗаказНаПроизводство2_2",
        ref_key: "01234567-89ab-cdef-0123-456789abcdef",
        tabular_section: "Продукция",
      },
    },
    {
      title: "Ресурсные спецификации (что из чего делаем)",
      tool: "get_catalogs",
      args: {
        catalog_name: "Catalog_РесурсныеСпецификации",
        filter: "DeletionMark eq false",
        select: "Ref_Key,Code,Description",
      },
    },
    {
      title: "Проводки регламентированного контура за период",
      tool: "get_accounting_register",
      args: {
        register_name: "Хозрасчетный",
        filter:
          "Period ge datetime'2026-07-01T00:00:00' and Period lt datetime'2026-08-01T00:00:00' and Active eq true",
        orderby: "Period desc",
      },
    },
    {
      title: "Сколько этапов производства открыто",
      tool: "count_entities",
      args: { entity: "Document_ЭтапПроизводства2_2", filter: "Posted eq true" },
    },
    {
      title: "Несколько разрезов сразу — одним вызовом",
      tool: "batch_query",
      args: {
        queries: [
          { entity: "Catalog_Склады", top: 100 },
          { entity: "Catalog_РесурсныеСпецификации", top: 100 },
          { entity: "Document_ЗаказНаПроизводство2_2", top: 20, orderby: "Date desc" },
        ],
      },
      note: "1С не поддерживает OData $batch — это клиентская параллельность (по умолчанию 5 запросов сразу).",
    },
  ],

  pitfalls: [
    "Торговый и складской контур ERP 2 совпадает с УТ 11 — берите пресет ut11, " +
      "не изобретайте имена заново. Здесь только надстройка.",
    "СвободныеОстатки удалён с ERP 2.5.7 (как и в УТ 11.5.7) → InformationRegister_РаспределениеЗапасов.",
    "Суффиксы версий подсистем в именах документов (…2_2) — реальная ловушка ERP: " +
      "имя типа документа зависит от релиза. Всегда list_entities перед запросом.",
    "В ERP управленческий и регламентированный учёт живут в ОДНОЙ базе, но в разных " +
      "регистрах. Управленческая себестоимость и бухгалтерская себестоимость не обязаны " +
      "совпадать — не смешивать источники в одном отчёте.",
    "Производственные документы связаны цепочкой заказ → этапы → выпуск. Один запрос " +
      "к одному типу документа картины не даёт.",
    "ERP тяжёлая: выборки без $top и без $select легко упираются в таймаут клиента (15 с). " +
      "Резать выборку сразу.",
  ],

  sources: [
    "https://tnsoft.ru/blog/udalen-registr-nakopleniya-svobodnyeostatki-chto-vmesto-nego/ — ERP 2.5.7",
    "https://1cfresh.com/articles/data_odata",
    "⚠ Производственная часть (ЗаказНаПроизводство2_2, ЭтапПроизводства2_2, РесурсныеСпецификации) первоисточником в этой сборке НЕ подтверждена",
  ],
};
