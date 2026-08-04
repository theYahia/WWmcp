#!/usr/bin/env node
/**
 * Собрать docs/manual/*.md в единое руководство docs/MANUAL.ru.md.
 *
 * Руководство — обязательный артефакт сразу для двух заявок (реестр отечественного
 * ПО по ПП №1937 и «1С:Совместимо»), поэтому собирается скриптом, а не руками:
 * секции правятся по отдельности, документ пересобирается одной командой и не
 * расходится с ними.
 *
 * Заодно нормализуются уровни заголовков — авторы секций писали их независимо,
 * и часть подразделов уехала на уровень выше, чем нужно в общем документе.
 *
 *   node scripts/build-manual.mjs
 */
import { readFileSync, writeFileSync, readdirSync } from "node:fs";
import { join, dirname, resolve } from "node:path";
import { fileURLToPath } from "node:url";

const root = resolve(dirname(fileURLToPath(import.meta.url)), "..");
const dir = join(root, "docs", "manual");
const files = readdirSync(dir).filter((f) => /^\d\d-.*\.md$/.test(f)).sort();

/**
 * Уровень заголовка по номеру раздела: "3." → h2, "7.4" → h3, "7.4.1" → h4.
 * Верхний уровень авторы писали с точкой на конце ("## 3. Установка"), а
 * подразделы без ("## 7.4 Модуль registers") — нормализуем обе формы.
 */
function levelFor(num) {
  return Math.min(1 + num.replace(/\.$/, "").split(".").length, 6);
}

const chunks = [];
for (const f of files) {
  let text = readFileSync(join(dir, f), "utf8").trim();

  // Титул документа держим только в первой секции.
  if (f !== files[0]) text = text.replace(/^# Руководство пользователя[^\n]*\n+/, "");

  // Нумерованные заголовки приводим к уровню, который следует из самого номера:
  // авторы секций не видели друг друга, и "7.7" мог оказаться h1, а "7.4" — h2.
  text = text.replace(/^(#{1,6})\s+(\d+(?:\.\d+)*\.?)\s+/gm, (_m, _h, num) =>
    "#".repeat(levelFor(num)) + " " + num + " ",
  );

  chunks.push(text);
}

const body = chunks.join("\n\n---\n\n");

// --- оглавление ----------------------------------------------------------
const toc = [];
for (const line of body.split("\n")) {
  const m = /^(#{2,4})\s+(\d+(?:\.\d+)*\.?)\s+(.+)$/.exec(line);
  if (!m) continue;
  const [, hashes, num, title] = m;
  const indent = "  ".repeat(hashes.length - 2);
  const anchor = `${num} ${title}`
    .toLowerCase()
    .replace(/[`*]/g, "")
    .replace(/[^\p{L}\p{N}\s.-]/gu, "")
    .trim()
    .replace(/[\s.]+/g, "-");
  toc.push(`${indent}- [${num} ${title.replace(/[`*]/g, "")}](#${anchor})`);
}

const head = body.slice(0, body.indexOf("\n## "));
const rest = body.slice(body.indexOf("\n## "));

const out =
  head +
  "\n\n## Оглавление\n\n" +
  toc.join("\n") +
  "\n" +
  rest +
  "\n";

const target = join(root, "docs", "MANUAL.ru.md");
writeFileSync(target, out, "utf8");

const chars = out.length;
console.log(`${target}`);
console.log(`секций: ${files.length}`);
console.log(`знаков: ${chars} (≈ ${Math.round(chars / 2000)} стр. А5 при 2000 зн./стр.)`);
console.log(`пунктов оглавления: ${toc.length}`);
