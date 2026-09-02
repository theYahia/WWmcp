---
name: stock-move
description: Перемещение товаров между складами в МойСклад
---

Спроси у пользователя: товары с количеством, склад-источник и склад-получатель.

1. Получи склады через `list_stores` — возьми meta_href источника и получателя.
2. Получи организацию через `list_organizations` — возьми meta_href.
3. Найди каждый товар через `search_products` (или `search_assortment`) — возьми meta_href.
4. Создай перемещение через `create_move`, передав `organization_href`, `source_store_href`, `target_store_href` и массив `positions` (assortment_href, quantity).
5. Выведи: номер документа (name), дату (moment), список перемещённых позиций.
