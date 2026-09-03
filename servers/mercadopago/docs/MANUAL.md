# mercadopago-mcp user manual

Package `@theyahia/mercadopago-mcp`, version 1.1.0, 10 tools. Node.js 18 or newer.
Mercado Pago API, base URL `https://api.mercadopago.com`.

Sections: [1. Purpose](#1-what-this-is-and-who-needs-it) · [2. Install](#2-installation-and-connection) ·
[3. Token](#3-where-to-get-the-access-token) · [4. Tools](#4-tools-by-task) ·
[5. Scenarios](#5-ready-made-scenarios) · [6. Limits](#6-limits-and-pitfalls) ·
[7. Errors](#7-common-errors)

---

## 1. What this is and who needs it

The server gives an AI agent access to Mercado Pago's payments API across its Latin
American markets: charge a card with instalments, take PIX, OXXO or Rapipago, open a
hosted checkout that returns a link for the customer, search payments by your own
reference or by date, refund fully or partially, and read merchant orders to see which
payments cover which store order.

The work it removes is the switching between a support conversation and the merchant
dashboard: "which payments were approved yesterday and for how much", "refund half of
payment 12345678", "is PIX enabled on this account", "create a checkout link for two
books at 100 each".

Who needs it: a merchant reconciling payments by hand; support staff who need a payment's
status in one question; a developer prototyping a Mercado Pago integration before writing
code.

> ⚠️ **This server moves real money.** `create_payment` charges a customer and
> `refund_payment` returns funds — both are irreversible, and neither is protected by an
> idempotency key (section 6.2). While integrating, use a `TEST-` token.

---

## 2. Installation and connection

### Claude Desktop

In `claude_desktop_config.json`:

```json
{
  "mcpServers": {
    "mercadopago": {
      "command": "npx",
      "args": ["-y", "@theyahia/mercadopago-mcp"],
      "env": {
        "MERCADOPAGO_ACCESS_TOKEN": "APP_USR-XXXXXXXX-XXXXXX-X-XXXXXXXX"
      }
    }
  }
}
```

Use a `TEST-…` token instead while integrating. The client reads its configuration at
startup — restart it after editing.

### Claude Code

```
claude mcp add mercadopago -e MERCADOPAGO_ACCESS_TOKEN=your_token -- npx -y @theyahia/mercadopago-mcp
```

### Cursor / Windsurf / VS Code (Copilot)

Cursor and Windsurf take the same `mcpServers` block in `.cursor/mcp.json` or
`.windsurf/mcp.json`. VS Code uses `.vscode/mcp.json`, where the root key is `servers`,
not `mcpServers`; `command`, `args` and `env` are the same. A workspace file is usually
under version control — never keep the access token in it: that token can charge cards.

### Streamable HTTP transport

```bash
HTTP_PORT=3000 MERCADOPAGO_ACCESS_TOKEN=your_token npx @theyahia/mercadopago-mcp
# equivalently: npx @theyahia/mercadopago-mcp --http
```

The mode is enabled by the `--http` flag or by setting `HTTP_PORT` (default 3000).
Endpoints: `POST /mcp` (requests; an initialize request opens a session), `GET /mcp` (SSE
stream for an existing session), `DELETE /mcp` (session termination), `GET /health`
(`status`, `server`, `version`, `uptime`, `memory_mb`, `tools`). Sessions are keyed by the
`mcp-session-id` header; browser cross-origin calls are rejected by default.

The token comes from the process environment and is shared by every session. `/mcp` has no
authentication of its own, and access to the port means the ability to charge and refund —
do not publish it. If it must be reachable remotely, put it behind an authenticating
reverse proxy.

### Environment variables

| Variable | Required | Purpose |
|---|---|---|
| `MERCADOPAGO_ACCESS_TOKEN` | yes | Access token; sent as `Authorization: Bearer …`. Production `APP_USR-…`, sandbox `TEST-…` |
| `HTTP_PORT` | no | Port for HTTP mode; setting it also enables the mode |
| `MCP_DISABLE_SANITIZE` | no | `true` disables prompt-injection filtering of responses |

There is no country variable: the market (AR, BR, MX, CL, CO, PE, UY…) follows from the
account the token belongs to, and so does the currency.

A missing token is discovered on the first tool call, not at startup — the client is built
lazily.

---

## 3. Where to get the access token

1. Log in to the Mercado Pago account.
2. Open **Developers panel → Your applications → Credentials**.
3. Copy either the **production** access token (`APP_USR-…`) or the **test** access token
   (`TEST-…`).
4. Pass it as `MERCADOPAGO_ACCESS_TOKEN`.

Credentials panel: <https://www.mercadopago.com.ar/developers/panel/credentials> — the
same URL the server names in its error message when the variable is missing.

**The token prefix is the only thing separating test from production.** There is no
sandbox URL and no sandbox flag: the same base URL serves both, and which world you are in
depends entirely on the token. A `TEST-` token cannot see production payments and vice
versa, so "payment not found" is often a token-world mismatch rather than a wrong ID.

Mercado Pago publishes separate test accounts and test card numbers for the sandbox; use
those with a `TEST-` token before switching over.

**The token's scopes and the account are the real boundary.** A tool the account is not
entitled to use returns an error from Mercado Pago; it is not hidden from the tool list.

---

## 4. Tools by task

Amounts are in the **account's own currency** — ARS, BRL, MXN and so on — as plain
decimal numbers. There is no currency parameter on payments; `create_preference` items
accept an optional `currency_id`, which otherwise defaults to the account currency.

Search tools paginate with `limit` (1–100, default 30) and `offset` (default 0).

Responses are the raw Mercado Pago payload, pretty-printed — no reshaping, no field
trimming.

### 4.1 Know the account first

**`get_payment_methods`** — every payment method enabled on this account. No parameters.
This is the tool that answers "is PIX available", "does this account take OXXO", and it is
where the exact `payment_method_id` strings for `create_payment` come from.

Method availability differs by country and by account, so the values cannot be guessed:
`pix` exists in Brazil, `rapipago` in Argentina, `oxxo` in Mexico.

### 4.2 Charging a customer

**`create_payment`** — a direct charge. Required: `transaction_amount`, `description`,
`payment_method_id` (from `get_payment_methods`) and `payer_email`. Optional:

| Parameter | Purpose |
|---|---|
| `token` | Card token produced by the front-end SDK — **required for card payments** |
| `installments` | Number of instalments; cards only |
| `external_reference` | Your own order ID, and the main way to find the payment later |
| `notification_url` | Webhook for status updates |
| `metadata` | Arbitrary key-value data stored with the payment |

Card numbers never pass through this server: Mercado Pago requires the card to be
tokenised in the customer's browser by the front-end SDK, and only the resulting `token`
is accepted. A card charge without `token` will be rejected by the API.

Voucher and transfer methods (PIX, OXXO, Rapipago) need no token. They return a payment in
a pending state along with the data the customer needs to pay — read it from the response.

**`get_payment`** — full detail for one `payment_id`: status, amount, payer, fees,
refunds.

**`search_payments`** — the reconciliation tool. All parameters optional:
`external_reference`, `status` (`pending`, `approved`, `authorized`, `in_process`,
`in_mediation`, `rejected`, `cancelled`, `refunded`, `charged_back`), `begin_date` and
`end_date` (ISO 8601, e.g. `2026-01-01T00:00:00Z`), `range` — which date field the window
applies to: `date_created` (default), `date_last_updated`, `date_approved`,
`money_release_date` — plus `limit` and `offset`.

Choosing `range` matters: settlement reporting usually wants `date_approved` or
`money_release_date`, not `date_created`.

**`refund_payment`** — required `payment_id`; optional `amount` for a partial refund.
Omitting `amount` refunds the payment in full.

### 4.3 Hosted checkout (preferences)

A preference is a checkout session: you describe the cart, Mercado Pago returns a hosted
page URL (`init_point`) that the customer opens and pays on.

**`create_preference`** — required: a non-empty `items` array, each item with `title`,
`quantity` and `unit_price`; `currency_id` and `description` are optional per item.
Optional at the top level: `payer_email`, `payer_name`, `external_reference`, `back_urls`
(an object with `success`, `failure`, `pending` URLs), `notification_url`, and
`auto_return` (`approved` or `all`).

The response carries `init_point` — the link to send the customer — and `id`, the
preference ID.

**`get_preference`** — one preference by `preference_id`.

**`update_preference`** — required `preference_id` and `patch`: a free-form object of
fields to change (items, `back_urls`, expiration…). The patch is sent to Mercado Pago
verbatim, with no schema on this side — see section 6.4.

### 4.4 Merchant orders

A merchant order is the orchestrating entity that ties a preference to the payments and
shipments made against it. Use it when one order can be covered by more than one payment.

**`search_merchant_orders`** — optional `external_reference`, `preference_id`, `status`,
plus `limit` and `offset`.

**`get_merchant_order`** — one order by `merchant_order_id`.

---

## 5. Ready-made scenarios

**1. "Which payments were approved yesterday?"**
`search_payments` (`status: "approved"`, `range: "date_approved"`,
`begin_date: "2026-09-02T00:00:00Z"`, `end_date: "2026-09-03T00:00:00Z"`, `limit: 100`).
Using the default `range: "date_created"` here would answer a different question — when
the payment was started, not when it cleared.

**2. "Create a checkout link for 2 books at 100 each."**
`create_preference` (`items: [{title: "Book", quantity: 2, unit_price: 100}]`,
`external_reference: "ORDER-2026-09-03-001"`,
`back_urls: {success: "https://mystore.com/thanks"}`, `auto_return: "approved"`) → send
the `init_point` from the response to the customer.

**3. "Did order ORDER-2026-09-03-001 get paid?"**
`search_payments` (`external_reference: "ORDER-2026-09-03-001"`). If the order may be
covered by several payments: `search_merchant_orders` with the same reference, then
`get_merchant_order` for the full picture.

**4. "Refund 500 of a 1000 payment."**
`get_payment` (`payment_id` — confirm status and amount) → `refund_payment`
(`payment_id`, `amount: 500`) → `get_payment` again to see the refund recorded.

**5. "Is PIX available on this account?"**
`get_payment_methods`. The same call gives you the exact `payment_method_id` values to use
in `create_payment`.

**6. "Charge 1500 to a tokenised card in 6 instalments."**
`get_payment_methods` (confirm the card brand ID, e.g. `visa`) → `create_payment`
(`transaction_amount: 1500`, `description`, `payment_method_id: "visa"`,
`payer_email`, `token` from the front-end SDK, `installments: 6`,
`external_reference`).

**7. "Take a PIX payment."**
`create_payment` (`payment_method_id: "pix"`, `transaction_amount`, `description`,
`payer_email`) — no `token`. The response comes back pending with the PIX data the
customer needs; poll `get_payment` or use `notification_url` for the status change.

**8. "Change the success URL on an existing checkout."**
`get_preference` (`preference_id` — read the current shape) → `update_preference`
(`preference_id`, `patch: {back_urls: {success: "https://newdomain.com/ok"}}`). Read
section 6.4 before patching: the object replaces, it does not merge.

---

## 6. Limits and pitfalls

### 6.1 Test and production are separated only by the token

Same host, same endpoints. A `TEST-` token sees only sandbox objects; an `APP_USR-` token
sees only production ones. The most common confusing symptom is a `404` on a payment ID
that plainly exists — check which token the process is running with before hunting for the
ID.

There is no tool in this server that reports which world you are in; the token prefix in
the configuration is the answer.

### 6.2 Money-moving calls are not retried — and carry no idempotency key

Retries run only for read requests (GET). `create_payment`, `refund_payment`,
`create_preference` and `update_preference` are sent with POST or PUT and are **not**
repeated after a timeout, a `5xx` or a dropped connection. The error text gains a note
telling you to check before repeating.

That behaviour is deliberate and important here: this server sends no `X-Idempotency-Key`
header on any request. A manual retry of `create_payment` charges the customer a second
time; a retry of `refund_payment` refunds twice.

The rule: after an ambiguous failure on a payment or refund, call `search_payments` with
your `external_reference` (or `get_payment`) and decide from the actual state. This is
also the strongest argument for always setting `external_reference` — without it, finding
the possibly-created payment is much harder.

Reads are retried up to three times with a `1000 × 2^(attempt−1)` ms delay, capped at
8 seconds. The per-request timeout is 15 seconds and is not configurable.

### 6.3 Card data never passes through here

`create_payment` accepts a card `token`, never a card number, expiry or CVV. Tokenisation
happens in the customer's browser through Mercado Pago's front-end SDK, and the token is
short-lived and single-use.

Two consequences: the agent cannot take card details in a chat and charge them — there is
no path for that — and a token cannot be reused for a second charge. Recurring billing is
not covered by this tool set at all.

### 6.4 `update_preference` has no schema on this side

The `patch` parameter is a free-form object sent to Mercado Pago verbatim. Nothing
validates it here, so a misspelled field is not caught before the request; and because the
API replaces the objects it receives, patching `back_urls` with only `success` can drop
`failure` and `pending`.

Read the current preference with `get_preference` first and send back the complete
sub-object you intend to have, not just the field you are changing.

### 6.5 Nothing is cancelled or captured here

The tool set has no payment cancellation, no capture of an authorised payment, no
preference deletion, no customer or card management, and no webhook administration. A
payment in `authorized` state cannot be captured through this server, and a pending
voucher payment cannot be cancelled through it either — both are dashboard or direct-API
operations.

`refund_payment` is the only way money goes back, and it applies to a payment that has
already been approved.

### 6.6 Search windows, statuses and pagination

`limit` caps at 100 and `offset` starts at 0; a full export is a loop over `offset`.
Dates are ISO 8601 with a timezone — `2026-01-01` alone is not the same as
`2026-01-01T00:00:00Z`, and Mercado Pago interprets bare values inconsistently. Always
send the full form.

The `status` values are a closed list validated before the request:
`pending`, `approved`, `authorized`, `in_process`, `in_mediation`, `rejected`,
`cancelled`, `refunded`, `charged_back`. Anything else is rejected as a validation error
rather than silently returning nothing.

`search_merchant_orders`, by contrast, takes `status` as a free-text string — no
validation, and a wrong value returns an empty list.

### 6.7 Output size

Responses are returned whole. A Mercado Pago payment object is large — payer, card
metadata, fee breakdown, refunds — so `search_payments` with `limit: 100` produces a very
large answer.

Output longer than 50 000 characters is truncated with a note. Keep `limit` at 20–50 for
interactive work and page with `offset`.

Text from responses (descriptions, payer names, metadata) passes through a filter:
constructions such as "ignore previous instructions" and `<system>` tags are replaced with
`[filtered]`. Disable with `MCP_DISABLE_SANITIZE=true`.

### 6.8 One account, one country

The market and currency follow the account behind the token. There is no parameter to
switch country, and amounts carry no currency on payments. A server instance therefore
serves exactly one Mercado Pago account; multiple markets mean multiple server entries
with different tokens.

---

## 7. Common errors

Errors reach the model as a result with `isError: true`, classified by HTTP status, with
the message from Mercado Pago's response body appended after `Детали:`.

| What you see | What it means | What to do |
|---|---|---|
| `MERCADOPAGO_ACCESS_TOKEN is required. Get it at https://www.mercadopago.com.ar/developers/panel/credentials …` | The token never reached the process; surfaces on the first tool call, not at startup | Set it in the client's `env` block and restart the client |
| Access denied, HTTP 401 | The token is invalid, expired or revoked | Copy it again from Developers panel → Credentials |
| Access denied, HTTP 403 | The token is valid but the account may not perform this operation | Check the application's scopes and the account's enabled products |
| Resource not found, HTTP 404 | No such payment, preference or merchant order — **or** a test/production token mismatch | Section 6.1: confirm which token the process runs with, then verify the ID via `search_payments` |
| HTTP 400 with `payment_method_id` | The method does not exist or is not enabled for this account/country | Take the exact value from `get_payment_methods` |
| HTTP 400 about a missing card token | A card charge was sent without `token` | Tokenise the card in the front end and pass the resulting `token` |
| HTTP 400 about `installments` | Instalments not supported for that method, or the count is not offered | Instalments apply to cards only; check the allowed counts for the brand |
| HTTP 400 on a refund | The payment is not in a refundable state, or the amount exceeds what remains | `get_payment` first: check `status` and any refunds already applied |
| `Rate limit. Retry in Ns` (HTTP 429) | Mercado Pago's rate limit; reads have already been retried three times | Pause; lower `limit`, spread the export over time |
| `Request timeout` | No response within 15 seconds | For reads, retry with a smaller `limit`; for payments and refunds see the next row |
| `Повтор не выполнен автоматически, потому что операция изменяет данные…` | An ambiguous failure on a payment, refund or preference; the outcome is unknown | **Do not retry blindly.** Section 6.2: check with `search_payments` using your `external_reference` |
| Validation error naming a parameter | The MCP schema rejected the arguments before any request — e.g. an unknown `status`, `limit` above 100, a non-positive amount, a malformed email | Correct the argument against the lists in section 4 |
| Empty `results` in a search | The request succeeded, nothing matched | Check `range` — the default `date_created` is not `date_approved`; check the date format is full ISO 8601 |
| Response truncated with a `[Truncated…]` note | Output exceeded 50 000 characters | Lower `limit`, page with `offset` |
| Fields disappeared after `update_preference` | The patch replaced an object instead of merging into it | Section 6.4: read with `get_preference` and send the complete sub-object |

The server log goes to **stderr** — stdout carries the JSON-RPC protocol. Retry warnings
and the startup line with the tool count appear there.

---

MIT licence. Source: `servers/mercadopago` in the
[WWmcp](https://github.com/theYahia/WWmcp) monorepo.
