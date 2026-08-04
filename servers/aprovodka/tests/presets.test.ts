import { describe, it, expect } from "vitest";
import { PRESETS, listPresets, getPreset, COMMON } from "../src/presets/index.js";
import { handleGetConfigPreset } from "../src/tools/presets.js";

/**
 * Пресеты — данные, поэтому тест проверяет ровно то, что в данных можно сломать:
 * дубли id/синонимов, имя сущности не по префиксу своего вида, и главное —
 * примеры, которые нельзя отправить существующим инструментом.
 */

/** Имена инструментов из src/server.ts — примеры не должны ссылаться на несуществующие. */
const TOOL_NAMES = new Set([
  "list_entities", "get_document_by_number", "get_metadata", "describe_entity",
  "get_catalogs", "create_catalog_item", "update_catalog_item",
  "get_documents", "create_document", "update_document", "post_document",
  "unpost_document", "delete_document", "get_document_lines",
  "get_register", "write_information_register", "get_accumulation_balance",
  "get_report", "odata_query", "get_constant", "set_constant",
  "get_accounting_register",
  "find_by_description", "get_by_key", "count_entities", "set_deletion_mark",
  "get_recent_documents",
  "batch_create_documents", "batch_update_catalog_items", "batch_query",
  "poll_changes_since", "list_subscriptions",
]);

const PREFIX_BY_KIND: Record<string, string> = {
  catalog: "Catalog_",
  document: "Document_",
  accumulation_register: "AccumulationRegister_",
  information_register: "InformationRegister_",
  accounting_register: "AccountingRegister_",
  calculation_register: "CalculationRegister_",
  chart_of_accounts: "ChartOfAccounts_",
  constant: "Constant_",
};

describe("presets — загрузка", () => {
  it("грузятся все четыре конфигурации", () => {
    expect(PRESETS.map((p) => p.id).sort()).toEqual(["bp30", "erp2", "ut11", "zup31"]);
  });

  it("id и синонимы уникальны по всем пресетам", () => {
    const keys = PRESETS.flatMap((p) => [p.id, ...p.aliases]).map((k) => k.toLowerCase());
    expect(new Set(keys).size).toBe(keys.length);
  });

  it("находится по id и по синониму, регистр не важен", () => {
    expect(getPreset("bp30")?.id).toBe("bp30");
    expect(getPreset("Бухгалтерия")?.id).toBe("bp30");
    expect(getPreset("  ЕРП  ")?.id).toBe("erp2");
    expect(getPreset("nonexistent")).toBeUndefined();
  });

  it("в каждом пресете непустые сущности, примеры, ловушки и источники", () => {
    for (const p of PRESETS) {
      expect(p.entities.length, p.id).toBeGreaterThan(0);
      expect(p.examples.length, p.id).toBeGreaterThanOrEqual(5);
      expect(p.pitfalls.length, p.id).toBeGreaterThan(0);
      expect(p.sources.length, p.id).toBeGreaterThan(0);
    }
  });
});

describe("presets — целостность данных", () => {
  it("имя сущности соответствует префиксу своего вида", () => {
    for (const p of PRESETS) {
      for (const e of p.entities) {
        expect(e.name.startsWith(PREFIX_BY_KIND[e.kind]!), `${p.id}: ${e.name}`).toBe(true);
      }
    }
  });

  it("имена сущностей внутри пресета не дублируются", () => {
    for (const p of PRESETS) {
      const names = p.entities.map((e) => e.name);
      expect(new Set(names).size, p.id).toBe(names.length);
    }
  });

  it("у каждой сущности есть русское описание и confidence", () => {
    for (const p of PRESETS) {
      for (const e of p.entities) {
        expect(e.ru.length, `${p.id}: ${e.name}`).toBeGreaterThan(10);
        expect(["verified", "common"]).toContain(e.confidence);
      }
    }
  });
});

describe("presets — примеры исполнимы существующими инструментами", () => {
  it("каждый example.tool — реально зарегистрированный инструмент", () => {
    for (const p of PRESETS) {
      for (const ex of p.examples) {
        expect(TOOL_NAMES.has(ex.tool), `${p.id}: "${ex.title}" → ${ex.tool}`).toBe(true);
      }
    }
  });

  it("аргументы совпадают с формой схем инструментов (полное имя vs имя без префикса)", () => {
    for (const p of PRESETS) {
      for (const ex of p.examples) {
        const a = ex.args as Record<string, string>;
        const where = `${p.id}: "${ex.title}"`;

        // Эти инструменты принимают ПОЛНОЕ имя сущности.
        if (ex.tool === "get_catalogs") {
          expect(a["catalog_name"], where).toMatch(/^Catalog_/);
        }
        if (ex.tool === "get_documents" || ex.tool === "get_recent_documents" || ex.tool === "get_document_lines") {
          expect(a["document_type"], where).toMatch(/^Document_/);
        }

        // А эти — имя регистра БЕЗ префикса: инструмент добавляет его сам.
        if (ex.tool === "get_accumulation_balance" || ex.tool === "get_register" || ex.tool === "get_accounting_register") {
          expect(a["register_name"], where).not.toMatch(
            /^(Accumulation|Information|Accounting)Register_/,
          );
        }

        // odata_query кодирует путь целиком → вызов виртуальной таблицы через него не выразить.
        if (ex.tool === "odata_query") {
          expect(a["entity"], where).not.toMatch(/[/()]/);
        }
      }
    }
  });
});

describe("get_config_preset — инструмент", () => {
  it("без config отдаёт список пресетов", async () => {
    const out = JSON.parse(await handleGetConfigPreset({}));
    expect(out.presets).toHaveLength(4);
    expect(out.presets[0]).toHaveProperty("verified_entities");
  });

  it("с config отдаёт пресет + платформенное знание", async () => {
    const out = JSON.parse(await handleGetConfigPreset({ config: "ут" }));
    expect(out.id).toBe("ut11");
    expect(out.entities.length).toBeGreaterThan(0);
    expect(out.platform.standard_fields).toHaveProperty("Ref_Key");
    expect(out.platform.pitfalls.length).toBeGreaterThan(0);
    expect(out.how_to_read).toContain("verified");
  });

  it("на неизвестный config отдаёт ошибку со списком доступных, а не бросает", async () => {
    const out = JSON.parse(await handleGetConfigPreset({ config: "sap" }));
    expect(out.error).toContain("sap");
    expect(out.available).toHaveLength(4);
  });

  it("listPresets считает подтверждённые имена", () => {
    const bp = listPresets().find((p) => p.id === "bp30")!;
    expect(bp.verified_entities).toBeGreaterThan(0);
    expect(bp.verified_entities).toBeLessThanOrEqual(bp.entities);
  });

  it("COMMON знает все префиксы, которые использует list_entities", () => {
    for (const prefix of ["Catalog_", "Document_", "AccumulationRegister_", "InformationRegister_"]) {
      expect(COMMON.entity_prefixes).toHaveProperty(prefix);
    }
  });
});
