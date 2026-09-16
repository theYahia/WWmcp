/**
 * Единственный источник правды о префиксах имён entity set в OData 1С.
 *
 * Таблица префиксов жила в трёх местах — `validation.ts` (плоский список для
 * `normaliseRegisterEntity`), `tools/metadata.ts` (группировка «тип → префиксы»
 * для фильтра `list_entities`) и `presets/common.ts` (префикс → русское
 * существительное для `get_config_preset`). Тремя копиями они расходились молча,
 * и первым это увидел бы пользователь, а не сборка.
 *
 * Модуль намеренно без единого импорта: его тянут и путь discovery, и офлайновые
 * пресеты, и валидация — лишняя зависимость здесь протекла бы всюду. Именно
 * поэтому карта не переехала в `presets/common.ts`: тот тянет за собой всё
 * поддерево пресетов.
 */

/**
 * Префикс → как эта группа объектов называется по-русски.
 *
 * Порядок сохранён от прежней карты в `presets/common.ts`: он виден
 * пользователю в ответе `get_config_preset`.
 */
export const ENTITY_PREFIX_LABELS: Record<string, string> = {
  "Catalog_": "справочники",
  "Document_": "документы",
  "DocumentJournal_": "журналы документов",
  "Constant_": "константы",
  "ExchangePlan_": "планы обмена",
  "ChartOfAccounts_": "планы счетов",
  "ChartOfCalculationTypes_": "планы видов расчёта",
  "ChartOfCharacteristicTypes_": "планы видов характеристик",
  "InformationRegister_": "регистры сведений",
  "AccumulationRegister_": "регистры накопления",
  "CalculationRegister_": "регистры расчёта",
  "AccountingRegister_": "регистры бухгалтерии",
  "BusinessProcess_": "бизнес-процессы",
  "Task_": "задачи",
  "Report_": "отчёты",
};

/** Известные префиксы списком. Порядок значения не имеет. */
export const ENTITY_PREFIXES: readonly string[] = Object.keys(ENTITY_PREFIX_LABELS);

/**
 * Какие префиксы попадают под каждое значение фильтра `type` у `list_entities`.
 *
 * `charts` намеренно один: в 1С три разных плана (ChartOfAccounts_,
 * ChartOfCalculationTypes_, ChartOfCharacteristicTypes_), и дробить их на три
 * значения enum ради полноты — менять одну ловушку на другую.
 */
export const ENTITY_PREFIX_FILTERS: Record<string, string[]> = {
  catalogs:  ["Catalog_"],
  documents: ["Document_"],
  registers: [
    "AccumulationRegister_",
    "InformationRegister_",
    "AccountingRegister_",
    "CalculationRegister_",
  ],
  charts:    ["ChartOf"],
  constants: ["Constant_"],
  journals:  ["DocumentJournal_"],
  reports:   ["Report_"],
};
