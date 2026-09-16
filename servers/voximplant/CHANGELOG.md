# Changelog

Все заметные изменения документируются здесь. Формат — [Keep a Changelog](https://keepachangelog.com/), версионирование — [SemVer](https://semver.org/).

## 2.0.0 — 2026-06-23

### Breaking
- **`get_active_calls` удалён, заменён на `get_acd_state`.** Метод `GetActiveSessions`, который вызывал старый инструмент, в Platform API **не существует** — теперь используется реальный `GetACDState` (состояние ACD-очередей). Параметр `application_id` → `acd_queue_id`.
- **`start_call` изменил сигнатуру.** `destination` теперь действительно передаётся сценарию через `script_custom_data` (раньше молча терялся). `caller_id` больше не уходит несуществующим query-параметром `StartScenarios`, а кладётся в customData. Сценарий VoxEngine должен прочитать `VoxEngine.customData()` и инициировать звонок.
- **Формат вывода изменён.** Все инструменты возвращают результат через единый слой форматирования; ошибки — как `{ "error": "..." }` с флагом `isError`. `get_account_info` отдаёт только безопасные поля.

### Fixed (безопасность и корректность)
- **Утечка `api_key` устранена.** `GetAccountInfo` эхо-возвращает `api_key` (и `callback_salt`) аккаунта; раньше сырой ответ дампился в контекст модели. Теперь `get_account_info` и `skill-account-info` проходят через строгий витлист безопасных полей.
- **`get_sms_history` чинён.** Вызывал `GetSMSHistory` (неверный регистр → 404); исправлено на `GetSmsHistory`.
- **POST для крупных payload.** `update_scenario` (скрипт VoxEngine может занимать килобайты), `send_sms`, `send_a2p_sms` и `start_call` уходят POST с form-body — раньше всё шло в query string GET и упиралось в лимит длины URL.
- **Секреты не логируются.** Клиент логирует только имя метода, не URL с ключом.

### Added
- **9 READ-инструментов:** `get_phone_numbers`, `get_applications`, `get_queues`, `get_skills`, `get_sq_state`, `get_caller_ids`, `get_record_storages`, `get_transaction_history`, `get_a2p_sms_history`.
- **1 WRITE-инструмент (с предупреждением):** `send_a2p_sms` — массовая A2P-рассылка.
- `src/errors.ts`, `src/config.ts` (fail-fast креды, VERSION из package.json), `src/lib/` (formatters, shape, dates, schemas).
- `docs/VERIFICATION.md`, `.env.example`, `CHANGELOG.md`, `tsconfig.build.json`.

### Internal
- Клиент переписан: GET+POST, error-as-value (`ApiResult`), ретраи с учётом идемпотентности (429 — любой метод; 5xx/сеть — только GET), таймаут 15с.
- Инструменты сгруппированы по `registerXTools(server)`; `src/types.ts` задействован.
- CI гоняет typecheck + build + test на Node 18/20/22 (раньше — только build на Node 20).

## 1.2.3 и ранее

Базовая версия: 11 инструментов + 2 скилла, stdio + Streamable HTTP, GET-only клиент, сырой JSON-вывод.
