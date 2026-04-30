# SKILLS_IMPLEMENTATION.md — План реализации скиллов

**Дата:** 2026-04-01
**Источник:** AI_Skills_Strategy.docx + 114 серверов на npm
**Формат:** Гибридный (MCP Prompts + .claude/commands/ Markdown)

---

## АРХИТЕКТУРА

```
@theyahia/mcp-skills/              ← отдельный npm пакет + GitHub repo
├── README.md                       каталог всех скиллов
├── package.json                    @theyahia/mcp-skills
├── SKILL_TEMPLATE.md               мастер-шаблон
│
├── ecommerce/                      категория
│   ├── order-payment-delivery.md   мультисерверный скилл
│   ├── stock-check.md              одно-серверный
│   └── choose-courier.md           мультисерверный
│
├── finance/
│   ├── counterparty-check.md
│   ├── 1c-bank-reconciliation.md
│   └── invoice-payment.md
│
├── marketing/
│   ├── roi-report.md
│   ├── email-campaign.md
│   └── seo-audit.md
│
├── hr/
│   ├── resume-screening.md
│   ├── salary-analytics.md
│   └── hr-pipeline.md
│
├── comms/
│   ├── omnichannel-notify.md
│   ├── call-analysis.md
│   └── vk-publish.md
│
├── logistics/
│   ├── courier-compare.md
│   ├── bulk-shipments.md
│   └── return-flow.md
│
├── data/
│   ├── address-normalize.md
│   ├── marking-chestnyznak.md
│   └── cbr-rates.md
│
├── ai/
│   ├── content-generation.md
│   ├── review-sentiment.md
│   └── voice-bot.md
│
└── cis/
    ├── kaspi-store-management.md
    ├── kaspi-pay-delivery.md
    └── uz-payment-invoice.md
```

---

## ФОРМАТ СКИЛЛА

Каждый .md файл:

```markdown
---
id: {kebab-case-id}
name: {Название на русском}
version: 1.0.0
category: {ecommerce|finance|marketing|hr|comms|logistics|data|ai|cis}
persona: [{целевой пользователь}]
servers:
  - @theyahia/{server1}
  - @theyahia/{server2}
env_required:
  - {ENV_VAR_1}
  - {ENV_VAR_2}
tags: [{tag1}, {tag2}]
complexity: {single-server|multi-tool|multi-server}
time_saving: "{до} → {после}"
premium: {false|true}
---

# {Название}

## Что делает
{1-2 предложения}

## Требуемые серверы
- `npx -y @theyahia/{server1}` — {что делает}
- `npx -y @theyahia/{server2}` — {что делает}

## Переменные окружения
| Переменная | Сервер | Где получить |
|-----------|--------|-------------|
| {VAR} | {server} | {URL} |

## Шаги
1. {Конкретный шаг с указанием какой tool вызвать}
2. ...
3. ...

## Пример использования
«{Точная фраза которую пользователь скажет AI}»

## Обработка ошибок
- Если {ситуация} → {что делать}

## Ожидаемый результат
{Что пользователь получит в конце}
```

---

## ПЛАН РЕАЛИЗАЦИИ: 8 АГЕНТОВ ПАРАЛЛЕЛЬНО

### Агент 0: Фундамент (repo + шаблон + CI)

```
Создать:
1. D:/Yahia/experiments/mcp-servers/skills/ — корневая папка
2. package.json (@theyahia/mcp-skills)
3. README.md — каталог скиллов
4. SKILL_TEMPLATE.md — мастер-шаблон
5. Структуру папок (ecommerce/, finance/, marketing/, hr/, comms/, logistics/, data/, ai/, cis/)
6. gh repo create theYahia/mcp-skills --public
7. npm publish
```

### Агент 1: E-commerce скиллы (6 скиллов)

| # | Скилл | Серверы | Complexity |
|---|-------|---------|-----------|
| 1 | Полный цикл заказа | moysklad + cdek + yookassa + sms-ru | multi-server |
| 2 | Проверка остатков и резерв | moysklad | single |
| 3 | Выбор курьерской службы | cdek + boxberry + delovye-linii + pochta-russia | multi-server |
| 4 | Массовое создание накладных | cdek | single |
| 5 | Возврат товара | cdek + moysklad | multi-server |
| 6 | Трекинг посылок | cdek + pochta-russia | multi-server |

### Агент 2: Финансы + Данные скиллы (6 скиллов)

| # | Скилл | Серверы | Complexity |
|---|-------|---------|-----------|
| 1 | Проверка контрагента 360° | dadata + kontur-focus | multi-server |
| 2 | Нормализация адресной базы | dadata | single |
| 3 | Сверка 1С + банк | 1c-rest + sber | multi-server |
| 4 | Создание счёта в 1С | 1c-rest | single |
| 5 | Курсы валют ЦБ для 1С | cbr + 1c-rest | multi-server |
| 6 | Маркировка Честный ЗНАК | chestnyznak + moysklad | multi-server |

