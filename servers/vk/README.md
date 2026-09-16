# VK MCP — публикация во ВКонтакте и работа со стеной из нейросети

Если вы искали, как постить во ВКонтакте прямо из диалога с ИИ, читать стену сообщества, разбирать личные сообщения или снимать статистику группы без ручных выгрузок — это оно. **8 инструментов** поверх VK API: записи со стены, публикация, сообщения, друзья, пользователи, группы и статистика.

[![npm](https://img.shields.io/npm/v/@theyahia/vk-mcp)](https://www.npmjs.com/package/@theyahia/vk-mcp)
[![License: MIT](https://img.shields.io/badge/License-MIT-yellow.svg)](https://opensource.org/licenses/MIT)

Часть серии [WWmcp](https://github.com/theYahia/WWmcp) (46 серверов) by [@theYahia](https://github.com/theYahia).

## Установка

### Claude Desktop

```json
{
  "mcpServers": {
    "vk": {
      "command": "npx",
      "args": ["-y", "@theyahia/vk-mcp"],
      "env": { "VK_ACCESS_TOKEN": "your-token" }
    }
  }
}
```

### Claude Code

```bash
claude mcp add vk -e VK_ACCESS_TOKEN=your-token -- npx -y @theyahia/vk-mcp
```

### VS Code / Cursor

```json
{
  "servers": {
    "vk": {
      "command": "npx",
      "args": ["-y", "@theyahia/vk-mcp"],
      "env": { "VK_ACCESS_TOKEN": "your-token" }
    }
  }
}
```

### Smithery

```bash
npx @smithery/cli install @theyahia/vk-mcp --client claude
```

> Требуется `VK_ACCESS_TOKEN`. Получите на [vk.com/dev](https://vk.com/dev).

## Транспорт

| Режим | Запуск |
|-------|--------|
| stdio (по умолчанию) | `npx @theyahia/vk-mcp` |
| Streamable HTTP | `npx @theyahia/vk-mcp --http` (порт 3000 или `PORT=8080`) |

## Инструменты (8)

| Инструмент | Метод VK API | Описание |
|------------|-------------|----------|
| `get_wall` | `wall.get` | Записи со стены пользователя или сообщества |
| `post_wall` | `wall.post` | Публикация записи на стене |
| `search_posts` | `newsfeed.search` | Поиск постов по ключевым словам |
| `get_user` | `users.get` | Информация о пользователях |
| `get_groups` | `groups.getById` | Информация о сообществах |
| `get_friends` | `friends.get` | Список друзей пользователя |
| `send_message` | `messages.send` | Отправка сообщения |
| `get_stats` | `stats.get` | Статистика сообщества |

## Skills (Prompts)

| Skill | Описание |
|-------|----------|
| `post-wall` | Опубликуй пост в группу VK |
| `group-stats` | Статистика группы VK за N дней |

## Примеры

```
Покажи последние посты со стены Дурова
Опубликуй пост "Привет мир!" в группу 123456
Найди посты про AI в VK
Информация о группе team
Покажи моих друзей
Статистика группы 123456 за 30 дней
```

## Разработка

```bash
npm install
npm test          # Vitest
npm run build     # TypeScript
npm run dev       # tsx watch
```

## API

- Base URL: `https://api.vk.com/method/`
- API version: `v=5.199`
- Auth: `VK_ACCESS_TOKEN` (env)
- Retry: 3 попытки с exponential backoff (429, 5xx)
- Timeout: 10 секунд

## Часть серии WWmcp

**46 серверов:** [github.com/theYahia/WWmcp](https://github.com/theYahia/WWmcp)

## Лицензия

MIT

---

Часть [WWmcp](https://github.com/theYahia/WWmcp) · Telegram: [@vhodvai](https://t.me/vhodvai)

