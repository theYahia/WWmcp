#!/usr/bin/env node
/**
 * Харнесс сверки: 10 вопросов клиента прогоняются одной командой.
 *
 * Продаём мы «ответ агента стоит рядом с цифрой из вашего же штатного отчёта
 * 1С». Руками это день работы на клиента, а стоп-условие вехи 3 звучит так:
 * сверка дороже 12 часов — 12 000 ₽ нерентабельны. Скрипт двигает именно это
 * условие: эталон вносится человеком один раз, дальше прогон и таблица.
 *
 *   node scripts/reconcile.mjs docs/reconciliation-questions.example.yaml
 *   node scripts/reconcile.mjs questions.yaml --out otchet.md
 *   node scripts/reconcile.mjs --selftest
 *
 * Доступ к базе — те же переменные, что у самого сервера:
 * ONEC_BASE_URL, ONEC_LOGIN, ONEC_PASSWORD.
 *
 * Код выхода: 0 — сошлось всё, 1 — есть расхождения или ошибки.
 *
 * ponytail: без зависимостей и без YAML-библиотеки — разбирается строгое
 * подмножество YAML (см. parseYaml), всё остальное падает с явной ошибкой.
 * Полноценный парсер понадобится, только если файл вопросов перестанет быть
 * плоским списком.
 */
import { readFileSync, writeFileSync } from "node:fs";
import { strict as assert } from "node:assert";

// ──────────────────────────────────────────────────────────────
// Разбор файла вопросов — строгое подмножество YAML
// ──────────────────────────────────────────────────────────────

/**
 * Понимает ровно две формы: `ключ: значение` на верхнем уровне и один список
 * отображений (`questions:` плюс элементы `- ключ: значение`). Всё, что в них
 * не укладывается, — ошибка с номером строки: молча разобрать не то опаснее,
 * чем не разобрать вовсе, потому что дальше по этим числам принимают работу.
 *
 * Комментарий — только строкой целиком (решётка первым непробельным символом).
 * Хвостовые комментарии не поддержаны намеренно: в значениях живут
 * OData-литералы, и решётка в них — часть значения.
 */
