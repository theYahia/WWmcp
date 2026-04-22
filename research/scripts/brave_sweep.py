#!/usr/bin/env python3
"""
brave_sweep.py v2 — parallel Brave Search API fan-out for research sprints.

Usage:
    python brave_sweep.py [options] [queries_file] output_dir
    python brave_sweep.py --queries "a|b|c" output_dir

Backward compat:
    python brave_sweep.py queries.txt output/ --count 10  (still works)

Features:
    - Web, News, LLM Context, Answers, Suggest endpoints
    - Full param coverage per Brave API docs 2026-04-17 (7-pass audit)
    - Adaptive rate limiting (X-RateLimit-* headers)
    - Silent behavior detection (query altered, freshness ignored, etc.)
    - Per-query JSON + consolidated parsed_snippets.md v2
    - _sweep_log.json structured warnings + stats
    - ToS-compliant: internal research only disclaimer in output

Exit codes:
    0 — all queries succeeded
    1 — config error (no key, bad args, validation failure)
    2 — at least one query failed (others still written)
"""
from __future__ import annotations

import argparse
import concurrent.futures
import gzip
import io
import json
import re
import sys
import threading
import time
import urllib.error
import urllib.parse
import urllib.request
from dataclasses import dataclass, field
from pathlib import Path
from typing import Any

if hasattr(sys.stdout, "buffer"):
    sys.stdout = io.TextIOWrapper(sys.stdout.buffer, encoding="utf-8")
if hasattr(sys.stderr, "buffer"):
    sys.stderr = io.TextIOWrapper(sys.stderr.buffer, encoding="utf-8")

# ── Constants ──────────────────────────────────────────────────────────────────
BASE = "https://api.search.brave.com/res/v1"
ENDPOINTS = {
    "web":       f"{BASE}/web/search",
    "news":      f"{BASE}/news/search",
    "context":   f"{BASE}/llm/context",
    "answers":   f"{BASE}/chat/completions",
    "suggest":   f"{BASE}/suggest/search",
    "spellcheck": f"{BASE}/spellcheck/search",
    "pois":      f"{BASE}/local/pois",
    "local_desc": f"{BASE}/local/descriptions",
}
MAX_PARALLEL_DEFAULT = 3
REQUEST_TIMEOUT = 30
REQUEST_TIMEOUT_RESEARCH = 300
MAX_RETRIES = 3
VALID_RESULT_FILTERS = {"discussions", "faq", "infobox", "news", "summarizer", "videos", "web", "locations"}
TOS_DISCLAIMER = (
    "\n---\n"
    "_Data retrieved via Brave Search API. **POWERED BY BRAVE.**_  \n"
    "_For internal research only; not for redistribution or AI training._  \n"
    "_Brave query logs retained for 90 days. Zero Data Retention on Enterprise tier only._\n"
)
RICH_VERTICAL_NAMES = {
    "calculator": "Calculator",
    "definitions": "Dictionary (Wordnik)",
    "unit_conversion": "Unit Conversion",
    "unix_timestamp": "Unix Timestamp",
    "package_tracker": "Package Tracker",
    "stock": "Stock Prices (FMP)",
    "currency": "Currency (Fixer)",
    "cryptocurrency": "Crypto (CoinGecko)",
    "weather": "Weather (OpenWeatherMap)",
    "american_football": "American Football",
    "baseball": "Baseball",
    "basketball": "Basketball",
    "cricket": "Cricket",
    "football": "Football/Soccer",
    "ice_hockey": "Ice Hockey",
    "web3": "Web3/Blockchain",
    "translator": "Translation",
}

# ── Dataclasses ────────────────────────────────────────────────────────────────

@dataclass
class WebResult:
    title: str = ""
    url: str = ""
    hostname: str = ""
    description: str = ""
    extra_snippets: list = field(default_factory=list)
    age: str | None = None
    page_age: str | None = None
    language: str | None = None
    profile_name: str | None = None
    thumbnail_src: str | None = None
    thumbnail_original: str | None = None
    thumbnail_logo: str | None = None
    family_friendly: bool | None = None
    schemas: list | None = None
    rating: dict | None = None
    content_type: str | None = None
    fetched_content_timestamp: str | None = None
    entity_type: str | None = None
    entity_data: dict | None = None


@dataclass
class NewsResult:
    title: str = ""
    url: str = ""
    hostname: str = ""
    description: str = ""
    source: str = ""
    age: str | None = None
    page_age: str | None = None
    page_fetched: str | None = None
    extra_snippets: list = field(default_factory=list)
    thumbnail_url: str | None = None
    breaking: bool | None = None


@dataclass
class FaqResult:
    question: str = ""
    answer: str = ""
    source_url: str = ""
    source_hostname: str = ""


@dataclass
class VideoResult:
    title: str = ""
    url: str = ""
    description: str = ""
    age: str | None = None
    duration: str | None = None
    thumbnail_url: str | None = None
    page_fetched: str | None = None
    video_creator: str | None = None
    video_publisher: str | None = None
    video_requires_subscription: bool | None = None
    video_tags: list = field(default_factory=list)
    video_author: dict | None = None


@dataclass
class InfoboxResult:
    type: str = ""
    title: str = ""
    description: str = ""
    long_desc: str | None = None
    attributes: dict = field(default_factory=dict)
    images: list = field(default_factory=list)


@dataclass
class RichHint:
    vertical: str = ""
    callback_key: str = ""


@dataclass
class LocationResult:
    id: str = ""
    title: str = ""
    description: str | None = None
    coordinates: tuple | None = None


@dataclass
class POIResult:
    id: str = ""
    title: str = ""
    url: str = ""
    description: str | None = None
    display_address: str | None = None
    street_address: str | None = None
    city: str | None = None
    state: str | None = None
    postal_code: str | None = None
    country: str | None = None
    telephone: str | None = None
    email: str | None = None
    rating_value: float | None = None
    best_rating: float | None = None
    review_count: int | None = None
    rating_provider: str | None = None
    hours_current_day: str | None = None
    hours_weekly: dict | None = None
    coordinates: tuple | None = None
    distance: float | None = None
    distance_units: str | None = None
    categories: list = field(default_factory=list)
    price_range: str | None = None
    cuisine: list = field(default_factory=list)
    timezone: str | None = None


@dataclass
class ContextGrounding:
    url: str = ""
    title: str = ""
    snippets: list = field(default_factory=list)


@dataclass
class ContextSource:
    url: str = ""
    title: str = ""
    hostname: str = ""
    age: list | None = None


@dataclass
class AnswerCitation:
    url: str = ""
    snippet: str = ""
    favicon: str | None = None


@dataclass
class AnswerEntity:
    name: str = ""
    metadata: dict = field(default_factory=dict)


@dataclass
class AnswerUsage:
    request_count: int = 0
    input_tokens: int = 0
    output_tokens: int = 0
    total_cost_usd: float | None = None


@dataclass
class Suggestion:
    query: str = ""
    is_entity: bool = False
    title: str | None = None
    description: str | None = None
    img: str | None = None


@dataclass
class ParsedResult:
    query: str = ""
    endpoint: str = ""
    query_original: str | None = None
    query_altered: str | None = None
    query_cleaned: str | None = None
    query_spellcheck: bool = True
    query_country: str | None = None
    query_show_strict_warning: bool = False
    query_search_operators: dict | None = None
    more_results_available: bool = False
    mutated_by_goggles: bool = False
    web: list = field(default_factory=list)
    discussions: list = field(default_factory=list)
    faq: list = field(default_factory=list)
    infobox: InfoboxResult | None = None
    videos: list = field(default_factory=list)
    rich: RichHint | None = None
    locations: list = field(default_factory=list)
    mixed_order: list = field(default_factory=list)
    news: list = field(default_factory=list)
    context_grounding: list = field(default_factory=list)
    context_sources: dict = field(default_factory=dict)
    answers_text: str | None = None
    answers_citations: list = field(default_factory=list)
    answers_entities: list = field(default_factory=list)
    answers_usage: AnswerUsage | None = None
    suggestions: list = field(default_factory=list)
    rate_limit_remaining: int | None = None
    rate_limit_reset: int | None = None
    rate_limit_policy: str | None = None
    total_results_web: int = 0
    raw_path: str = ""
    warnings: list = field(default_factory=list)


