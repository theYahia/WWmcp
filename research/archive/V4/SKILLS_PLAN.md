# План Skills (.claude/skills/) для всех MCP-серверов

Skills — это готовые сценарии для Claude Code (slash-команды).
Файл: `.claude/skills/{skill-name}/SKILL.md`

---

## Production серверы (приоритет #1)

### DaData MCP (✅ уже добавлены)
- `/check-counterparty` — проверка контрагента по ИНН
- `/validate-address` — валидация и стандартизация адреса

### МойСклад MCP
- `/low-stock` — товары с остатком < 5 штук
- `/create-order` — создание заказа покупателя
- `/daily-report` — выручка и прибыль за сегодня
- `/find-product` — поиск товара по названию/артикулу

### СДЭК MCP
- `/calculate-delivery` — расчёт стоимости из города А в город Б
- `/track-shipment` — отслеживание по трек-номеру
- `/find-pvz` — ближайшие пункты выдачи в городе

### YooKassa MCP
- `/create-payment` — создать платёж на сумму
- `/check-payment` — статус платежа по ID
- `/refund` — оформить возврат
- `/daily-payments` — все платежи за сегодня

### hh.ru MCP
- `/find-job` — поиск вакансий (должность, город, зарплата)
- `/salary-stats` — статистика зарплат по специальности
- `/company-vacancies` — вакансии конкретной компании

## Остальные серверы РФ (приоритет #2)

### ЦБ РФ MCP
- `/exchange-rate` — курс валюты к рублю
- `/convert` — конвертация суммы

### Wildberries MCP
- `/wb-low-stock` — товары с минимальным остатком
- `/wb-orders` — новые заказы за сегодня
- `/wb-analytics` — продажи за период

### Ozon MCP
- `/ozon-orders` — заказы FBS за сегодня
- `/ozon-analytics` — выручка за период
- `/ozon-update-prices` — обновить цены в категории

### amoCRM MCP
- `/new-leads` — новые сделки за сегодня
- `/create-lead` — создать сделку
- `/enrich-lead` — обогатить лид по ИНН (связка с dadata-mcp)

### Яндекс.Метрика MCP
- `/site-stats` — посещаемость за период
- `/traffic-sources` — откуда приходят пользователи

### Unisender MCP
- `/send-campaign` — отправить рассылку
- `/campaign-stats` — статистика рассылки

### Bitrix24 MCP
- `/bitrix-tasks` — мои задачи на сегодня
- `/create-task` — создать задачу

## CIS серверы (приоритет #3)

### НБК Казахстан MCP
- `/kzt-rate` — курс валюты к тенге
- `/kzt-convert` — конвертация через тенге

### ЦБУ Узбекистан MCP
- `/uzs-rate` — курс валюты к суму
- `/uzs-convert` — конвертация через сум

### Kaspi MCP
- `/kaspi-orders` — новые заказы Kaspi Marketplace
- `/kaspi-accept` — принять заказ

### Payme MCP
- `/payme-create` — создать чек на оплату
- `/payme-status` — статус платежа

### Click MCP
- `/click-invoice` — создать счёт
- `/click-status` — статус оплаты

### Eskiz MCP
- `/send-sms` — отправить SMS
- `/sms-balance` — баланс и лимиты
