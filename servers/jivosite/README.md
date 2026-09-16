# Jivo (JivoSite) MCP — онлайн-чат с клиентами под управлением нейросети

Если вы искали, как подключить чат Jivo к ИИ-ассистенту, разобрать переписку с клиентом, ответить в диалог или собрать сводку по операторам без ручного листания истории — это оно. **10 инструментов + 2 скилла** поверх JivoSite API: чаты, агенты, контакты, сообщения и вебхуки.

[![npm](https://img.shields.io/npm/v/@theyahia/jivosite-mcp)](https://www.npmjs.com/package/@theyahia/jivosite-mcp)
[![License: MIT](https://img.shields.io/badge/License-MIT-yellow.svg)](https://opensource.org/licenses/MIT)

Часть серии [Russian API MCP](https://github.com/theYahia/russian-mcp) (50 серверов) by [@theYahia](https://github.com/theYahia).

## Установка

### Claude Desktop

```json
{
  "mcpServers": {
    "jivosite": {
      "command": "npx",
      "args": ["-y", "@theyahia/jivosite-mcp"],
      "env": { "JIVOSITE_TOKEN": "your-token" }
    }
  }
}
```

### Claude Code

```bash
claude mcp add jivosite -e JIVOSITE_TOKEN=your-token -- npx -y @theyahia/jivosite-mcp
```

### VS Code / Cursor

```json
{
  "servers": {
    "jivosite": {
      "command": "npx",
      "args": ["-y", "@theyahia/jivosite-mcp"],
      "env": { "JIVOSITE_TOKEN": "your-token" }
    }
  }
}
```

### Smithery

```bash
npx @smithery/cli install @theyahia/jivosite-mcp
```

> Требуется `JIVOSITE_TOKEN`. Получите в панели JivoSite -> Управление -> API.

## Режимы запуска

### Stdio (по умолчанию)

```bash
npx -y @theyahia/jivosite-mcp
```

### Streamable HTTP

```bash
npx -y @theyahia/jivosite-mcp --http --port=3000
```

- MCP endpoint: `http://localhost:3000/mcp`
- Health check: `http://localhost:3000/health`

## Инструменты (10)

| Инструмент | Описание |
|------------|----------|
| `get_chats` | Список чатов (фильтр по статусу) |
| `get_agents` | Список агентов (операторов) |
| `get_contacts` | Список контактов (поиск по имени/email/телефону) |
| `create_contact` | Создать контакт |
| `get_messages` | Сообщения из чата по chat_id |
| `send_message` | Отправить сообщение в чат |
| `get_webhooks` | Список вебхуков |
| `create_webhook` | Создать вебхук |
| `delete_webhook` | Удалить вебхук |

## Скиллы (2)

| Скилл | Описание |
|-------|----------|
| `skill_active_chats` | Активные чаты сейчас |
| `skill_agent_stats` | Статистика операторов (онлайн/оффлайн) |

## Примеры

```
Покажи последние чаты
Список агентов JivoSite
Найди контакт по email
Покажи сообщения из чата chat-123
Какие чаты сейчас активны?
Сколько операторов онлайн?
Создай вебхук для chat_accepted
```

## Реферальная программа JivoSite

JivoSite предлагает партнёрскую программу с **пожизненной комиссией 25-35%** от оплат привлечённых клиентов.

- **25%** — базовая ставка
- **30%** — от 10 привлечённых клиентов
- **35%** — от 50 привлечённых клиентов
- Выплаты ежемесячно, пожизненно
- Регистрация: [jivo.ru/partners](https://www.jivo.ru/partners/)

> Подключите JivoSite и зарабатывайте на каждом клиенте.

## Лицензия

MIT

---

Telegram: [@vhodvai](https://t.me/vhodvai)
