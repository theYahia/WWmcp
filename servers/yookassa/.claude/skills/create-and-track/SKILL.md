---
name: create-and-track
description: Создать платёж в ЮKassa и показать ссылку для оплаты. Использует create_payment и get_payment
argument-hint: <сумма> "<описание>"
---

# /create-and-track — Создать и отследить платёж

## Алгоритм

1. Получи сумму и описание от пользователя
2. Вызови `create_payment` с amount, description, capture=true
3. Покажи ссылку на оплату из confirmation.confirmation_url
4. Предложи проверить статус через `get_payment`

## Формат ответа

```
## Платёж создан

**ID**: pay_xxx
**Сумма**: 5 000 ₽
**Статус**: pending
**Ссылка для оплаты**: https://yoomoney.ru/checkout/payments/...

Когда клиент оплатит, скажите: "Проверь статус платежа pay_xxx"
```

## Примеры

```
/create-and-track 5000 "Заказ #123"
/create-and-track 15000 "Консультация" sbp
```
