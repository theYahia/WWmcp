import { spawn } from "node:child_process";
import { randomUUID } from "node:crypto";
import { createServer } from "node:http";
import {
  buildAuthorizeUrl,
  clientCredentialsToken,
  createConsent,
  exchangeCode,
  type OAuthConfig,
} from "./oauth.js";
import { defaultTokenStorePath, saveTokens } from "./tokenStore.js";

const HELP = `tochka-bank-mcp auth — one-time OAuth authorization

Runs the Tochka OAuth hybrid flow (client_credentials -> consent -> authorize
-> authorization_code) and saves the resulting tokens so the MCP server can
refresh them automatically.

Required env:
  TOCHKA_CLIENT_ID       OAuth client id
  TOCHKA_CLIENT_SECRET   OAuth client secret
Optional env:
  TOCHKA_BASE_URL        API base (default https://enter.tochka.com/uapi)
  TOCHKA_REDIRECT_URI    Must match a redirect URI registered for your app
                         (default http://localhost:8765/callback)
  TOCHKA_TOKEN_STORE     Where to save tokens (default ~/.config/tochka-bank-mcp/tokens.json)

The redirect URI's host must be a loopback address (localhost/127.0.0.1) so this
command can capture the authorization code.`;

function openBrowser(url: string): void {
  const platform = process.platform;
  const cmd = platform === "win32" ? "cmd" : platform === "darwin" ? "open" : "xdg-open";
  const args = platform === "win32" ? ["/c", "start", "", url] : [url];
  try {
    const child = spawn(cmd, args, { stdio: "ignore", detached: true });
    child.on("error", () => {});
    child.unref();
  } catch {
    // Best-effort; the URL is also printed so the user can open it manually.
  }
}

function waitForCode(
  redirectUri: URL,
  expectedState: string,
  timeoutMs = 300_000,
): Promise<string> {
  const port = Number(redirectUri.port) || 80;
  return new Promise((resolve, reject) => {
    const server = createServer((req, res) => {
      const url = new URL(req.url ?? "/", `http://${redirectUri.host}`);
      if (url.pathname !== redirectUri.pathname) {
        res.writeHead(404).end("Not found");
        return;
      }
      const code = url.searchParams.get("code");
      const state = url.searchParams.get("state");
      const error = url.searchParams.get("error");
      res.writeHead(200, { "Content-Type": "text/html; charset=utf-8" });
      if (error) {
        res.end(`<h1>Authorization failed</h1><p>${error}</p>`);
        cleanup();
        reject(new Error(`Authorization error: ${error}`));
        return;
      }
      if (!code || state !== expectedState) {
        res.end("<h1>Invalid callback</h1>");
        cleanup();
        reject(new Error("Invalid OAuth callback (missing code or state mismatch)"));
        return;
      }
      res.end("<h1>Authorized ✓</h1><p>You can close this tab and return to the terminal.</p>");
      cleanup();
      resolve(code);
    });

    const timer = setTimeout(() => {
      cleanup();
      reject(new Error("Timed out waiting for authorization callback"));
    }, timeoutMs);

    function cleanup() {
      clearTimeout(timer);
      server.close();
    }

    server.on("error", (err) => {
      clearTimeout(timer);
      reject(err);
    });
    server.listen(port, redirectUri.hostname);
  });
}

export async function runAuthCommand(argv: string[]): Promise<void> {
  if (argv.includes("--help") || argv.includes("-h")) {
    console.log(HELP);
    return;
  }

  const clientId = process.env.TOCHKA_CLIENT_ID;
  const clientSecret = process.env.TOCHKA_CLIENT_SECRET;
  if (!clientId || !clientSecret) {
    console.error("Missing TOCHKA_CLIENT_ID or TOCHKA_CLIENT_SECRET environment variables");
    process.exitCode = 1;
    return;
  }

  const baseUrl = process.env.TOCHKA_BASE_URL ?? "https://enter.tochka.com/uapi";
  const redirectUri = process.env.TOCHKA_REDIRECT_URI ?? "http://localhost:8765/callback";
  const cfg: OAuthConfig = { clientId, clientSecret, baseUrl };
  const ru = new URL(redirectUri);

  console.error("→ Requesting client-credentials token…");
  const cc = await clientCredentialsToken(cfg);

  console.error("→ Creating consent…");
  const consentId = await createConsent(cfg, cc.access_token);

  const state = randomUUID();
  const authorizeUrl = buildAuthorizeUrl(cfg, { consentId, state, redirectUri });

  console.error("\n→ Open this URL in your browser to authorize:\n");
  console.error(`   ${authorizeUrl}\n`);
  openBrowser(authorizeUrl);

  console.error(`→ Waiting for the callback on ${redirectUri} …`);
  const code = await waitForCode(ru, state);

  console.error("→ Exchanging authorization code for tokens…");
  const tok = await exchangeCode(cfg, code, redirectUri);

  const expiresIn = Number(tok.expires_in);
  saveTokens({
    accessToken: tok.access_token,
    accessTokenExpiresAt:
      Number.isFinite(expiresIn) && expiresIn > 60
        ? Date.now() + (expiresIn - 60) * 1000
        : undefined,
    refreshToken: tok.refresh_token,
    consentId,
    scope: tok.scope,
    obtainedAt: Date.now(),
  });

  console.error(`\n✓ Authorized. Tokens saved to ${defaultTokenStorePath()}`);
  if (tok.refresh_token) {
    console.error(
      "  For headless deployments, set TOCHKA_REFRESH_TOKEN to the refresh token (printed once below):",
    );
    console.error(`  ${tok.refresh_token}`);
  }
}
