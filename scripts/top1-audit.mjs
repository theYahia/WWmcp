#!/usr/bin/env node
/**
 * top1-audit.mjs — ежемесячный замер «мы топ-1 в этой нише или нет».
 *
 * Пять машинно-проверяемых критериев на нишу:
 *   1. GitHub-лидерство — наш репо первый по звёздам в выдаче `gh search repos`
 *   2. npm-поиск        — наша позиция в registry.npmjs.org/-/v1/search
 *   3. Загрузки         — МЕДИАНА дневных загрузок и доля максимального дня
 *                         (месячная сумма намеренно НЕ используется как показатель)
 *   4. Каталог MCP      — есть ли сервер в registry.modelcontextprotocol.io, сходится ли версия
 *   5. Живость          — дата последнего коммита + сверка тега релиза с версией npm
 *
 * Запуск:       node scripts/top1-audit.mjs
 * Самопроверка: node scripts/top1-audit.mjs --selftest
 * Вывод:        markdown в консоль + scripts/top1-audit-<YYYY-MM-DD>.json
 *
 * Node 20+, встроенный fetch, без npm-зависимостей. Нужен авторизованный `gh`.
 */

import { execFile } from 'node:child_process';
import { writeFileSync } from 'node:fs';
import { promisify } from 'node:util';
import { dirname, join } from 'node:path';
import { fileURLToPath } from 'node:url';

const execFileAsync = promisify(execFile);
const HERE = dirname(fileURLToPath(import.meta.url));

// ---------------------------------------------------------------- конфигурация

/** Ниши: наш пакет, наш репо, запросы для поиска по GitHub и npm. */
const NICHES = [
  { niche: 'wildberries',      pkg: '@theyahia/wildberries-mcp',      repo: 'theYahia/wildberries-mcp',      queries: ['wildberries mcp'] },
  { niche: '1c',               pkg: '@theyahia/aprovodka',            repo: 'theYahia/aprovodka',            queries: ['1c mcp', '1с mcp', 'onec mcp'] },
  { niche: 'tilda',            pkg: '@theyahia/tilda-mcp',            repo: 'theYahia/tilda-mcp',            queries: ['tilda mcp'] },
  { niche: 'moysklad',         pkg: '@theyahia/moysklad-mcp',         repo: 'theYahia/moysklad-mcp',         queries: ['moysklad mcp', 'мойсклад mcp'] },
  { niche: 'chestnyznak',      pkg: '@theyahia/chestnyznak-mcp',      repo: 'theYahia/chestnyznak-mcp',      queries: ['chestnyznak mcp', 'честный знак mcp'] },
  { niche: 'hh',               pkg: '@theyahia/hh-mcp',               repo: 'theYahia/hh-mcp',               queries: ['hh.ru mcp', 'headhunter mcp'] },
  { niche: 'ozon',             pkg: '@theyahia/ozon-mcp',             repo: null,                            queries: ['ozon mcp'] },
  { niche: 'avito',            pkg: '@theyahia/avito-mcp',            repo: null,                            queries: ['avito mcp'] },
  { niche: 'kaspi',            pkg: '@theyahia/kaspi-mcp',            repo: 'theYahia/kaspi-mcp',            queries: ['kaspi mcp'] },
  { niche: 'yandex-direct',    pkg: '@theyahia/yandex-direct-mcp',    repo: 'theYahia/yandex-direct-mcp',    queries: ['yandex direct mcp'] },
  { niche: 'yandex-metrika',   pkg: '@theyahia/yandex-metrika-mcp',   repo: 'theYahia/yandex-metrika-mcp',   queries: ['yandex metrika mcp'] },
  { niche: 'yandex-webmaster', pkg: '@theyahia/yandex-webmaster-mcp', repo: 'theYahia/yandex-webmaster-mcp', queries: ['yandex webmaster mcp'] },
  { niche: 'wordstat',         pkg: null,                             repo: null,                            queries: ['wordstat mcp'] },
  { niche: 'tgstat',           pkg: '@theyahia/tgstat-mcp',           repo: 'theYahia/tgstat-mcp',           queries: ['tgstat mcp', 'telegram analytics mcp'] },
  { niche: 'cdek',             pkg: '@theyahia/cdek-mcp',             repo: 'theYahia/cdek-mcp',             queries: ['cdek mcp', 'сдэк mcp'] },
  { niche: 'pochta-russia',    pkg: '@theyahia/pochta-russia-mcp',    repo: 'theYahia/pochta-russia-mcp',    queries: ['pochta russia mcp'] },
  { niche: 'yookassa',         pkg: '@theyahia/yookassa-mcp',         repo: 'theYahia/yookassa-mcp',         queries: ['yookassa mcp', 'юкасса mcp'] },
  { niche: 'tkassa',           pkg: '@theyahia/tkassa-mcp',           repo: null,                            queries: ['tkassa mcp', 'tinkoff kassa mcp'] },
  { niche: 'cloudpayments',    pkg: '@theyahia/cloudpayments-mcp',    repo: null,                            queries: ['cloudpayments mcp'] },
  { niche: 'ileti-merkezi',    pkg: '@theyahia/ileti-merkezi-mcp',    repo: 'theYahia/ileti-merkezi-mcp',    queries: ['iletimerkezi mcp'] },
  { niche: 'parasut',          pkg: '@theyahia/parasut-mcp',          repo: 'theYahia/parasut-mcp',          queries: ['parasut mcp'] },
  { niche: 'kontur-diadoc',    pkg: '@theyahia/kontur-diadoc-mcp',    repo: 'theYahia/kontur-diadoc-mcp',    queries: ['diadoc mcp', 'контур диадок mcp'] },
];

