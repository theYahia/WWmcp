# SMS.RU MCP — отправка СМС из нейросети без написания кода

Если вы искали, как отправить SMS прямо из диалога с ИИ-ассистентом, проверить доставку сообщения или узнать остаток на счету не заходя в кабинет — это оно. **5 инструментов** поверх API [SMS.RU](https://sms.ru): отправка SMS, статус сообщения, баланс, расчёт стоимости и список отправителей.

[![npm](https://img.shields.io/npm/v/@theyahia/sms-ru-mcp)](https://www.npmjs.com/package/@theyahia/sms-ru-mcp)
[![License: MIT](https://img.shields.io/badge/License-MIT-yellow.svg)](https://opensource.org/licenses/MIT)

Часть серии [Russian API MCP](https://github.com/theYahia/russian-mcp) (50 серверов) by [@theYahia](https://github.com/theYahia).

## Установка

### Claude Desktop

```json
{
  "mcpServers": {
    "sms-ru": {
      "command": "npx",
      "args": ["-y", "@theyahia/sms-ru-mcp"],
      "env": { "SMS_RU_API_ID": "your-api-id" }
    }
  }
}
```

### Claude Code

```bash
claude mcp add sms-ru -e SMS_RU_API_ID=your-api-id -- npx -y @theyahia/sms-ru-mcp
```

### VS Code / Cursor

```json
{ "servers": { "sms-ru": { "command": "npx", "args": ["-y", "@theyahia/sms-ru-mcp"], "env": { "SMS_RU_API_ID": "your-api-id" } } } }
```

### Streamable HTTP

```bash
SMS_RU_API_ID=your-api-id npx @theyahia/sms-ru-mcp --http
# POST http://localhost:8080/mcp
# GET  http://localhost:8080/health
```

### Smithery

[![smithery badge](https://smithery.ai/badge/@theyahia/sms-ru-mcp)](https://smithery.ai/server/@theyahia/sms-ru-mcp)

```bash
npx -y @smithery/cli install @theyahia/sms-ru-mcp --client claude
```

> Требуется `SMS_RU_API_ID`. Получите на [sms.ru](https://sms.ru/my/settings).

## Инструменты (5)

| Инструмент | Описание |
|------------|----------|
| `send_sms` | Отправить SMS (номер, текст, опционально имя отправителя) |
| `check_status` | Проверить статус SMS по ID |
| `get_balance` | Баланс аккаунта SMS.RU |
| `get_cost` | Рассчитать стоимость SMS до отправки |
| `get_senders` | Список одобренных имён отправителей |

## Skills (Claude Code)

| Skill | Триггер |
|-------|---------|
| `/send-sms` | «Отправь SMS на номер...» |
| `/check-balance` | «Проверь баланс SMS.ru» |

## Примеры

```
Отправь SMS на 79001234567 с текстом "Привет"
Сколько будет стоить SMS на 79001234567 "Тестовое сообщение"?
Проверь статус сообщения 123456
Какой баланс на SMS.RU?
Покажи список отправителей
```

## Разработка

```bash
npm install
npm run build
npm test
```

## Лицензия

MIT

---

Telegram: [@vhodvai](https://t.me/vhodvai)
