/**
 * Скиллы ↔ инструменты: имена, которые скилл называет, должны существовать у его сервера.
 *
 * Зачем: имя инструмента в SKILL.md переживает переименование в коде молча. Агент
 * выполнит скилл и вызовет то, чего нет. Проверка такого рода была только у yookassa
 * (servers/yookassa/tests/skills.test.ts) — и дрейф остальных 34 серверов нашёлся руками:
 * moysklad звал девять несуществующих инструментов, tkassa — get_state вместо
 * get_payment_state, gigachat — chat_completion вместо chat, cbu — get_rates вместо
 * get_currency_rate.
 *
 * Живёт в packages/core/tests, потому что это единственное место в монорепе, чей `test`
 * поднимает turbo без правки package.json / turbo.json (см. scripts/README.md).
 *
 * Источник имён — scripts/catalog.json: он снят с живого listTools() собранных серверов.
 * Греп по registerTool врёт (wildberries регистрирует в цикле, huntflow — своими
 * обёртками), поэтому статический подсчёт тут не годится.
 */
import { describe, expect, it } from "vitest";
import { existsSync, readdirSync, readFileSync } from "node:fs";
import { join } from "node:path";
import { fileURLToPath } from "node:url";

const ROOT = fileURLToPath(new URL("../../../", import.meta.url));
const CATALOG_PATH = join(ROOT, "scripts", "catalog.json");
const SERVERS = join(ROOT, "servers");

if (!existsSync(CATALOG_PATH)) {
  throw new Error(
    `scripts/catalog.json не найден — без него неоткуда взять реальные имена инструментов.\n` +
      `Сгенерируй: pnpm build && node scripts/catalog.mjs`,
  );
}

type CatalogEntry = { dir: string; connected: boolean; tools: string[] };
const catalog = JSON.parse(readFileSync(CATALOG_PATH, "utf8")) as { entries: CatalogEntry[] };
const toolsByServer = new Map(catalog.entries.map((e) => [e.dir, new Set(e.tools)]));

/**
 * Префиксы имён инструментов — первый сегмент реального имени, собранный по ВСЕЙ монорепе.
 * Не рукописный список: `get`, `list`, `create` приходят из yookassa и moysklad, `chat` —
 * из gigachat (инструмент так и называется), `customer`/`store`/`receipts`/`cards` — из
 * retailcrm, payme и bkash, которые называют инструменты от существительного.
 *
 * Токен в обратных кавычках считается ссылкой на инструмент, если его первый сегмент есть
 * в этом наборе. Так поля схем и namespace-примеры отсеиваются сами, без списка:
 * `city_code`, `area_id`, `moment_from`, `professional_role_id`, `first_name`,
 * `organization_href`, `crm_deals`, `approval_flow` — ни `city`, ни `area`, ни `crm`,
 * ни `approval` не начинают ни одного инструмента монорепы.
 */
const TOOL_PREFIXES = new Set(
  catalog.entries.flatMap((e) => e.tools.map((t) => t.split("_")[0])),
);

/**
 * Плейсхолдеры в примерах вывода: «**Возврат**: refund_xxx», «/refund-payment pay_xxx».
 * Это не вызов, а рыба под идентификатор.
 */
const PLACEHOLDER = /_x{2,}$/i;

/**
 * Идентификаторы и ссылки в схемах: `customer_id` (поле create_order у retailcrm),
 * `store_href` / `organization_href` (moysklad), `order_id` (аргумент get_report у
 * ileti-merkezi). Они сталкиваются с существительными-префиксами реальных инструментов
 * (`customer_notes_list`, `store_inventories`, `order_payment_create`), поэтому правилом
 * префикса не отсеиваются.
 *
 * Плата — один слепой угол: `get_user_by_id` (единственный инструмент монорепы на `_id`)
 * и опечатки в его форме проверку не проходят.
 */
const SCHEMA_FIELD = /_(id|href)$/;

/**
 * Оставшиеся исключения — поимённо и с причиной. Инструменты, которые у сервера есть,
 * но не при дефолтном окружении, с которым снят каталог.
 */