const T = {
  leaderDeadDays: 120,  // лидер без push дольше — «мёртвый»
  medianMin: 3,         // здоровая медиана дневных загрузок
  maxShareOk: 0.25,     // здоровая доля максимального дня
  maxShareSpike: 0.5,   // выше — всплеск (накрутка или разовый релиз)
  liveDays: 90,         // свежесть последнего коммита
  cloneViewBots: 2,     // clone:view выше — подозрение на ботов/CI
};

const CONCURRENCY = 5;      // HTTP-запросы к npm и MCP-реестру
const GH_CONCURRENCY = 3;   // подпроцессы gh: параллельные TLS-хендшейки отваливаются
const GH_SEARCH_INTERVAL_MS = 2300; // GitHub Search API: 30 запросов/мин

// -------------------------------------------------------------------- утилиты

const sleep = (ms) => new Promise((r) => setTimeout(r, ms));
const daysSince = (iso) => (iso ? Math.floor((Date.now() - Date.parse(iso)) / 86400000) : null);
const pct = (x) => (x == null ? '—' : `${Math.round(x * 100)}%`);
const semver = (s) => String(s ?? '').match(/\d+\.\d+\.\d+[\w.+-]*/)?.[0] ?? null;

function today() {
  const d = new Date();
  const p = (n) => String(n).padStart(2, '0');
  return `${d.getFullYear()}-${p(d.getMonth() + 1)}-${p(d.getDate())}`;
}

/** Ограниченный параллелизм: не больше `limit` запросов одновременно. */
async function pool(items, limit, fn) {
  const out = new Array(items.length);
  let next = 0;
  const worker = async () => {
    while (next < items.length) {
      const i = next++;
      out[i] = await fn(items[i], i);
    }
  };
  await Promise.all(Array.from({ length: Math.min(limit, items.length) }, worker));
  return out;
}

/** Сериализует вызовы и держит паузу между ними (для GitHub Search API). */
function throttle(fn, intervalMs) {
  let chain = Promise.resolve();
  return (...args) => {
    const started = chain.then(() => fn(...args));
    chain = started.then(() => sleep(intervalMs), () => sleep(intervalMs));
    return started;
  };
}

/** Никогда не бросает: {ok:true,data} либо {ok:false,error}. */
async function jsonFetch(url, attempt = 0) {
  try {
    const res = await fetch(url, { headers: { accept: 'application/json' } });
    if (res.status === 429 && attempt < 2) {
      await sleep(20000);
      return jsonFetch(url, attempt + 1);
    }
    if (res.status >= 500 && attempt < 3) {
      await sleep(1500 * (attempt + 1));
      return jsonFetch(url, attempt + 1);
    }
    if (!res.ok) return { ok: false, error: `HTTP ${res.status}` };
    return { ok: true, data: await res.json() };
  } catch (e) {
    // сеть тут регулярно моргает: без повторов пакет молча уходит в «не проверено»
    if (attempt < 3) {
      await sleep(1500 * (attempt + 1));
      return jsonFetch(url, attempt + 1);
    }
    return { ok: false, error: String(e.message || e).slice(0, 120) };
  }
}

