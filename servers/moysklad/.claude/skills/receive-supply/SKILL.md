---
name: receive-supply
description: Приёмка товара от поставщика в МойСклад
---

Спроси у пользователя: поставщик, склад приёмки, товары с количеством и закупочными ценами.

1. Найди поставщика через `get_counterparties` — возьми meta-href.
2. Получи организацию через `list_organizations` и склад через `list_stores` — возьми их meta_href.
3. Найди каждый товар через `search_products` (или `search_assortment`) — возьми meta_href.
4. Создай приёмку через `create_supply`, передав `organization_href`, `agent_href`, `store_href` и массив `positions` (assortment_href, quantity, price_rubles в рублях). При необходимости укажи `incoming_number` и `incoming_date`.
5. Выведи: номер документа (name), сумму в рублях (sum_rubles), список позиций.
