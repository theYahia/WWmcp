/**
 * examples/check_balance.ts — end-to-end demo: print the seller's Avito
 * wallet balance and alert if it's under a threshold (default 500 ₽).
 *
 * Run (requires real Avito OAuth credentials):
 *   AVITO_CLIENT_ID=... AVITO_CLIENT_SECRET=... AVITO_USER_ID=... \
 *     tsx servers/avito/examples/check_balance.ts
 *
 * Typical use: cron this nightly, route the printed alert into Telegram.
 */

import { handleGetAccountBalance } from "../src/tools/get-account-balance.js";

const LOW_BALANCE_THRESHOLD_RUB = 500;

async function main(): Promise<void> {
  if (!process.env["AVITO_CLIENT_ID"] || !process.env["AVITO_CLIENT_SECRET"]) {
    console.error(
      "Set AVITO_CLIENT_ID + AVITO_CLIENT_SECRET (+ optionally AVITO_USER_ID) before running.",
    );
    process.exit(1);
  }

  console.error("→ Fetching Avito wallet balance...");
  const raw = await handleGetAccountBalance({});
  const balance = JSON.parse(raw) as { real?: number; bonus?: number };

  const real = balance.real ?? 0;
  const bonus = balance.bonus ?? 0;
  const total = real + bonus;

  console.log(JSON.stringify({ real, bonus, total }, null, 2));

  if (real < LOW_BALANCE_THRESHOLD_RUB) {
    console.error(
      `⚠ ALERT: real balance ${real} ₽ is below threshold ${LOW_BALANCE_THRESHOLD_RUB} ₽. ` +
        `Top up before promotion services lapse.`,
    );
    process.exit(2);
  } else {
    console.error(`✓ Balance OK (${real} ₽ real + ${bonus} ₽ bonus).`);
  }
}

main().catch((err: unknown) => {
  console.error(
    "check_balance demo failed:",
    err instanceof Error ? err.message : String(err),
  );
  process.exit(1);
});