const RATE_LIMIT_RE = /rate limit|429|secondary|abuse/i;
// gh (Go) при пачке параллельных запросов регулярно отдаёт TLS handshake timeout —
// это сеть, а не отказ API: без повтора критерий молча уходит в «не проверено»
const TRANSIENT_RE = /timeout|TLS handshake|connection reset|unexpected EOF|no such host|temporary failure|network is unreachable|connection refused/i;

/** Никогда не бросает. 404 репозитория возвращается как ok:false, сеть — повторяется. */
async function ghJson(args, attempt = 0) {
  try {
    const { stdout } = await execFileAsync('gh', args, { maxBuffer: 16 * 1024 * 1024 });
    const raw = stdout.trim();
    if (!raw) return { ok: true, data: null };
    try {
      return { ok: true, data: JSON.parse(raw) };
    } catch {
      // `gh api --jq` печатает строки сырыми, без кавычек: дата коммита — не JSON
      return { ok: true, data: raw };
    }
  } catch (e) {
    const msg = String(e.stderr || e.message || '').trim().split('\n')[0].slice(0, 160);
    if (RATE_LIMIT_RE.test(msg) && attempt < 1) {
      await sleep(65000);
      return ghJson(args, attempt + 1);
    }
    if (TRANSIENT_RE.test(msg) && attempt < 3) {
      await sleep(2000 * (attempt + 1));
      return ghJson(args, attempt + 1);
    }
    return { ok: false, error: msg || 'gh failed' };
  }
}

const ghSearchJson = throttle(ghJson, GH_SEARCH_INTERVAL_MS);

// ------------------------------------------------------ расчёты по загрузкам

/**
 * Сбойные дни реестра: день нулевой ОДНОВРЕМЕННО у всех живых пакетов.
 * ponytail: панель — только наши 21 пакет; общий ноль при таком размере панели =
 * сбой реестра, а не наш провал. Сожмётся до пары пакетов — брать ряд конкурента.
 */
function findDeadDays(seriesList) {
  const active = seriesList.filter((s) => Array.isArray(s) && s.some((d) => d.downloads > 0));
  if (active.length < 3) return new Set();
  const dead = new Set();
  for (const { day } of active[0]) {
    const allZero = active.every((s) => (s.find((d) => d.day === day)?.downloads ?? 0) === 0);
    if (allZero) dead.add(day);
  }
  return dead;
}

/** Медиана дневных загрузок + доля максимального дня, без сбойных дней. */
function downloadStats(series, deadDays) {
  const days = (series || []).filter((d) => !deadDays.has(d.day));
  if (!days.length) return null;
  const v = days.map((d) => d.downloads).sort((a, b) => a - b);
  const mid = v.length >> 1;
  const median = v.length % 2 ? v[mid] : (v[mid - 1] + v[mid]) / 2;
  const total = v.reduce((a, b) => a + b, 0);
  const max = v[v.length - 1];
  const maxShare = total > 0 ? max / total : null;
  return {
    days: v.length,
    excludedDays: (series || []).length - v.length,
    median,
    total,
    max,
    maxShare,
    healthy: median >= T.medianMin && maxShare != null && maxShare <= T.maxShareOk,
    spike: maxShare != null && maxShare > T.maxShareSpike && median < T.medianMin,
  };
}

// ---------------------------------------------------------------- сбор данных

async function fetchDownloads(pkg) {
  const r = await jsonFetch(`https://api.npmjs.org/downloads/range/last-month/${encodeURIComponent(pkg)}`);
  return r.ok ? { series: r.data.downloads ?? [], error: null } : { series: null, error: r.error };
}

async function fetchNpmLatest(pkg) {
  const r = await jsonFetch(`https://registry.npmjs.org/${encodeURIComponent(pkg)}`);
  return r.ok ? { version: r.data?.['dist-tags']?.latest ?? null, error: null } : { version: null, error: r.error };
}