@dataclass
class SweepConfig:
    key: str = ""
    count: int = 20
    news_count: int = 50
    offset: int = 0
    freshness: str | None = None
    country: str = "us"
    search_lang: str = "en"
    ui_lang: str = "en-US"
    safesearch: str = "off"
    spellcheck: bool = True
    operators: bool = True
    extra_snippets: bool = True
    text_decorations: bool = False
    result_filter: str | None = None
    goggles: list = field(default_factory=list)
    enable_rich_callback: bool = False
    include_fetch_metadata: bool = False
    loc_lat: float | None = None
    loc_long: float | None = None
    loc_timezone: str | None = None
    loc_city: str | None = None
    loc_country_hdr: str | None = None
    api_version: str | None = None
    no_cache: bool = False
    include_news: bool = False
    include_context: bool = False
    include_answers: bool = False
    include_local: bool = False
    expand_via_suggest: bool = False
    ctx_max_urls: int = 20
    ctx_max_tokens: int = 8192
    ctx_max_snippets: int = 50
    ctx_tokens_per_url: int = 4096
    ctx_snippets_per_url: int = 50
    ctx_threshold: str = "balanced"
    ctx_local: bool = False
    ans_stream: bool = True
    ans_entities: bool = True
    ans_citations: bool = True
    ans_research_mode: bool = False
    ans_research_iters: int | None = None
    ans_research_seconds: int | None = None
    ans_max_tokens: int | None = None
    suggest_count: int = 5
    suggest_rich: bool = True
    max_parallel: int = MAX_PARALLEL_DEFAULT
    target_rps: float = 1.0
    results_per: int = 10
    dry_run: bool = False
    check_status: bool = False


# ── Validation ─────────────────────────────────────────────────────────────────

def validate_query(q: str, label: str) -> None:
    if len(q) > 400:
        raise SystemExit(f"ERROR [{label}]: query exceeds 400 chars ({len(q)})")
    if len(q.split()) > 50:
        raise SystemExit(f"ERROR [{label}]: query exceeds 50 words ({len(q.split())})")


def validate_args(args: argparse.Namespace) -> None:
    count = getattr(args, "count", 20) or 20
    offset = getattr(args, "offset", 0) or 0
    if not (1 <= count <= 20):
        raise SystemExit(f"ERROR: --count must be 1-20 for web, got {count}")
    if not (0 <= offset <= 9):
        raise SystemExit(f"ERROR: --offset must be 0-9, got {offset}")
    if count + offset > 20:
        raise SystemExit(f"ERROR: count({count}) + offset({offset}) > 20")
    news_count = getattr(args, "news_count", 50)
    if news_count is None:
        news_count = 50
    if not (1 <= news_count <= 50):
        raise SystemExit(f"ERROR: --news-count must be 1-50, got {news_count}")
    suggest_count = getattr(args, "suggest_count", 5)
    if suggest_count is None:
        suggest_count = 5
    if not (1 <= suggest_count <= 20):
        raise SystemExit(f"ERROR: --suggest-count must be 1-20, got {suggest_count}")
    freshness = getattr(args, "freshness", None)
    if freshness:
        _validate_freshness(freshness)
    result_filter = getattr(args, "result_filter", None)
    if result_filter:
        vals = {v.strip() for v in result_filter.split(",")}
        invalid = vals - VALID_RESULT_FILTERS
        if invalid:
            raise SystemExit(f"ERROR: invalid result_filter values: {invalid}")
    loc_lat = getattr(args, "loc_lat", None)
    if loc_lat is not None and not (-90 <= loc_lat <= 90):
        raise SystemExit(f"ERROR: --loc-lat must be ±90, got {loc_lat}")
    loc_long = getattr(args, "loc_long", None)
    if loc_long is not None and not (-180 <= loc_long <= 180):
        raise SystemExit(f"ERROR: --loc-long must be ±180, got {loc_long}")
    api_version = getattr(args, "api_version", None)
    if api_version and not re.match(r"^\d{4}-\d{2}-\d{2}$", api_version):
        raise SystemExit(f"ERROR: --api-version must be YYYY-MM-DD, got {api_version}")
    safesearch = getattr(args, "safesearch", "off")
    if safesearch not in ("off", "moderate", "strict"):
        raise SystemExit(f"ERROR: --safesearch must be off/moderate/strict")
    ctx_threshold = getattr(args, "ctx_threshold", "balanced")
    if ctx_threshold not in ("strict", "balanced", "lenient", "disabled"):
        raise SystemExit(f"ERROR: --ctx-threshold must be strict/balanced/lenient/disabled")


def _validate_freshness(freshness: str) -> None:
    if freshness in ("pd", "pw", "pm", "py"):
        return
    m = re.match(r"^(\d{4}-\d{2}-\d{2})to(\d{4}-\d{2}-\d{2})$", freshness)
    if not m:
        raise SystemExit(f"ERROR: invalid --freshness {freshness!r}. Use pd/pw/pm/py or YYYY-MM-DDtoYYYY-MM-DD")
    if m.group(1) > m.group(2):
        raise SystemExit(f"ERROR: --freshness date range reversed: {m.group(1)} > {m.group(2)}")


# ── Key loading ────────────────────────────────────────────────────────────────

def load_env_key(start: Path) -> str:
    cur = start.resolve()
    for parent in [cur, *cur.parents]:
        env = parent / ".env.local"
        if env.exists():
            for line in env.read_text(encoding="utf-8").splitlines():
                line = line.strip()
                if line.startswith("BRAVE_API_KEY="):
                    return line.split("=", 1)[1].strip().strip('"').strip("'")
    raise SystemExit("ERROR: no .env.local with BRAVE_API_KEY found walking up from " + str(start))


# ── Query file parsing ─────────────────────────────────────────────────────────

def parse_queries_file(path: Path) -> list:
    out = []
    auto_idx = 1
    for raw in path.read_text(encoding="utf-8").splitlines():
        line = raw.strip()
        if not line or line.startswith("#"):
            continue
        for sep in ("|", ":"):
            if sep in line:
                label_part, q_part = line.split(sep, 1)
                label_part = label_part.strip()
                if label_part.replace("_", "").isalnum() and len(label_part) >= 1:
                    out.append((label_part, q_part.strip()))
                    break
        else:
            out.append((f"q{auto_idx:02d}", line))
            auto_idx += 1
    return out


# ── Request building ───────────────────────────────────────────────────────────

def _base_headers(cfg: SweepConfig) -> dict:
    h: dict = {
        "X-Subscription-Token": cfg.key,
        "Accept": "application/json",
        "Accept-Encoding": "gzip",
        "User-Agent": "qvacsnowball-research/2.0",
    }
    if cfg.api_version:
        h["api-version"] = cfg.api_version
    if cfg.no_cache:
        h["cache-control"] = "no-cache"
    if cfg.loc_lat is not None:
        h["x-loc-lat"] = str(cfg.loc_lat)
    if cfg.loc_long is not None:
        h["x-loc-long"] = str(cfg.loc_long)
    if cfg.loc_timezone:
        h["x-loc-timezone"] = cfg.loc_timezone
    if cfg.loc_city:
        h["x-loc-city"] = cfg.loc_city
    if cfg.loc_country_hdr:
        h["x-loc-country"] = cfg.loc_country_hdr
    return h


