---
name: create-order
description: Создание заказа покупателя в МойСклад
---

Спроси у пользователя: контрагент (название или ИНН) и товары (название и количество).

1. Найди контрагента через `get_counterparties` по имени/ИНН — возьми его meta-href.
2. Найди каждый товар через `search_products` — возьми meta_href каждого.
3. Спроси у пользователя meta-href организации-продавца. **Инструмента для списка организаций в этой версии сервера нет** — href берётся из МойСклад (`/entity/organization`) или из `list_organizations` в `@theyahia/moysklad-mcp@3.1.0`.
4. Создай заказ через `create_customer_order`, передав `organization_href`, `agent_href` и массив `positions` (assortment_href, quantity, при необходимости price_rubles в рублях).
5. Выведи: номер заказа (name), сумму в рублях (sum_rubles), список позиций.
