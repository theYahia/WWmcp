# 1.1 MCP Registry — перерегистрация aprovodka + снятие 1c-rest-mcp

Дата проверки: 2026-08-04. Всё ниже — прочитано из официальных источников или получено живыми запросами к API. Непроверенное помечено явно.

## Источники (что именно прочитано)

| # | Источник | URL |
|---|---|---|
| S1 | Quickstart: Publish a Server | `github.com/modelcontextprotocol/registry` → `docs/modelcontextprotocol-io/quickstart.mdx` |
| S2 | Publisher CLI Commands Reference | `docs/reference/cli/commands.md` |
| S3 | Official Registry API | `docs/reference/api/official-registry-api.md` |
| S4 | OpenAPI спека реестра | `docs/reference/api/openapi.yaml` |
| S5 | Admin Operations | `docs/administration/admin-operations.md` |
| S6 | Moderation Policy | `docs/modelcontextprotocol-io/moderation-policy.mdx` |
| S7 | Versioning | `docs/modelcontextprotocol-io/versioning.mdx` |
| S8 | Official Registry server.json Requirements | `docs/reference/server-json/official-registry-requirements.md` |
| S9 | Исходник CLI `status` | `cmd/publisher/commands/status.go` |

---

## 1. Как публикуется server.json (дословно, S1/S2)

Механизм: реестр хранит **только метаданные**, не артефакты. Пакет должен уже лежать на npm.

1. **Верификация владения пакетом** (S1, Step 1): для npm требуется поле `mcpName` в `package.json`. Дословно: «The value of `mcpName` will be your server's name in the MCP Registry. Because we will be using GitHub-based authentication, `mcpName` **must** start with `io.github.my-username/`».
2. **Публикация на npm** (Step 2) — `npm publish --access public`.
3. **Установка CLI** (Step 3) — `mcp-publisher` (бинарник с GitHub Releases или `brew install mcp-publisher`).
4. **`server.json`** (Step 4) — генерируется `mcp-publisher init`. Дословно: «The `name` property in `server.json` **must** match the `mcpName` property in `package.json`».
5. **Аутентификация** (Step 5) — `mcp-publisher login github`, device-flow (github.com/login/device + код).
6. **Публикация** (Step 6) — `mcp-publisher publish`.

### Валидация namespace `io.github.*` (S1, S2, S3, S8)

- GitHub OAuth-логин выдаёт права на namespace `io.github.{username}/*` и `io.github.{org}/*` (S2, дословно: «Grants access to `io.github.{username}/*` and `io.github.{org}/*` namespaces»).
- Ошибка при несовпадении (S1, таблица Troubleshooting): «You do not have permission to publish this server» → «With GitHub auth, your server name must start with `io.github.your-username/`».
- Ошибка при отсутствии маркера в пакете: «Registry validation failed for package» → «For npm this is `mcpName` in `package.json`».
- Ограничение registry base URL (S8): для npm разрешён **только** `https://registry.npmjs.org`.

### Версии (S7)

- «The version string **MUST** be unique for each publication of the server. Once published, the version string (and other metadata) cannot be changed.»

---

## 2. Что происходит со старым именем — механизм снятия

### 2.1 Переименовать запись НЕЛЬЗЯ