def build_request(endpoint: str, query: str, cfg: SweepConfig) -> urllib.request.Request:
    headers = _base_headers(cfg)
    url = ENDPOINTS[endpoint]

    if endpoint == "answers":
        return _build_answers_request(url, query, cfg, headers)

    # lang param: lightweight endpoints use "lang", heavy use "search_lang"
    lang_key = "lang" if endpoint in ("suggest", "spellcheck") else "search_lang"

    params: dict[str, Any] = {"q": query}

    if endpoint == "news":
        params["count"] = min(cfg.news_count, 50)
    elif endpoint == "context":
        params["count"] = min(cfg.count, 50)
    elif endpoint == "suggest":
        params["count"] = cfg.suggest_count
    else:
        params["count"] = min(cfg.count, 20)

    params["country"] = cfg.country
    params[lang_key] = cfg.search_lang

    if endpoint not in ("spellcheck", "suggest"):
        params["ui_lang"] = cfg.ui_lang
        params["safesearch"] = cfg.safesearch

    if endpoint in ("web", "news", "context"):
        if cfg.offset:
            params["offset"] = cfg.offset
        if cfg.freshness:
            params["freshness"] = cfg.freshness
        params["extra_snippets"] = "1" if cfg.extra_snippets else "0"
        if not cfg.spellcheck:
            params["spellcheck"] = "0"
        params["text_decorations"] = "1" if cfg.text_decorations else "0"

    if endpoint == "web":
        if not cfg.operators:
            params["operators"] = "0"
        if cfg.result_filter:
            params["result_filter"] = cfg.result_filter
        if cfg.enable_rich_callback:
            params["enable_rich_callback"] = "1"
        if cfg.include_fetch_metadata:
            params["include_fetch_metadata"] = "1"

    if endpoint == "suggest" and cfg.suggest_rich:
        params["rich"] = "1"

    if endpoint == "context":
        params["maximum_number_of_urls"] = cfg.ctx_max_urls
        params["maximum_number_of_tokens"] = cfg.ctx_max_tokens
        params["maximum_number_of_snippets"] = cfg.ctx_max_snippets
        params["maximum_number_of_tokens_per_url"] = cfg.ctx_tokens_per_url
        params["maximum_number_of_snippets_per_url"] = cfg.ctx_snippets_per_url
        params["context_threshold_mode"] = cfg.ctx_threshold
        if cfg.ctx_local:
            params["enable_local"] = "1"

    # Multiple goggles: add as list to params so doseq=True handles URL encoding
    # AND so POST body contains them too (B2 fix)
    if cfg.goggles and endpoint in ("web", "context"):
        params["goggles"] = cfg.goggles

    qs = urllib.parse.urlencode(params, doseq=True)
    full_url = f"{url}?{qs}"

    # Auto-switch to POST for long URLs — params dict now includes goggles
    if len(full_url) > 2000 and endpoint in ("web", "context"):
        post_h = dict(headers)
        post_h["Content-Type"] = "application/json"
        return urllib.request.Request(url, data=json.dumps(params).encode(), headers=post_h, method="POST")

    return urllib.request.Request(full_url, headers=headers)


def _build_answers_request(url: str, query: str, cfg: SweepConfig, headers: dict) -> urllib.request.Request:
    extra_body: dict[str, Any] = {
        "country": cfg.country,
        "language": cfg.search_lang,
        "safesearch": cfg.safesearch,
        "enable_entities": cfg.ans_entities,
        "enable_citations": cfg.ans_citations,
        "enable_research": cfg.ans_research_mode,
    }
    if cfg.ans_research_mode:
        if cfg.ans_research_iters:
            extra_body["research_maximum_number_of_iterations"] = min(cfg.ans_research_iters, 5)
        if cfg.ans_research_seconds:
            extra_body["research_maximum_number_of_seconds"] = min(cfg.ans_research_seconds, 300)
    if cfg.ans_max_tokens:
        extra_body["max_completion_tokens"] = cfg.ans_max_tokens

    body = {
        "model": "brave",
        "messages": [{"role": "user", "content": query}],
        "stream": cfg.ans_stream,
        "extra_body": extra_body,
    }
    h = dict(headers)
    h["Content-Type"] = "application/json"
    return urllib.request.Request(url, data=json.dumps(body).encode(), headers=h, method="POST")


# ── Rate limiter ───────────────────────────────────────────────────────────────

class RateLimiter:
    def __init__(self, target_rps: float = 1.0):
        self._lock = threading.Lock()
        self._last = 0.0
        self._min_interval = 1.0 / max(target_rps, 0.1)

    def acquire(self) -> None:
        with self._lock:
            now = time.time()
            wait = self._last + self._min_interval - now
            if wait > 0:
                time.sleep(wait)
            self._last = time.time()

    def update_from_headers(self, headers: Any) -> None:
        try:
            r = headers.get("X-RateLimit-Remaining")
            if r and int(r.split(",")[0].strip()) == 0:
                time.sleep(1.0)
        except Exception:
            pass

    @staticmethod
    def get_reset_secs(headers: Any) -> int:
        try:
            r = headers.get("X-RateLimit-Reset")
            if r:
                return int(r.split(",")[0].strip())
        except Exception:
            pass
        return 1


def probe_plan_qps(key: str) -> tuple:
    """Lightweight probe → read X-RateLimit-Limit → return (per_sec, per_month)."""
    url = f"{ENDPOINTS['web']}?q=test&count=1"
    req = urllib.request.Request(url, headers={"X-Subscription-Token": key, "Accept": "application/json"})
    try:
        with urllib.request.urlopen(req, timeout=10) as resp:
            resp.read()  # consume body to release connection
            hdr = resp.headers.get("X-RateLimit-Limit", "1, 15000")
            parts = hdr.split(",")
            return int(parts[0].strip()), int(parts[1].strip()) if len(parts) > 1 else 15000
    except Exception:
        return 1, 15000


# ── Fetch ──────────────────────────────────────────────────────────────────────

def _decompress(data: bytes, enc: str | None) -> bytes:
    if enc and "gzip" in enc.lower():
        return gzip.decompress(data)
    return data


def fetch_endpoint(
    label: str,
    query: str,
    endpoint: str,
    cfg: SweepConfig,
    out_dir: Path,
    rate_limiter: RateLimiter,
) -> tuple:
    """Returns (label, query, endpoint, ok: bool, info: str, rate_headers: dict, payload: dict | None)."""
    timeout = REQUEST_TIMEOUT_RESEARCH if (endpoint == "answers" and cfg.ans_research_mode) else REQUEST_TIMEOUT
    last_err = ""

    for attempt in range(MAX_RETRIES):
        req = build_request(endpoint, query, cfg)
        rate_limiter.acquire()
        try:
            with urllib.request.urlopen(req, timeout=timeout) as resp:
                raw = _decompress(resp.read(), resp.headers.get("Content-Encoding"))
                rate_hdrs = {
                    "X-RateLimit-Limit": resp.headers.get("X-RateLimit-Limit"),
                    "X-RateLimit-Remaining": resp.headers.get("X-RateLimit-Remaining"),
                    "X-RateLimit-Reset": resp.headers.get("X-RateLimit-Reset"),
                    "X-RateLimit-Policy": resp.headers.get("X-RateLimit-Policy"),
                }
                rate_limiter.update_from_headers(resp.headers)

                if endpoint == "answers" and cfg.ans_stream:
                    payload = _parse_sse(raw.decode("utf-8"))
                else:
                    payload = json.loads(raw.decode("utf-8"))

                suffix = "" if endpoint == "web" else f"__{endpoint}"
                suffix = "" if endpoint == "web" else f"__{endpoint}"
                out_path = out_dir / f"{label}{suffix}.json"
                try:
                    out_path.write_text(json.dumps(payload, ensure_ascii=False, indent=2), encoding="utf-8")
                except OSError as disk_err:
                    print(f"  ⚠️  disk write [{label}/{endpoint}]: {disk_err}", file=sys.stderr)
                return (label, query, endpoint, True, str(out_path), rate_hdrs, payload)

        except urllib.error.HTTPError as e:
            if e.code == 429:
                secs = RateLimiter.get_reset_secs(e.headers)
                print(f"  ⏳ 429 [{label}/{endpoint}] sleeping {secs}s", file=sys.stderr)
                time.sleep(secs + 0.5)
                last_err = "429"
                continue
            elif e.code in (500, 502, 503, 504):
                last_err = f"HTTP {e.code}"
                time.sleep(min(2 ** attempt, 30))
                continue
            elif e.code == 403:
                return (label, query, endpoint, False, "HTTP 403 (plan mismatch — endpoint may need higher tier)", {}, None)
            else:
                try:
                    body_text = e.read().decode("utf-8", errors="replace")[:200]
                except Exception:
                    body_text = str(e)
                return (label, query, endpoint, False, f"HTTP {e.code}: {body_text}", {}, None)
        except Exception as ex:
            last_err = f"{type(ex).__name__}: {ex}"
            if attempt < MAX_RETRIES - 1:
                time.sleep(min(2 ** attempt, 30))

    return (label, query, endpoint, False, f"Failed after {MAX_RETRIES} retries: {last_err}", {}, None)