/** Наша позиция в npm-поиске — лучшая среди всех запросов ниши. */
async function npmSearchPosition(pkg, queries) {
  const perQuery = [];
  for (const q of queries) {
    const r = await jsonFetch(`https://registry.npmjs.org/-/v1/search?text=${encodeURIComponent(q)}&size=10`);
    if (!r.ok) {
      perQuery.push({ query: q, position: null, top: null, error: r.error });
      continue;
    }
    const objs = r.data.objects ?? [];
    const idx = objs.findIndex((o) => o.package?.name === pkg);
    perQuery.push({
      query: q,
      position: idx >= 0 ? idx + 1 : null, // null = вне топ-10
      top: objs[0]?.package?.name ?? null,
      error: null,
    });
  }
  const found = perQuery.filter((r) => r.position);
  const best = found.length ? found.reduce((a, b) => (a.position <= b.position ? a : b)) : null;
  return {
    checked: perQuery.some((r) => !r.error),
    best: best?.position ?? null,
    bestQuery: best?.query ?? null,
    perQuery,
  };
}

/** Лидерство по звёздам: объединяем выдачу всех запросов ниши. */
async function githubLeadership(repo, queries) {
  const byName = new Map();
  const errors = [];
  for (const q of queries) {
    const r = await ghSearchJson(['search', 'repos', q, '--limit', '20', '--json', 'fullName,stargazersCount,pushedAt,isArchived']);
    if (!r.ok) {
      errors.push(`${q}: ${r.error}`);
      continue;
    }
    for (const row of r.data ?? []) if (!byName.has(row.fullName)) byName.set(row.fullName, row);
  }
  if (!byName.size) return { checked: false, errors, candidates: 0, ok: false };

  const rows = [...byName.values()]
    .filter((r) => !r.isArchived)
    .map((r) => ({ ...r, staleDays: daysSince(r.pushedAt), dead: daysSince(r.pushedAt) > T.leaderDeadDays }))
    .sort((a, b) => b.stargazersCount - a.stargazersCount || Date.parse(b.pushedAt) - Date.parse(a.pushedAt));

  const ourIdx = repo ? rows.findIndex((r) => r.fullName.toLowerCase() === repo.toLowerCase()) : -1;
  const leader = rows[0] ?? null;
  const ours = ourIdx >= 0 ? rows[ourIdx] : null;
  const ahead = ourIdx > 0 ? rows.slice(0, ourIdx) : [];

  return {
    checked: true,
    errors,
    candidates: rows.length,
    leader: leader && { repo: leader.fullName, stars: leader.stargazersCount, staleDays: leader.staleDays, dead: leader.dead },
    ourRank: ourIdx >= 0 ? ourIdx + 1 : null,
    ourStars: ours?.stargazersCount ?? null,
    gap: ours && leader ? leader.stargazersCount - ours.stargazersCount : null,
    // лидируем, если первые по звёздам — или все, кто выше, мертвы >120 дней
    ok: ourIdx === 0 || (ourIdx > 0 && ahead.every((r) => r.dead)),
    aheadAllDead: ourIdx > 0 && ahead.length > 0 && ahead.every((r) => r.dead),
    top3: rows.slice(0, 3).map((r) => ({ repo: r.fullName, stars: r.stargazersCount, staleDays: r.staleDays })),
  };
}

async function repoLiveness(repo) {
  const [commit, releases] = await Promise.all([
    ghJson(['api', `repos/${repo}/commits?per_page=1`, '--jq', '.[0].commit.committer.date']),
    ghJson(['release', 'list', '--repo', repo, '--limit', '1', '--json', 'tagName,publishedAt']),
  ]);
  const lastCommit = commit.ok ? commit.data : null;
  const rel = releases.ok ? (releases.data ?? [])[0] ?? null : null;
  return {
    checked: commit.ok,
    error: commit.ok ? null : commit.error,
    lastCommit,
    lastCommitDays: daysSince(lastCommit),
    latestTag: rel?.tagName ?? null,
    latestReleaseAt: rel?.publishedAt ?? null,
    tagMatchesNpm: null, // проставляется в main(), когда известна версия npm
    ok: commit.ok && daysSince(lastCommit) != null && daysSince(lastCommit) <= T.liveDays,
  };
}

