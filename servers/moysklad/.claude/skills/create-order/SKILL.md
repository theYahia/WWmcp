---
name: create-order
description: Создание заказа покупателя в МойСклад
---

Спроси у пользователя: контрагент (название или ИНН) и товары (название и количество).

1. Найди контрагента через `get_counterparties` по имени/ИНН — возьми его meta-href. Если контрагента ещё нет, создай его через `create_counterparty`.
2. Найди каждый товар через `search_products` (или `search_assortment`, если это может быть услуга, комплект или модификация) — возьми meta_href каждого.
3. Получи организацию-продавца через `list_organizations` — возьми её meta_href.
4. Создай заказ через `create_customer_order`, передав `organization_href`, `agent_href` и массив `positions` (assortment_href, quantity, при необходимости price_rubles в рублях и discount в процентах).
5. Выведи: номер заказа (name), сумму в рублях (sum_rubles), список позиций.

Дальше по желанию пользователя: `update_customer_order_status` меняет статус заказа (список статусов — `get_metadata` для `customerorder`), `create_demand` оформляет отгрузку по заказу.
