/**
 * Сведённые копии не должны разъехаться обратно (WORK-1559).
 *
 * Тесты нарочно смотрят на единственный источник и на его потребителей: если
 * кто-то заведёт локальную копию таблицы префиксов или соберёт query руками,
 * это здесь и упадёт.
 */
import { describe, it, expect } from "vitest";
import { buildQuery } from "../src/lib/paging.js";
import {
  ENTITY_PREFIXES,
  ENTITY_PREFIX_LABELS,
  ENTITY_PREFIX_FILTERS,
} from "../src/lib/entity-prefixes.js";
import { ENTITY_PREFIXES as PREFIXES_FROM_VALIDATION } from "../src/validation.js";
import { ENTITY_PREFIX_FILTERS as FILTERS_FROM_METADATA } from "../src/tools/metadata.js";
import { COMMON } from "../src/presets/common.js";

describe("префиксы сущностей — один источник на три потребителя", () => {
  it("validation, metadata и presets берут ровно ту же таблицу, а не копию", () => {
    expect(PREFIXES_FROM_VALIDATION).toBe(ENTITY_PREFIXES);
    expect(FILTERS_FROM_METADATA).toBe(ENTITY_PREFIX_FILTERS);
    expect(COMMON.entity_prefixes).toBe(ENTITY_PREFIX_LABELS);
  });

  it("плоский список и карта названий описывают один и тот же набор", () => {
    expect([...ENTITY_PREFIXES].sort()).toEqual(Object.keys(ENTITY_PREFIX_LABELS).sort());
    expect(ENTITY_PREFIXES).toHaveLength(15);
  });

  it("каждый префикс из фильтра list_entities известен таблице названий", () => {
    for (const prefixes of Object.values(ENTITY_PREFIX_FILTERS)) {
      for (const prefix of prefixes) {
        const known = Object.keys(ENTITY_PREFIX_LABELS).some((p) => p.startsWith(prefix));
        expect(known, `таблица названий не знает ${prefix}`).toBe(true);
      }
    }
  });

  it("каждый вид регистра из фильтра есть в плоском списке — на нём стоит normaliseRegisterEntity", () => {
    for (const prefix of ENTITY_PREFIX_FILTERS["registers"]!) {
      expect(ENTITY_PREFIXES).toContain(prefix);
    }
  });
});

describe("buildQuery — единственная сборка query читающего запроса", () => {
  it("просит на одну запись больше: $top = top + 1", () => {
    expect(buildQuery({ top: 100 })).toEqual({ $format: "json", $top: "101" });
  });

  it("пустые и нулевые параметры в query не попадают", () => {
    expect(buildQuery({ top: 10, skip: 0, filter: undefined, orderby: undefined })).toEqual({
      $format: "json",
      $top: "11",
    });
  });

  it("собирает полный набор опций в предсказуемом порядке", () => {
    const q = buildQuery({
      top: 5,
      skip: 20,
      filter: "Posted eq true",
      select: "Ref_Key,Number",
      expand: "Товары",
      orderby: "Date desc",
      inlinecount: true,
    });
    expect(Object.keys(q)).toEqual([
      "$format", "$top", "$skip", "$filter", "$select", "$expand", "$orderby", "$inlinecount",
    ]);
    expect(q["$skip"]).toBe("20");
    expect(q["$inlinecount"]).toBe("allpages");
  });

  it("без top не подставляет $top — запрос одной записи по ключу не постраничный", () => {
    expect(buildQuery({ select: "Ref_Key" })).toEqual({ $format: "json", $select: "Ref_Key" });
  });
});