/** Довесок к отчёту: issues за всё время и clone:view — сигналы «ставят не люди». */
async function repoSignals(repo) {
  const [issues, clones, views] = await Promise.all([
    ghSearchJson(['api', `search/issues?q=repo:${repo}+type:issue`, '--jq', '.total_count']),
    ghJson(['api', `repos/${repo}/traffic/clones`, '--jq', '{count:.count,uniques:.uniques}']),
    ghJson(['api', `repos/${repo}/traffic/views`, '--jq', '{count:.count,uniques:.uniques}']),
  ]);
  const c = clones.ok ? clones.data?.count ?? null : null;
  const v = views.ok ? views.data?.count ?? null : null;
  const ratio = c != null && v ? +(c / v).toFixed(2) : null;
  return {
    issuesEver: issues.ok ? issues.data : null,
    clones: c,
    views: v,
    cloneViewRatio: ratio,
    botSuspect: ratio != null && ratio > T.cloneViewBots,
    errors: [issues, clones, views].filter((r) => !r.ok).map((r) => r.error),
  };
}

// -------------------------------------------------------------------- вердикт

function verdictFor(n) {
  const unchecked = [];
  if (n.pkg && !n.github?.checked) unchecked.push('github');
  if (n.pkg && !n.npm?.checked) unchecked.push('npm-поиск');
  if (n.pkg && !n.downloads) unchecked.push('загрузки');
  if (n.pkg && !n.registry?.checked) unchecked.push('mcp-реестр');
  if (n.repo && !n.liveness?.checked) unchecked.push('живость');

  if (!n.pkg && !n.repo) {
    return { verdict: 'НЕТ ПРОДУКТА', passed: 0, criteria: null, unchecked, todo: 'ниша пустая — сделать и опубликовать MCP-сервер' };
  }

  const c = {
    github: !!n.github?.ok,
    npm: n.npm?.best === 1,
    downloads: !!n.downloads?.healthy,
    registry: !!n.registry?.present && !!n.registry?.versionMatch,
    live: !!n.liveness?.ok,
  };
  const passed = Object.values(c).filter(Boolean).length;
  const leadership = c.github && c.npm && c.downloads; // критерии 1-3 = собственно лидерство

  let verdict;
  if (leadership && c.registry && c.live) verdict = 'ТОП-1';
  // БЛИЗКО требует живых загрузок либо связки GitHub+npm: первое место в текстовом
  // поиске npm даётся именем пакета и без установок лидерством не является
  else if (passed >= 3 && (c.downloads || (c.github && c.npm))) verdict = 'БЛИЗКО';
  else verdict = 'ОТСТАЁМ';

  // одна строка «что нужно, чтобы обойти» — по первому провалившемуся критерию
  let todo;
  if (n.pkg && !n.repo) {
    todo = 'нет публичного репо — открыть его, иначе GitHub-нишу не занять';
  } else if (!c.github) {
    const L = n.github?.leader;
    todo = n.github?.ourRank == null
      ? `нашего репо нет в выдаче GitHub (лидер ${L?.repo ?? '?'}, ${L?.stars ?? '?'}★) — topics, описание, README под запрос`
      : `+${(n.github.gap ?? 0) + 1}★ чтобы обойти ${L?.repo} (${L?.stars}★${L?.dead ? ', мёртвый' : ''})`;
  } else if (!c.npm) {
    todo = n.npm?.best
      ? `npm-поиск: позиция ${n.npm.best} по «${n.npm.bestQuery}» — keywords + description под запрос`
      : 'вне топ-10 npm-поиска — добавить keywords/description под запросы ниши';
  } else if (!c.downloads) {
    const d = n.downloads;
    todo = d
      ? d.spike
        ? `всплеск: макс. день ${pct(d.maxShare)} трафика при медиане ${d.median} — нужен ровный поток, а не релизный пик`
        : `медиана ${d.median}/день (нужно ≥${T.medianMin}), макс. день ${pct(d.maxShare)} — гнать живых пользователей`
      : 'загрузки не проверены';
  } else if (!c.registry) {
    todo = n.registry?.present
      ? `версия в MCP-реестре ${n.registry.registryVersion} ≠ npm ${n.registry.npmVersion} — перепубликовать`
      : 'нет в registry.modelcontextprotocol.io — опубликовать через mcp-publisher';
  } else if (!c.live) {
    todo = `последний коммит ${n.liveness?.lastCommitDays ?? '?'} дн. назад — оживить репо`;
  } else {
    todo = 'держать: свежие коммиты + добор звёзд, иначе догонят';
  }

  return { verdict, passed, criteria: c, unchecked, todo };
}

