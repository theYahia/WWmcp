/**
 * Версия и число инструментов в документации: во всех формах, в которых они там записаны.
 *
 * Вынесено из catalog.mjs отдельным модулем ровно потому, что это единственная чистая часть
 * скрипта: её можно проверить тестом, не поднимая 46 серверов
 * (packages/core/tests/doc-numbers.test.ts).
 *
 * Дыра, из-за которой модуль появился: прежний patchLine знал только markdown-таблицу и
 * мёртвый class="tools-num" (такого класса в docs/index.html нет вообще), поэтому витрина
 * числилась проверяемой, но не проверялась — salla стояла с «9 tools» при реальных 22.
 *
 * Формы, встречающиеся в документации:
 *
 *   README.md / README.ru.md   | v3.1.0 |                    | 22 tools |
 *   docs/index.html            <td class="ver">3.1.0</td>
 *   docs/index.html, проза     22 tools / 1 tool
 *   docs/index.html, проза     22 инструмента / 8 инструментов / 1 инструмент
 */

/** Пакеты монорепы. Суффикс -mcp требовать нельзя: @theyahia/aprovodka его не имеет. */
export const PKG_RE = /@theyahia\/[a-z0-9-]+/;

/** Границы строки HTML-таблицы: <tr>, <tr class="..."> и </tr>. */
export const ROW_OPEN_RE = /<tr[\s>]/;
export const ROW_CLOSE_RE = /<\/tr>/;

/** «1 инструмент» / «22 инструмента» / «8 инструментов» — форму пересчитываем при замене. */
export function ruPlural(n) {
  const d = n % 10;
  const h = n % 100;
  if (d === 1 && h !== 11) return "инструмент";
  if (d >= 2 && d <= 4 && (h < 12 || h > 14)) return "инструмента";
  return "инструментов";
}

/**
 * Переписывает версию и число инструментов в одной строке документации.
 *
 * Каждая замена — без флага g: правится ПЕРВОЕ вхождение. Числа, идущие в описании дальше
 * («34 инструмента в 11 модулях», «плюс 2 MCP-подсказки», «8 tools … Custom 3-step token
 * auth», «(+ 10 Francophone countries) — 8 tools»), остаются нетронутыми.
 */
export function patchDocLine(line, { version, toolCount }) {
  return (
    line
      // markdown-таблица README: | v3.1.0 | 22 tools |
      .replace(/\| v\d[^|\s]* \|/, `| v${version} |`)
      .replace(/\| \d+ tools? \|/, `| ${toolCount} tools |`)
      // docs/index.html, ячейка версии: <td class="ver">3.1.0</td>
      .replace(/(class="ver">)\d[^<]*(<)/, `$1${version}$2`)
      // docs/index.html, проза по-английски: «— 22 tools for products», «8 tools: SMS, …»
      .replace(/\b\d+ tools?\b/, `${toolCount} ${toolCount === 1 ? "tool" : "tools"}`)
      // docs/index.html, проза по-русски: «СДЭК: 16 инструментов — расчёт, заказы, …»
      .replace(/\b\d+ инструмент(?:ов|а)?(?![а-яё])/, `${toolCount} ${ruPlural(toolCount)}`)
  );
}

/**
 * Проходит файл документации построчно и правит числа тех пакетов, что реально есть в
 * `byPkg` (Map «имя пакета» → { version, toolCount }). Всё остальное — standalone-репо вне
 * монорепы — не трогается.
 *
 * В markdown пакет, версия и число тулов лежат в одной строке. В docs/index.html они
 * разнесены по строкам одного <tr>: имя пакета, <td class="ver">, следом описание с числом
 * прозой. Поэтому для html имя пакета переносится вниз — но только внутри <tr>…</tr>. Иначе
 * пакет из примера конфига (<pre class="cfg"> с "@theyahia/wildberries-mcp" стоит прямо над
 * таблицей) утёк бы в первую строку этой таблицы и проставил бы 2gis чужую версию.
 */
export function patchDocFile(text, byPkg, rel) {
  const rowScoped = rel.endsWith(".html");
  const changes = [];
  let row = null;
  let inRow = false;
  const next = text.split("\n").map((line, i) => {
    if (rowScoped && ROW_OPEN_RE.test(line)) {
      inRow = true;
      row = null;
    }
    const m = line.match(PKG_RE);
    const hit = m ? (byPkg.get(m[0]) ?? null) : null;
    if (m) row = hit;
    const e = hit ?? (rowScoped && inRow ? row : null);
    if (rowScoped && ROW_CLOSE_RE.test(line)) {
      inRow = false;
      row = null;
    }
    if (!e) return line;
    const patched = patchDocLine(line, e);
    if (patched !== line) {
      changes.push({ pkg: e.name ?? null, line: i + 1, from: line.trim(), to: patched.trim() });
    }
    return patched;
  });
  return { text: next.join("\n"), changes };
}