const NOT_A_TOOL: Record<string, Record<string, string>> = {
  aprovodka: {
    approve_write:
      "гейт записи: регистрируется только при ONEC_WRITE_MODE=approval, каталог снят с дефолтным ONEC_WRITE_MODE=off",
    rollback_write: "то же: регистрируется только при ONEC_WRITE_MODE != off",
  },
};

/** Все SKILL.md сервера, на любой глубине под .claude/skills. */
function skillFiles(dir: string): string[] {
  const root = join(SERVERS, dir, ".claude", "skills");
  if (!existsSync(root)) return [];
  const out: string[] = [];
  const walk = (d: string) => {
    for (const entry of readdirSync(d, { withFileTypes: true })) {
      const p = join(d, entry.name);
      if (entry.isDirectory()) walk(p);
      else if (entry.name === "SKILL.md") out.push(p);
    }
  };
  walk(root);
  return out;
}

/** «create-order/SKILL.md» — путь для сообщения об ошибке, без шума из абсолютного пути. */
function skillName(dir: string, file: string): string {
  return file.slice(join(SERVERS, dir, ".claude", "skills").length + 1).replace(/\\/g, "/");
}

/**
 * Имена инструментов, на которые ссылается тело скилла.
 *
 * Известный слепой угол: односегментные токены (`chat`, `search`, `track`) не проверяются —
 * в обратных кавычках такой формы чаще стоят значения полей (`full`, `new`, `succeeded`),
 * и ловить их пришлось бы ценой постоянно красного теста.
 */
function referencedTools(dir: string, body: string): string[] {
  const exceptions = NOT_A_TOOL[dir] ?? {};
  const tokens = [...body.matchAll(/`([a-z][a-z0-9_]*)`/g)].map((m) => m[1]);
  return [
    ...new Set(
      tokens.filter(
        (t) =>
          t.includes("_") &&
          TOOL_PREFIXES.has(t.split("_")[0]) &&
          !PLACEHOLDER.test(t) &&
          !SCHEMA_FIELD.test(t) &&
          !(t in exceptions),
      ),
    ),
  ];
}

const serversWithSkills = readdirSync(SERVERS, { withFileTypes: true })
  .filter((d) => d.isDirectory() && d.name !== "_template")
  .map((d) => d.name)
  .filter((d) => skillFiles(d).length > 0)
  .sort();

describe("скиллы ↔ инструменты по всей монорепе", () => {
  it("нашлись и скиллы, и каталог", () => {
    expect(serversWithSkills.length).toBeGreaterThan(30);
    expect(TOOL_PREFIXES.size).toBeGreaterThan(20);
  });

  it("у каждого сервера со скиллами есть запись в catalog.json", () => {
    const missing = serversWithSkills.filter((d) => !toolsByServer.has(d));
    expect(
      missing,
      `нет в scripts/catalog.json: ${missing.join(", ")} — перегенерируй: pnpm build && node scripts/catalog.mjs`,
    ).toEqual([]);
  });

  it("скиллы ссылаются только на существующие инструменты", () => {
    const drift: string[] = [];
    for (const dir of serversWithSkills) {
      const known = toolsByServer.get(dir);
      if (!known) continue; // покрыто отдельным тестом выше
      for (const file of skillFiles(dir)) {
        const unknown = referencedTools(dir, readFileSync(file, "utf8")).filter(
          (t) => !known.has(t),
        );
        if (unknown.length) drift.push(`${dir} · ${skillName(dir, file)}: ${unknown.join(", ")}`);
      }
    }
    expect(
      drift,
      `скиллы зовут инструменты, которых нет у сервера:\n  ${drift.join("\n  ")}`,
    ).toEqual([]);
  });

  it("allowed-tools в скилле разрешает хотя бы один mcp__ инструмент", () => {
    const broken: string[] = [];
    for (const dir of serversWithSkills) {
      for (const file of skillFiles(dir)) {
        const body = readFileSync(file, "utf8");
        const frontmatter = body.split(/^---$/m)[1] ?? "";
        if (/allowed-tools:/.test(frontmatter) && !/mcp__/.test(frontmatter)) {
          broken.push(`${dir} · ${skillName(dir, file)}`);
        }
      }
    }
    expect(
      broken,
      `allowed-tools без единого mcp__ — скилл не сможет вызвать инструменты сервера:\n  ${broken.join("\n  ")}`,
    ).toEqual([]);
  });
});