// --------------------------------------------------------------------- отчёт

function mdTable(headers, rows) {
  const all = [headers, ...rows].map((r) => r.map((c) => String(c ?? '—')));
  const w = headers.map((_, i) => Math.max(...all.map((r) => [...r[i]].length)));
  const line = (r) => `| ${r.map((c, i) => c + ' '.repeat(w[i] - [...c].length)).join(' | ')} |`;
  return [line(all[0]), `|${w.map((n) => '-'.repeat(n + 2)).join('|')}|`, ...all.slice(1).map(line)].join('\n');
}

// --------------------------------------------------------------------- запуск

async function main() {
  const date = today();
  console.log(`# Топ-1 аудит — ${date}\n`);
  console.log(`Ниш: ${NICHES.length}. Критерии: GitHub-лидерство / npm-поиск / медиана загрузок / MCP-реестр / живость.`);
  console.log('GitHub Search троттлится до ~26 запросов/мин — сбор займёт пару минут.\n');

  // 1. MCP-реестр — один запрос на всё
  const regRes = await jsonFetch('https://registry.modelcontextprotocol.io/v0/servers?search=theyahia&limit=100');
  const regMap = new Map();
  if (regRes.ok) {
    for (const entry of regRes.data?.servers ?? []) {
      for (const p of entry.server?.packages ?? []) {
        if (p.registryType === 'npm' && p.identifier) {
          regMap.set(p.identifier.toLowerCase(), { version: p.version ?? entry.server.version, name: entry.server.name });
        }
      }
    }
  }
  console.log(`MCP-реестр: ${regRes.ok ? `${regMap.size} наших npm-пакетов` : `НЕ ПРОВЕРЕН (${regRes.error})`}`);

  // 2. Загрузки всех пакетов — нужны целиком, чтобы найти общие сбойные дни
  const pkgs = NICHES.filter((n) => n.pkg).map((n) => n.pkg);
  const dl = await pool(pkgs, CONCURRENCY, fetchDownloads);
  const dlMap = new Map(pkgs.map((p, i) => [p, dl[i]]));
  const deadDays = findDeadDays(dl.map((d) => d.series));
  console.log(`Загрузки: ${pkgs.length} пакетов; сбойных дней исключено: ${deadDays.size}${deadDays.size ? ` (${[...deadDays].join(', ')})` : ''}`);

  // 3. Версии npm
  const vers = await pool(pkgs, CONCURRENCY, fetchNpmLatest);
  const verMap = new Map(pkgs.map((p, i) => [p, vers[i].version]));

  // 4. Живость и сигналы по репозиториям
  const repos = NICHES.filter((n) => n.repo).map((n) => n.repo);
  const live = await pool(repos, GH_CONCURRENCY, repoLiveness);
  const liveMap = new Map(repos.map((r, i) => [r, live[i]]));
  console.log(`Живость: ${repos.length} репозиториев`);

  const sig = await pool(repos, GH_CONCURRENCY, repoSignals);
  const sigMap = new Map(repos.map((r, i) => [r, sig[i]]));

  // 5. npm-поиск (сеть) и GitHub-поиск (троттлится)
  const npmPos = await pool(NICHES, CONCURRENCY, (n) => (n.pkg ? npmSearchPosition(n.pkg, n.queries) : null));
  console.log('npm-поиск: готово. GitHub-поиск…');
  const ghLead = await pool(NICHES, 2, (n) => githubLeadership(n.repo, n.queries));

  // 6. Сборка
  const results = NICHES.map((n, i) => {
    const d = n.pkg ? dlMap.get(n.pkg) : null;
    const npmVersion = n.pkg ? verMap.get(n.pkg) ?? null : null;
    const reg = n.pkg ? regMap.get(n.pkg.toLowerCase()) ?? null : null;
    const liveness = n.repo ? liveMap.get(n.repo) : null;
    if (liveness && liveness.latestTag) liveness.tagMatchesNpm = semver(liveness.latestTag) === semver(npmVersion);

    const row = {
      niche: n.niche,
      pkg: n.pkg,
      repo: n.repo,
      queries: n.queries,
      npmVersion,
      github: ghLead[i],
      npm: n.pkg ? npmPos[i] : null,
      downloads: d?.series ? downloadStats(d.series, deadDays) : null,
      downloadsError: d?.error ?? null,
      registry: n.pkg
        ? {
            checked: regRes.ok,
            present: !!reg,
            registryName: reg?.name ?? null,
            registryVersion: reg?.version ?? null,
            npmVersion,
            versionMatch: !!reg && !!npmVersion && semver(reg.version) === semver(npmVersion),
          }
        : null,
      liveness,
      signals: n.repo ? sigMap.get(n.repo) : null,
    };
    return { ...row, ...verdictFor(row) };
  });

  // 7. Вывод
  const order = { 'ТОП-1': 0, 'БЛИЗКО': 1, 'ОТСТАЁМ': 2, 'НЕТ ПРОДУКТА': 3 };
  const sorted = [...results].sort((a, b) => order[a.verdict] - order[b.verdict] || a.niche.localeCompare(b.niche));

  console.log(`\n## Позиции (${date})\n`);
  console.log(mdTable(
    ['ниша', 'вердикт', 'GH ранг', 'наши★', 'лидер★', 'npm поз.', 'медиана/д', 'макс.день', 'реестр', 'коммит'],
    sorted.map((r) => [
      r.niche,
      r.verdict + (r.unchecked?.length ? ' ⚠' : ''),
      r.github?.checked ? r.github.ourRank ?? 'нет' : '?',
      r.github?.ourStars ?? '—',
      r.github?.leader ? `${r.github.leader.stars}${r.github.leader.dead ? '†' : ''}` : '—',
      r.npm ? r.npm.best ?? '>10' : '—',
      r.downloads ? r.downloads.median : '—',
      r.downloads ? pct(r.downloads.maxShare) + (r.downloads.spike ? ' ⚡' : '') : '—',
      r.registry ? (r.registry.present ? (r.registry.versionMatch ? 'да' : 'верс.≠') : 'нет') : '—',
      r.liveness?.lastCommitDays != null ? `${r.liveness.lastCommitDays}д` : '—',
    ]),
  ));
  console.log('\n† лидер мёртв (>120 дн. без push) · ⚡ всплеск загрузок · ⚠ часть критериев не проверена\n');

  console.log('## Что нужно, чтобы обойти\n');
  for (const r of sorted) console.log(`- **${r.niche}** (${r.verdict}, ${r.passed}/5): ${r.todo}`);

  const withSignals = sorted.filter((r) => r.signals);
  if (withSignals.length) {
    console.log('\n## Сигналы «ставят не люди» (в вердикт не входят)\n');
    console.log(mdTable(
      ['ниша', 'issues за всё время', 'clones', 'views', 'clone:view'],
      withSignals.map((r) => [
        r.niche,
        r.signals.issuesEver ?? '?',
        r.signals.clones ?? '?',
        r.signals.views ?? '?',
        `${r.signals.cloneViewRatio ?? '?'}${r.signals.botSuspect ? ' ⚠боты?' : ''}`,
      ]),
    ));
  }

  console.log(`\n## Итог\n`);
  console.log(Object.keys(order).map((v) => `${v}: ${results.filter((r) => r.verdict === v).length}`).join(' · '));
  const top1 = results.filter((r) => r.verdict === 'ТОП-1').map((r) => r.niche);
  console.log(`ТОП-1: ${top1.length ? top1.join(', ') : 'нет ни одной ниши'}`);

  const unchecked = results.filter((r) => r.unchecked?.length);
  if (unchecked.length) {
    console.log('\nНЕ ПРОВЕРЕНО:');
    for (const r of unchecked) console.log(`- ${r.niche}: ${r.unchecked.join(', ')}`);
  }

  const out = join(HERE, `top1-audit-${date}.json`);
  writeFileSync(out, JSON.stringify({
    date,
    thresholds: T,
    deadDays: [...deadDays],
    registryChecked: regRes.ok,
    summary: Object.fromEntries(Object.keys(order).map((v) => [v, results.filter((r) => r.verdict === v).map((r) => r.niche)])),
    niches: results,
  }, null, 2));
  console.log(`\nJSON: ${out}`);
}

