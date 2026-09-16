# MCP-сервер для Voximplant — облачная телефония, звонки и SMS через ИИ

> 🌍 Часть **[WWmcp](https://github.com/theYahia/WWmcp)** — коллекции из 46 MCP-серверов для развивающихся рынков (Россия, СНГ, MENA, Gulf, SE Asia, Africa). Единственная коллекция MCP, покрывающая не-западные API.

Если вы искали, как подключить Voximplant к нейросети, поднять историю звонков и записи разговоров или запустить обзвон и A2P-рассылку из чата — это оно. 21 инструмент и 2 скилла: звонки и их записи, SMS, сценарии VoxEngine, правила маршрутизации, очереди ACD/SmartQueue, телефонные номера и биллинг. Спрашиваете «сколько звонков потеряли вчера» — получаете цифру со ссылками на записи.

[![npm](https://img.shields.io/npm/v/@theyahia/voximplant-mcp)](https://www.npmjs.com/package/@theyahia/voximplant-mcp)
[![CI](https://github.com/theYahia/voximplant-mcp/actions/workflows/ci.yml/badge.svg)](https://github.com/theYahia/voximplant-mcp/actions/workflows/ci.yml)
[![License: MIT](https://img.shields.io/badge/License-MIT-yellow.svg)](https://opensource.org/licenses/MIT)

## Установка

### 1. Получите ключи

`VOXIMPLANT_ACCOUNT_ID` и `VOXIMPLANT_API_KEY` — в [панели управления Voximplant](https://manage.voximplant.com) (раздел API).

> Аутентификация по `api_key` официально помечена как *deprecated, но рабочая* — её достаточно, если доступ к аккаунту есть только у вас. Современная альтернатива — service-account JWT (RS256); этот сервер использует классический `account_id` + `api_key`.

### 2. Подключите сервер

**Claude Desktop** (`claude_desktop_config.json`):

```json
{
  "mcpServers": {
    "voximplant": {
      "command": "npx",
      "args": ["-y", "@theyahia/voximplant-mcp"],
      "env": {
        "VOXIMPLANT_ACCOUNT_ID": "your-id",
        "VOXIMPLANT_API_KEY": "your-key"
      }
    }
  }
}
```

**Claude Code:**

```bash
claude mcp add voximplant -e VOXIMPLANT_ACCOUNT_ID=your-id -e VOXIMPLANT_API_KEY=your-key -- npx -y @theyahia/voximplant-mcp
```

**VS Code / Cursor:**

```json
{
  "servers": {
    "voximplant": {
      "command": "npx",
      "args": ["-y", "@theyahia/voximplant-mcp"],
      "env": {
        "VOXIMPLANT_ACCOUNT_ID": "your-id",
        "VOXIMPLANT_API_KEY": "your-key"
      }
    }
  }
}
```

**Streamable HTTP:**

```bash
npx @theyahia/voximplant-mcp --http
# Сервер: http://localhost:3000/mcp · health: http://localhost:3000/health · порт: PORT=8080
```

## Инструменты (21)

| Инструмент | Описание |
|------------|----------|
| `get_call_history` | История звонков за период |
| `start_call` | Инициировать исходящий звонок по правилу (номер передаётся сценарию через customData) |
| `get_acd_state` | Состояние ACD-очередей: звонки в очереди, статусы операторов |
| `get_sq_state` | Текущее состояние SmartQueue-очереди |
| `get_recordings` | Ссылки на записи разговоров (и transcription_url) за период |
| `get_record_storages` | Список хранилищ записей |
| `send_sms` | Отправить SMS |
| `get_sms_history` | История SMS за период |
| `get_a2p_sms_history` | История доставки A2P-SMS |
| `send_a2p_sms` | ⚠️ Массовая A2P-рассылка (до 100 номеров) — действие с оплатой |
| `get_account_info` | Информация об аккаунте (баланс, тариф). Секреты (`api_key`, `callback_salt`) скрыты |
| `get_transaction_history` | История биллинговых транзакций (расходы) |
| `get_applications` | Список приложений (опц. с правилами/сценариями) |
| `get_rules` | Правила маршрутизации приложения |
| `get_phone_numbers` | Телефонные номера аккаунта (поддержка SMS, привязка) |
| `get_caller_ids` | Caller ID и статус их верификации |
| `get_queues` | ACD-очереди (опц. с навыками и числом операторов) |
| `get_skills` | Каталог навыков ACD для маршрутизации |
| `get_scenarios` | Список сценариев VoxEngine |
| `update_scenario` | Обновить код/имя сценария VoxEngine |
| `get_users` | Список пользователей |

> **Формат вывода:** инструменты возвращают pretty-JSON ответа API; ошибки приходят как `{ "error": "..." }` с флагом `isError`. Ответ `get_account_info` проходит строгий витлист — секретные поля (`api_key`, `callback_salt`) в него не попадают.

## Скиллы (2)

| Скилл | Описание |
|-------|----------|
| `skill-call-history` | Сводка истории звонков за последние 24 часа |
| `skill-account-info` | Информация об аккаунте Voximplant |

## Примеры

```
Покажи историю звонков за вчера
Отправь SMS на +79001234567
Что сейчас в ACD-очередях — кто свободен?
Покажи баланс и расходы за январь
Какие у меня номера с поддержкой SMS?
Обнови сценарий 123 — добавь логирование
Начни звонок на +79001234567 по правилу 456
Дай ссылки на записи звонков за вчера
```

## WWmcp — связки с соседними серверами

Voximplant закрывает голос и SMS; соседние серверы из [WWmcp](https://github.com/theYahia/WWmcp) дополняют сценарий:

- [`tgstat-mcp`](https://github.com/theYahia/tgstat-mcp) — аналитика Telegram-каналов
- [`yookassa-mcp`](https://github.com/theYahia/yookassa-mcp) — платежи и чеки
- [`vk-ads-mcp`](https://github.com/theYahia/vk-ads-mcp) — рекламные кампании VK Ads

Пример сценария: *«Найди должников по платежам (yookassa), обзвони их голосом по сценарию (voximplant) и отправь SMS-напоминание тем, кто не ответил»*.

## Разработка

```bash
npm install
npm run build      # компиляция в dist/ (тесты исключены)
npm run typecheck  # проверка типов, включая тесты
npm test           # vitest
```

Проверка живых предположений об API (имена методов, параметры) — в [`docs/VERIFICATION.md`](docs/VERIFICATION.md).

## ⭐ Поддержать

Если сервер полезен — поставьте звезду этому репозиторию и [WWmcp](https://github.com/theYahia/WWmcp). Это помогает другим найти коллекцию серверов для не-западных API.

## Лицензия

MIT

---

Часть [WWmcp](https://github.com/theYahia/WWmcp) · Telegram: [@vhodvai](https://t.me/vhodvai)
