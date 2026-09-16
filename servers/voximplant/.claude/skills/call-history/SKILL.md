---
name: call-history
description: История звонков Voximplant
argument-hint: ""
allowed-tools:
  - mcp__voximplant__skill-call-history
  - mcp__voximplant__get_call_history
---

# /call-history

## Алгоритм
1. Вызови `skill-call-history` (сводка за 24 часа) или `get_call_history` за нужный период
2. Покажи результат в читаемом формате

## Примеры
```
/call-history 
```
