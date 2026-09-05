# @theyahia/mcp-core

## 1.2.0

### Minor Changes

- b146575: `BaseHttpClient` больше не повторяет изменяющие запросы (fleet-wide).

  - **POST/PATCH/DELETE не ретраятся** на таймауте, 429 и 5xx. Раньше цикл повторов не различал метод: проведение документа в 1С регулярно длится дольше таймаута в 15 с, и до трёх POST по сети давали дубль документа и дубль движений в боевой базе клиента. Теперь такой запрос падает сразу, а к тексту ошибки добавляется: «Повтор не выполнен автоматически, потому что операция изменяет данные. Проверьте в базе, не создан ли объект, прежде чем повторять».
  - **Добавлен ретрай сетевых сбоев** (`ECONNRESET` / `ETIMEDOUT` / `EAI_AGAIN`) — раньше они не повторялись вообще, хотя это ровно тот класс ошибок, ради которого ретраи существуют. Повторяются только идемпотентные методы (GET, HEAD); код ошибки достаётся из цепочки `cause`, куда его прячет fetch в Node.

## 1.1.0

### Minor Changes

- 80fc973: Security hardening (fleet-wide via shared core):

  - **Output sanitization wired into `withErrorHandling`** — every server now strips prompt-injection patterns and truncates oversized responses from external APIs before they reach the LLM. Previously `sanitizeApiResponse`/`truncateResponse` were dead code. Opt out for trusted public-data servers (cbr/cbu) with `MCP_DISABLE_SANITIZE=true`.
  - **SSRF guard in `BaseHttpClient`** — an absolute URL passed as `path` is now allowed only if its origin matches the configured `baseUrl`; cross-origin fetches throw. Closes the vector where a tool taking a user-supplied URL (e.g. 1c-rest `get_report`) could be coerced into hitting an attacker host with the server's credentials.
  - **CORS default → deny-all** — HTTP transport previously defaulted `corsOrigins` to `["*"]`. Now empty by default; pass explicit origins to opt in. Non-browser MCP clients are unaffected.
