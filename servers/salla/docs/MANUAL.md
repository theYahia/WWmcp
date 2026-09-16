# salla-mcp user manual

Package `@theyahia/salla-mcp`, version 3.1.0, 22 tools. Node.js 18 or newer.
Salla Merchant API v2, base URL `https://api.salla.dev/admin/v2`.

Sections: [1. Purpose](#1-what-this-is-and-who-needs-it) · [2. Install](#2-installation-and-connection) ·
[3. Token](#3-where-to-get-the-access-token) · [4. Tools](#4-tools-by-task) ·
[5. Scenarios](#5-ready-made-scenarios) · [6. Limits](#6-limits-and-pitfalls) ·
[7. Errors](#7-common-errors)

---

## 1. What this is and who needs it

The server gives an AI agent access to a Salla store: products and categories, stock,
orders and their fulfilment statuses, customers, coupons, abandoned carts, branches,
brands, and store settings. The work it removes is the switching between a question and
the merchant dashboard: "which orders are still waiting to be confirmed", "set SKU-4410
stock to 120", "create a product for 150 SAR", "mark order 1001 as completed".

Who needs it: a merchant who spends the day between chat and the dashboard; an operations
person reconciling stock across a catalogue; an integrator syncing Salla with an external
warehouse or ERP.

One tool is built specifically for volume: `bulk_update_quantities` updates stock for many
products in a single call, so a catalogue sync is not two hundred separate requests.

Responses are returned as the Salla API produced them, formatted as JSON — no reshaping
and no field trimming. That is deliberate: Salla product and order objects carry
store-specific fields, and any summary would drop some of them.

---

## 2. Installation and connection

### Claude Desktop

In `claude_desktop_config.json`:

```json
{
  "mcpServers": {
    "salla": {
      "command": "npx",
      "args": ["-y", "@theyahia/salla-mcp"],
      "env": {
        "SALLA_ACCESS_TOKEN": "your_oauth_access_token"
      }
    }
  }
}
```

The client reads its configuration at startup — restart it after editing.

### Claude Code

```
claude mcp add salla -e SALLA_ACCESS_TOKEN=your_token -- npx -y @theyahia/salla-mcp
```

### Cursor / Windsurf / VS Code (Copilot)

Cursor and Windsurf take the same `mcpServers` block in `.cursor/mcp.json` or
`.windsurf/mcp.json`. VS Code uses `.vscode/mcp.json`, where the root key is `servers`,
not `mcpServers`; `command`, `args` and `env` are the same. A workspace file is usually
under version control — do not keep `SALLA_ACCESS_TOKEN` in it.

### Streamable HTTP transport

```bash
HTTP_PORT=3000 SALLA_ACCESS_TOKEN=your_token npx @theyahia/salla-mcp
# equivalently: npx @theyahia/salla-mcp --http
```

The mode is enabled by the `--http` flag or by setting `HTTP_PORT` (default 3000).
Endpoints: `POST /mcp` (requests; an initialize request opens a session), `GET /mcp`
(SSE stream for an existing session), `DELETE /mcp` (session termination), `GET /health`
(`status`, `server`, `version`, `uptime`, `memory_mb`, `tools`). Sessions are keyed by the
`mcp-session-id` header; browser cross-origin calls are rejected by default — the allow
list is empty.

The token comes from the process environment and is shared by every session: everyone
connected acts on the same store. `/mcp` has no authentication of its own, and access to
the port is equivalent to write access to the store — do not publish it on an untrusted
network.

### Environment variables

| Variable | Required | Purpose |
|---|---|---|
| `SALLA_ACCESS_TOKEN` | yes | OAuth 2.0 access token; sent as `Authorization: Bearer …` |
| `HTTP_PORT` | no | Port for HTTP mode; setting it also enables the mode |
| `MCP_DISABLE_SANITIZE` | no | `true` disables prompt-injection filtering of responses |

A missing token is discovered **on the first tool call**, not at startup — the client is
built lazily. The message names the variable and where to obtain it.

---

## 3. Where to get the access token

Salla uses OAuth 2.0. There is no plain "API key":

1. Register an app at [Salla Partners](https://salla.partners/) (Apps → OAuth
   credentials).
2. Complete the OAuth flow and obtain an access token for the store.
3. Pass it as `SALLA_ACCESS_TOKEN`.

Salla developer documentation: <https://docs.salla.dev/>.

**Refresh is not handled by this server.** There is no `SALLA_REFRESH_TOKEN` and no
refresh call anywhere in the code. When the access token expires, every tool starts
returning an authentication error and the token has to be replaced in the client
configuration. If the integration is long-lived, run the refresh flow externally and feed
the current access token into the environment.

**The token's scopes are the real boundary.** A tool whose scope was not granted is not
hidden from the list — it returns an error from Salla. Restricting what the agent may do
is done by the scopes of the OAuth app, not by how the request is phrased. For a
read-only assistant, issue a token without write scopes; the write tools will then fail
loudly instead of changing the store.

---

## 4. Tools by task

List tools paginate with `page` (starts at 1) and `per_page` (1–50, default 25).
`list_categories` is the exception: it takes `page` but no `per_page`.

All responses are the raw Salla payload, pretty-printed.

### 4.1 Store and reference data

**`get_store_info`** — store name, currency, timezone, plan. No parameters. Worth calling
first: the currency it reports is the currency every price in the other tools is
expressed in.

**`list_order_statuses`** — the statuses and sub-statuses configured for this store. No
parameters. Store owners customise these, so read them before filtering or changing
orders.

**`list_branches`** — branches, locations and pickup points; `page`, `per_page`. Branch
IDs from here go into the `branch` field of a bulk stock update.

**`list_brands`** — brands; `page`, `per_page`.

### 4.2 Products

**`list_products`** — `page`, `per_page`, and an optional `status` filter: `sale`, `out`,
`hidden`, `deleted`.

**`get_product`** — full product by numeric `product_id`.

**`get_product_by_sku`** — full product by `sku` string. Use this when you have a
warehouse code rather than a Salla ID.

**`create_product`** — `name` and `price` are required. `product_type` defaults to
`product` and also accepts `service`, `digital`, `food`, `codes`. Optional: `quantity`,
`description`, `sku`.

**`update_product`** — `product_id` is required; `name`, `price`, `quantity` and `status`
(`sale`, `out`, `hidden`) are optional and only the supplied fields are sent. Note that
`update_product` cannot set a product to `deleted` — that is `delete_product`.

**`delete_product`** — permanent deletion by `product_id`. There is no undo and no
tool to restore it.

**`bulk_update_quantities`** — stock for many items in one call. Required: a non-empty
`products` array. Each entry takes:

| Field | Values | Required |
|---|---|---|
| `identifer_type` | `id`, `variant_id`, `sku` | yes |
| `identifer` | the ID or SKU value, as a string | yes |
| `quantity` | non-negative integer | yes |
| `mode` | `overwrite` (default), `increment`, `decrement` | no |
| `unlimited_quantity` | boolean — mark the item as unlimited stock | no |
| `branch` | branch ID to scope the change to | no |
| `reason_id` | reason ID for the inventory movement | no |

The misspelling `identifer` is Salla's, not a typo in this manual — the field name is
passed through verbatim, and `identifier` will be rejected.

### 4.3 Categories

**`list_categories`** — `page`, optional `keyword` (matches the category name) and
`status` (`active`, `hidden`).

**`get_category`** — single category by `category_id`.

**`create_category`** — `name` is required; `status` (`active`, `hidden`), `parent_id`
(for a subcategory), `sort_order` and `image` (URL) are optional.

There is no tool to update or delete a category.

### 4.4 Orders

**`list_orders`** — `page`, `per_page`, optional `status` (a free-text string, e.g.
`completed`, `under_review` — take exact values from `list_order_statuses`).

**`get_order`** — full order by `order_id`: customer, items, totals.

**`update_order_status`** — required `order_id` and `status`, one of `completed`,
`in_progress`, `under_review`, `cancelled`, `restoring`, `refunded`. These six are fixed
in the tool schema; a store's custom sub-statuses cannot be set through it.

**`get_order_histories`** — the status-change timeline of an order by `order_id`.

### 4.5 Customers and marketing

**`list_customers`** — `page`, `per_page`.

**`get_customer`** — single customer by `customer_id`, including group membership.

**`list_coupons`** — discount coupons; `page`, `per_page`.

**`list_abandoned_carts`** — abandoned carts for recovery workflows; `page`, `per_page`.

---

## 5. Ready-made scenarios

**1. "Which orders are still waiting to be confirmed?"**
`list_order_statuses` (read the exact status strings this store uses) → `list_orders`
(`status: "under_review"`, `per_page: 50`). Status names are store-configurable, so do
not guess them.

**2. "Set SKU-4410 stock to 120."**
`bulk_update_quantities` with a single entry: `identifer_type: "sku"`,
`identifer: "SKU-4410"`, `quantity: 120`. To verify: `get_product_by_sku`. Remember the
update is queued (section 6.2).

**3. "Sync stock for the whole catalogue."**
`list_products` (paginate to collect SKUs) → one `bulk_update_quantities` call carrying
all the entries. Splitting this into per-product `update_product` calls costs one HTTP
request each and is the wrong shape for the task.

**4. "Create a product: Premium Dates, 150 SAR, stock 100."**
`get_store_info` (confirm the currency) → `create_product` (`name`, `price: 150`,
`product_type: "product"`, `quantity: 100`, `sku`) → `get_product` on the returned ID.

**5. "Mark order 1001 as completed."**
`get_order` (`order_id: 1001` — confirm it is the right order and its current state) →
`update_order_status` (`order_id: 1001`, `status: "completed"`) → `get_order_histories`
to confirm the transition was recorded.

**6. "Which products are out of stock?"**
`list_products` (`status: "out"`, `per_page: 50`), paginating through `page`.

**7. "How many customers do we have, and who are the newest?"**
`list_customers` (`page: 1`, `per_page: 50`). The total count comes from Salla's own
pagination block in the response.

**8. "Recover abandoned carts from this week."**
`list_abandoned_carts` (`per_page: 50`) → `get_customer` for the contacts worth reaching
out to → `list_coupons` to pick an existing discount code to offer.

**9. "Add a subcategory under Sweets."**
`list_categories` (`keyword: "Sweets"`, take the ID) → `create_category` (`name`,
`parent_id`, `status: "active"`).

---

## 6. Limits and pitfalls

### 6.1 Writing operations are not retried automatically

Retries run only for read requests (GET). Every create, update and delete —
`create_product`, `update_product`, `delete_product`, `bulk_update_quantities`,
`create_category`, `update_order_status` — is sent with POST, PUT or DELETE and is **not**
repeated after a timeout, a `5xx` or a dropped connection. The error text gains a note
telling you to check the store before repeating, because a blind retry would create a
second product or apply a stock change twice.

Reads are retried up to three times with a `1000 × 2^(attempt−1)` ms delay, capped at
8 seconds. The per-request timeout is 15 seconds and is not configurable through an
environment variable.

In practice: after a failed `create_product`, search with `list_products` or
`get_product_by_sku` before trying again.

### 6.2 Bulk stock updates are queued

`bulk_update_quantities` returns as soon as Salla accepts the batch. The response is an
acknowledgement, not a result: the quantities are applied asynchronously and may take
minutes. Reading a product immediately afterwards can still show the old number.

Verify by re-reading the product a little later (`get_product_by_sku`), not by repeating
the bulk call — a repeat with `mode: "increment"` would add the delta a second time.

Note the interaction between `mode` and repeats: `overwrite` is safe to reapply,
`increment` and `decrement` are not.

### 6.3 Deletion is permanent

`delete_product` removes the product outright. There is no restore tool, and no
confirmation step in the server: the model can call it exactly the way it calls a read.
If an agent should never be able to do this, issue an OAuth token without the
corresponding write scope — that is the only real barrier.

`status: "hidden"` via `update_product` is the reversible alternative when the goal is
just to take a product off the storefront.

### 6.4 What the tool set does not cover

- **No category update or delete** — only `list`, `get` and `create`.
- **No customer create or update** — customers are read-only here.
- **No coupon create, update or delete** — `list_coupons` only.
- **No refund, invoice or shipment tools.** `update_order_status` can set `refunded` as a
  fulfilment state, but no money is moved by this server.
- **No webhook management.**
- **No product search by keyword.** `list_categories` accepts `keyword`; products do not.
  Finding a product means either its ID, its SKU, or paginating `list_products`.

### 6.5 Pagination caps at 50

`per_page` has a hard ceiling of 50 and defaults to 25. A full catalogue export is a loop
over `page` using the pagination block Salla returns. `list_categories` has no `per_page`
at all — it pages at whatever size the API defaults to.

Responses longer than 50 000 characters are truncated with a note. Salla product objects
are large, so `list_products` with `per_page: 50` can approach that limit — reduce
`per_page` if output is being cut.

Text from responses (product names, descriptions, customer notes) passes through a filter:
constructions such as "ignore previous instructions" and `<system>` tags are replaced with
`[filtered]`. Disable with `MCP_DISABLE_SANITIZE=true`.

### 6.6 Store-specific values cannot be guessed

Order statuses, categories, branches and brands are configured per store.
`update_order_status` accepts six fixed fulfilment values, but `list_orders`'s `status`
filter is a free-text string matched against this store's configuration. Reading
`list_order_statuses` first is the difference between a filter that works and an empty
result.

The same applies to currency: prices in `create_product` and `update_product` carry no
currency field — they are in the store's currency, which `get_store_info` reports.

### 6.7 The token does not refresh itself

Section 3 covers this, and it is the most common reason a working setup stops working
after a while: an expired access token turns every tool into an authentication error at
once. If all 22 tools fail simultaneously with a 401, the token — not the store — is the
problem.

---

## 7. Common errors

Errors reach the model as a result with `isError: true`. Transport failures are classified
by HTTP status, and the message from Salla's response body is appended after `Детали:`.

| What you see | What it means | What to do |
|---|---|---|
| `SALLA_ACCESS_TOKEN is required. Get it from https://salla.partners/ (Apps → OAuth credentials).` | The token never reached the process; surfaces on the first tool call, not at startup | Set it in the client's `env` block and restart the client |
| Access denied, HTTP 401 | The token is expired, revoked, or belongs to another store | Run the OAuth flow again and replace the token — this server does not refresh (section 6.7) |
| Access denied, HTTP 403 | The token is valid but the app lacks the scope for this operation | Grant the scope to the OAuth app in Salla Partners and re-issue the token |
| Resource not found, HTTP 404 | No object with that ID or SKU | Verify with `list_products` / `list_orders`; `get_product` takes a numeric ID, `get_product_by_sku` a string |
| HTTP 422 with a field name | Salla rejected the payload: a missing required field, a value out of range, an unknown status | Read the field name in the message; check `per_page` ≤ 50 and status values against `list_order_statuses` |
| `identifer` rejected in a bulk update | The field was spelled `identifier` | Use Salla's spelling: `identifer` and `identifer_type` |
| `Rate limit. Retry in Ns` (HTTP 429) | Salla's rate limit was hit; reads have already been retried three times | Pause; lower `per_page`, spread the export over time |
| `Request timeout` | No response within 15 seconds | For reads, repeat with a smaller `per_page`; for writes, check the store before repeating |
| `Повтор не выполнен автоматически, потому что операция изменяет данные…` | An ambiguous failure on a write; the outcome is unknown | Section 6.1: check with `list_products` / `get_order` before retrying |
| Validation error naming a parameter | The MCP schema rejected the arguments before any request was sent — e.g. `per_page` above 50, a negative `quantity`, an unknown `product_type` | Correct the argument; `product_type` is one of `product`, `service`, `digital`, `food`, `codes` |
| Stock unchanged right after a bulk update | The batch is queued, not applied | Section 6.2: re-read the product later; do not repeat the call |
| Empty list in the response | The request succeeded, nothing matched | Check the `status` filter; for products the values are `sale`, `out`, `hidden`, `deleted` |
| Response truncated with a `[Truncated…]` note | The output exceeded 50 000 characters | Lower `per_page` and page through |

The server log goes to **stderr** — stdout carries the JSON-RPC protocol. Retry warnings
and the startup line with the tool count appear there.

---

MIT licence. Source: `servers/salla` in the
[WWmcp](https://github.com/theYahia/WWmcp) monorepo.
