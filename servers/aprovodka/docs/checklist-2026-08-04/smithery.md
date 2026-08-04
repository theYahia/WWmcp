# 1.1 Smithery — карточка на слуг `aprovodka`

Дата проверки: 2026-08-04. Всё ниже — прочитанное; непроверенное помечено явно.

---

## A. Что нашлось в репо

| Файл | Состояние |
|---|---|
| `servers/aprovodka/smithery.yaml` | ✅ уже `name: aprovodka`, `args: ["-y","@theyahia/aprovodka"]`. Правок не требует. |
| `README.md` / `CHANGELOG.md` | Упоминания `1c-rest-mcp` — **исторические** (секции миграции v3→v4). Оставить. |
| `ROADMAP.md:47-48` | Открытые пункты про npm deprecate + MCP Registry. Не Smithery. |

**Ничего править не пришлось.** Старый слуг в конфиге не сидит.

---

## B. Проверка занятости слуга — рабочий способ

`smithery.ai/server/...` — неверный путь. Правильный публичный URL: **`smithery.ai/servers/<namespace>/<slug>`**
(источник: `https://smithery.ai/docs/concepts/namespaces.md` — «a server published under the `acme` namespace with the slug `weather` is accessible at `smithery.ai/servers/acme/weather`»).

Registry API работает **без ключа**:

```bash
# точечный lookup (авторитетный)
curl -s https://registry.smithery.ai/servers/<namespace>/<slug>
# поиск (нечёткий/семантический — НЕ доказательство занятости)
curl -s "https://registry.smithery.ai/servers?q=<term>"
```

### Результаты (2026-08-04)

| Запрос | Ответ |
|---|---|
| `GET /servers/theyahia/aprovodka` | `404 {"error":"Server not found"}` |
| `GET /servers/theyahia/1c-rest-mcp` | `404 {"error":"Server not found"}` |
| `GET /servers/theYahia/1c-rest-mcp` | `404 {"error":"Server not found"}` |
| `GET /servers/aprovodka` (bare) | `404 {"error":"Namespace not found"}` |
| `GET /servers/theyahia` (bare) | `404 {"error":"Namespace not found"}` |
| `?q=aprovodka` / `?q=1c-rest-mcp` / `?q=theYahia` | 0 точных совпадений (поиск семантический, отдаёт мусор) |

⚠️ Ловушка: bare-lookup вида `/servers/<x>` = запрос **namespace-only сервера**, а не проверка namespace. `favcrm` тоже отдаёт «Namespace not found», хотя `favcrm/favcrm` существует. Т.е. этот ответ **не доказывает**, что namespace свободен.

### Вывод

- Сервера `theyahia/aprovodka` в реестре **нет** → слуг под этим namespace свободен.
- Старой карточки `theyahia/1c-rest-mcp` в реестре тоже **нет** → «обновлять» нечего, задача превращается в **первичную публикацию**.
- ⚠️ Не подтверждено: существовала ли когда-либо карточка. Если она есть, но `unlisted: true` — публичный registry её может не отдавать. Проверить только войдя в аккаунт: `smithery auth login && smithery namespace list`.

---

## C. Главное: Smithery сменил модель публикации — `smithery.yaml` больше не документирован

Индекс доков `https://smithery.ai/docs/llms.txt` (прочитан целиком) **не содержит** ни страницы `smithery.yaml`, ни `build/deployments`, ни `build/project-config`. Все эти URL отдают 404.

Актуальный `https://smithery.ai/docs/build/publish.md` описывает **ровно два** способа:

1. **URL** — свой хостинг, Streamable HTTP; Smithery Gateway проксирует. Через `smithery.ai/new` или `smithery mcp publish "https://…/mcp" -n @org/server`.
2. **Local (MCPB bundle)** — для stdio-серверов. Публикуется `.mcpb`, клиент качает и запускает локально. `smithery mcp publish ./server.mcpb -n your-org/your-server`.

Подтверждено API-доками (`api-reference/servers/publish-a-server.md`): release types = `hosted` (JS module upload), `external` (URL), `stdio` (**MCPB bundle**).

**Следствие для aprovodka:** сервер stdio (`npx @theyahia/aprovodka`) → путь = **MCPB bundle**, а не `smithery.yaml`. Legacy-формат `startCommand.commandFunction` в нашем `smithery.yaml` текущей платформой, судя по докам, не потребляется.

⚠️ Не подтверждено: читает ли платформа `smithery.yaml` до сих пор из legacy-соображений (в UI GitHub-деплой мог остаться). Проверяется только в веб-UI после логина. Файл **не удалять** — он безвреден.

CLI (`docs/concepts/cli.md`) тоже больше не содержит `smithery build` / `smithery dev` — только `search/add/list/remove/get/update/publish`.

---

## D. Можно ли переименовать существующий сервер / что с редиректом

**Rename слуга есть — через transfer, не через update.**