def _parse_sse(text: str) -> dict:
    """Parse SSE stream from Answers endpoint into a payload dict."""
    chunks: list[str] = []
    citations: list[dict] = []
    usage: dict = {}

    for line in text.splitlines():
        line = line.strip()
        if not line.startswith("data:"):
            continue
        data_str = line[5:].strip()
        if data_str == "[DONE]":
            break
        try:
            chunk = json.loads(data_str)
            delta = (chunk.get("choices") or [{}])[0].get("delta", {})
            if delta.get("content"):
                chunks.append(delta["content"])
            if chunk.get("usage"):
                usage = chunk["usage"]
        except Exception:
            pass

    content = "".join(chunks)
    for m in re.finditer(r'<citation[^>]*url="([^"]*)"[^>]*>([^<]*)</citation>', content, re.DOTALL):
        citations.append({"url": m.group(1), "snippet": m.group(2).strip()})

    # Extract entities from SSE chunks that carry structured entity data
    entities: list[dict] = []
    # Brave may emit entities as a separate SSE event with a top-level "entities" key
    # We capture these if they appear in any chunk parsed above
    # (stored in usage dict opportunistically — check both locations)
    if isinstance(usage, dict) and "entities" in usage:
        entities = usage.pop("entities", [])

    return {"content": content, "citations": citations, "entities": entities, "usage": usage}


# ── Response parsing ───────────────────────────────────────────────────────────

def _s(v: Any) -> str:
    if not isinstance(v, str):
        return ""
    return v.replace("<strong>", "").replace("</strong>", "").replace("\n", " ").strip()


def parse_response(payload: dict, endpoint: str, rate_hdrs: dict, query: str) -> ParsedResult:
    r = ParsedResult(query=query, endpoint=endpoint)

    try:
        rem = rate_hdrs.get("X-RateLimit-Remaining")
        if rem:
            r.rate_limit_remaining = int(rem.split(",")[0].strip())
        rst = rate_hdrs.get("X-RateLimit-Reset")
        if rst:
            r.rate_limit_reset = int(rst.split(",")[0].strip())
        r.rate_limit_policy = rate_hdrs.get("X-RateLimit-Policy")
    except Exception:
        pass

    if endpoint in ("web", "news", "context"):
        _parse_query_meta(payload, r)

    if endpoint == "web":
        _parse_web(payload, r)
    elif endpoint == "news":
        _parse_news(payload, r)
    elif endpoint == "context":
        _parse_context(payload, r)
    elif endpoint == "answers":
        _parse_answers(payload, r)
    elif endpoint == "suggest":
        _parse_suggest(payload, r)

    return r


def _parse_query_meta(payload: dict, r: ParsedResult) -> None:
    q = payload.get("query") or {}
    r.query_original = q.get("original")
    r.query_altered = q.get("altered")
    r.query_cleaned = q.get("cleaned")
    r.query_show_strict_warning = bool(q.get("show_strict_warning"))
    r.query_search_operators = q.get("search_operators")
    r.query_country = q.get("country")
    r.query_spellcheck = not bool(q.get("spellcheck_off"))
    r.more_results_available = bool(payload.get("more_results_available"))


def _parse_web(payload: dict, r: ParsedResult) -> None:
    web = payload.get("web") or {}
    r.total_results_web = web.get("total_results") or 0
    r.mutated_by_goggles = bool(web.get("mutated_by_goggles"))

    for item in (web.get("results") or []):
        meta = item.get("meta_url") or {}
        thumb = item.get("thumbnail") or {}
        snips = item.get("extra_snippets") or []
        struct = sum(1 for s in snips if isinstance(s, str) and (s.strip().startswith("{") or s.strip().startswith("[")))
        if struct:
            r.warnings.append(f"- [{r.query[:40]}]: {struct} JSON-serialized snippets")

        entity_data = None
        for ek in ("product", "recipe", "article", "book", "software", "movie",
                   "video", "location", "qa", "organization", "review", "music_recording", "creative_work"):
            if ek in item:
                entity_data = {ek: item[ek]}
                break

        r.web.append(WebResult(
            title=_s(item.get("title", "")),
            url=item.get("url", ""),
            hostname=meta.get("hostname", ""),
            description=_s(item.get("description", "")),
            extra_snippets=[_s(s) for s in snips],
            age=item.get("age"),
            page_age=item.get("page_age"),
            language=item.get("language"),
            profile_name=(item.get("profile") or {}).get("name"),
            thumbnail_src=thumb.get("src"),
            thumbnail_original=thumb.get("original"),
            thumbnail_logo=thumb.get("logo"),
            family_friendly=item.get("family_friendly"),
            schemas=item.get("schemas"),
            rating=item.get("rating"),
            content_type=item.get("content_type"),
            fetched_content_timestamp=item.get("fetched_content_timestamp"),
            entity_type=item.get("type") if item.get("type") not in (None, "SearchResult") else None,
            entity_data=entity_data,
        ))

    for item in ((payload.get("discussions") or {}).get("results") or []):
        meta = item.get("meta_url") or {}
        r.discussions.append(WebResult(
            title=_s(item.get("title", "")),
            url=item.get("url", ""),
            hostname=meta.get("hostname", ""),
            description=_s(item.get("description", "")),
            extra_snippets=[_s(s) for s in (item.get("extra_snippets") or [])],
        ))

    for item in ((payload.get("faq") or {}).get("results") or []):
        r.faq.append(FaqResult(
            question=_s(item.get("question", "")),
            answer=_s(item.get("answer", "")),
            source_url=item.get("url", ""),
            source_hostname=(item.get("meta_url") or {}).get("hostname", ""),
        ))

    # Handle both Brave infobox shapes: {"results": [{...}]} and direct {"type": ..., "title": ...}
    ib_raw = payload.get("infobox")
    ib = None
    if isinstance(ib_raw, dict):
        results_list = ib_raw.get("results")
        ib = results_list[0] if results_list else ib_raw
    if ib:
        r.infobox = InfoboxResult(
            type=ib.get("type", ""),
            title=_s(ib.get("title", "")),
            description=_s(ib.get("description", "")),
            long_desc=_s(ib.get("long_desc")) if ib.get("long_desc") else None,
            attributes=dict(ib.get("attributes") or {}),
            images=[i.get("src", "") for i in (ib.get("images") or [])],
        )

    for item in ((payload.get("videos") or {}).get("results") or []):
        r.videos.append(_parse_video(item))

    for item in ((payload.get("locations") or {}).get("results") or []):
        coords = None
        c = item.get("coordinates")
        if c:
            try:
                coords = (float(c["lat"]), float(c["long"]))
            except Exception:
                pass
        r.locations.append(LocationResult(
            id=item.get("id", ""),
            title=_s(item.get("title", "")),
            description=_s(item.get("description")) if item.get("description") else None,
            coordinates=coords,
        ))

    # Brave returns rich in multiple shapes:
    # 1. Direct: {"type": "weather", "callback_key": "xyz"}
    # 2. Nested:  {"results": [{"type": ...}]}
    # 3. With hint key: {"hint": {"type": ...}}
    rich_raw = payload.get("rich") or {}
    hint = None
    if rich_raw:
        results_list = rich_raw.get("results")
        if results_list:
            hint = results_list[0]
        elif rich_raw.get("hint"):
            hint = rich_raw["hint"]
        elif rich_raw.get("type"):
            hint = rich_raw
    if hint and isinstance(hint, dict):
        r.rich = RichHint(
            vertical=hint.get("type", ""),
            callback_key=hint.get("callback_key", ""),
        )

    mixed = payload.get("mixed") or {}
    if mixed.get("type") == "mixed":
        r.mixed_order = [item.get("type", "") for item in (mixed.get("main") or [])]


