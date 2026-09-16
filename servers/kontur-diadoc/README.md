# MCP-сервер для Контур.Диадок — электронный документооборот (ЭДО) через ИИ

[![CI](https://github.com/theYahia/WWmcp/actions/workflows/ci.yml/badge.svg)](https://github.com/theYahia/WWmcp/actions/workflows/ci.yml)

Если вы искали, как подключить Диадок к нейросети, достать счета-фактуры и УПД из ЭДО не кликая
по кабинету или подписать документ из чата — это оно. 12 инструментов: поиск контрагентов по ИНН,
список и содержимое документов, отправка и подписание (счета-фактуры, акты, УПД, ТОРГ-12 и др.).
Пишете «покажи входящие УПД за март» — получаете список, а не инструкцию, куда нажать.

> MCP server for **Kontur.Diadoc** electronic document interchange (EDI). Search organizations
> and counterparties, list/fetch documents, send and sign them — straight from your AI assistant.

---

## Инструменты / Tools

| Tool | Назначение | Ключевые параметры |
|------|-----------|--------------------|
| `authenticate` | Проверить аутентификацию, вернуть превью токена | — |
| `list_organizations` | Поиск организаций по ИНН/КПП | `inn` (обяз.), `kpp`, `include_relations` |
| `get_organization` | Детали организации | один из: `org_id` / `box_id` / `inn` (+`kpp`) |
| `list_documents` | Список документов в ящике с фильтрами и пагинацией | `box_id`, `filter_category`, `timestamp_from/to`, `count`, `after_index_key` |
| `get_document` | Конкретный документ | `box_id`, `message_id`, `entity_id`, `inject_entity_content` |
| `send_document` | Отправить документ контрагенту | `from_box_id`, `to_box_id`, `type_named_id`, `content_base64`, `signature_base64?` |
| `sign_document` | Подписать входящий документ | `box_id`, `message_id`, `entity_id`, `signature_base64?` / `sign_with_test_signature?` |
| `list_counterparties` | Список контрагентов | `box_id` (myBoxId), `counteragent_status`, `query`, `page_size` |

## Установка / Install

### Claude Desktop / Cline / Cursor

```json
{
  "mcpServers": {
    "kontur-diadoc": {
      "command": "npx",
      "args": ["-y", "@theyahia/kontur-diadoc-mcp"],
      "env": {
        "DIADOC_API_CLIENT_ID": "<YOUR_DEVELOPER_KEY>",
        "DIADOC_LOGIN": "<YOUR_LOGIN>",
        "DIADOC_PASSWORD": "<YOUR_PASSWORD>"
      }
    }
  }
}
```

### Переменные окружения / Environment variables

| Variable | Обяз. | Описание |
|----------|:-----:|----------|
| `DIADOC_API_CLIENT_ID` | да | Ключ разработчика (`ddauth_api_client_id`), выдаётся при регистрации для доступа к API |
| `DIADOC_LOGIN` | да | Логин учётной записи Diadoc |
| `DIADOC_PASSWORD` | да | Пароль учётной записи Diadoc |
| `DIADOC_BASE_URL` | нет | Альтернативный хост API (напр. песочница). По умолчанию `https://diadoc-api.kontur.ru` |

> ⚠️ **Изменение совместимости (v1.1.0):** ключ разработчика теперь читается из
> `DIADOC_API_CLIENT_ID`. Старое имя `DIADOC_CLIENT_ID` всё ещё принимается как fallback.
> Прежняя переменная `DIADOC_API_KEY` **больше не требуется** (раньше она читалась, но
> никуда не отправлялась).

### Как получить доступ / Getting credentials

1. Зарегистрируйте приложение и получите **ключ разработчика** (`ddauth_api_client_id`) на
   [портале разработчика Контура](https://developer.kontur.ru/doc/diadoc-api).
2. Используйте **логин и пароль** вашей учётной записи Diadoc.
3. Для экспериментов запросите доступ к **тестовому контуру (песочнице)** и укажите его хост
   в `DIADOC_BASE_URL`.

## Основные понятия / Key concepts

- **box_id** — идентификатор «ящика» организации в Diadoc; адресат отправки и контекст
  большинства операций.
- **ИНН/КПП** — проверяются на формат (ИНН 10 или 12 цифр, КПП 9 цифр) до обращения к API.
- **filter_category** — обязательный фильтр в `list_documents`, формат
  `<DocumentType>.<DocumentClass><Status>`, напр. `Any.Inbound`, `Any.InboundNotFinished`,
  `XmlTorg12.OutboundWithRecipientSignature`.
- **Пагинация** — курсорная: ответ содержит ключ, который передаётся в `after_index_key`
  следующего запроса (`count` 0–100). Сдвиг по `offset` Diadoc **не использует**.
- **Время** — `timestamp_from`/`timestamp_to` принимаются как ISO-8601 и автоматически
  конвертируются в .NET-тики (`timestampFromTicks`/`timestampToTicks`), которых ждёт API.

## Подписание документов / Signing — важно

Diadoc API **не создаёт криптографическую подпись сам**. Боевую подпись (КЭП, формат
CAdES/PKCS#7) формирует клиент — например, через КриптоПро CSP — и передаёт её сюда в base64:

- `send_document` — поле `signature_base64` (можно опустить для неподписанных/неформализованных
  документов: тогда отправляется только содержимое).
- `sign_document` — поле `signature_base64`; либо `sign_with_test_signature: true` для
  **тестовой** подписи в песочнице (в проде не работает).

> Генерация самой подписи — вне зоны ответственности этого сервера. Он корректно формирует
> структуру запроса (`DocumentAttachments` / `SignedContent` для отправки, `Signatures` для
> подписания) и прокидывает вашу подпись в Diadoc.

## Обработка ошибок / Error handling

Ошибки API (HTTP-статус и тело ответа Diadoc) возвращаются как результат инструмента с флагом
`isError: true` и понятным текстом, а не роняют сессию. Клиент сам делает:
повтор с экспоненциальной задержкой на `429`/`5xx`, одну прозрачную ре-аутентификацию на `401`,
таймаут 15 с на запрос.

## Примеры запросов / Demo prompts

- «Найди организацию по ИНН 7707083893 в Diadoc»
- «Покажи входящие неподписанные документы за этот месяц»
- «Открой документ по message_id … и entity_id …»
- «Отправь неформализованный документ контрагенту box-456»
- «Подпиши входящий акт тестовой подписью (песочница)»
- «Список моих контрагентов со статусом IsMyCounteragent»

## Разработка / Development

```bash
npm install
npm run dev        # запуск из исходников (tsx)
npm run build      # компиляция в dist/
npm test           # vitest
npm run typecheck  # tsc --noEmit
npm run lint       # biome check .
npm run format     # biome check --write . (автоформат + фиксы)
```

## Справочник API / API reference

Документация: [developer.kontur.ru/doc/diadoc-api](https://developer.kontur.ru/doc/diadoc-api)

## Лицензия / License

MIT

---

Часть [WWmcp](https://github.com/theYahia/WWmcp) · Telegram: [@vhodvai](https://t.me/vhodvai)
