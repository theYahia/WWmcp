# JazzCash MCP — accept Pakistani mobile wallet payments from an AI assistant

If you were looking for a way to take JazzCash payments from Claude or another AI assistant, charge a CNIC-enabled Mobile Account, issue an over-the-counter voucher or refund a transaction without writing gateway code, this is it. 5 tools cover Mobile Wallet payments, Mobile Account payments, OTC vouchers, status inquiry and refunds. Requests are signed with the JazzCash HMAC-SHA256 secure hash, and responses are hash-verified.

## Tools (5)

| Tool | Type | Description |
|------|------|-------------|
| `create_payment` | write | Mobile Wallet (MWALLET) payment |
| `create_mobile_account_payment` | write | CNIC-enabled Mobile Account payment (MWALLET) |
| `create_voucher` | write | Over-The-Counter (OTC) voucher — returns a voucher number redeemed offline at an outlet |
| `check_payment_status` | read | Transaction status inquiry (`PaymentInquiry/Inquire`) |
| `refund_payment` | write, destructive | Refund a transaction (`authorize/Refund`; card transactions per JazzCash) |

## Quick Start

```json
{
  "mcpServers": {
    "jazzcash": {
      "command": "npx",
      "args": ["-y", "@theyahia/jazzcash-mcp"],
      "env": {
        "JAZZCASH_MERCHANT_ID": "<YOUR_MERCHANT_ID>",
        "JAZZCASH_PASSWORD": "<YOUR_PASSWORD>",
        "JAZZCASH_INTEGRITY_SALT": "<YOUR_SALT>",
        "JAZZCASH_ENV": "sandbox"
      }
    }
  }
}
```

## Environment Variables

| Variable | Required | Default | Description |
|----------|----------|---------|-------------|
| `JAZZCASH_MERCHANT_ID` | Yes | — | Merchant ID from the JazzCash portal |
| `JAZZCASH_PASSWORD` | Yes | — | Merchant password |
| `JAZZCASH_INTEGRITY_SALT` | Yes | — | HMAC integrity salt (shared secret) |
| `JAZZCASH_ENV` | No | `sandbox` | `sandbox` or `production` |
| `JAZZCASH_BASE_URL` | No | — | Full base URL override (e.g. for staging); takes precedence over `JAZZCASH_ENV` |

The server **fails fast at startup** if the three required credentials are missing.

## Amounts

All `amount` parameters are in **PKR rupees** (e.g. `5000` = 5000 PKR). The server converts to paisa
(`amount × 100`, no decimal point) before signing, because JazzCash's `pp_Amount` is expressed in the
lowest denomination. So `5000` is sent to JazzCash as `pp_Amount=500000`.

## Sandbox vs Production

| Environment | Host |
|-------------|------|
| sandbox (default) | `https://sandbox.jazzcash.com.pk/ApplicationAPI/API` |
| production | `https://payments.jazzcash.com.pk/ApplicationAPI/API` |

The default is **sandbox** for safety. Set `JAZZCASH_ENV=production` (or a full `JAZZCASH_BASE_URL`) to go live.

> **Verify endpoints against your merchant portal.** JazzCash exposes the same operation under slightly
> different path/version conventions depending on the merchant-account generation, and the modern
> token-wallet endpoint differs from the documented Payment API. The endpoint paths in `src/config.ts`
> are best-evidence canonical values cross-checked against the official docs and multiple integrations;
> confirm the exact paths and whether `pp_Version` is expected against the per-merchant API URLs shown in
> your JazzCash merchant portal before transacting real money.

## Security

- **Request signing** — every request carries an HMAC-SHA256 `pp_SecureHash` (integrity salt as both the
  prepended prefix and the HMAC key; empty fields excluded; lowercase hex). Verified against the official
  worked test vector in the test suite.
- **Response verification** — responses that include a `pp_SecureHash` are recomputed and compared
  (constant-time); a mismatch raises an error rather than returning unverified data.
- **No secret leakage** — `pp_Password`/`pp_SecureHash` are stripped from tool output, and upstream error
  bodies are never echoed back to the model (only redacted to stderr).

## Demo Prompts

- "Create a JazzCash payment of 5000 PKR to 03001234567"
- "Check the status of transaction TXN-001"
- "Refund 3000 PKR for transaction TXN-001"
- "Create an OTC voucher for 2000 PKR for 03001234567 (CNIC 123456)"

## Removed in 2.0 (and why)

`2.0.0` removed three tools that targeted JazzCash endpoints which **do not exist**, verified against the
official documentation and multiple independent integrations:

- `get_balance` — JazzCash has no balance-inquiry API.
- `redeem_voucher` — voucher redemption happens offline at a JazzCash outlet, not via a merchant API.
- `inquire_transaction` — duplicated `check_payment_status`; both now use the canonical `PaymentInquiry/Inquire`.

Other breaking changes: `create_mobile_account_payment` now uses the real `MWALLET` transaction type (there
is no `MA` type), `create_voucher` now issues an OTC voucher, amounts are in **rupees** (auto-converted to
paisa), and `txn_ref` is optional (auto-generated when omitted). See [CHANGELOG.md](./CHANGELOG.md).

## Development

```bash
npm install
npm run build   # tsc → dist/
npm test        # vitest (schema, hash test-vector, response verification, fetch mocking)
npm run dev     # run from source via tsx
```

## License

MIT

---

Telegram: [@vhodvai](https://t.me/vhodvai)
