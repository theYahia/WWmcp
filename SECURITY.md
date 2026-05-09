# Security Policy

## Reporting a Vulnerability

If you discover a security vulnerability in any `@theyahia/*-mcp` package, please report it privately. **Do not open a public GitHub issue.**

**Contact:** open a [GitHub Security Advisory](https://github.com/theYahia/WWmcp/security/advisories/new) (preferred), or email `security@theyahia.dev` with:

- Affected package(s) and version(s)
- Steps to reproduce
- Impact assessment (data exposure, RCE, auth bypass, etc.)
- Suggested fix if you have one

## Disclosure Process

1. We acknowledge receipt within **3 business days**.
2. We investigate and confirm the issue within **7 days**.
3. We develop and test a fix.
4. We publish a patch and a [GitHub Security Advisory](https://github.com/theYahia/WWmcp/security/advisories) crediting the reporter (unless they request anonymity).
5. We request a **30-day grace period** before public disclosure to give downstream users time to upgrade.

## Supported Versions

Each MCP server in this monorepo follows independent semver. Security patches are released for:

- The **current major version** of every published `@theyahia/*-mcp` package.
- The **previous major version** for 90 days after a new major ships.

Versions older than that receive fixes only at maintainer discretion.

## Scope

In scope:
- Authentication / authorization bypass in any `@theyahia/*-mcp` server
- Credential or secret leakage (logs, error messages, telemetry)
- Injection (SQL, command, prompt) via tool inputs
- Vulnerable third-party dependencies in published packages
- Supply-chain issues (npm publishing pipeline, GitHub Actions)

Out of scope:
- Issues in upstream third-party APIs we wrap (report those to the API vendor)
- Self-exploitation (e.g., misconfiguring your own API keys to read your own data)
- DoS via excessive request volume — these servers are user-controlled

## Hall of Fame

Researchers credited here after responsible disclosure.

_(Empty for now — be the first.)_
