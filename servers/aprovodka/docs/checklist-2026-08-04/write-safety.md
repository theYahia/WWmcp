# Write-safety layer (aprovodka) — 2026-08-04

Цепочка: **preview (dry-run) → approval gate → audit ledger → rollback token**.

## Где живёт

| Файл | Что |
|---|---|
| `src/lib/write-safety.ts` | весь слой (новый, ~430 строк) |
| `src/client.ts` | `oneCPost/oneCPatch/oneCDelete` обёрнуты в `guardWrite`; добавлен `oneCRawWrite` (unguarded, только для отката) |
| `src/tools/safety.ts` | tools `approve_write`, `rollback_write` (новый) |
| `src/server.ts` | регистрация этих 2 tools только при `ONEC_WRITE_MODE != off`; `countRegisteredTools` +2 в этом режиме |
| `src/tools/documents.ts` | `handleDeleteDocument` отдаёт envelope, а не выдуманное `deleted: true` после dry-run |
| `tests/write-safety.test.ts` | 18 тестов (новый) |

**Точка перехвата одна.** Все 1С-мутации в сервере проходят через три функции клиента, поэтому слой — один guard в `client.ts`, без правки 32 tools. Новый пишущий tool не может случайно пройти мимо гейта.

## Конфиг (всё opt-in, дефолт = прежнее поведение)

| Env | Значение |
|---|---|
| `ONEC_WRITE_MODE` | `off` (default) / `preview` / `approval` |
| `ONEC_AUDIT_LOG` | путь к append-only JSONL (работает в любом режиме, включая `off`) |
| `ONEC_AUDIT_ACTOR` | «кто» в журнале (default: `ONEC_LOGIN`) |
| `ONEC_APPROVAL_TTL_SEC` | срок жизни одобрения, default 300 |

- `off` — байт-в-байт прежнее поведение: сырой ответ 1С, никаких envelope. 87 старых тестов зелёные без правок.
- `preview` — записи **никогда** не выполняются; любой пишущий tool возвращает dry-run отчёт. Режим для демо/чужой продовой базы.
- `approval` — первый вызов возвращает отчёт + `op_hash`; запись идёт только после `approve_write(op_hash)` **и** повторного идентичного вызова tool.

## Как выглядит цикл (approval)

1. `post_document(...)` → `{write_safety:"preview", op_hash:"a1b2…", operation:{...}, changes:{kind:"post_document", effect:"Posted → true; движения пишутся"}, reversible:true, rollback_plan:"rollback_write → unpost …", next_step:"…"}`. Записи нет.
2. Человек говорит «да» → `approve_write(op_hash="a1b2…", reason="закрытие месяца")` — одноразово, TTL, привязано к хэшу.
3. Повтор того же `post_document(...)` с **идентичными** аргументами → выполняется → `{write_safety:"executed", op_hash, rollback:{token:"rb-a1b2…", tool:"rollback_write", describes:"unpost …"}, result:<сырой ответ 1С>}`.
4. `rollback_write(token="rb-a1b2…")` → выполняет обратную операцию.

`op_hash` = sha256(method + path + канонический JSON body), 16 hex. Любое изменение аргументов → другой хэш → старое одобрение не подходит (есть тест).

## Что показывает preview

| Операция | `changes` | Обратимость |
|---|---|---|
| PATCH (update_*, set_constant, set_deletion_mark) | GET текущей записи → пофайловый `{from, to}` | ✅ откат = PATCH прежних значений; `DeletionMark` инвертируется структурно даже без чтения |
| POST `/Post` | `Posted → true`, пишутся движения | ✅ → `Unpost` |
| POST `/Unpost` | `Posted → false`, движения снимаются | ✅ → `Post` (неоперативно) |
| POST create (документ / элемент справочника / запись регистра сведений) | поля новой записи | ❌ `irreversible_reason`: возьми Ref_Key из результата и `set_deletion_mark` |
| DELETE | цель физического удаления | ❌ «1C has no undo — prefer set_deletion_mark» |

## Audit ledger

JSONL, одна строка на событие: `ts`, `actor`, `event` (`preview` / `approved` / `attempt` / `executed` / `failed` / `rollback_token_issued` / `rollback_attempt` / `rollback_executed`), `op_hash`, `method`, `path`, `body`, `error`.

- **Fail-closed:** `attempt` пишется ДО запроса в 1С; если строку не записать (нет каталога, нет прав) — запись в 1С не выполняется вообще (есть тест).
- Тела запросов пишутся как есть — журнал изменений без payload бесполезен, значит файл так же чувствителен, как сами данные 1С. Класть под те же права, что и креды.

## Честные ограничения (не «фича», а факт)

1. `approve_write` — сам MCP tool. Реальный человеческий гейт = подтверждение вызова инструмента в UI MCP-клиента. Слой гарантирует, что запись невозможна без **отдельного явного шага с показом хэша операции**, но не может доказать, что кнопку нажал человек. В описании tool это сказано прямо.
2. Одобрения и rollback-токены живут **в памяти процесса** — рестарт их теряет. Обратная операция при этом записана в ledger (`rollback_token_issued.inverse`), её можно проиграть руками.
3. `rollback_write` сам не проходит гейт (это откат уже одобренной операции), но логируется.
4. В preview-режиме PATCH делает один дополнительный GET на операцию — для батча из 100 обновлений это 100 GET. Ожидаемо, не оптимизировалось.
5. Откат отката не поддержан: токен одноразовый.

## Тесты

`npx vitest run` в `servers/aprovodka`:

```
 Test Files  7 passed (7)
      Tests  105 passed (105)
```

87 существующих + 18 новых. `npx tsc --noEmit` — чисто.
