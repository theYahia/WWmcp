/**
 * Typed-config presets — тонкий загрузчик.
 *
 * Пресеты статичны: массив модулей, поиск по id/alias, счётчики.
 * Никакого I/O, никакого кэша, никаких зависимостей — данные вкомпилированы.
 */

import type { ConfigPreset } from "./types.js";
import { COMMON } from "./common.js";
import { bp30 } from "./bp30.js";
import { ut11 } from "./ut11.js";
import { zup31 } from "./zup31.js";
import { erp2 } from "./erp2.js";

export type { ConfigPreset, PresetEntity, PresetExample, Confidence, EntityKind } from "./types.js";
export { COMMON } from "./common.js";

export const PRESETS: readonly ConfigPreset[] = [bp30, ut11, zup31, erp2];

/** Краткая сводка по всем пресетам — дёшево по контексту. */
export function listPresets(): Array<{
  id: string;
  name: string;
  aliases: string[];
  summary: string;
  entities: number;
  examples: number;
  /** Сколько имён подтверждено первоисточником из sources. */
  verified_entities: number;
}> {
  return PRESETS.map((p) => ({
    id: p.id,
    name: p.name,
    aliases: [...p.aliases],
    summary: p.summary,
    entities: p.entities.length,
    examples: p.examples.length,
    verified_entities: p.entities.filter((e) => e.confidence === "verified").length,
  }));
}

/**
 * Найти пресет по id или синониму (регистр и пробелы не важны).
 * Возвращает undefined, если не нашли — вызывающий сам решает, что делать.
 */
export function getPreset(config: string): ConfigPreset | undefined {
  const q = config.trim().toLowerCase();
  return PRESETS.find(
    (p) => p.id.toLowerCase() === q || p.aliases.some((a) => a.toLowerCase() === q),
  );
}

/** Пресет + общее платформенное знание — то, что уходит в ответ инструмента. */
export function getPresetWithCommon(config: string):
  | ({ preset: ConfigPreset; common: typeof COMMON })
  | undefined {
  const preset = getPreset(config);
  return preset ? { preset, common: COMMON } : undefined;
}
