/**
 * Optional mutual-TLS (mTLS) scaffold for the Alfa API.
 *
 * The production Alfa API mandates an mTLS connection (client certificate +
 * private key) for ALL calls — including the sandbox. Node's global `fetch`
 * (undici) does not expose a per-request TLS client cert, so we install a
 * process-wide undici dispatcher when the relevant env vars are present.
 *
 * Env vars (each may be an inline PEM string or a path to a PEM file):
 *   - ALFA_TLS_CERT  client certificate (required to enable mTLS)
 *   - ALFA_TLS_KEY   client private key (required to enable mTLS)
 *   - ALFA_TLS_CA    CA bundle (optional)
 *
 * Without these the server runs in demo mode and will not reach the live API.
 */
import { readFileSync } from "node:fs";
import { Agent, setGlobalDispatcher } from "undici";

/** Reads a PEM from an inline value or a file path. */
function readPem(value: string): string {
  return value.includes("-----BEGIN") ? value : readFileSync(value, "utf8");
}

/**
 * Installs a global mTLS dispatcher if ALFA_TLS_CERT + ALFA_TLS_KEY are set.
 * Returns true when mTLS was configured, false when running without it.
 */
export function configureMtlsFromEnv(): boolean {
  const certEnv = process.env.ALFA_TLS_CERT;
  const keyEnv = process.env.ALFA_TLS_KEY;
  const caEnv = process.env.ALFA_TLS_CA;

  if (!certEnv || !keyEnv) {
    return false;
  }

  const cert = readPem(certEnv);
  const key = readPem(keyEnv);
  const ca = caEnv ? readPem(caEnv) : undefined;

  setGlobalDispatcher(
    new Agent({
      connect: ca ? { cert, key, ca } : { cert, key },
    }),
  );
  return true;
}
