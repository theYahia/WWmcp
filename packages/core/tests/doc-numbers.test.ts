/**
 * scripts/doc-numbers.mjs — числа в README.md / README.ru.md / docs/index.html.
 *
 * Зачем тест: витрина docs/index.html числилась проверяемой генератором, но не
 * проверялась — числа там написаны прозой («5 инструментов», «9 tools»), а патчер знал
 * только markdown-таблицу и мёртвый class="tools-num". Мимо прошла salla с «9 tools» при
 * реальных 22. Тест фиксирует все формы записи и — главное — проверяет, что ни одно
 * упоминание числа инструментов в таблицах витрины не осталось вне досягаемости патчера.
 *
 * Живёт в packages/core/tests, потому что это единственное место в монорепе, чей `test`
 * поднимает turbo без правки package.json / turbo.json (см. scripts/README.md).
 */
import { describe, expect, it } from "vitest";
import { readFileSync } from "node:fs";
import { join } from "node:path";
import { fileURLToPath } from "node:url";

// @ts-expect-error — служебный .mjs монорепы, типов у него нет
import { patchDocFile, patchDocLine, ruPlural } from "../../../scripts/doc-numbers.mjs";

const ROOT = fileURLToPath(new URL("../../../", import.meta.url));
const catalog = JSON.parse(readFileSync(join(ROOT, "scripts", "catalog.json"), "utf8"));

type Change = { pkg: string | null; line: number; from: string; to: string };

describe("patchDocLine — формы записи версии и числа инструментов", () => {
  const to = { version: "3.1.0", toolCount: 22 };

  it.each([
    [
      "markdown README: версия и число в одной строке",
      "| [@theyahia/salla-mcp](https://npm/@theyahia/salla-mcp) | v1.0.0 | 9 tools | Shop |",
      "| [@theyahia/salla-mcp](https://npm/@theyahia/salla-mcp) | v3.1.0 | 22 tools | Shop |",
    ],
    [
      "markdown README со страной в отдельной колонке",
      "| [@theyahia/salla-mcp](https://npm/x) | Saudi Arabia | v1.0.0 | 9 tools | Shop |",
      "| [@theyahia/salla-mcp](https://npm/x) | Saudi Arabia | v3.1.0 | 22 tools | Shop |",
    ],
    ["html: ячейка версии", '<td class="ver">1.0.0</td>', '<td class="ver">3.1.0</td>'],
    [
      "html-проза EN: «— N tools for …»",
      "<td>MCP server for Salla (Saudi Arabia) — 9 tools for products, orders. OAuth 2.0.</td>",
      "<td>MCP server for Salla (Saudi Arabia) — 22 tools for products, orders. OAuth 2.0.</td>",
    ],
    [
      "html-проза EN: «N tools: …»",
      "<td>MCP server for Fawaterak (Egypt) — 9 tools: invoice creation, refunds.</td>",
      "<td>MCP server for Fawaterak (Egypt) — 22 tools: invoice creation, refunds.</td>",
    ],
    [
      "html-проза RU: «N инструментов.» с пересчётом склонения",
      "<td>API Банка России: курсы валют. 5 инструментов. Без авторизации.</td>",
      "<td>API Банка России: курсы валют. 22 инструмента. Без авторизации.</td>",
    ],
    [
      "html-проза RU: «N инструмента» в середине предложения",
      "<td>Битрикс24: сделки, контакты. 4 инструмента. Авторизация по webhook-URL.</td>",
      "<td>Битрикс24: сделки, контакты. 22 инструмента. Авторизация по webhook-URL.</td>",
    ],
    [
      "html-проза RU: «N инструментов —» с тире",
      "<td>СДЭК: 16 инструментов — расчёт, заказы, вызов курьера. OAuth2.</td>",
      "<td>СДЭК: 22 инструмента — расчёт, заказы, вызов курьера. OAuth2.</td>",
    ],
  ])("%s", (_name, from, expected) => {
    expect(patchDocLine(from, to)).toBe(expected);
  });

  it.each([
    // Правится ПЕРВОЕ вхождение: остальные числа в описании — не про инструменты.
    [
      "<td>1С через OData 3.0. 34 инструмента в 11 модулях: справочники и 3 подсказки.</td>",
      "<td>1С через OData 3.0. 22 инструмента в 11 модулях: справочники и 3 подсказки.</td>",
    ],
    [
      "<td>Мегаплан: 8 инструментов — задачи, сделки, плюс 2 MCP-подсказки.</td>",
      "<td>Мегаплан: 22 инструмента — задачи, сделки, плюс 2 MCP-подсказки.</td>",
    ],
    [
      "<td>Авито — классифайд России, 50 млн MAU. 3 инструмента: объявления, чаты.</td>",
      "<td>Авито — классифайд России, 50 млн MAU. 22 инструмента: объявления, чаты.</td>",
    ],
    [
      "<td>Orange Money (Senegal + 10 Francophone countries) — 8 tools for web payments.</td>",
      "<td>Orange Money (Senegal + 10 Francophone countries) — 22 tools for web payments.</td>",
    ],
    [
      "<td>bKash — 8 tools for payments, refunds. Custom 3-step token auth.</td>",
      "<td>bKash — 22 tools for payments, refunds. Custom 3-step token auth.</td>",
    ],
  ])("не трогает соседние числа: %s", (from, expected) => {
    expect(patchDocLine(from, to)).toBe(expected);
  });

  it("идемпотентен: повторный прогон ничего не меняет", () => {
    const once = patchDocLine("<td>СДЭК: 16 инструментов — расчёт, заказы.</td>", to);
    expect(patchDocLine(once, to)).toBe(once);
  });

  it("не трогает описание без числа инструментов", () => {
    const line = "<td>amoCRM: сделки, контакты, воронки, задачи.</td>";
    expect(patchDocLine(line, to)).toBe(line);
  });

  it.each([
    [1, "1 инструмент"],
    [2, "2 инструмента"],
    [5, "5 инструментов"],
    [11, "11 инструментов"],
    [21, "21 инструмент"],
    [22, "22 инструмента"],
    [112, "112 инструментов"],
  ])("русское склонение: %i", (n, expected) => {
    expect(`${n} ${ruPlural(n)}`).toBe(expected);
  });

  it.each([
    [1, "1 tool"],
    [22, "22 tools"],
  ])("английское число: %i", (n, expected) => {
    const patched = patchDocLine("<td>— 9 tools for products.</td>", {
      version: "1.0.0",
      toolCount: n,
    });
    expect(patched).toContain(expected);
  });
});

