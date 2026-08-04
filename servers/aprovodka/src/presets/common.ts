/**
 * Платформенное знание, общее для ВСЕХ конфигураций 1С.
 *
 * Всё в этом файле относится к стандартному интерфейсу OData самой платформы
 * 8.3, а не к конкретной конфигурации, поэтому отдаётся вместе с любым
 * пресетом. Источники — внизу файла (COMMON.sources).
 */

export const COMMON = {
  /** Префиксы имён entity set по типу объекта метаданных. */
  entity_prefixes: {
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
  } as Record<string, string>,

  /** Стандартные поля, которые есть почти у любого объекта. */
  standard_fields: {
    Ref_Key: "GUID ссылки — первичный ключ записи",
    DataVersion: "версия данных (оптимистичная блокировка)",
    DeletionMark: "пометка удаления (bool). Мягкое удаление — set_deletion_mark",
    Description: "наименование/представление",
    Code: "код (справочники)",
    Predefined: "признак предопределённого элемента",
    Parent_Key: "ссылка на родителя (иерархические справочники)",
    IsFolder: "признак группы (иерархия групп и элементов)",
    Number: "номер документа",
    Date: "дата документа",
    Posted: "признак проведения документа",
  } as Record<string, string>,

  /** Синтаксис литералов OData 3.0, который понимает 1С. */
  literals: {
    guid: "guid'01234567-89ab-cdef-0123-456789abcdef'",
    datetime: "datetime'2026-01-31T00:00:00'",
    string: "'текст' — одинарная кавычка внутри удваивается ('' )",
    substring: "substringof('подстрока',Description) — OData 3.0, не contains()",
    typed_ref:
      "cast(guid'…','Document_ПоступлениеТоваровУслуг') — сравнение ссылки составного типа (Recorder, ExtDimension)",
  } as Record<string, string>,

  /** Табличные части документов и справочников. */
  tabular_sections: [
    "Отдельный entity set: `Document_<Документ>_<ИмяТЧ>` (например Catalog_Организации_КонтактнаяИнформация).",
    "Или навигацией от записи: `Document_<Документ>(guid'…')/<ИмяТЧ>`.",
    "Инструмент get_document_lines делает второй вариант через $expand.",
    "Имя табличной части конфигурационно-зависимо — уточнять get_metadata / describe_entity.",
  ],

  /** Виртуальные таблицы регистров накопления. */
  accumulation_virtual_tables: {
    "Balance(Period=…,Condition=…,Dimensions=…)": "остатки на дату",
    "Turnovers(StartPeriod=…,EndPeriod=…,Condition=…,Dimensions=…)": "обороты за период",
    "BalanceAndTurnovers(…те же параметры, что у Turnovers…)": "остатки и обороты",
    result_fields:
      "к имени ресурса дописывается суффикс: <Ресурс>Balance, <Ресурс>OpeningBalance, " +
      "<Ресурс>ClosingBalance, <Ресурс>Turnover, <Ресурс>Receipt, <Ресурс>Expense. " +
      "Измерения возвращаются как <Измерение>_Key.",
  } as Record<string, string>,

  /** Виртуальные таблицы регистров бухгалтерии. */
  accounting_virtual_tables: {
    Balance: "остатки по счетам",
    Turnovers: "обороты",
    BalanceAndTurnovers: "остатки и обороты (StartPeriod=…,EndPeriod=…)",
    RecordsWithExtDimensions: "записи с субконто",
    ExtDimensions: "субконто",
    _todo:
      "TODO: точное имя виртуальной таблицы оборотов Дт/Кт (DrCrTurnover либо DrCrTurnovers) " +
      "в прочитанных источниках однозначно не зафиксировано — сверить по get_metadata на своей базе.",
  } as Record<string, string>,

  /** Поля записи регистра бухгалтерии. */
  accounting_record_fields: [
    "Period — период проводки",
    "Recorder — регистратор (документ-основание); фильтр только через cast()",
    "LineNumber — номер строки движения",
    "Active — активность записи",
    "AccountDr_Key / AccountCr_Key — счета дебета и кредита (корреспондирующий регистр)",
    "Account_Key — счёт (в результатах Balance / BalanceAndTurnovers)",
    "ExtDimension1 / ExtDimension2 / ExtDimension3 — субконто (составной тип → cast())",
    "Ресурсы конфигурационно-зависимы: Сумма, ВалютнаяСуммаDr/Ct, КоличествоDr/Ct",
  ],

  /** Ловушки платформы — верны для любой конфигурации. */
  pitfalls: [
    "Сущность не видна в list_entities → скорее всего она не включена в состав стандартного " +
      "интерфейса OData в Конфигураторе. Это настройка публикации, а не право доступа " +
      "(подтверждать на своей базе).",
    "Имена сущностей и реквизитов кириллические — URL-кодирование обязательно. " +
      "Клиент aprovodka кодирует их сам; при ручной сборке URL — не забыть.",
    "OData 3.0, а не 4.0: подстрока — substringof('x',Поле), НЕ contains(). " +
      "Даты — datetime'…', НЕ ISO-строкой без префикса.",
    "$select не работает с виртуальными таблицами Balance / BalanceAndTurnovers — " +
      "возвращается полный набор полей (по статье-первоисточнику; проверить на своей базе).",
    "Ссылочные поля составного типа (Recorder, ExtDimension*) фильтруются только через " +
      "cast(guid'…','Тип') — прямое сравнение с guid'…' даёт пустую выборку или ошибку.",
    "$expand по ссылке возвращает вложенный объект, но $select по вложенным полям часто " +
      "отдаёт HTTP 400 — проще сделать второй запрос по Ref_Key (get_by_key).",
    "Часовые пояса: 1С отдаёт время сервера, а не UTC. Границы периода задавать явно " +
      "(Date ge datetime'…T00:00:00' and Date lt datetime'…T00:00:00' следующего дня).",
    "Пометка удаления не фильтруется сама собой: почти всегда нужно добавлять " +
      "DeletionMark eq false, иначе в выборку попадут помеченные на удаление.",
    "Проведённость: Posted eq true. Непроведённый документ движений в регистрах НЕ имеет — " +
      "искать проводки по такому документу бессмысленно.",
    "1С НЕ поддерживает OData $batch — пакетность в aprovodka клиентская (batch_query и др.).",
    "list_entities с type-фильтром знает только Catalog_/Document_/AccumulationRegister_/" +
      "InformationRegister_/Report_. Для AccountingRegister_, CalculationRegister_, " +
      "ChartOfAccounts_, Constant_ вызывать list_entities с type=\"all\".",
  ],

  sources: [
    "https://1cfresh.com/articles/data_odata — префиксы имён, стандартные поля, примеры URL",
    "https://master1c8.ru/platforma-1s-predpriyatie-8/rukovodstvo-razrabottchika/glava-17-mehanizm-internet-servisov/7188/ — регистры накопления: Balance/Turnovers/BalanceAndTurnovers и суффиксы полей",
    "https://master1c8.ru/platforma-1s-predpriyatie-8/rukovodstvo-razrabottchika/glava-17-mehanizm-internet-servisov/7095/ — регистры бухгалтерии: виртуальные таблицы и поля записи",
    "https://infostart.ru/1c/articles/2714438/ — реальные запросы к регистру бухгалтерии и грабли ($select, ExtDimension, часовые пояса)",
  ],
} as const;