def _parse_video(item: dict) -> VideoResult:
    video = item.get("video") or {}
    thumb = item.get("thumbnail") or {}
    return VideoResult(
        title=_s(item.get("title", "")),
        url=item.get("url", ""),
        description=_s(item.get("description", "")),
        age=item.get("age"),
        duration=video.get("duration"),
        thumbnail_url=thumb.get("src"),
        page_fetched=item.get("page_fetched"),
        video_creator=video.get("creator"),
        video_publisher=video.get("publisher"),
        video_requires_subscription=video.get("requires_subscription"),
        video_tags=list(video.get("tags") or []),
        video_author=video.get("author"),
    )


def _parse_news(payload: dict, r: ParsedResult) -> None:
    results = payload.get("results") or (payload.get("news") or {}).get("results") or []
    for item in results:
        meta = item.get("meta_url") or {}
        thumb = item.get("thumbnail") or {}
        r.news.append(NewsResult(
            title=_s(item.get("title", "")),
            url=item.get("url", ""),
            hostname=meta.get("hostname", ""),
            description=_s(item.get("description", "")),
            source=(item.get("profile") or {}).get("name", ""),
            age=item.get("age"),
            page_age=item.get("page_age"),
            page_fetched=item.get("page_fetched"),
            extra_snippets=[_s(s) for s in (item.get("extra_snippets") or [])],
            thumbnail_url=thumb.get("src"),
            breaking=item.get("breaking"),
        ))


def _parse_context(payload: dict, r: ParsedResult) -> None:
    for g in ((payload.get("grounding") or {}).get("generic") or []):
        r.context_grounding.append(ContextGrounding(
            url=g.get("url", ""),
            title=g.get("title", ""),
            snippets=list(g.get("snippets") or []),
        ))
    for url, meta in (payload.get("sources") or {}).items():
        r.context_sources[url] = ContextSource(
            url=url,
            title=meta.get("title", ""),
            hostname=meta.get("hostname", ""),
            age=meta.get("age"),
        )


def _parse_answers(payload: dict, r: ParsedResult) -> None:
    if "content" in payload:
        # SSE-parsed payload from _parse_sse()
        r.answers_text = payload["content"]
        for c in (payload.get("citations") or []):
            r.answers_citations.append(AnswerCitation(
                url=c.get("url", ""),
                snippet=c.get("snippet", ""),
                favicon=c.get("favicon"),
            ))
        for e in (payload.get("entities") or []):
            r.answers_entities.append(AnswerEntity(
                name=e.get("name", "") if isinstance(e, dict) else str(e),
                metadata={k: v for k, v in e.items() if k != "name"} if isinstance(e, dict) else {},
            ))
        usage = payload.get("usage") or {}
    else:
        # Non-streaming: standard OpenAI JSON response
        choices = payload.get("choices") or []
        if choices:
            r.answers_text = (choices[0].get("message") or {}).get("content", "")
        # Entities may appear at top level or inside choices[0]
        for e in (payload.get("entities") or []):
            r.answers_entities.append(AnswerEntity(
                name=e.get("name", "") if isinstance(e, dict) else str(e),
                metadata={k: v for k, v in e.items() if k != "name"} if isinstance(e, dict) else {},
            ))
        usage = payload.get("usage") or {}

    if usage:
        r.answers_usage = AnswerUsage(
            request_count=usage.get("request_count", 1),
            input_tokens=usage.get("prompt_tokens") or usage.get("input_tokens") or 0,
            output_tokens=usage.get("completion_tokens") or usage.get("output_tokens") or 0,
        )


def _parse_suggest(payload: dict, r: ParsedResult) -> None:
    for item in (payload.get("results") or []):
        r.suggestions.append(Suggestion(
            query=item.get("query", ""),
            is_entity=bool(item.get("is_entity")),
            title=item.get("title"),
            description=item.get("description"),
            img=item.get("img"),
        ))


# ── Warning detection ──────────────────────────────────────────────────────────

def detect_warnings(result: ParsedResult, cfg: SweepConfig) -> list:
    warns = list(result.warnings)
    if result.query_altered and result.query_altered != result.query_original:
        warns.append(f"- [{result.query[:50]}]: Brave altered → {result.query_altered!r}")
    if result.endpoint == "web" and cfg.freshness and not result.web:
        warns.append(f"- [{result.query[:50]}]: freshness={cfg.freshness!r} → 0 web results")
    if result.more_results_available and cfg.offset >= 9:
        warns.append(f"- [{result.query[:50]}]: more_available=true but offset limit reached")
    if result.query_show_strict_warning:
        warns.append(f"- [{result.query[:50]}]: SafeSearch strict blocked some results")
    if result.endpoint == "web" and not result.web:
        warns.append(f"- [{result.query[:50]}]: zero web results")
    if result.mutated_by_goggles:
        warns.append(f"- [{result.query[:50]}]: results mutated by goggles")
    return warns


# ── Markdown rendering ─────────────────────────────────────────────────────────