describe("patchDocFile — обход файла целиком", () => {
  const SENTINEL_VER = "9.9.9";
  const SENTINEL_N = 777;
  const html = readFileSync(join(ROOT, "docs", "index.html"), "utf8");
  const monorepo = new Map<string, { name: string; version: string; toolCount: number }>(
    catalog.entries.map((e: { name: string }) => [
      e.name,
      { name: e.name, version: SENTINEL_VER, toolCount: SENTINEL_N },
    ]),
  );

  it("докатывается до версии каждого пакета монорепо", () => {
    const { changes } = patchDocFile(html, monorepo, "docs/index.html") as { changes: Change[] };
    const patched = new Set(changes.filter((c) => c.to.includes(SENTINEL_VER)).map((c) => c.pkg));
    const missing = [...monorepo.keys()].filter((n) => !patched.has(n));
    expect(missing, `в docs/index.html не правится версия: ${missing.join(", ")}`).toEqual([]);
  });

  it("ни одно число инструментов в ячейках витрины не остаётся без проверки", () => {
    const { text } = patchDocFile(html, monorepo, "docs/index.html") as { text: string };
    // Ищем по СЛОВУ, а не по известному формату числа: новая форма записи
    // («инструментов: 9», «9&nbsp;tools») тоже попадётся, хотя патчер её не знает.
    const missed = text
      .split("\n")
      .filter((l) => l.includes("<td"))
      .filter((l) => /\d+[\s ]+(?:инструмент|tools?\b)/.test(l))
      .filter((l) => !l.includes(String(SENTINEL_N)));
    expect(missed, "число инструментов в ячейке, до которой патчер не дотягивается").toEqual([]);
  });

  it("пакет из примера конфига не утекает в следующую таблицу", () => {
    // В docs/index.html <pre class="cfg"> с "@theyahia/wildberries-mcp" стоит прямо над
    // таблицей RU/CIS. Без сброса контекста на <tr> первая строка (2gis) получила бы
    // версию wildberries.
    const fixture = [
      '  <pre class="cfg">{ "args": ["-y", "@theyahia/wildberries-mcp"] }</pre>',
      '<td class="ver">0.0.1</td>',
      "<tr>",
      '<td><a href="https://npm/@theyahia/2gis-mcp">@theyahia/2gis-mcp</a></td>',
      '<td class="ver">0.0.1</td>',
      "</tr>",
      '<td class="ver">0.0.1</td>',
    ].join("\n");
    const { changes } = patchDocFile(fixture, monorepo, "docs/index.html") as { changes: Change[] };
    expect(changes.map((c) => ({ line: c.line, pkg: c.pkg }))).toEqual([
      { line: 5, pkg: "@theyahia/2gis-mcp" },
    ]);
  });

  it("standalone-пакеты вне монорепы не трогаются", () => {
    const fixture =
      "<tr><td>Alfa Bank</td><td><a href=x>@theyahia/alfa-bank-mcp</a></td><td>9 tools</td></tr>";
    const { text, changes } = patchDocFile(fixture, monorepo, "docs/index.html") as {
      text: string;
      changes: Change[];
    };
    expect(changes).toEqual([]);
    expect(text).toBe(fixture);
  });

  it("markdown правится построчно, без переноса контекста", () => {
    const md = [
      "| [@theyahia/salla-mcp](https://npm/x) | v1.0.0 | 9 tools | Shop |",
      "| Итого | v0.0.1 | 500 tools | не пакет — контекст не должен дотянуться |",
    ].join("\n");
    const { text } = patchDocFile(md, monorepo, "README.md") as { text: string };
    const [first, second] = text.split("\n");
    expect(first).toContain(`| v${SENTINEL_VER} | ${SENTINEL_N} tools |`);
    expect(second).toBe("| Итого | v0.0.1 | 500 tools | не пакет — контекст не должен дотянуться |");
  });
});
