---
"@theyahia/mcp-core": minor
---

Security hardening (fleet-wide via shared core):

- **Output sanitization wired into `withErrorHandling`** — every server now strips prompt-injection patterns and truncates oversized responses from external APIs before they reach the LLM. Previously `sanitizeApiResponse`/`truncateResponse` were dead code. Opt out for trusted public-data servers (cbr/cbu) with `MCP_DISABLE_SANITIZE=true`.
- **SSRF guard in `BaseHttpClient`** — an absolute URL passed as `path` is now allowed only if its origin matches the configured `baseUrl`; cross-origin fetches throw. Closes the vector where a tool taking a user-supplied URL (e.g. 1c-rest `get_report`) could be coerced into hitting an attacker host with the server's credentials.
- **CORS default → deny-all** — HTTP transport previously defaulted `corsOrigins` to `["*"]`. Now empty by default; pass explicit origins to opt in. Non-browser MCP clients are unaffected.
