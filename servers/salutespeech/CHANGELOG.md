# Changelog

All notable changes to this project are documented here.
The format is based on [Keep a Changelog](https://keepachangelog.com/en/1.1.0/),
and this project adheres to [Semantic Versioning](https://semver.org/spec/v2.0.0.html).

## [1.2.0] - 2026-06-23

### Fixed
- **Text-to-speech was completely broken.** `synthesize_speech` POSTed to the non-existent
  `/speech:synthesize`; the correct SaluteSpeech endpoint is `/text:synthesize`. Every TTS
  call previously failed.
- **Recognition MIME types were wrong** for several formats. SaluteSpeech has no `audio/wav`
  content-type — WAV is now sent as `audio/x-pcm;bit=16;rate=<sr>` with the sample rate read
  from the file header. `.flac` now uses `audio/flac` (was `audio/x-flac`), and `.pcm` now
  requires a `sample_rate` and emits `audio/x-pcm;bit=16;rate=<sr>`. `.mp3`, `.ogg`, and
  `.opus` were already correct and are unchanged.

### Added
- Configurable OAuth scope via `SALUTE_SPEECH_SCOPE` (default `SALUTE_SPEECH_PERS`), so
  corporate accounts (`SALUTE_SPEECH_CORP`, `SALUTE_SPEECH_B2B`) can authenticate.
- `list_models` now reports the English voice **Kira** (`Kin_24000`/`Kin_8000`), the 8000 Hz
  telephony variants of every voice, the `alaw` synthesis format, and a note that the sample
  rate comes from the voice id suffix and other languages are selected via SSML.
- Friendly size guard: recognition input over the 2 MB / 1 minute synchronous limit now
  fails with an actionable message pointing to the async flow (instead of a raw HTTP 413).
- TLS troubleshooting: a clear OAuth error hint and a README section about installing the
  Russian Trusted Root CA (НУЦ Минцифры) via `NODE_EXTRA_CA_CERTS`.
- All tool handlers now return `isError` on failure, so the model sees readable errors
  instead of opaque protocol errors.
- `.alaw`/`.ulaw` recognition input mapping (`audio/pcma`/`audio/pcmu`).
- New tests: WAV header parsing, size guard, recognition output shaping, exported
  `getAuthKey` priority, TLS-hint wrapping, and client retry behavior (429/500/abort).
  Handler tests assert request URL + content-type, locking in the endpoint and MIME fixes.

### Changed
- Recognition tools now return a flattened `text` transcript alongside `emotions` and the
  raw API body (the transcript lives in `result[]`).
- Synthesis input is validated to 1–4000 characters (the documented limit).
- `.mcp.json` example uses `SALUTESPEECH_API_KEY` to match the README.
- Removed unused type interfaces (`RecognitionResult`, `SynthesisResponse`, `SaluteModel`).

## [1.1.0]

- Upgrade to 5 tools, Vitest test suite, and Streamable HTTP transport.

## [1.0.0]

- Initial release.