### Агент 3: Маркетинг скиллы (6 скиллов)

| # | Скилл | Серверы | Complexity |
|---|-------|---------|-----------|
| 1 | ROI по рекламным каналам | roistat + calltouch + yandex-metrika | multi-server |
| 2 | Еженедельный отчёт по сайту | yandex-metrika | single |
| 3 | Аудит Яндекс.Директ | yandex-direct + yandex-metrika | multi-server |
| 4 | Email-кампания по сегменту | unisender + retailcrm | multi-server |
| 5 | SEO-аудит сайта | yandex-webmaster + yandex-metrika | multi-server |
| 6 | Генерация описаний товаров | yandexgpt + moysklad | multi-server |

### Агент 4: HR скиллы (5 скиллов)

| # | Скилл | Серверы | Complexity |
|---|-------|---------|-----------|
| 1 | Скрининг резюме | hh + huntflow | multi-server |
| 2 | Публикация вакансии на площадках | hh + superjob | multi-server |
| 3 | Аналитика рынка зарплат | hh + superjob | multi-server |
| 4 | HR pipeline end-to-end | huntflow + hh + amocrm + mts-exolve | multi-server |
| 5 | Поиск кандидатов по критериям | hh | single |

### Агент 5: CRM + Коммуникации скиллы (6 скиллов)

| # | Скилл | Серверы | Complexity |
|---|-------|---------|-----------|
| 1 | Квалификация лида с обогащением | amocrm + dadata | multi-server |
| 2 | Воронка сделки под ключ | bitrix24 | single |
| 3 | Карточка клиента 360° | retailcrm + dadata + kontur-focus | multi-server |
| 4 | Омниканальное уведомление | sms-ru + vk + mts-exolve | multi-server |
| 5 | Публикация в VK из контент-плана | vk | single |
| 6 | Рассылка по сегменту CRM | amocrm + unisender | multi-server |

### Агент 6: AI + Голос скиллы (5 скиллов)

| # | Скилл | Серверы | Complexity |
|---|-------|---------|-----------|
| 1 | Транскрипция и анализ звонков | salutespeech + yandexgpt | multi-server |
| 2 | Генерация контента на русском | yandexgpt | single |
| 3 | Анализ тональности отзывов | gigachat + retailcrm | multi-server |
| 4 | Голосовой чат-бот | yandex-speechkit + yandexgpt + voximplant | multi-server |
| 5 | Суммаризация документов | yandexgpt | single |

### Агент 7: Платежи + СНГ скиллы (6 скиллов)

| # | Скилл | Серверы | Complexity |
|---|-------|---------|-----------|
| 1 | Создать платёжную ссылку | yookassa | single |
| 2 | Возврат платежа с актом | yookassa | single |
| 3 | Сравнение эквайеров | yookassa + robokassa + cloudpayments | multi-server |
| 4 | 54-ФЗ формирование чека | yookassa + tkassa | multi-server |
| 5 | Kaspi магазин управление | kaspi | single |
| 6 | Kaspi Pay + СДЭК (КЗ) | kaspi + cdek | multi-server |

---

## ИТОГО

| Агент | Категория | Скиллов | Серверов задействовано |
|-------|-----------|---------|----------------------|
| 0 | Фундамент | — | — |
| 1 | E-commerce | 6 | moysklad, cdek, yookassa, sms-ru, boxberry, delovye-linii, pochta-russia |
| 2 | Финансы + Данные | 6 | dadata, kontur-focus, 1c-rest, sber, cbr, chestnyznak, moysklad |
| 3 | Маркетинг | 6 | roistat, calltouch, yandex-metrika, yandex-direct, unisender, retailcrm, yandex-webmaster, yandexgpt, moysklad |
| 4 | HR | 5 | hh, superjob, huntflow, amocrm, mts-exolve |
| 5 | CRM + Коммуникации | 6 | amocrm, bitrix24, retailcrm, dadata, kontur-focus, sms-ru, vk, mts-exolve, unisender |
| 6 | AI + Голос | 5 | salutespeech, yandexgpt, gigachat, retailcrm, yandex-speechkit, voximplant |
| 7 | Платежи + СНГ | 6 | yookassa, robokassa, cloudpayments, tkassa, kaspi, cdek |
| **ИТОГО** | | **40 скиллов** | **30+ серверов** |

---

## МЕТРИКИ

| Метрика | Цель |
|---------|------|
| Скиллов всего | 40 |
| Multi-server | 28 |
| Single-server | 12 |
| Категорий | 9 |
| С готовым промпт-текстом | 40 (все) |
| Premium (платные) | 5-8 (самые сложные multi-server) |