// ---------------------------------------------------------------- самопроверка

function selftest() {
  const assert = (cond, msg) => {
    if (!cond) throw new Error('SELFTEST: ' + msg);
  };
  const day = (i, downloads) => ({ day: `2026-08-${String(i).padStart(2, '0')}`, downloads });

  // медиана и доля максимального дня
  let s = downloadStats([day(1, 1), day(2, 3), day(3, 6)], new Set());
  assert(s.median === 3, `медиана 3, получено ${s.median}`);
  assert(s.maxShare === 0.6, `доля макс. дня 0.6, получено ${s.maxShare}`);
  assert(!s.healthy, 'медиана 3 при доле 60% не здорова');

  // ровный ряд — здоровый
  s = downloadStats([day(1, 5), day(2, 5), day(3, 5), day(4, 5)], new Set());
  assert(s.healthy, 'ровный ряд по 5/день должен быть здоровым');

  // всплеск: один большой день при нулевой медиане
  s = downloadStats([day(1, 0), day(2, 0), day(3, 0), day(4, 90)], new Set());
  assert(s.spike, 'один день с 90 из 90 загрузок — всплеск');

  // сбойный день исключается из расчёта
  s = downloadStats([day(1, 4), day(2, 0), day(3, 4)], new Set(['2026-08-02']));
  assert(s.days === 2 && s.median === 4, `сбойный день должен выпасть, получено days=${s.days} median=${s.median}`);
  assert(s.excludedDays === 1, 'один исключённый день');

  // сбойный день = ноль одновременно у всех живых пакетов
  const dd = findDeadDays([
    [day(1, 5), day(2, 0), day(3, 7)],
    [day(1, 2), day(2, 0), day(3, 1)],
    [day(1, 9), day(2, 0), day(3, 3)],
  ]);
  assert(dd.has('2026-08-02') && dd.size === 1, `ожидался один сбойный день, получено ${[...dd]}`);

  // день, нулевой лишь у части пакетов, сбойным не считается
  const dd2 = findDeadDays([
    [day(1, 5), day(2, 0), day(3, 7)],
    [day(1, 2), day(2, 4), day(3, 1)],
    [day(1, 9), day(2, 1), day(3, 3)],
  ]);
  assert(dd2.size === 0, `ложный сбойный день: ${[...dd2]}`);

  // вердикты
  const full = {
    pkg: 'p',
    repo: 'o/r',
    github: { checked: true, ok: true, ourRank: 1 },
    npm: { checked: true, best: 1 },
    downloads: { healthy: true, median: 9, maxShare: 0.1 },
    registry: { checked: true, present: true, versionMatch: true },
    liveness: { checked: true, ok: true },
  };
  assert(verdictFor(full).verdict === 'ТОП-1', 'все пять критериев пройдены → ТОП-1');
  assert(verdictFor({ ...full, liveness: { checked: true, ok: false, lastCommitDays: 300 } }).verdict === 'БЛИЗКО', 'мёртвый репо → БЛИЗКО');
  assert(
    verdictFor({
      ...full,
      github: { checked: true, ok: false, ourRank: 3, gap: 40, leader: { repo: 'x/y', stars: 42 } },
      downloads: { healthy: false, median: 0, maxShare: 0.9 },
    }).verdict === 'ОТСТАЁМ',
    'два провала → ОТСТАЁМ',
  );
  assert(verdictFor({ pkg: null, repo: null }).verdict === 'НЕТ ПРОДУКТА', 'нет пакета и репо → НЕТ ПРОДУКТА');
  assert(
    /\+41★/.test(verdictFor({ ...full, github: { checked: true, ok: false, ourRank: 2, gap: 40, leader: { repo: 'x/y', stars: 42 } } }).todo),
    'разрыв в звёздах попадает в строку «что нужно»',
  );
  assert(verdictFor({ ...full, downloads: null }).unchecked.includes('загрузки'), 'непроверенные загрузки помечаются');

  // разбор тега релиза
  assert(semver('v3.1.0') === '3.1.0' && semver('wildberries-mcp@3.1.0') === '3.1.0', 'разбор тега');

  console.log('SELFTEST OK');
}

if (process.argv.includes('--selftest')) selftest();
else await main();
