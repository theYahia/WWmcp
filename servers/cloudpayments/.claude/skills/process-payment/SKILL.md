---
name: process-payment
description: Обработать платёж в CloudPayments — списание, проверка статуса
argument-hint: <сумма> "<описание>"
allowed-tools:
  - Bash
  - Read
---

# /process-payment — Платёж CloudPayments

## Алгоритм
1. Вызови `charge` с суммой и описанием
2. Покажи результат транзакции
3. При необходимости — `get_transaction` для проверки

## Примеры
```
/process-payment 5000 "Подписка"
```
