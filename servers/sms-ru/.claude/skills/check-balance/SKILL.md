---
name: check-balance
description: "Проверь баланс SMS.ru"
argument-hint: ""
allowed-tools:
  - mcp__sms-ru__get_balance
  - mcp__sms-ru__get_senders
---

# /check-balance

Проверка баланса и состояния аккаунта SMS.ru.

## Алгоритм
1. Вызови get_balance для получения текущего баланса
2. Вызови get_senders для списка одобренных отправителей
3. Покажи результат в читаемом формате:
   - Баланс в рублях
   - Список одобренных отправителей (если есть)

## Примеры
```
/check-balance
```