def render_markdown(
    results_map: dict,
    queries: list,
    cfg: SweepConfig,
    all_warnings: list,
    suggest_expansions: dict,
    duration: float,
    stats: dict,
) -> str:
    lines: list[str] = []

    endpoints_used = ["web"]
    if cfg.include_news: endpoints_used.append("news")
    if cfg.include_context: endpoints_used.append("context")
    if cfg.include_answers: endpoints_used.append("answers")

    cfg_parts = []
    if cfg.freshness: cfg_parts.append(f"freshness={cfg.freshness}")
    cfg_parts += [f"country={cfg.country}", f"lang={cfg.search_lang}",
                  "extra_snippets=on" if cfg.extra_snippets else "extra_snippets=off"]

    lines += [
        f"# Brave sweep — {len(queries)} queries",
        "",
        f"**Config:** {', '.join(cfg_parts)}",
        f"**Endpoints used:** {', '.join(endpoints_used)}",
        f"**Generated:** {_iso_now()} | **Script:** brave_sweep.py v2",
        "",
        "---",
        "",
    ]

    if all_warnings:
        lines += ["## ⚠️ Silent behavior warnings", ""]
        lines += all_warnings
        lines += [""]

    if suggest_expansions:
        lines += ["## 📊 Query expansion via Suggest", ""]
        for seed, expanded in suggest_expansions.items():
            lines.append(f'- "{seed}" → ' + ", ".join(f'"{e}"' for e in expanded))
        lines += [""]

    for label, query in queries:
        lines += [f'\n## {label} — "{query}"', ""]
        label_results = results_map.get(label) or {}

        web_r = label_results.get("web")
        if web_r:
            meta_parts = []
            if web_r.query_original:
                meta_parts.append(f"original={web_r.query_original!r}")
            if web_r.query_altered and web_r.query_altered != web_r.query_original:
                meta_parts.append(f"altered={web_r.query_altered!r}")
            if web_r.more_results_available:
                meta_parts.append("more_available=true")
            if meta_parts:
                lines += [f"**Meta:** {' | '.join(meta_parts)}", ""]

            if web_r.web:
                lines += [f"### 🔎 Web ({len(web_r.web)} results)", ""]
                for i, wr in enumerate(web_r.web[:cfg.results_per], 1):
                    lines.append(f"**{i}. {wr.title[:140]}**")
                    lines.append(f"- URL: {wr.url}")
                    if wr.description:
                        lines.append(f"- {wr.description[:400]}")
                    if wr.age:
                        lines.append(f"- Age: {wr.age}")
                    for s in wr.extra_snippets[:5]:
                        s = s[:500]
                        if s.strip().startswith("{") or s.strip().startswith("["):
                            lines += [f"  ```json", f"  {s}", f"  ```"]
                        else:
                            lines.append(f"  > {s}")
                    lines.append("")

            if web_r.discussions:
                lines += [f"### 💬 Discussions ({len(web_r.discussions)})", ""]
                for i, wr in enumerate(web_r.discussions[:5], 1):
                    lines.append(f"**{i}. {wr.title[:140]}**")
                    lines.append(f"- URL: {wr.url}")
                    if wr.description:
                        lines.append(f"- {wr.description[:300]}")
                    lines.append("")

            if web_r.faq:
                lines += [f"### ❓ FAQ ({len(web_r.faq)})", ""]
                for fi in web_r.faq[:5]:
                    lines += [
                        f"**Q: {fi.question}**",
                        f"A: {fi.answer[:400]}",
                        f"*Source: {fi.source_hostname}*",
                        "",
                    ]

            if web_r.infobox:
                ib = web_r.infobox
                lines += ["### 📦 Infobox", "", f"**{ib.title}** ({ib.type})"]
                if ib.description:
                    lines.append(ib.description[:500])
                if ib.long_desc:
                    lines.append(f"_{ib.long_desc[:300]}_")
                for k, v in list((ib.attributes or {}).items())[:10]:
                    lines.append(f"- {k}: {v}")
                lines.append("")

            if web_r.videos:
                lines += [f"### 🎥 Videos ({len(web_r.videos)})", ""]
                for vr in web_r.videos[:5]:
                    lines.append(f"**{vr.title[:120]}**")
                    lines.append(f"- URL: {vr.url}")
                    if vr.duration: lines.append(f"- Duration: {vr.duration}")
                    if vr.video_creator: lines.append(f"- Creator: {vr.video_creator}")
                    if vr.video_requires_subscription: lines.append("- ⚠️ Requires subscription")
                    lines.append("")

            if web_r.rich:
                vname = RICH_VERTICAL_NAMES.get(web_r.rich.vertical.lower(), web_r.rich.vertical)
                lines += ["### 🎯 Rich hint", "", f"**{vname}** (`{web_r.rich.callback_key}`)", ""]

            if web_r.locations:
                lines += [f"### 📍 Locations ({len(web_r.locations)})", ""]
                for loc in web_r.locations[:10]:
                    lines.append(f"- **{loc.title}** `id={loc.id}` ⚠️ expires 8h")
                    if loc.description: lines.append(f"  {loc.description[:200]}")
                    if loc.coordinates: lines.append(f"  📌 {loc.coordinates[0]:.4f},{loc.coordinates[1]:.4f}")
                lines.append("")

        news_r = label_results.get("news")
        if news_r and news_r.news:
            lines += [f"### 📰 News ({len(news_r.news)} results)", ""]
            for i, nr in enumerate(news_r.news[:cfg.results_per], 1):
                brk = " **[BREAKING]**" if nr.breaking else ""
                lines.append(f"**{i}. {nr.title[:140]}**{brk}")
                lines.append(f"- URL: {nr.url}")
                lines.append(f"- Source: {nr.source or nr.hostname}")
                if nr.age: lines.append(f"- Age: {nr.age}")
                if nr.description: lines.append(f"- {nr.description[:300]}")
                lines.append("")

        ctx_r = label_results.get("context")
        if ctx_r and ctx_r.context_grounding:
            lines += [f"### 📚 LLM Context ({len(ctx_r.context_grounding)} sources)", "", "**Grounding:**", ""]
            for g in ctx_r.context_grounding[:20]:
                hostname = urllib.parse.urlparse(g.url).hostname or g.url
                lines.append(f"- **{g.title[:80]}** ([{hostname}]({g.url})) — {len(g.snippets)} snippets")
                for s in g.snippets[:3]:
                    s_str = str(s)[:400]
                    if s_str.strip().startswith("{") or s_str.strip().startswith("["):
                        lines += [f"  ```json", f"  {s_str}", f"  ```"]
                    else:
                        lines.append(f"  > {s_str}")
                lines.append("")
            if ctx_r.context_sources:
                lines += ["**Sources metadata:**", "", "| Hostname | Title | Age |", "|----------|-------|-----|"]
                for src in list(ctx_r.context_sources.values())[:20]:
                    age_str = (", ".join(src.age) if isinstance(src.age, list) else str(src.age) if src.age else "—")
                    lines.append(f"| {src.hostname} | {src.title[:60]} | {age_str} |")
                lines.append("")

        ans_r = label_results.get("answers")
        if ans_r and ans_r.answers_text:
            lines += ["### 🤖 Answers", "", "**Direct answer:**", "", ans_r.answers_text[:3000], ""]
            if ans_r.answers_entities:
                lines += ["**Entities:**", ""]
                for e in ans_r.answers_entities[:10]:
                    meta_str = ", ".join(f"{k}={v}" for k, v in list(e.metadata.items())[:3]) if e.metadata else ""
                    lines.append(f"- **{e.name}**" + (f" — {meta_str}" if meta_str else ""))
                lines.append("")
            if ans_r.answers_citations:
                lines += ["**Citations:**", ""]
                for i, c in enumerate(ans_r.answers_citations, 1):
                    lines.append(f'{i}. {c.url} — "{c.snippet[:200]}"')
                lines.append("")
            if ans_r.answers_usage:
                u = ans_r.answers_usage
                lines.append(f"**Usage:** {u.request_count} search(es), {u.input_tokens} input tokens, {u.output_tokens} output tokens")
                lines.append("")

    # Summary
    lines += ["---", "", "## Sweep summary", ""]
    lines.append(f"- Total queries: {len(queries)}")
    lines.append(f"- Web: {stats.get('web_ok', 0)} ok / {stats.get('web_fail', 0)} failed")
    if cfg.include_news:
        lines.append(f"- News: {stats.get('news_ok', 0)} ok / {stats.get('news_fail', 0)} failed")
    if cfg.include_context:
        lines.append(f"- Context: {stats.get('context_ok', 0)} ok / {stats.get('context_fail', 0)} failed")
    if cfg.include_answers:
        lines.append(f"- Answers: {stats.get('answers_ok', 0)} ok / {stats.get('answers_fail', 0)} failed")
    lines.append(f"- Silent warnings: {len(all_warnings)}")
    lines.append(f"- Duration: {duration:.1f}s")
    lines.append(f"- Unique hostnames: {stats.get('unique_hostnames', 0)}")
    lines.append("")

    hcounts = stats.get("hostname_counts", {})
    if hcounts:
        lines += ["## Top hostnames", "", "| Domain | Appearances |", "|--------|-------------|"]
        for domain, cnt in sorted(hcounts.items(), key=lambda x: -x[1])[:20]:
            lines.append(f"| {domain} | {cnt} |")
        lines.append("")

    lines.append(TOS_DISCLAIMER)
    return "\n".join(lines)


def _iso_now() -> str:
    return time.strftime("%Y-%m-%dT%H:%M:%SZ", time.gmtime())


