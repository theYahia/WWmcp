---
name: create-invoice
description: Создать счёт в Робокасса и получить ссылку на оплату
argument-hint: <сумма> <номер счёта> "<описание>"
allowed-tools:
  - Bash
  - Read
---

# /create-invoice — Счёт Робокасса

## Алгоритм
1. Вызови `create_invoice` с суммой, номером и описанием
2. Покажи ссылку на оплату

## Примеры
```
/create-invoice 5000 42 "Заказ #42"
```
