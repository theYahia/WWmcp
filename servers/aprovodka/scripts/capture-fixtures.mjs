#!/usr/bin/env node
/**
 * Снять сырые ответы живой базы 1С в tests/fixtures/ — обезличенно.
 *
 * Все 226 тестов сейчас зелёные на моках, которые мы же и придумали. Они
 * доказывают, что код делает задуманное, но не то, что база реально отдаёт, —
 * а продаём мы именно совпадение с реальностью. Не покрыты: кириллица в именах
 * и значениях, `odata.count` строкой, Atom-XML конверт, ошибка веб-сервера в
 * HTML, пустой `value` против отсутствующего.
 *
 *   ONEC_BASE_URL=… ONEC_LOGIN=… ONEC_PASSWORD=… \
 *     node scripts/capture-fixtures.mjs --config "БП 3.0" --platform 8.3.25.1257
 *
 *   node scripts/capture-fixtures.mjs --selftest      # проверка обезличивания
 *
 * Имена сущностей конфигурационно-зависимы; свои задаются флагами
 * --catalog / --document / --register (см. PROBES).
 *
 * ⚠️ Только демо-база. Данные реального клиента здесь не складываются даже
 * обезличенными — так записано в WORK-1519.
 */
import { writeFileSync, mkdirSync, existsSync } from "node:fs";
import { join, dirname, resolve } from "node:path";
import { fileURLToPath } from "node:url";
import { strict as assert } from "node:assert";

const ROOT = resolve(dirname(fileURLToPath(import.meta.url)), "..");
const OUT_DIR = join(ROOT, "tests", "fixtures");

// ──────────────────────────────────────────────────────────────
// Обезличивание
// ──────────────────────────────────────────────────────────────

const GUID_RE = /[0-9a-fA-F]{8}-[0-9a-fA-F]{4}-[0-9a-fA-F]{4}-[0-9a-fA-F]{4}-[0-9a-fA-F]{12}/g;

/**
 * Поля, чьи ЗНАЧЕНИЯ маскируются целиком. Кириллица в наименованиях при этом
 * сохраняется намеренно: ради неё фикстуры и снимаются — если затереть все
 * русские строки, тест перестанет проверять то единственное, что проверяет.
 */
const SENSITIVE_FIELD_RE =
  /^(ИНН|КПП|ОГРН|ОГРНИП|СНИЛС|Телефон|Факс|Email|АдресЭП|АдресЭлектроннойПочты|НомерСчета|НомерСчёта|Паспорт\w*|ДатаРождения|АдресДоставки|ЮридическийАдрес|ФактическийАдрес)$/i;

/** Устойчивая подстановка GUID: одинаковый вход — одинаковый выход в пределах прогона. */
export function makeGuidMapper() {
  const seen = new Map();
  return (guid) => {
    const key = guid.toLowerCase();
    let repl = seen.get(key);
    if (!repl) {
      const n = (seen.size + 1).toString(16).padStart(12, "0");
      repl = `00000000-0000-4000-8000-${n}`;
      seen.set(key, repl);
    }
    return repl;
  };
}

/**
 * Обезличить разобранный JSON-ответ.
 *
 * GUID подменяются, потому что Ref_Key связывает фикстуру с конкретной базой;
 * формат при этом сохраняется — иначе `refKeySchema` перестанет их принимать
 * и тест начнёт проверять не то.
 */
export function anonymiseJson(value, mapGuid, baseUrl) {
  if (typeof value === "string") {
    let out = value.replace(GUID_RE, (g) => mapGuid(g));
    if (baseUrl) out = out.split(baseUrl).join("https://demo.example/base");
    return out;
  }
  if (Array.isArray(value)) return value.map((v) => anonymiseJson(v, mapGuid, baseUrl));
  if (value && typeof value === "object") {
    const out = {};
    for (const [k, v] of Object.entries(value)) {
      out[k] = SENSITIVE_FIELD_RE.test(k) && typeof v === "string" ? "—обезличено—" : anonymiseJson(v, mapGuid, baseUrl);
    }
    return out;
  }
  return value;
}

