// Filter — keyword-match scoring + solo-builder fit boost
import type { TrendingRepo } from './scraper.ts';

// Категории keywords (взвешенные). Все matching — case-insensitive, по word boundary.
const KEYWORDS = {
  ai: ['ai', 'artificial intelligence', 'llm', 'agent', 'agents', 'agentic'],
  mcp: ['mcp', 'model context protocol', 'model-context-protocol', 'claude', 'anthropic'],
  rag: ['rag', 'retrieval', 'vector', 'embedding', 'embeddings', 'semantic search'],
  ru: ['russian', 'yandex', 'gigachat', 'sber'],
} as const;

export type ScoredRepo = TrendingRepo & {
  score: number;
  matched: string[];
  category_hits: Record<keyof typeof KEYWORDS, number>;
  solo_builder_fit: boolean;
};

function matchKeyword(text: string, keyword: string): boolean {
  // Word boundary match (учитываем дефисы как часть слова)
  const escaped = keyword.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
  const re = new RegExp(`(^|[^a-z0-9-])${escaped}([^a-z0-9-]|$)`, 'i');
  return re.test(text);
}

export function scoreRepo(repo: TrendingRepo): ScoredRepo {
  const haystack = `${repo.full_name} ${repo.description} ${repo.language}`.toLowerCase();
  const matched: string[] = [];
  const category_hits: Record<keyof typeof KEYWORDS, number> = {
    ai: 0,
    mcp: 0,
    rag: 0,
    ru: 0,
  };

  for (const [cat, words] of Object.entries(KEYWORDS) as [
    keyof typeof KEYWORDS,
    readonly string[],
  ][]) {
    for (const w of words) {
      if (matchKeyword(haystack, w)) {
        matched.push(w);
        category_hits[cat]++;
      }
    }
  }

  // Solo-builder fit: small repo с быстрым ростом (≤500 total stars, ≥30 recent),
  // или явная индивидуальная авторская репа (built_by_count ≤ 3)
  const solo_builder_fit =
    (repo.stars <= 500 && repo.stars_recent >= 30) || repo.built_by_count <= 3;

  let score = matched.length;
  // Boost за MCP-категорию (наша primary thesis)
  if (category_hits.mcp > 0) score += 1;
  // Boost за solo-builder fit
  if (solo_builder_fit) score += 1;

  return { ...repo, score, matched, category_hits, solo_builder_fit };
}

export function filterRepos(repos: TrendingRepo[], minScore = 3): ScoredRepo[] {
  return repos
    .map(scoreRepo)
    .filter((r) => r.score >= minScore)
    .sort((a, b) => b.score - a.score);
}
