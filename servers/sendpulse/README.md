# SendPulse MCP — рассылки, SMTP и push-уведомления из нейросети

Если вы искали, как отправить email-кампанию прямо из диалога с ИИ, наполнить адресную книгу, отправить транзакционное письмо через SMTP или разослать web-push без ручной работы в кабинете — это оно. 11 инструментов поверх SendPulse API с авторизацией OAuth2: адресные книги, кампании, шаблоны, SMTP и push-уведомления.

[![npm](https://img.shields.io/npm/v/@theyahia/sendpulse-mcp)](https://www.npmjs.com/package/@theyahia/sendpulse-mcp)
[![License: MIT](https://img.shields.io/badge/License-MIT-yellow.svg)](https://opensource.org/licenses/MIT)

## Установка

### Claude Desktop

```json
{
  "mcpServers": {
    "sendpulse": {
      "command": "npx",
      "args": ["-y", "@theyahia/sendpulse-mcp"],
      "env": {
        "SENDPULSE_ID": "your_client_id",
        "SENDPULSE_SECRET": "your_client_secret"
      }
    }
  }
}
```

### Claude Code

```bash
claude mcp add sendpulse -e SENDPULSE_ID=id -e SENDPULSE_SECRET=secret -- npx -y @theyahia/sendpulse-mcp
```

### Smithery

[![smithery badge](https://smithery.ai/badge/@theyahia/sendpulse-mcp)](https://smithery.ai/server/@theyahia/sendpulse-mcp)

```bash
npx -y @smithery/cli install @theyahia/sendpulse-mcp --client claude
```

### Streamable HTTP (удалённый сервер / несколько клиентов)

```bash
npx @theyahia/sendpulse-mcp --http
# Слушает порт 3000 (переопределяется переменной HTTP_PORT; она же включает HTTP без флага)
# POST /mcp — эндпоинт MCP
# GET /health — проверка состояния
```

## Авторизация

OAuth 2.0, поток client credentials. Задайте `SENDPULSE_ID` и `SENDPULSE_SECRET` из [настроек аккаунта SendPulse](https://login.sendpulse.com/settings/#api).

Эндпоинт токена: `POST https://api.sendpulse.com/oauth/access_token` с `grant_type=client_credentials`.

Токены кэшируются и обновляются автоматически.

## Инструменты (11)

### Адресные книги
| Инструмент | Описание |
|------|-------------|
| `get_mailing_lists` | Все адресные книги со счётчиками подписчиков |

### Кампании
| Инструмент | Описание |
|------|-------------|
| `send_email` | Создать и отправить email-кампанию по адресной книге |
| `list_campaigns` | Список email-кампаний с пагинацией |
| `get_campaign_statistics` | Статистика кампании: отправлено, открытия, клики, open rate, click rate |

### Шаблоны
| Инструмент | Описание |
|------|-------------|
| `list_templates` | Список шаблонов писем (свои или системные шаблоны SendPulse) |
| `get_template` | Подробности шаблона по ID |

### SMTP
| Инструмент | Описание |
|------|-------------|
| `smtp_send_email` | Отправить транзакционное письмо через сервис SMTP |
| `smtp_list_emails` | Список отправленных SMTP-писем с пагинацией |

### Push-уведомления
| Инструмент | Описание |
|------|-------------|
| `list_push_websites` | Список сайтов с push-подписками |
| `get_push_statistics` | Статистика push-уведомлений по сайту |
| `create_push_task` | Создать push-уведомление для сайта |

## Навыки (Skills)

| Навык | Триггер |
|-------|---------|
| `skill-send-email` | «Отправь email через SendPulse» |
| `skill-list-stats` | «Статистика подписчиков» |

## Разработка

```bash
npm install
npm run build
npm test
```

## Примеры промптов

```
Покажи все адресные книги
Отправь письмо по списку 12345
Какая статистика у моей последней кампании?
Покажи мои шаблоны писем
Отправь транзакционное письмо на user@example.com
Покажи сайты с push-уведомлениями
```

## Лицензия

MIT

---

Telegram: [@vhodvai](https://t.me/vhodvai)
