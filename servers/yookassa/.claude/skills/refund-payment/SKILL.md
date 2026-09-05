---
name: refund-payment
description: Возврат по платежу — полный или частичный. Проверяет статус перед возвратом
argument-hint: <payment_id> [сумма]
---

# /refund-payment — Возврат по платежу

## Алгоритм

1. Вызови `get_payment` чтобы проверить что платёж в статусе `succeeded`
2. Если статус не `succeeded` — сообщи что возврат невозможен
3. Если сумма не указана — возврат на полную сумму платежа
4. Вызови `create_refund` с payment_id и amount
5. Покажи результат

## Формат ответа

```
## Возврат выполнен

**Платёж**: pay_xxx (5 000 ₽, succeeded)
**Возврат**: refund_xxx
**Сумма возврата**: 2 500 ₽
**Статус**: succeeded
```

## Примеры

```
/refund-payment pay_xxx 2500
/refund-payment pay_xxx
```
