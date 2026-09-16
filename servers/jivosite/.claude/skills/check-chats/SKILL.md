---
name: check-chats
description: Просмотр чатов и агентов JivoSite
argument-hint: ""
allowed-tools:
  - mcp__jivosite__get_chats
  - mcp__jivosite__get_messages
  - mcp__jivosite__get_agents
  - mcp__jivosite__skill_active_chats
  - mcp__jivosite__skill_agent_stats
---

# /check-chats

## Алгоритм
1. Вызови `skill_active_chats` — сводка по активным чатам; для полного списка с фильтром по статусу — `get_chats`
2. Если нужна переписка конкретного чата — `get_messages` по `chat_id`
3. Вызови `skill_agent_stats` (или `get_agents`) — кто из операторов онлайн
4. Покажи результат в читаемом формате

## Примеры
```
/check-chats
```