/** То же для не-JSON ответов (Atom-XML, HTML веб-сервера, простой текст). */
export function anonymiseText(text, mapGuid, baseUrl) {
  let out = text.replace(GUID_RE, (g) => mapGuid(g));
  if (baseUrl) out = out.split(baseUrl).join("https://demo.example/base");
  return out;
}

// ──────────────────────────────────────────────────────────────
// Что снимаем
// ──────────────────────────────────────────────────────────────

/**
 * Семь ответов из WORK-1519. `expect` — что именно эта фикстура должна дать
 * тесту; попадает в шапку файла, чтобы через месяц не гадать, зачем она.
 */
const PROBES = (n) => [
  {
    file: "01-service-root.json",
    path: "?$format=json",
    expect: "корень OData: состав опубликованных сущностей, кириллица в именах entity set",
  },
  {
    file: "02-metadata-fragment.xml",
    path: "$metadata",
    truncate: 20000,
    expect: "фрагмент $metadata: реальные имена виртуальных таблиц (в т. ч. оборотов Дт/Кт — WORK-1516)",
  },
  {
    file: "03-documents.json",
    path: `${n.document}?$top=3&$format=json`,
    expect: "список документов: Ref_Key, Date, Number, Posted, суммы — числом или строкой",
  },
  {
    file: "04-catalog-cyrillic.json",
    path: `${n.catalog}?$top=3&$format=json`,
    expect: "справочник с кириллицей в Description и в именах реквизитов",
  },
  {
    file: "05-register.json",
    path: `${n.register}?$top=3&$format=json`,
    expect: "регистр накопления: измерения как <Измерение>_Key, ресурсы",
  },
  {
    file: "06-error-4xx.txt",
    path: `${n.catalog}?$filter=НетТакогоРеквизита eq 1&$format=json`,
    expectError: true,
    expect: "ошибка 4xx с русским текстом — вход для parseOneCError",
  },
  {
    file: "07-error-webserver.txt",
    path: "ТакойСущностиНет",
    expectError: true,
    expect: "ответ веб-сервера на несуществующий путь: часто HTML, а не конверт OData",
  },
];

const DEFAULT_NAMES = {
  catalog: "Catalog_Контрагенты",
  document: "Document_РеализацияТоваровУслуг",
  register: "AccumulationRegister_ТоварыНаСкладах",
};

// ──────────────────────────────────────────────────────────────

function arg(argv, name, fallback) {
  const i = argv.indexOf(`--${name}`);
  return i >= 0 && argv[i + 1] ? argv[i + 1] : fallback;
}

