# Deep Research — Улучшение 47 существующих MCP-серверов для российских API

## Контекст

Я — @theyahia (npm org, GitHub: github.com/theYahia). У меня **47 MCP-серверов** для российских API. Все имеют реальный код (TypeScript, src/, tools/, client.ts). Три сервера уже в production-grade состоянии:

- **DaData MCP** (`@metarebalance/dadata-mcp`) — 31 tool, 99 тестов, Streamable HTTP, smithery.yaml, v1.0.6
- **МойСклад MCP** (`@theyahia/moysklad-mcp`) — 10 tools, тесты, Streamable HTTP (в процессе)
- **СДЭК MCP** (`@theyahia/cdek-mcp`) — 8 tools, OAuth 2.0, sandbox (в процессе)

Остальные 44 сервера имеют код, но:
- Нет тестов
- Нет Streamable HTTP
- README минимальный
- Не проверена актуальность API endpoints
- Не проверена корректность Zod-схем
- Нет CI/CD (GitHub Actions добавляется)

## Полный список 47 серверов по категориям

### Платежи (4)
| Сервер | npm | Tools | API | Авторизация |
|--------|-----|-------|-----|-------------|
| yookassa-mcp | @theyahia/yookassa-mcp | 10 | ЮKassa v3 | HTTP Basic (shop_id:secret) |
| tkassa-mcp | @theyahia/tkassa-mcp | ~8 | Т-Касса (Tinkoff) | Token |
| robokassa-mcp | @theyahia/robokassa-mcp | ~6 | Robokassa | MD5 signature |
| cloudpayments-mcp | @theyahia/cloudpayments-mcp | ~8 | CloudPayments | HTTP Basic |

### E-commerce (4)
| Сервер | npm | Tools | API | Авторизация |
|--------|-----|-------|-----|-------------|
| ozon-mcp | @theyahia/ozon-mcp | 12 | Ozon Seller v3 | Client-Id + Api-Key headers |
| wildberries-mcp | @theyahia/wildberries-mcp | 12 | WB Seller | JWT (180 дней) |
| yandex-market-mcp | @theyahia/yandex-market-mcp | 10 | YM Partner | API Key header |
| insales-mcp | @theyahia/insales-mcp | ~6 | InSales | API Key |

### Данные и обогащение (4)
| Сервер | npm | Tools | API | Авторизация |
|--------|-----|-------|-----|-------------|
| dadata-mcp | @metarebalance/dadata-mcp | **31** | DaData | Token + Secret |
| kontur-focus-mcp | @theyahia/kontur-focus-mcp | ~6 | Контур.Фокус | API Key |
| cbr-mcp | @theyahia/cbr-mcp | 5 | ЦБ РФ | Без авторизации |
| chestnyznak-mcp | @theyahia/chestnyznak-mcp | ~5 | Честный ЗНАК | Token |

### CRM и ERP (8)
| Сервер | npm | Tools | API |
|--------|-----|-------|-----|
| amocrm-mcp | @theyahia/amocrm-mcp | 10 | amoCRM v4 (OAuth 2.0) |
| bitrix24-mcp | @theyahia/bitrix24-mcp | ~8 | Bitrix24 REST (OAuth 2.0) |
| moysklad-mcp | @theyahia/moysklad-mcp | 10 | МойСклад JSON API 1.2 |
| retailcrm-mcp | @theyahia/retailcrm-mcp | ~8 | RetailCRM v5 |
| megaplan-mcp | @theyahia/megaplan-mcp | ~6 | Мегаплан |
| planfix-mcp | @theyahia/planfix-mcp | ~6 | ПланФикс XML API |
| kaiten-mcp | @theyahia/kaiten-mcp | ~6 | Kaiten REST |
| elma365-mcp | @theyahia/elma365-mcp | ~6 | ELMA365 |

