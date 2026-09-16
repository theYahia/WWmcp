---
name: warehouse-management
description: Управление складом МойСклад — товары, остатки, заказы, контрагенты, документы
argument-hint: <действие> [детали]
---

# /warehouse-management — операции в МойСклад

## Алгоритм

1. `search_products` — найти товары по названию/артикулу; `search_assortment` — единый поиск по товарам, модификациям, услугам и комплектам.
2. `get_stock` — проверить остатки; для разреза по складам передай `group_by: "store"` или вызови `get_stock_by_store`.
3. `get_counterparties` — найти покупателей/поставщиков (`create_counterparty` — завести нового).
4. `list_organizations` и `list_stores` — получить meta-href организации и склада для документов.
5. Создать документ:
   - `create_customer_order` — заказ покупателя, `create_demand` — отгрузка по нему
   - `create_supply` — приёмка, `create_purchase_order` — заказ поставщику
   - `create_move` — перемещение между складами
   - `create_enter` / `create_loss` — оприходование и списание
   - `create_inventory` — инвентаризация
   - `create_sales_return` / `create_purchase_return` — возвраты
   - `create_invoice_out` / `create_invoice_in` — счета
   - `create_payment_in` / `create_payment_out` / `create_cash_in` / `create_cash_out` — деньги
6. `get_orders` — посмотреть заказы, `get_profit_report` — выручка и прибыль, `get_turnover` — обороты, `get_money_report` — остатки денег.

## Важно

- Цены, которые **возвращают** инструменты, уже в **рублях** (сервер сам конвертирует из копеек). Исключение — `get_dashboard`, там суммы в копейках, как их отдаёт МойСклад.
- При создании документов цены передаются в **рублях** (конвертируются в копейки автоматически).
- Документам нужны **meta-href** организации (`list_organizations`), контрагента (`get_counterparties`) и склада (`list_stores`), а не просто UUID.
- Статусы документов меняются по meta-href состояния: список — `get_metadata` для нужного типа сущности, смена статуса заказа — `update_customer_order_status`.
- Если для нужного типа документа нет отдельного инструмента, используй универсальные `get_documents` / `get_document` с полем `entity_type`.

## Формат ответа

```
## Склад МойСклад

### Товары по запросу «laptop»
1. Laptop Pro 15 — артикул: LP15 — цена: 89 990 ₽ — остаток: 42
2. ...

### Сводка остатков
Всего позиций: 156
Критический остаток (<5): 3 товара
```

## Примеры

```
/warehouse-management найди товары "laptop"
/warehouse-management проверь остатки
/warehouse-management найди контрагента "Ромашка"
/warehouse-management создай заказ покупателя
/warehouse-management перемести 10 штук LP15 с основного склада в розницу
```
