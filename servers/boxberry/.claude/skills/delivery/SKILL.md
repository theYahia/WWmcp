---
name: delivery
description: Расчёт доставки Boxberry — поиск города, пункта выдачи и расчёт стоимости
argument-hint: <город назначения> <вес г>
allowed-tools:
  - Bash
  - Read
---

# /delivery — Доставка Boxberry

## Алгоритм

1. Вызови list_cities для поиска города назначения
2. Вызови list_points для получения пунктов выдачи в городе
3. Вызови calc_delivery с кодом первого ПВЗ и весом
4. Покажи стоимость, сроки и ближайшие ПВЗ

## Примеры

    /delivery Москва 1000
    /delivery Казань 500