# ── Suggest expansion ──────────────────────────────────────────────────────────

def expand_via_suggest(
    seed_queries: list,
    cfg: SweepConfig,
    rate_limiter: RateLimiter,
    out_dir: Path,
) -> tuple:
    extra: list = []
    expansions: dict = {}
    for label, query in seed_queries:
        _, _, _, ok, _, rate_hdrs, payload = fetch_endpoint(label, query, "suggest", cfg, out_dir, rate_limiter)
        if not ok or payload is None:
            continue
        parsed = parse_response(payload, "suggest", rate_hdrs, query)
        expanded = [s.query for s in parsed.suggestions if s.query and s.query != query][:cfg.suggest_count]
        if expanded:
            expansions[query] = expanded
            for i, eq in enumerate(expanded, 1):
                extra.append((f"{label}_x{i:02d}", eq))
    return extra, expansions


# ── Local POIs ─────────────────────────────────────────────────────────────────

def fetch_local_pois(
    queries: list,
    results_map: dict,
    cfg: SweepConfig,
    out_dir: Path,
    rate_limiter: RateLimiter,
) -> None:
    all_ids: list[str] = []
    for label, _ in queries:
        web_r = (results_map.get(label) or {}).get("web")
        if web_r:
            for loc in web_r.locations:
                if loc.id and loc.id not in all_ids:
                    all_ids.append(loc.id)
    if not all_ids:
        return
    print(f"[brave_sweep] fetching Local POIs for {len(all_ids)} IDs...")
    headers = _base_headers(cfg)
    for start in range(0, len(all_ids), 20):
        batch = all_ids[start:start + 20]
        qs = "&".join(f"ids={urllib.parse.quote(i)}" for i in batch)
        req = urllib.request.Request(f"{ENDPOINTS['pois']}?{qs}", headers=headers)
        rate_limiter.acquire()
        try:
            with urllib.request.urlopen(req, timeout=REQUEST_TIMEOUT) as resp:
                raw = _decompress(resp.read(), resp.headers.get("Content-Encoding"))
                payload = json.loads(raw.decode("utf-8"))
                out_f = out_dir / f"_local_pois_batch{start // 20 + 1}.json"
                out_f.write_text(json.dumps(payload, ensure_ascii=False, indent=2), encoding="utf-8")
                print(f"  ✓ local/pois batch {start // 20 + 1}")
        except urllib.error.HTTPError as e:
            msg = "needs Search plan" if e.code == 403 else f"HTTP {e.code}"
            print(f"  ✗ local/pois: {msg}", file=sys.stderr)
        except Exception as e:
            print(f"  ✗ local/pois: {e}", file=sys.stderr)


# ── Status check ───────────────────────────────────────────────────────────────

def check_brave_status() -> None:
    try:
        req = urllib.request.Request(
            "https://status.brave.com/api/v2/status.json",
            headers={"Accept": "application/json"},
        )
        with urllib.request.urlopen(req, timeout=5) as resp:
            data = json.loads(resp.read().decode("utf-8"))
        indicator = data.get("status", {}).get("indicator", "none")
        desc = data.get("status", {}).get("description", "")
        if indicator != "none":
            print(f"  ⚠️  Brave status: [{indicator.upper()}] {desc}", file=sys.stderr)
        else:
            print("  ✅ Brave API: operational")
    except Exception as e:
        print(f"  ⚠️  Brave status check failed: {e}", file=sys.stderr)


# ── Sweep log ──────────────────────────────────────────────────────────────────

def write_sweep_log(out_dir: Path, warnings: list, stats: dict, queries: list, duration: float) -> None:
    log = {
        "generated": _iso_now(),
        "duration_seconds": round(duration, 2),
        "total_queries": len(queries),
        "stats": {k: v for k, v in stats.items() if k != "hostname_counts"},
        "warnings": warnings,
    }
    (out_dir / "_sweep_log.json").write_text(json.dumps(log, ensure_ascii=False, indent=2), encoding="utf-8")


# ── Arg parser ─────────────────────────────────────────────────────────────────

def build_parser() -> argparse.ArgumentParser:
    ap = argparse.ArgumentParser(description="brave_sweep.py v2 — parallel Brave Search API fan-out")
    ap.add_argument("queries_file", nargs="?", help="Queries file (label:query per line)")
    ap.add_argument("output_dir", help="Output directory")
    ap.add_argument("--queries", help="Inline queries separated by |")

    ap.add_argument("--count", type=int, default=20)
    ap.add_argument("--offset", type=int, default=0)
    ap.add_argument("--results-per", type=int, default=10)

    ap.add_argument("--freshness")
    ap.add_argument("--country", default="us")
    ap.add_argument("--lang", dest="search_lang", default="en")
    ap.add_argument("--ui-lang", dest="ui_lang", default="en-US")
    ap.add_argument("--safesearch", default="off", choices=["off", "moderate", "strict"])
    ap.add_argument("--result-filter")

    ap.add_argument("--no-extra-snippets", action="store_true")
    ap.add_argument("--text-decorations", action="store_true")
    ap.add_argument("--no-operators", action="store_true")
    ap.add_argument("--no-spellcheck", action="store_true")

    ap.add_argument("--goggles", action="append", default=[])
    ap.add_argument("--rich", action="store_true")
    ap.add_argument("--include-fetch-metadata", action="store_true")

    ap.add_argument("--loc-lat", type=float)
    ap.add_argument("--loc-long", type=float)
    ap.add_argument("--loc-tz", dest="loc_timezone")
    ap.add_argument("--loc-city")
    ap.add_argument("--loc-country-hdr", dest="loc_country_hdr")

    ap.add_argument("--api-version")
    ap.add_argument("--no-cache", action="store_true")

    ap.add_argument("--include-news", action="store_true")
    ap.add_argument("--include-context", action="store_true")
    ap.add_argument("--include-answers", action="store_true")
    ap.add_argument("--include-local", action="store_true")
    ap.add_argument("--expand-via-suggest", action="store_true")
    ap.add_argument("--news-count", type=int, default=50)

    ap.add_argument("--ctx-max-urls", type=int, default=20)
    ap.add_argument("--ctx-max-tokens", type=int, default=8192)
    ap.add_argument("--ctx-max-snippets", type=int, default=50)
    ap.add_argument("--ctx-tokens-per-url", type=int, default=4096)
    ap.add_argument("--ctx-snippets-per-url", type=int, default=50)
    ap.add_argument("--ctx-threshold", default="balanced", choices=["strict", "balanced", "lenient", "disabled"])
    ap.add_argument("--ctx-local", action="store_true")
    ap.add_argument("--ctx-preset", choices=["simple", "standard", "deep"])

    ap.add_argument("--ans-no-stream", action="store_true")
    ap.add_argument("--no-ans-entities", action="store_true")
    ap.add_argument("--no-ans-citations", action="store_true")
    ap.add_argument("--ans-research-mode", action="store_true")
    ap.add_argument("--ans-research-iters", type=int)
    ap.add_argument("--ans-research-seconds", type=int)
    ap.add_argument("--ans-max-tokens", type=int)

    ap.add_argument("--suggest-count", type=int, default=5)
    ap.add_argument("--no-suggest-rich", action="store_true")

    ap.add_argument("--max-parallel", type=int)
    ap.add_argument("--target-rps", type=float, default=1.0)

    ap.add_argument("--dry-run", action="store_true")
    ap.add_argument("--check-status", action="store_true")
    return ap