export function parseYaml(text) {
  const doc = {};
  let list = null; // текущий список отображений
  let item = null; // текущий элемент списка

  const lines = text.split(/\r?\n/);
  for (let i = 0; i < lines.length; i++) {
    const raw = lines[i];
    const line = raw.replace(/\s+$/, "");
    if (line === "" || /^\s*#/.test(line)) continue;

    const at = `строка ${i + 1}: ${raw.trim()}`;
    const indent = line.length - line.trimStart().length;
    const body = line.trimStart();

    // `- ключ: значение` — начало элемента списка
    if (body.startsWith("- ")) {
      if (!list) throw new Error(`Элемент списка вне списка — ${at}`);
      item = {};
      list.push(item);
      const [key, rawValue] = splitPair(body.slice(2), at);
      const [value, next] = resolve(rawValue, lines, i, indent + 2);
      item[key] = value;
      i = next;
      continue;
    }

    const [key, rawValue] = splitPair(body, at);
    const [value, next] = resolve(rawValue, lines, i, indent);
    i = next;

    if (indent === 0) {
      item = null;
      if (value === null) {
        // `questions:` — заголовок списка
        list = [];
        doc[key] = list;
      } else {
        list = null;
        doc[key] = value;
      }
      continue;
    }

    // Продолжение элемента списка
    if (!item) throw new Error(`Вложенный ключ без элемента списка — ${at}`);
    item[key] = value;
  }
  return doc;
}

function splitPair(body, at) {
  const idx = body.indexOf(":");
  if (idx <= 0) throw new Error(`Ожидалось "ключ: значение" — ${at}`);
  const key = body.slice(0, idx).trim();
  if (!/^[A-Za-z_][A-Za-z0-9_]*$/.test(key)) {
    throw new Error(`Недопустимое имя ключа "${key}" — ${at}`);
  }
  return [key, body.slice(idx + 1).trim()];
}

/**
 * Значение пары: обычный скаляр либо блок `>`/`>-`/`|`/`|-`.
 *
 * Блоки понадобились сразу же: примечания к вопросам сверки — это записанные
 * ловушки базы, и в одну строку они не влезают. Возвращает [значение, индекс
 * последней поглощённой строки].
 */
function resolve(raw, lines, i, indent) {
  const block = raw.match(/^([>|])([-+]?)$/);
  if (!block) return [scalar(raw), i];

  const chunks = [];
  let j = i;
  while (j + 1 < lines.length) {
    const nxt = lines[j + 1];
    if (nxt.trim() === "") {
      chunks.push("");
      j++;
      continue;
    }
    if (nxt.length - nxt.trimStart().length <= indent) break;
    chunks.push(nxt.trim());
    j++;
  }
  while (chunks.length > 0 && chunks[chunks.length - 1] === "") chunks.pop();
  const text = block[1] === ">" ? chunks.join(" ").replace(/\s+/g, " ").trim() : chunks.join("\n");
  return [block[2] === "-" || block[1] === ">" ? text : text + "\n", j];
}

/** Пустое — null, число — Number, кавычки снимаются, остальное — строка. */
function scalar(text) {
  if (text === "" || text === "~" || text === "null") return null;
  if (text === "true") return true;
  if (text === "false") return false;
  if (/^-?\d+(\.\d+)?$/.test(text)) return Number(text);
  const quoted = text.match(/^"([\s\S]*)"$/) ?? text.match(/^'([\s\S]*)'$/);
  return quoted ? quoted[1] : text;
}

// ──────────────────────────────────────────────────────────────
// Извлечение числа из ответа 1С
// ──────────────────────────────────────────────────────────────

/** Точечный путь с числовыми индексами: `value.0.СуммаBalance`. */
export function pick(obj, path) {
  if (!path) return obj;
  let cur = obj;
  for (const part of String(path).split(".")) {
    if (cur == null) return undefined;
    cur = cur[part];
  }
  return cur;
}

/**
 * Число, которое агент кладёт рядом с эталоном.
 *
 * 1С отдаёт денежные суммы то числом, то строкой (зависит от версии платформы
 * и от того, виртуальная это таблица или нет), поэтому приведение явное.
 * `odata.count` платформа отдаёт строкой всегда.
 */
export function extractValue(json, q) {
  const target = pick(json, q.extract ?? "value");
  if (Array.isArray(target)) {
    const mode = q.aggregate ?? (q.field ? "sum" : "count");
    if (mode === "count") return target.length;
    if (!q.field) throw new Error(`aggregate=${mode} требует поле field`);
    const nums = target.map((row) => toNumber(row[q.field], q.field));
    if (mode === "sum") return nums.reduce((a, b) => a + b, 0);
    if (mode === "first") {
      if (nums.length === 0) throw new Error("выборка пуста, aggregate=first нечего взять");
      return nums[0];
    }
    throw new Error(`Неизвестный aggregate: ${mode}`);
  }
  return toNumber(target, q.extract ?? "value");
}

function toNumber(value, where) {
  if (typeof value === "number") return value;
  if (typeof value === "string" && value.trim() !== "" && !Number.isNaN(Number(value))) {
    return Number(value);
  }
  throw new Error(`Ожидалось число в "${where}", получено: ${JSON.stringify(value)}`);
}

// ──────────────────────────────────────────────────────────────
// Запрос к базе
// ──────────────────────────────────────────────────────────────

const ODATA_ROOT = "/odata/standard.odata/";

export function buildUrl(baseUrl, path) {
  const base = baseUrl.replace(/\/+$/, "");
  // ONEC_BASE_URL исторически пишут в двух формах: с /odata/standard.odata и
  // без него. Обе рабочие — иначе получается 404 без внятной причины.
  const root = base.endsWith("/odata/standard.odata") ? base + "/" : base + ODATA_ROOT;
  return new URL(root + String(path).replace(/^\/+/, "")).toString();
}

async function fetchJson(url, login, password, fetchImpl) {
  const res = await fetchImpl(url, {
    headers: {
      Accept: "application/json",
      Authorization: "Basic " + Buffer.from(`${login}:${password}`).toString("base64"),
    },
  });
  const text = await res.text();
  if (!res.ok) throw new Error(`HTTP ${res.status}: ${text.slice(0, 300)}`);
  try {
    return JSON.parse(text);
  } catch {
    // 1С отвечает Atom-XML, когда $format=json не дошёл до платформы, и
    // HTML-страницей веб-сервера, когда публикация недоступна. Оба случая
    // выглядят как «данные не пришли», причины разные.
    throw new Error(`Ответ не JSON (${text.slice(0, 120)}…) — проверьте ?$format=json в path`);
  }
}

// ──────────────────────────────────────────────────────────────
// Прогон и вердикт
// ──────────────────────────────────────────────────────────────

const DEFAULT_TOLERANCE = 0.01;

export async function runReconciliation(doc, opts) {
  const { baseUrl, login, password, fetchImpl } = opts;
  const questions = doc.questions ?? [];
  if (questions.length === 0) throw new Error("В файле нет ни одного вопроса (ключ questions)");

  const rows = [];
  for (const q of questions) {
    const row = { id: q.id, title: q.title, source: q.reference_report, expected: q.expected };
    try {
      if (!q.path) throw new Error("не задан path — запрос к OData");
      const url = buildUrl(baseUrl, q.path);
      row.url = url;
      const json = await fetchJson(url, login, password, fetchImpl);
      row.actual = extractValue(json, q);
      if (q.expected == null) {
        row.verdict = "нет эталона";
      } else {
        const tol = q.tolerance ?? DEFAULT_TOLERANCE;
        row.diff = row.actual - q.expected;
        row.verdict = Math.abs(row.diff) <= tol ? "сошлось" : "НЕ СОШЛОСЬ";
      }
    } catch (e) {
      row.verdict = "ошибка";
      row.error = e instanceof Error ? e.message : String(e);
    }
    rows.push(row);
  }
  return rows;
}

const money = (n) =>
  n == null ? "—" : n.toLocaleString("ru-RU", { maximumFractionDigits: 2 });

export function renderReport(doc, rows, startedAt) {
  const matched = rows.filter((r) => r.verdict === "сошлось").length;
  const comparable = rows.filter((r) => r.expected != null).length;
  const out = [];

  out.push("# Отчёт сверки");
  out.push("");
  out.push("| Параметр | Значение |");
  out.push("|---|---|");
  out.push(`| Конфигурация | ${doc.config ?? "—"} |`);
  out.push(`| База | ${doc.base ?? "—"} |`);
  out.push(`| Период | ${doc.period_from ?? "—"} — ${doc.period_to ?? "—"} |`);
  out.push(`| Дата прогона | ${startedAt.toISOString().slice(0, 19).replace("T", " ")} |`);
  out.push(`| Вопросов | ${rows.length} |`);
  out.push("");
  out.push(
    `**Сошлось ${matched} из ${comparable}.**` +
      (comparable < rows.length
        ? ` Ещё ${rows.length - comparable} без эталона — цифру из штатного отчёта не внесли.`
        : ""),
  );
  out.push("");
  out.push("| № | Вопрос | Штатный отчёт 1С | Эталон | Агент | Расхождение | Вердикт |");
  out.push("|---|---|---|---|---|---|---|");
  for (const r of rows) {
    out.push(
      `| ${r.id ?? ""} | ${r.title ?? ""} | ${r.source ?? "—"} | ${money(r.expected)} | ` +
        `${r.error ? "—" : money(r.actual)} | ${money(r.diff)} | ${r.verdict} |`,
    );
  }

  const failed = rows.filter((r) => r.verdict === "НЕ СОШЛОСЬ" || r.verdict === "ошибка");
  if (failed.length > 0) {
    out.push("");
    out.push("## Что разошлось");
    out.push("");
    for (const r of failed) {
      out.push(`- **${r.id ?? ""} ${r.title ?? ""}** — ${r.error ?? `расхождение ${money(r.diff)}`}`);
      if (r.url) out.push(`  - запрос: \`${r.url}\``);
    }
  }

  out.push("");
  out.push("## Что мы нашли");
  out.push("");
  out.push("> Раздел заполняется руками: ловушки базы, из-за которых наивный запрос вернул бы");
  out.push("> правдоподобное, но неверное число. Без хотя бы одной находки отчёт — формальность.");
  out.push("");
  return out.join("\n");
}

// ──────────────────────────────────────────────────────────────
// Самопроверка — подложенные расхождения обязаны дать «НЕ СОШЛОСЬ»
// ──────────────────────────────────────────────────────────────

const SELFTEST_DOC = [
  "config: БП 3.0",
  "period_from: 2026-08-01",
  "questions:",
  "  - id: 1",
  "    title: Остаток на 51 счёте",
  "    reference_report: ОСВ по счёту 51",
  "    path: AccountingRegister_Хозрасчетный/Balance(Period=datetime'2026-09-01T00:00:00')?$format=json",
  "    field: СуммаBalance",
  "    expected: 1500.5",
  "    note: >-",
  "      Граница периода — 00:00:00 следующего дня,",
  "      иначе теряются проводки последнего дня.",
  "  - id: 2",
  "    title: Сумма поступлений за период",
  "    path: Document_ПоступлениеТоваровУслуг?$format=json",
  "    field: СуммаДокумента",
  "    expected: 100",
  "  - id: 3",
  "    title: Число документов",
  "    path: Document_ПоступлениеТоваровУслуг?$format=json",
  "    aggregate: count",
  "    expected: 2",
  "  - id: 4",
  "    title: Сущности нет в публикации",
  "    path: AccumulationRegister_Нетакой?$format=json",
  "    expected: 1",
  "",
].join("\n");

async function selftest() {
  const doc = parseYaml(SELFTEST_DOC);

  assert.equal(doc.config, "БП 3.0");
  assert.equal(doc.questions.length, 4);
  assert.equal(doc.questions[0].expected, 1500.5);
  // Двоеточия внутри OData-литерала не должны разрывать значение.
  assert.ok(doc.questions[0].path.endsWith("T00:00:00')?$format=json"));
  // Сложенный блок склеивается в одну строку и не съедает следующий вопрос.
  assert.equal(
    doc.questions[0].note,
    "Граница периода — 00:00:00 следующего дня, иначе теряются проводки последнего дня.",
  );
  assert.equal(doc.questions[1].title, "Сумма поступлений за период");

  const responses = {
    // Сходится в допуске; сумма пришла строкой, как её отдаёт платформа.
    "AccountingRegister_Хозрасчетный/Balance": { value: [{ "СуммаBalance": "1500.50" }] },
    // Заведомо расходится: 1000 + 500 = 1500 против эталона 100.
    "Document_ПоступлениеТоваровУслуг": {
      "odata.count": "2",
      value: [{ "СуммаДокумента": 1000 }, { "СуммаДокумента": 500 }],
    },
  };
  const fetchImpl = async (url) => {
    const decoded = decodeURIComponent(url);
    const hit = Object.entries(responses).find(([k]) => decoded.includes(k));
    if (!hit) return { ok: false, status: 404, text: async () => "Not found" };
    return { ok: true, status: 200, text: async () => JSON.stringify(hit[1]) };
  };

  const rows = await runReconciliation(doc, {
    baseUrl: "http://localhost:8080/base",
    login: "u",
    password: "p",
    fetchImpl,
  });

  assert.equal(rows[0].verdict, "сошлось", "строка из 1С должна приводиться к числу");
  assert.equal(rows[1].verdict, "НЕ СОШЛОСЬ", "подложенное расхождение обязано ловиться");
  assert.equal(rows[1].actual, 1500);
  assert.equal(rows[2].verdict, "сошлось", "aggregate=count считает строки");
  assert.equal(rows[3].verdict, "ошибка");
  assert.match(rows[3].error, /HTTP 404/);

  const report = renderReport(doc, rows, new Date("2026-09-02T12:00:00Z"));
  assert.match(report, /Сошлось 2 из 4/);
  assert.match(report, /НЕ СОШЛОСЬ/);
  assert.match(report, /Что разошлось/);

  // Разбор обязан падать громко, а не молча съедать неизвестную форму.
  assert.throws(() => parseYaml("questions:\n  - id: 1\n    bad line without colon\n"), /значение/);
  assert.throws(() => parseYaml("  orphan: 1\n"), /без элемента списка/);

  assert.equal(
    buildUrl("http://h/base/odata/standard.odata", "Catalog_Валюты"),
    "http://h/base/odata/standard.odata/Catalog_%D0%92%D0%B0%D0%BB%D1%8E%D1%82%D1%8B",
  );

  console.log("selftest: ок");
}

// ──────────────────────────────────────────────────────────────

async function main(argv) {
  if (argv.includes("--selftest")) {
    await selftest();
    return 0;
  }
  const file = argv.find((a) => !a.startsWith("--"));
  if (!file) {
    console.error("Использование: node scripts/reconcile.mjs <вопросы.yaml> [--out отчёт.md]");
    console.error("               node scripts/reconcile.mjs --selftest");
    return 2;
  }
  const outIdx = argv.indexOf("--out");
  const outFile = outIdx >= 0 ? argv[outIdx + 1] : null;

  const baseUrl = process.env["ONEC_BASE_URL"] ?? process.env["1C_BASE_URL"];
  const login = process.env["ONEC_LOGIN"] ?? process.env["1C_LOGIN"];
  const password = process.env["ONEC_PASSWORD"] ?? process.env["1C_PASSWORD"];
  if (!baseUrl || !login || !password) {
    console.error("Нужны ONEC_BASE_URL, ONEC_LOGIN, ONEC_PASSWORD — те же, что у сервера.");
    return 2;
  }

  const startedAt = new Date();
  const doc = parseYaml(readFileSync(file, "utf8"));
  const rows = await runReconciliation(doc, { baseUrl, login, password, fetchImpl: fetch });
  const report = renderReport(doc, rows, startedAt);

  if (outFile) {
    writeFileSync(outFile, report, "utf8");
    console.error(`Отчёт записан: ${outFile}`);
  } else {
    console.log(report);
  }
  console.error(`Прогон занял ${((Date.now() - startedAt.getTime()) / 1000).toFixed(1)} с.`);
  const bad = rows.filter((r) => r.verdict === "НЕ СОШЛОСЬ" || r.verdict === "ошибка").length;
  return bad > 0 ? 1 : 0;
}

if (process.argv[1]?.endsWith("reconcile.mjs")) {
  main(process.argv.slice(2)).then((code) => process.exit(code));
}