### Доставка (4)
| Сервер | npm | Tools | API |
|--------|-----|-------|-----|
| cdek-mcp | @theyahia/cdek-mcp | 8 | СДЭК v2 (OAuth 2.0) |
| boxberry-mcp | @theyahia/boxberry-mcp | ~6 | Boxberry |
| delovye-linii-mcp | @theyahia/delovye-linii-mcp | ~6 | Деловые Линии |
| pochta-russia-mcp | @theyahia/pochta-russia-mcp | ~6 | Почта России |

### Маркетинг и аналитика (8)
| Сервер | npm | Tools | API |
|--------|-----|-------|-----|
| yandex-metrika-mcp | @theyahia/yandex-metrika-mcp | 6 | Яндекс.Метрика |
| yandex-direct-mcp | @theyahia/yandex-direct-mcp | ~8 | Яндекс.Директ |
| yandex-webmaster-mcp | @theyahia/yandex-webmaster-mcp | ~6 | Яндекс.Вебмастер |
| unisender-mcp | @theyahia/unisender-mcp | ~8 | Unisender |
| sendpulse-mcp | @theyahia/sendpulse-mcp | ~6 | SendPulse |
| roistat-mcp | @theyahia/roistat-mcp | ~6 | Roistat |
| calltouch-mcp | @theyahia/calltouch-mcp | ~6 | Calltouch |
| mindbox-mcp | @theyahia/mindbox-mcp | ~6 | Mindbox |

### HR (3)
| Сервер | npm | Tools | API |
|--------|-----|-------|-----|
| hh-mcp | @theyahia/hh-mcp | 8 | hh.ru (OAuth 2.0) |
| superjob-mcp | @theyahia/superjob-mcp | ~6 | SuperJob |
| huntflow-mcp | @theyahia/huntflow-mcp | ~6 | HuntFlow |

### Коммуникации (7)
| Сервер | npm | Tools | API |
|--------|-----|-------|-----|
| vk-mcp | @theyahia/vk-mcp | ~8 | VK API |
| jivosite-mcp | @theyahia/jivosite-mcp | ~6 | JivoSite |
| mts-exolve-mcp | @theyahia/mts-exolve-mcp | ~6 | MTS Exolve |
| mango-office-mcp | @theyahia/mango-office-mcp | ~6 | Mango Office |
| voximplant-mcp | @theyahia/voximplant-mcp | ~6 | Voximplant |
| sms-ru-mcp | @theyahia/sms-ru-mcp | ~5 | SMS.ru |
| tilda-mcp | @theyahia/tilda-mcp | ~5 | Tilda |

### AI/ML (4)
| Сервер | npm | Tools | API |
|--------|-----|-------|-----|
| gigachat-mcp | @theyahia/gigachat-mcp | ~6 | GigaChat (Sber) |
| yandexgpt-mcp | @theyahia/yandexgpt-mcp | ~6 | YandexGPT |
| salutespeech-mcp | @theyahia/salutespeech-mcp | ~5 | SaluteSpeech |
| yandex-speechkit-mcp | @theyahia/yandex-speechkit-mcp | ~5 | Yandex SpeechKit |

### Другое (5)
| Сервер | npm | Tools | API |
|--------|-----|-------|-----|
| sber-mcp | @theyahia/sber-mcp | ~6 | Сбер API |
| 1c-rest-mcp | @theyahia/1c-rest-mcp | ~6 | 1С REST/OData |
| getcourse-mcp | @theyahia/getcourse-mcp | ~6 | GetCourse |
| travelpayouts-mcp | @theyahia/travelpayouts-mcp | ~6 | Travelpayouts |
| kaspi-mcp | @theyahia/kaspi-mcp | ~5 | Kaspi.kz |

---

## Что нужно исследовать

### 1. Аудит актуальности API

Для каждого из 47 серверов проверить:
- **API ещё работает?** Не deprecated? Не сменили версию?
- **Endpoints актуальны?** (Ozon уже выключил v2, перешёл на v3 — мы исправили)
- **Авторизация не изменилась?**
- **Rate limits актуальны?** Не ужесточили?
- **Появились новые endpoints** которые стоит добавить?

