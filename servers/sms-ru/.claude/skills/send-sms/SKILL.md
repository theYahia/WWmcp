---
name: send-sms
description: "Отправь SMS через SMS.ru"
argument-hint: "<номер> <текст>"
allowed-tools:
  - mcp__sms-ru__send_sms
  - mcp__sms-ru__get_cost
---

# /send-sms

Отправка SMS через MCP-сервер sms-ru-mcp.

## Алгоритм
1. Запроси у пользователя номер (79XXXXXXXXX) и текст, если не указаны
2. Рассчитай стоимость через get_cost и покажи пользователю
3. Отправь SMS через send_sms
4. Покажи результат: sms_id, статус, остаток баланса

## Примеры
```
/send-sms 79001234567 Привет, это тест!
/send-sms 79161234567 Ваш код: 4821
```