`PATCH /servers/{qualifiedName}` (`update-a-server.md`) принимает только:
`displayName`, `description`, `homepage`, `repositoryUrl`, `backlinkUrl`, `license`, `iconUrl`, `unlisted`.
→ **Слуг/qualifiedName сменить нельзя.**

`POST /servers/{qualifiedName}/transfer` (`transfer-a-server.md`), схема `TransferServerRequest`:

```yaml
targetOrganizationId:  string   # required
targetNamespace:       string   # required
targetSlug:            string   # optional, example: weather
```

→ `targetSlug` **позволяет сменить слуг** при переносе. Caller нужен write-доступ к обоим namespace.

**Редирект со старого слуга: НЕ ПОДТВЕРЖДЁН.** Ни в `transfer-a-server.md`, ни в `namespaces.md`, ни в `publish.md` про сохранение старого URL/алиаса ничего не сказано. Исходить из того, что редиректа нет.
Проверка: после переименования дёрнуть `curl -s -o /dev/null -w '%{http_code}' https://registry.smithery.ai/servers/<ns>/<old-slug>` — 404 = редиректа нет.

Прочие релевантные эндпоинты: `PUT /servers/{qualifiedName}` (create, идемпотентный), `DELETE /servers/{qualifiedName}` (удаляет сервер + релизы, необратимо). База API: `https://api.smithery.ai`, auth `bearerAuth`.

---

## E. Шаги обновления карточки

Сценарий по факту проверки — **карточки нет, значит первичная публикация**.

| # | Шаг | Кто |
|---|---|---|
| 1 | `smithery auth login` (OAuth в браузере), затем `smithery auth whoami` | 🔴 руками |
| 2 | `smithery namespace list` — есть ли namespace и старая карточка (в т.ч. unlisted) | 🔴 руками |
| 3 | Если namespace нет: `smithery namespace create theyahia` (lowercase alnum+дефисы, глобально уникален; Hobby-free = **до 3** namespace) | 🔴 руками |
| 4 | Собрать `.mcpb` bundle из `@theyahia/aprovodka` (спека: github.com/modelcontextprotocol/mcpb) — **у нас его сейчас нет, это отдельная задача** | 🟢 можно кодом |
| 5 | `smithery mcp publish ./server.mcpb -n theyahia/aprovodka` | 🔴 руками (нужен логин) |
| 6 | Метаданные карточки: `PATCH /servers/theyahia/aprovodka` → `displayName`, `description`, `repositoryUrl=https://github.com/theYahia/aprovodka`, `homepage`, `license=MIT`, `iconUrl` | 🟢 скриптом с API-ключом |
| 7 | Иконка: `POST /servers/{qn}/icon`, ≤1MB, PNG/JPEG/GIF/SVG/WebP | 🟢 скриптом |
| 8 | Верификация: `curl -s https://registry.smithery.ai/servers/theyahia/aprovodka` → 200; открыть `https://smithery.ai/servers/theyahia/aprovodka` | 🟢 |

**Если на шаге 2 старая карточка `…/1c-rest-mcp` всё-таки найдётся** — вместо 4-5:
`POST /servers/theyahia/1c-rest-mcp/transfer` с `{targetOrganizationId, targetNamespace:"theyahia", targetSlug:"aprovodka"}`, затем шаг 6. Учесть: редиректа со старого URL, вероятно, не будет — обновить ссылки в README/CHANGELOG/ROADMAP.

---

## F. Требует ручного входа в аккаунт (нельзя автоматизировать отсюда)

1. `smithery auth login` — OAuth-флоу через браузер.
2. Проверка существования старой/unlisted карточки (публичный registry её не покажет).
3. Создание namespace + сам `publish` (нужна сессия/ключ).
4. Получение `targetOrganizationId` — обязательное поле transfer, видно только в аккаунте.
5. Подтверждение, остался ли в веб-UI GitHub-деплой по `smithery.yaml`.

---

## G. Источники (все прочитаны 2026-08-04)

- `https://smithery.ai/docs/llms.txt` — индекс доков
- `https://smithery.ai/docs/build/publish.md`
- `https://smithery.ai/docs/concepts/namespaces.md`
- `https://smithery.ai/docs/concepts/cli.md`
- `https://smithery.ai/docs/api-reference/servers/{create,update,transfer,delete,publish}-a-server.md`
- `https://registry.smithery.ai/servers` + `/servers/{qualifiedName}` — живые запросы
- 404: `docs/build/project-config/smithery.yaml`, `docs/build/deployments`, `smithery.ai/docs/use/registry`

## H. Открытые вопросы

- Существует ли карточка `1c-rest-mcp` как unlisted → только после логина.
- Редирект после смены слуга → не документирован, считать что нет.
- Читается ли `smithery.yaml` legacy-путём → не документирован.
- MCPB bundle для aprovodka не собран — блокер шага 5.