def args_to_cfg(args: argparse.Namespace, key: str) -> SweepConfig:
    cfg = SweepConfig(key=key)
    cfg.count = args.count
    cfg.news_count = args.news_count
    cfg.offset = args.offset
    cfg.freshness = args.freshness
    cfg.country = args.country
    cfg.search_lang = args.search_lang
    cfg.ui_lang = args.ui_lang
    cfg.safesearch = args.safesearch
    cfg.spellcheck = not args.no_spellcheck
    cfg.operators = not args.no_operators
    cfg.extra_snippets = not args.no_extra_snippets
    cfg.text_decorations = args.text_decorations
    cfg.result_filter = args.result_filter
    cfg.goggles = args.goggles or []
    cfg.enable_rich_callback = args.rich
    cfg.include_fetch_metadata = args.include_fetch_metadata
    cfg.loc_lat = args.loc_lat
    cfg.loc_long = args.loc_long
    cfg.loc_timezone = args.loc_timezone
    cfg.loc_city = args.loc_city
    cfg.loc_country_hdr = args.loc_country_hdr
    cfg.api_version = args.api_version
    cfg.no_cache = args.no_cache
    cfg.include_news = args.include_news
    cfg.include_context = args.include_context
    cfg.include_answers = args.include_answers
    cfg.include_local = args.include_local
    cfg.expand_via_suggest = args.expand_via_suggest

    if args.ctx_preset == "simple":
        cfg.ctx_max_urls, cfg.ctx_max_tokens = 5, 2048
    elif args.ctx_preset == "deep":
        cfg.ctx_max_urls, cfg.ctx_max_tokens = 50, 16384
    else:
        cfg.ctx_max_urls = args.ctx_max_urls
        cfg.ctx_max_tokens = args.ctx_max_tokens
    cfg.ctx_max_snippets = args.ctx_max_snippets
    cfg.ctx_tokens_per_url = args.ctx_tokens_per_url
    cfg.ctx_snippets_per_url = args.ctx_snippets_per_url
    cfg.ctx_threshold = args.ctx_threshold
    cfg.ctx_local = args.ctx_local

    cfg.ans_stream = not args.ans_no_stream
    cfg.ans_entities = not args.no_ans_entities
    cfg.ans_citations = not args.no_ans_citations
    cfg.ans_research_mode = args.ans_research_mode
    cfg.ans_research_iters = args.ans_research_iters
    cfg.ans_research_seconds = args.ans_research_seconds
    cfg.ans_max_tokens = args.ans_max_tokens

    cfg.suggest_count = args.suggest_count
    cfg.suggest_rich = not args.no_suggest_rich
    cfg.target_rps = args.target_rps
    cfg.results_per = args.results_per
    cfg.dry_run = args.dry_run
    cfg.check_status = args.check_status

    if args.max_parallel is not None:
        cfg.max_parallel = args.max_parallel

    return cfg


# ── Main ───────────────────────────────────────────────────────────────────────

def main() -> int:
    ap = build_parser()
    args = ap.parse_args()

    out_dir = Path(args.output_dir)
    out_dir.mkdir(parents=True, exist_ok=True)

    if args.queries:
        queries = [(f"q{i+1:02d}", q.strip()) for i, q in enumerate(args.queries.split("|")) if q.strip()]
    elif args.queries_file:
        queries = parse_queries_file(Path(args.queries_file))
    else:
        ap.error("must provide queries_file OR --queries")
        return 1

    if not queries:
        print("ERROR: no queries found", file=sys.stderr)
        return 1

    validate_args(args)
    for label, q in queries:
        validate_query(q, label)

    key = load_env_key(out_dir)
    cfg = args_to_cfg(args, key)

    if cfg.dry_run:
        endpoints = ["web"]
        if cfg.include_news: endpoints.append("news")
        if cfg.include_context: endpoints.append("context")
        if cfg.include_answers: endpoints.append("answers")
        print(f"[dry-run] {len(queries)} queries × endpoints: {', '.join(endpoints)}")
        for label, q in queries:
            print(f"  [{label}] {q[:80]}")
        return 0

    if cfg.check_status:
        check_brave_status()

    # Probe adaptive rate limiting
    if args.max_parallel is None:
        print("[brave_sweep] probing plan QPS...", end=" ", flush=True)
        per_sec, per_month = probe_plan_qps(key)
        cfg.max_parallel = max(1, min(per_sec * 3, 20))
        print(f"{per_sec} req/s, {per_month} req/mo → max_parallel={cfg.max_parallel}")

    rate_limiter = RateLimiter(target_rps=cfg.target_rps)

    # Suggest expansion
    suggest_expansions: dict = {}
    if cfg.expand_via_suggest:
        print(f"[brave_sweep] expanding {len(queries)} queries via Suggest...")
        extra, suggest_expansions = expand_via_suggest(queries, cfg, rate_limiter, out_dir)
        if extra:
            print(f"  + {len(extra)} expanded queries")
            queries = queries + extra

    # Build endpoint list
    endpoints = ["web"]
    if cfg.include_news: endpoints.append("news")
    if cfg.include_context: endpoints.append("context")
    if cfg.include_answers: endpoints.append("answers")

    total_calls = len(queries) * len(endpoints)
    print(f"[brave_sweep] {len(queries)} queries × {len(endpoints)} endpoint(s) = {total_calls} calls → {out_dir} (parallel={cfg.max_parallel})")

    start_ts = time.time()
    stats: dict = {}
    results_map: dict = {}
    all_warnings: list[str] = []

    tasks = [(label, q, ep) for label, q in queries for ep in endpoints]

    with concurrent.futures.ThreadPoolExecutor(max_workers=cfg.max_parallel) as ex:
        futures = {
            ex.submit(fetch_endpoint, label, q, ep, cfg, out_dir, rate_limiter): (label, q, ep)
            for label, q, ep in tasks
        }
        for fut in concurrent.futures.as_completed(futures):
            label, q, ep, ok, info, rate_hdrs, payload = fut.result()
            stat_key = f"{ep}_ok" if ok else f"{ep}_fail"
            stats[stat_key] = stats.get(stat_key, 0) + 1

            if ok:
                print(f"  ✓ {label}/{ep}  {q[:55]}")
                try:
                    parsed = parse_response(payload, ep, rate_hdrs, q)
                    if label not in results_map:
                        results_map[label] = {}
                    results_map[label][ep] = parsed
                    all_warnings.extend(detect_warnings(parsed, cfg))
                except Exception as e:
                    print(f"  ⚠️  parse [{label}/{ep}]: {e}", file=sys.stderr)
            else:
                print(f"  ✗ {label}/{ep}  {q[:55]}  — {info}", file=sys.stderr)

    if cfg.include_local:
        fetch_local_pois(queries, results_map, cfg, out_dir, rate_limiter)

    duration = time.time() - start_ts

    # Hostname stats
    hcounts: dict[str, int] = {}
    for lr in results_map.values():
        for pr in lr.values():
            for wr in pr.web:
                if wr.hostname:
                    hcounts[wr.hostname] = hcounts.get(wr.hostname, 0) + 1
            for nr in pr.news:
                if nr.hostname:
                    hcounts[nr.hostname] = hcounts.get(nr.hostname, 0) + 1
    stats["unique_hostnames"] = len(hcounts)
    stats["hostname_counts"] = hcounts

    # Write outputs
    md = render_markdown(results_map, queries, cfg, all_warnings, suggest_expansions, duration, stats)
    md_path = out_dir / "parsed_snippets.md"
    md_path.write_text(md, encoding="utf-8")
    write_sweep_log(out_dir, all_warnings, stats, queries, duration)

    total_ok = sum(v for k, v in stats.items() if k.endswith("_ok"))
    total_fail = sum(v for k, v in stats.items() if k.endswith("_fail"))
    print(f"[brave_sweep] done: {total_ok} ok / {total_fail} fail in {duration:.1f}s")
    print(f"[brave_sweep] parsed → {md_path} ({md_path.stat().st_size} bytes)")
    if all_warnings:
        print(f"[brave_sweep] ⚠️  {len(all_warnings)} warnings in parsed_snippets.md")
    return 0 if total_fail == 0 else 2


if __name__ == "__main__":
    raise SystemExit(main())
