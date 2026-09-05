# @theyahia/salutespeech-mcp

MCP server for Sber SaluteSpeech API — speech recognition (STT) and synthesis (TTS). **5 tools.**

[![npm](https://img.shields.io/npm/v/@theyahia/salutespeech-mcp)](https://www.npmjs.com/package/@theyahia/salutespeech-mcp)
[![License: MIT](https://img.shields.io/badge/License-MIT-yellow.svg)](https://opensource.org/licenses/MIT)

Part of [WWmcp](https://github.com/theYahia/WWmcp) — MCP servers for non-Western APIs — by [@theYahia](https://github.com/theYahia). · Telegram: [@vhodvai](https://t.me/vhodvai)

## Install

### Claude Desktop

```json
{
  "mcpServers": {
    "salutespeech": {
      "command": "npx",
      "args": ["-y", "@theyahia/salutespeech-mcp"],
      "env": { "SALUTESPEECH_API_KEY": "your-base64-key" }
    }
  }
}
```

### Claude Code

```bash
claude mcp add salutespeech -e SALUTESPEECH_API_KEY=your-key -- npx -y @theyahia/salutespeech-mcp
```

### Streamable HTTP mode

```bash
SALUTESPEECH_API_KEY=your-key HTTP_PORT=3000 npx @theyahia/salutespeech-mcp --http
# POST http://localhost:3000/mcp
# GET  http://localhost:3000/health
```

## Auth

Three options (checked in order):

| Env var | Format |
|---------|--------|
| `SALUTESPEECH_API_KEY` | Base64-encoded `client_id:client_secret` |
| `SALUTE_AUTH_KEY` | Same (legacy alias) |
| `SALUTE_SPEECH_CLIENT_ID` + `SALUTE_SPEECH_CLIENT_SECRET` | Raw credentials (auto-encoded) |

OAuth tokens are obtained and refreshed automatically. The scope defaults to
`SALUTE_SPEECH_PERS` (individuals); set `SALUTE_SPEECH_SCOPE` for corporate accounts
(`SALUTE_SPEECH_CORP` — postpaid, `SALUTE_SPEECH_B2B` — prepaid).
Get credentials at [developers.sber.ru](https://developers.sber.ru).

## Tools (5)

| Tool | Description |
|------|-------------|
| `recognize_speech` | STT from Base64 audio |
| `synthesize_speech` | TTS, returns Base64 audio |
| `list_models` | List recognition models and synthesis voices |
| `get_task_status` | Check async recognition task status |
| `recognize_file` | STT from a local file path |

## Skills

- `skill-transcribe` — guided workflow for audio transcription
- `skill-synthesize` — guided workflow for speech synthesis

## Examples

```
Transcribe the audio file /tmp/meeting.wav
Synthesize "Hello world" with voice Bys_24000 in wav16 format
List available voices
```

## Limits

`recognize_speech` / `recognize_file` use the **synchronous** endpoint, capped at
**2 MB / 1 minute** of audio (larger input returns HTTP 413). For multi-channel audio only
the first channel is recognized. Longer recordings need the asynchronous flow
(`data:upload` → `speech:async_recognize` → `task:get` → `data:download`) — not yet exposed
as tools; `get_task_status` covers the polling step.

Synthesis input is capped at **4000 characters** (incl. spaces and SSML markup).

## Troubleshooting

### `self-signed certificate in certificate chain` / `UNABLE_TO_VERIFY_LEAF_SIGNATURE`

Sber's endpoints use the **Russian Trusted Root CA (НУЦ Минцифры)**, which is **not** in
Node.js's default trust store — so the very first OAuth call fails until you trust it.

Fix: download the root CA (`russian_trusted_root_ca_pem.crt`) from
[gosuslugi.ru/crt](https://www.gosuslugi.ru/crt) and point Node at it:

```bash
export NODE_EXTRA_CA_CERTS=/path/to/russian_trusted_root_ca_pem.crt
```

In an MCP client, add it to the server's `env` block. **Do not** set
`NODE_TLS_REJECT_UNAUTHORIZED=0` in production — it disables TLS verification entirely.
Official guide: [SaluteSpeech certificates](https://developers.sber.ru/docs/ru/salutespeech/certificates).

## License

MIT
