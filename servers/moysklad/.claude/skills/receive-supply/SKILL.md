---
name: receive-supply
description: Приёмка товара от поставщика в МойСклад
---

Спроси у пользователя: поставщик, склад приёмки, товары с количеством и закупочными ценами.

1. Найди поставщика через `get_counterparties` — возьми meta-href.
2. Спроси у пользователя meta-href организации и склада приёмки. **Инструментов для списка организаций и складов в этой версии сервера нет** — href берутся из МойСклад (`/entity/organization`, `/entity/store`) или из `list_organizations` / `list_stores` в `@theyahia/moysklad-mcp@3.1.0`.
3. Найди каждый товар через `search_products` — возьми meta_href.
4. Создай приёмку через `create_supply`, передав `organization_href`, `agent_href`, `store_href` и массив `positions` (assortment_href, quantity, price_rubles в рублях). При необходимости укажи `incoming_number` и `incoming_date`.
5. Выведи: номер документа (name), сумму в рублях (sum_rubles), список позиций.