async function capture(argv) {
  const baseUrl = (process.env["ONEC_BASE_URL"] ?? process.env["1C_BASE_URL"] ?? "").replace(/\/+$/, "");
  const login = process.env["ONEC_LOGIN"] ?? process.env["1C_LOGIN"];
  const password = process.env["ONEC_PASSWORD"] ?? process.env["1C_PASSWORD"];
  if (!baseUrl || !login || !password) {
    console.error("Нужны ONEC_BASE_URL, ONEC_LOGIN, ONEC_PASSWORD — те же, что у сервера.");
    return 2;
  }

  const meta = {
    config: arg(argv, "config", "НЕ УКАЗАНА — заполнить руками"),
    platform: arg(argv, "platform", "НЕ УКАЗАНА — заполнить руками"),
    captured: new Date().toISOString().slice(0, 10),
  };
  const names = {
    catalog: arg(argv, "catalog", DEFAULT_NAMES.catalog),
    document: arg(argv, "document", DEFAULT_NAMES.document),
    register: arg(argv, "register", DEFAULT_NAMES.register),
  };

  if (!existsSync(OUT_DIR)) mkdirSync(OUT_DIR, { recursive: true });
  const mapGuid = makeGuidMapper();
  const root = baseUrl.endsWith("/odata/standard.odata") ? baseUrl : baseUrl + "/odata/standard.odata";
  const auth = "Basic " + Buffer.from(`${login}:${password}`).toString("base64");

  let ok = 0;
  for (const probe of PROBES(names)) {
    const url = new URL(root + "/" + probe.path).toString();
    let status;
    let body;
    try {
      const res = await fetch(url, { headers: { Accept: "application/json", Authorization: auth } });
      status = res.status;
      body = await res.text();
    } catch (e) {
      console.error(`✗ ${probe.file}: сеть — ${e instanceof Error ? e.message : e}`);
      continue;
    }

    if (probe.expectError && status < 400) {
      console.error(`⚠ ${probe.file}: ждали ошибку, база ответила ${status} — фикстура записана как есть`);
    }
    if (!probe.expectError && status >= 400) {
      console.error(`✗ ${probe.file}: HTTP ${status} — ${body.slice(0, 150)}`);
      continue;
    }

    if (probe.truncate) body = body.slice(0, probe.truncate);

    // JSON обезличивается по полям, всё прочее — построчной заменой.
    let text;
    try {
      text = JSON.stringify(anonymiseJson(JSON.parse(body), mapGuid, baseUrl), null, 2);
    } catch {
      text = anonymiseText(body, mapGuid, baseUrl);
    }

    const header =
      `# Снято ${meta.captured} с демо-базы. Конфигурация: ${meta.config}. ` +
      `Платформа: ${meta.platform}. HTTP ${status}. URL: ${probe.path}\n` +
      `# Зачем: ${probe.expect}\n` +
      "# Обезличено: GUID подменены, адрес базы заменён, чувствительные реквизиты затёрты.\n";
    // В .json комментариев нет — шапка уходит в спутник .meta.txt.
    const isJson = probe.file.endsWith(".json");
    writeFileSync(join(OUT_DIR, probe.file), isJson ? text : header + text, "utf8");
    if (isJson) writeFileSync(join(OUT_DIR, probe.file + ".meta.txt"), header, "utf8");

    console.error(`✓ ${probe.file} (HTTP ${status}, ${text.length} симв.)`);
    ok++;
  }

  console.error(`\nСнято ${ok} из 7. Каталог: ${OUT_DIR}`);
  console.error("Дальше: прогнать parseOneCError и normaliseEntity на снятом; всё, что упало, — отдельные дефекты в WORK-1519.");
  return ok === 0 ? 1 : 0;
}

// ──────────────────────────────────────────────────────────────

function selftest() {
  const mapGuid = makeGuidMapper();
  const src = {
    "odata.metadata": "http://1c.local/buh/odata/standard.odata/$metadata#Catalog_Контрагенты",
    "odata.count": "17",
    value: [
      {
        Ref_Key: "bd5a3c14-1111-2222-3333-444455556666",
        Description: "ООО «Ромашка»",
        ИНН: "7720285735",
        Телефон: "+7 495 123-45-67",
        Владелец_Key: "bd5a3c14-1111-2222-3333-444455556666",
        Сумма: 1500.5,
        DeletionMark: false,
      },
    ],
  };
  const out = anonymiseJson(src, mapGuid, "http://1c.local/buh");

  assert.equal(out.value[0].Description, "ООО «Ромашка»", "кириллица обязана уцелеть — ради неё всё и снимается");
  assert.equal(out.value[0].ИНН, "—обезличено—");
  assert.equal(out.value[0].Телефон, "—обезличено—");
  assert.equal(out.value[0].Сумма, 1500.5, "числа не трогаем");
  assert.equal(out.value[0].DeletionMark, false);
  assert.equal(out["odata.count"], "17", "odata.count приходит строкой — так и остаётся");
  assert.notEqual(out.value[0].Ref_Key, src.value[0].Ref_Key);
  assert.match(out.value[0].Ref_Key, /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/);
  assert.equal(out.value[0].Владелец_Key, out.value[0].Ref_Key, "один GUID — одна подстановка");
  assert.ok(!out["odata.metadata"].includes("1c.local"), "адрес базы должен уйти");

  const xml =
    '<error><message xml:lang="ru">Объект не найден: bd5a3c14-1111-2222-3333-444455556666</message></error>';
  const anonXml = anonymiseText(xml, mapGuid, "http://1c.local/buh");
  assert.ok(anonXml.includes("Объект не найден"), "русский текст ошибки — это и есть вход parseOneCError");
  assert.ok(!anonXml.includes("bd5a3c14"));

  console.log("selftest: ок");
}

const argv = process.argv.slice(2);
if (argv.includes("--selftest")) {
  selftest();
} else {
  capture(argv).then((code) => process.exit(code));
}