### 2. Конкурентный анализ по каждому серверу

Для каждого из 47 — проверить:
- **Существует ли чужой MCP для этого сервиса?** (поиск на npm, GitHub, mcp.so, Smithery, LobeHub)
- **Сколько tools у конкурента?** Мы лучше или хуже?
- **Выпустил ли вендор свой официальный MCP?** (как DaData и Bitrix24)
- **Стоит ли вообще поддерживать** этот сервер или вендор скоро выпустит свой?

Известные конкуренты:
- DaData — есть официальный MCP (4 tools), наш лучше (31)
- Bitrix24 — есть официальный MCP (mcp-dev.bitrix24.com), нам не конкурировать
- amoCRM — есть caiborg-ai/amocrm-mcp (36 tools), нам сложно конкурировать
- Wildberries — 3-4 независимых MCP низкого качества

### 3. Приоритизация доработки

Разделить 44 сервера (кроме DaData, МойСклад, СДЭК) на 3 группы:

**Группа A (довести до production):** серверы с наибольшим потенциалом
- Критерии: большая аудитория API, нет конкурентов, хорошая документация API, потенциал монетизации

**Группа B (оставить как есть, поддерживать):** рабочие серверы без срочности
- Критерии: API работает, код корректен, но нет urgency

**Группа C (заморозить или удалить):** серверы где вендор выпустил свой MCP или API умер
- Критерии: вендор выпустил официальный MCP, API deprecated, нет аудитории

### 4. Технические улучшения — что даст наибольший эффект

Для серверов из группы A:
- **Какие tools добавить** чтобы покрытие API было полным?
- **Какие error messages улучшить** чтобы AI-агент понимал что делать?
- **Нужен ли Streamable HTTP** каждому? Или только топ-10?
- **Smithery deployment** — для каких серверов критичен?

### 5. Quality gates — что значит "production-grade"

Определить минимальные требования для каждого уровня:

**Level 1 (MVP):** собирается, tools перечислены, basic README
**Level 2 (Usable):** + тесты, + error handling, + подробный README
**Level 3 (Production):** + Streamable HTTP, + smithery.yaml, + CI, + badges, + examples

Для каких серверов нужен какой уровень?

### 6. Skills (Claude Code slash-commands)

Для топ-10 серверов — какие **skills** (готовые сценарии для Claude Code) создать?
Примеры:
- DaData: `/check-counterparty ИНН` → проверка контрагента
- МойСклад: `/low-stock` → товары с остатком < 5
- СДЭК: `/calculate-delivery Москва Новосибирск 1кг` → расчёт стоимости

Какие skills дадут наибольшую ценность? Какие сценарии пользователи реально используют?

### 7. Документация и DX (Developer Experience)

- **Какой формат README работает лучше** для MCP-серверов? (таблица tools, примеры диалогов, GIF-демо?)
- **Нужна ли документация на английском** для каждого сервера?
- **Нужен ли CHANGELOG** для каждого?
- **.mcp.json** — все ли серверы имеют его? Корректен ли формат?

---

## Формат ответа

### Для каждого из 47 серверов:

1. **Статус API** — работает / deprecated / изменилась версия
2. **Конкуренты** — есть ли чужие MCP, сколько tools
3. **Группа** — A (production) / B (поддержка) / C (заморозка)
4. **Что улучшить** — конкретные tools добавить, endpoints обновить
5. **Текущий уровень** — 1 (MVP) / 2 (Usable) / 3 (Production)
6. **Целевой уровень** — куда довести
7. **Трудозатраты** — часы на доработку

### Итоговые таблицы:

1. **Топ-10 серверов для доработки** (отсортированы по ROI: impact / effort)
2. **Серверы для заморозки** (вендор выпустил свой, нет смысла поддерживать)
3. **Skills план** — какие skills для каких серверов
4. **Roadmap доработки** — в каком порядке, сколько времени

Не давай абстрактных советов. Конкретные endpoints, конкретные конкуренты, конкретные цифры.
