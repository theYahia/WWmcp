# Changelog

## 2.0.0 — 2026-06-23

Major rework. Brings the server up to the WWmcp house standard and fixes
correctness bugs verified against the official TGStat API docs
(`api.tgstat.ru/docs/ru`).

### Breaking

- Output is now **curated** — tools return only the relevant fields (subscribers,
  reach, ERR, post text snippet, links) with dates as ISO strings, instead of the
  raw API JSON dump. This is cheaper in tokens and easier for an LLM to use.
  Consumers that parsed specific raw fields should re-check.
- `search_posts`: removed the non-functional `channels` parameter. TGStat's
  `posts/search` has no per-channel filter; the array was being sent as an invalid
  `peerType` value. Replaced with real filters: `peer_type`, `category`,
  `language`, `country`, `hide_forwards`, `minus_words`, `extended`.

### Fixed

- **Date filters now work.** `date_from` / `date_to` (and post date ranges) are
  converted to the Unix timestamps the API requires. They were previously sent as
  raw `YYYY-MM-DD`, which the API silently ignored.
- **Logical API errors are surfaced.** A `{"status":"error"}` body returned with
  HTTP 200 is now reported as a tool error instead of being passed off as success.
- **Token no longer leaks into logs.** Retries/timeouts logged the full request
  URL, which carried `?token=...`. Only the endpoint path is logged now.
- **`compare_channels` compares the right thing.** It now uses `channels/stat`
  (which has reach/ERR) instead of `channels/get` (which does not), tolerates a
  per-channel failure, and returns a table sorted by subscribers.

### Added

- 12 new tools (8 → 20): `get_post_stats`, `get_channel_subscribers`,
  `get_channel_views`, `get_channel_avg_reach`, `get_channel_err`,
  `get_channel_forwards`, `get_word_mentions`, `get_word_mentions_by_channels`,
  `list_categories`, `list_countries`, `list_languages`, `get_usage`.
- Retries now cover HTTP 429 (rate limits) and honour the `Retry-After` header.
- Stronger Zod input validation with sane defaults and limit clamping to API maxima
  (channels 100, posts 50, offset 1000).
- GitHub Actions CI: build + typecheck + test on Node 18 / 20 / 22.

### Internal

- New layout: `client.ts` (`ApiResult` error-as-value), `types.ts`, `lib/`
  (formatters, date helpers, tolerant output shapers), and modular `tools/*` files
  registered via `registerXTools(server)`.
- Tests split into `client.test.ts` and `tools.test.ts` (8 → 26 tests).
- Build no longer ships test files in `dist`.

## 1.0.1 — 2026-04-01

- Initial release. 8 tools, raw JSON output.