S5, раздел Notes, дословно: «**Server name**: Cannot be changed in any version (it's the immutable identifier)». → `io.github.theYahia/1c-rest-mcp` и `io.github.theYahia/aprovodka` — две независимые записи. Перерегистрация = публикация новой записи + отдельное снятие старой.

### 2.2 DELETE-эндпоинт — есть в спеке, но НЕ реализован в официальном реестре

S4, `DELETE /v0.1/servers/{serverName}/versions/{version}`, дословно из описания:

> **Note**: This endpoint is optional for registry implementations and **is not implemented by the official MCP registry**. It is included in the specification to standardize the deletion mechanism for registry implementations that choose to support it.

Ответ `501 Not Implemented` → «Deletion is not supported by this registry». **Жёсткого удаления нет.**

### 2.3 Механизм снятия, который РАБОТАЕТ и доступен самому автору

`PATCH /v0.1/servers/{serverName}/status` (все версии разом) и `PATCH /v0.1/servers/{serverName}/versions/{version}/status` (одна версия).

S3, дословно:
- Body: `status` (required) — `active`, `deprecated` или `deleted`; `statusMessage` (optional, max 500 символов, **не допускается при `status: active`**).
- Семантика статусов:
  - `active` — «Server is active and visible in default listings»
  - `deprecated` — «Server is deprecated but still visible with a warning message»
  - `deleted` — «Server is hidden from default listings (use `include_deleted=true` to show)»
- **Authentication:** «Requires `publish` or `edit` permission for the server namespace.» → это НЕ admin-only; владелец namespace `io.github.theYahia/*` может сделать сам своим обычным GitHub-токеном.

S6 (moderation policy) подтверждает семантику: «When we remove a server, we set the server's `status` to `"deleted"`, but the server's metadata remains accessible via the MCP Registry API. Aggregators may then remove the server from their indexes.»

**Вывод по механизму:** записи из реестра не стираются никогда. Максимум — `status: deleted`, что убирает из выдачи по умолчанию, но оставляет доступной через `include_deleted=true`. Агрегаторы (Smithery, GitHub MCP Registry и т.п.) должны сами подхватить статус — сроки и факт этого **не подтверждены**, проверять по факту.

### 2.4 CLI-обёртка (S9, `cmd/publisher/commands/status.go`)

Есть команда `mcp-publisher status` (в справке из S1 не перечислена — там только init/login/logout/publish, но в исходнике присутствует):

```
mcp-publisher status --status <active|deprecated|deleted> [--message "..."] [--all-versions] [--yes|-y] <server-name> [version]
```

- `--status` обязателен; валидные значения жёстко: `active`, `deprecated`, `deleted`.
- `version` обязателен, **если не задан** `--all-versions`.
- `-y` / `--yes` — пропустить подтверждение при bulk-операции.
- Токен читается из файла, сохранённого `mcp-publisher login` (путь определяется `tokenFilePath()` в `login.go` — точный путь не читал, **не подтверждено**).
- CLI бьёт по пути `v0/servers/{name}/status` (не `v0.1`) — оба префикса живые, проверено запросами.

---

## 3. Текущее состояние реестра (живые запросы, 2026-08-04)

`GET https://registry.modelcontextprotocol.io/v0/servers?search=...`

| Запись | Версии в реестре | status | isLatest |
|---|---|---|---|
| `io.github.theYahia/1c-rest-mcp` | `1.0.1` (опубл. 2026-03-31T07:59:17Z) | `active` | false |
| `io.github.theYahia/1c-rest-mcp` | `1.2.1` (опубл. 2026-05-01T12:01:47Z) | `active` | **true** |
| `io.github.theYahia/aprovodka` | — | — | **записи НЕТ** (`count: 0`) |

Метаданные старой записи `1.2.1`: `repository.url = https://github.com/theYahia/1c-rest-mcp`, npm `identifier = @theyahia/1c-rest-mcp@1.2.1`, transport stdio.

**Итого снимать надо 2 версии** (`1.0.1` и `1.2.1`) → нужен `--all-versions`.

### Смежные факты (проверено)

- `gh api repos/theYahia/1c-rest-mcp` резолвится в `theYahia/aprovodka` (id `1196390720`) → GitHub-репо **переименован**, старый URL в реестре редиректится. Само по себе запись в реестре это не чинит.
- npm `@theyahia/1c-rest-mcp`: существует, `dist-tags.latest = 3.2.0` (реестр знает только про 1.2.1 — расходится).
- npm `@theyahia/aprovodka`: **HTTP 404, пакет не опубликован**. Контекст задачи говорил «npm @theyahia/aprovodka@4.0.0» — на npm этого нет. ⛔ Это блокер шага 2 ниже.

---

## 4. Состояние репо (проверено / исправлено)

| Файл | Было | Стало |
|---|---|---|
| `servers/aprovodka/package.json` → `mcpName` | `io.github.theYahia/aprovodka` — **уже верно**, правка не нужна | без изменений |
| `servers/aprovodka/package.json` → `name` / `version` | `@theyahia/aprovodka` / `4.0.0` — верно | без изменений |
| `servers/aprovodka/server.json` | **отсутствовал** (по всему монорепо `find -name server.json` = пусто) | **создан** |

Создан `D:/Yahia/active/wwmcps/WWmcp/servers/aprovodka/server.json`: `name = io.github.theYahia/aprovodka`, `version = 4.0.0`, repo `https://github.com/theYahia/aprovodka`, npm-пакет `@theyahia/aprovodka@4.0.0`, transport stdio, env-переменные взяты из `smithery.yaml` + `grep process.env` по `src/` (`ONEC_BASE_URL`, `ONEC_LOGIN`, `ONEC_PASSWORD` обязательные; `ONEC_SERVICES` опциональная).

Замечание: в `src/` встречаются также `1C_BASE_URL` / `1C_LOGIN` / `1C_PASSWORD` (легаси-алиасы) и `ONEC_WRITE_MODE` / `ONEC_APPROVAL_TTL_SEC` / `ONEC_AUDIT_LOG` / `ONEC_AUDIT_ACTOR` — в `server.json` не вынесены, т.к. в `smithery.yaml` их нет; при желании добавить руками.

---

## 5. Последовательность команд

### Шаг 0 — предусловия

```bash
# CLI (Windows PowerShell, из S1 Step 3)
$arch = if ([System.Runtime.InteropServices.RuntimeInformation]::ProcessArchitecture -eq "Arm64") { "arm64" } else { "amd64" }
Invoke-WebRequest -Uri "https://github.com/modelcontextprotocol/registry/releases/latest/download/mcp-publisher_windows_$arch.tar.gz" -OutFile "mcp-publisher.tar.gz"
tar xf mcp-publisher.tar.gz mcp-publisher.exe
rm mcp-publisher.tar.gz
# положить mcp-publisher.exe в PATH
mcp-publisher --help
```

### Шаг 1 — npm (⛔ БЛОКЕР: пакета сейчас нет на npm)

```bash
cd D:/Yahia/active/wwmcps/WWmcp/servers/aprovodka
npm run build
npm publish --access public          # потребует npm login + 2FA OTP: npm publish --otp=NNNNNN
curl -s -o /dev/null -w "%{http_code}\n" "https://registry.npmjs.org/@theyahia%2Faprovodka"   # ждём 200
```

Без этого шага `mcp-publisher publish` упадёт на «Registry validation failed for package» — реестр проверяет, что npm-пакет существует и его `package.json` содержит `mcpName`.

Монорепо-нюанс: `dependencies` содержит `"@theyahia/mcp-core": "workspace:*"`. Публикация в npm с неразрешённым `workspace:*` сломает установку у потребителей. **Не проверено**, как это разрешается в текущем пайплайне (`prepublishOnly` делает только `npm run build`) — проверить перед publish.

### Шаг 2 — логин в реестр

```bash
mcp-publisher login github
# открыть https://github.com/login/device, ввести код из терминала (аккаунт theYahia)
```

### Шаг 3 — публикация новой записи

```bash
cd D:/Yahia/active/wwmcps/WWmcp/servers/aprovodka
mcp-publisher publish              # читает ./server.json (создан, см. §4)
```

Проверка:

```bash
curl -s "https://registry.modelcontextprotocol.io/v0/servers?search=aprovodka"
# ожидаем name: io.github.theYahia/aprovodka, version 4.0.0, status active
```

### Шаг 4 — снятие старой записи (все 2 версии разом)

Вариант A — CLI (предпочтительно):

```bash
mcp-publisher status \
  --status deprecated \
  --message "Renamed to io.github.theYahia/aprovodka (npm @theyahia/aprovodka). This entry is no longer maintained." \
  --all-versions -y \
  io.github.theYahia/1c-rest-mcp
```

Затем (после того как убедились, что новая запись живая и находится) — окончательно спрятать:

```bash
mcp-publisher status \
  --status deleted \
  --message "Superseded by io.github.theYahia/aprovodka" \
  --all-versions -y \
  io.github.theYahia/1c-rest-mcp
```

Вариант B — тот же эффект напрямую по HTTP (если CLI не хочет; токен — тот, что положил `mcp-publisher login`):

```bash
curl -X PATCH "https://registry.modelcontextprotocol.io/v0/servers/io.github.theYahia%2F1c-rest-mcp/status" \
  -H "Authorization: Bearer ${REGISTRY_TOKEN}" \
  -H "Content-Type: application/json" \
  -d '{"status":"deleted","statusMessage":"Superseded by io.github.theYahia/aprovodka"}'
```

Проверка снятия:

```bash
curl -s "https://registry.modelcontextprotocol.io/v0/servers?search=1c-rest-mcp"
# ожидаем servers: [] (count 0) — скрыто из выдачи по умолчанию
curl -s "https://registry.modelcontextprotocol.io/v0/servers/io.github.theYahia%2F1c-rest-mcp/versions?include_deleted=true"
# ожидаем обе версии со status: deleted
```

### Шаг 5 — npm-сторона старого пакета (вне реестра, для полноты)

```bash
npm deprecate @theyahia/1c-rest-mcp "Renamed. Use @theyahia/aprovodka instead."
```

Не является частью механики MCP Registry; поведение npm `deprecate` здесь **не проверялось** живым запуском.

---

## 6. Ответ на вопрос задачи одним абзацем

Механизм **жёсткого удаления** записи в официальном MCP Registry **отсутствует** (`DELETE` есть в OpenAPI, но помечен как не реализованный официальным реестром, отдаёт 501). Имя записи неизменяемо, переименовать `1c-rest-mcp` → `aprovodka` нельзя. Рабочий и **доступный самому автору** механизм — `PATCH /v0(.1)/servers/{name}/status` с `status: deprecated` или `deleted` (требует лишь `publish`/`edit` прав на namespace, т.е. обычного GitHub-логина `theYahia`), обёртка — `mcp-publisher status --status deleted --all-versions <name>`. Эффект `deleted`: запись пропадает из выдачи по умолчанию, но метаданные остаются доступны по `include_deleted=true`; удаление из индексов агрегаторов — на их усмотрение.

## 7. Открытые пункты (не подтверждено)

1. `@theyahia/aprovodka` не опубликован на npm (404) — публикация в реестр невозможна до этого.
2. `workspace:*` зависимость `@theyahia/mcp-core` при npm publish — как разрешается, не проверено.
3. Точный путь файла токена `mcp-publisher` (`tokenFilePath()` в `login.go`) — не читал.
4. Подхватят ли агрегаторы (Smithery и др.) `status: deleted` и за какое время — не проверено.
5. Команда `mcp-publisher status` есть в исходнике `cmd/publisher/commands/status.go`, но не перечислена в справке из quickstart — на всякий случай сверить `mcp-publisher --help` у установленной версии; при отсутствии использовать Вариант B (curl).
