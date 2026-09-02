---
name: create-payment
description: Создать платёж в T-Kassa и получить ссылку на оплату
argument-hint: <сумма> "<описание>"
allowed-tools:
  - Bash
  - Read
---

# /create-payment — Платёж T-Kassa

## Алгоритм
1. Вызови `init_payment` с суммой и описанием
2. Покажи PaymentURL для оплаты
3. Предложи проверить статус через `get_state`

## Примеры
```
/create-payment 5000 "Заказ #123"
```
