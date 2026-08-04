/**
 * Typed-config presets — типы данных.
 *
 * Пресеты — это ДАННЫЕ (чистые TS-модули без побочных эффектов и зависимостей).
 * Логики здесь нет: загрузчик в ./index.ts, инструмент — в ../tools/presets.ts.
 */

/**
 * Насколько имя сущности/реквизита подтверждено первоисточником.
 *
 * `verified` — имя прочитано в источнике из `ConfigPreset.sources` (дока 1С,
 *   руководство разработчика, статья с реальными запросами).
 * `common`   — типовое имя из практики, в этой сборке первоисточником НЕ
 *   подтверждено. Перед использованием проверить `list_entities` /
 *   `describe_entity` на конкретной базе.
 *
 * ponytail: два состояния, а не шкала 0-100 — решение всё равно бинарное
 * («можно слать в базу как есть» / «сначала проверь»).
 */
export type Confidence = "verified" | "common";

export type EntityKind =
  | "catalog"
  | "document"
  | "accumulation_register"
  | "information_register"
  | "accounting_register"
  | "calculation_register"
  | "chart_of_accounts"
  | "constant";

export interface PresetEntity {
  /** Полное имя entity set в OData, например `Document_РеализацияТоваровУслуг`. */
  name: string;
  kind: EntityKind;
  /** Человеческое описание по-русски: что это и когда брать. */
  ru: string;
  /** Типовые реквизиты СВЕРХ стандартных полей платформы (см. common.ts). */
  fields?: string[];
  confidence: Confidence;
  /** Табличные части (для документов): `Document_X_<ИмяТЧ>` / $expand. */
  tabular?: string[];
}

export interface PresetExample {
  /** Что делает запрос — по-русски. */
  title: string;
  /** Инструмент aprovodka, которым это исполняется. */
  tool: string;
  /** Готовые аргументы инструмента. */
  args: Record<string, unknown>;
  note?: string;
}

export interface ConfigPreset {
  /** Короткий идентификатор: bp30 / ut11 / zup31 / erp2. */
  id: string;
  /** Полное имя конфигурации. */
  name: string;
  /** Синонимы для поиска пресета по человеческому названию. */
  aliases: string[];
  summary: string;
  entities: PresetEntity[];
  examples: PresetExample[];
  /** Частые ловушки именно этой конфигурации. */
  pitfalls: string[];
  /** URL первоисточников, по которым проставлен confidence=verified. */
  sources: string[];
}
