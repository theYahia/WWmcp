// Скрапер GitHub Trending — парсит HTML страницу /trending?since=daily
// Github trending API нет, поэтому HTML scrape через cheerio.
import * as cheerio from 'cheerio';

export type TrendingRepo = {
  /** owner/name — уникальный slug */
  full_name: string;
  url: string;
  description: string;
  language: string;
  /** Total stars (snapshot на момент парсинга) */
  stars: number;
  /** Stars за выбранный период (today / week / month) */
  stars_recent: number;
  /** Количество контрибьюторов из avatar list (proxy для solo-builder fit) */
  built_by_count: number;
};

const UA =
  'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36';

function parseStarCount(raw: string): number {
  // "1,234" → 1234, "1.2k" → 1200
  const cleaned = raw.trim().replace(/,/g, '');
  if (/k$/i.test(cleaned)) return Math.round(parseFloat(cleaned) * 1000);
  return parseInt(cleaned, 10) || 0;
}

export async function fetchTrending(
  since: 'daily' | 'weekly' | 'monthly' = 'daily',
  topN = 25,
): Promise<TrendingRepo[]> {
  const url = `https://github.com/trending?since=${since}`;
  const res = await fetch(url, {
    headers: { 'User-Agent': UA, Accept: 'text/html' },
  });
  if (!res.ok) {
    throw new Error(`GitHub trending fetch failed: HTTP ${res.status}`);
  }
  const html = await res.text();
  const $ = cheerio.load(html);
  const repos: TrendingRepo[] = [];

  // Каждая trending карточка — <article class="Box-row">
  $('article.Box-row').each((_idx, el) => {
    const $el = $(el);

    // h2 > a с href вида "/owner/name"
    const href = $el.find('h2 a').attr('href')?.trim() || '';
    if (!href) return;
    const full_name = href.replace(/^\//, '');

    const description = $el.find('p').first().text().trim();
    const language = $el.find('[itemprop="programmingLanguage"]').first().text().trim();

    // Total stars — первая ссылка "/<repo>/stargazers" с числом
    const starsText = $el
      .find('a[href$="/stargazers"]')
      .first()
      .text()
      .trim();
    const stars = parseStarCount(starsText);

    // Stars recent — float-right span "X stars today/this week/this month"
    const recentText = $el.find('span.float-sm-right').first().text().trim();
    const recentMatch = recentText.match(/([\d,\.]+k?)/i);
    const stars_recent = recentMatch ? parseStarCount(recentMatch[1]) : 0;

    // Built-by avatars (proxy for contributor count в trending карточке)
    const built_by_count = $el.find('span.d-inline-block img').length;

    repos.push({
      full_name,
      url: `https://github.com${href}`,
      description,
      language,
      stars,
      stars_recent,
      built_by_count,
    });
  });

  return repos.slice(0, topN);
}
