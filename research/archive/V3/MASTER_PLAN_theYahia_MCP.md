# MASTER PLAN — @theyahia MCP-серия для российских API
**Автор:** theYahia · **npm аккаунт:** metarebalance · **npm org:** @theyahia · **GitHub:** github.com/theYahia
**Цель:** занять нишу "MCP для российских API" как личный бренд специалиста
**Горизонт:** 3 месяца · **Стек:** TypeScript + Python · **Соло**

> **npm-структура:**
> - Аккаунт: `metarebalance` (npmjs.com/~metarebalance)
> - Организация: `@theyahia` (npmjs.com/org/theyahia) — бесплатный план, public packages
> - **dadata-mcp** опубликован как `@metarebalance/dadata-mcp` (v1.0.4) — это единственный пакет вне @theyahia
> - Все остальные 50 пакетов серии — под `@theyahia/`
> - Новые MCP публикуются под `@theyahia/` для единообразия

---

> **Как использовать этот документ:**  
> Каждый раздел — это либо действие которое ты делаешь руками (5–30 минут),  
> либо готовый промпт который ты вставляешь в Claude Code CLI (`claude`).  
> Промпты помечены блоком `ПРОМПТ ДЛЯ CLAUDE CODE — копировать целиком`.

---

## НЕМЕДЛЕННО — ДО ВСЕГО ОСТАЛЬНОГО (сегодня, 1 час)

### ✅ Действие 1: Зарезервировать npm-имена (ВЫПОЛНЕНО 2026-03-30)

> **Статус:** Все 50 пакетов опубликованы под `@theyahia/`. Ни одной ошибки.
> Организация `@theyahia` создана на npmjs.com (бесплатный план, public packages).

Все 50 пакетов опубликованы. Полный список:

**Из оригинального плана (10):**
1. `@theyahia/yookassa-mcp` — YooKassa payment API
2. `@theyahia/moysklad-mcp` — МойСклад inventory API
3. `@theyahia/cdek-mcp` — СДЭК delivery API
4. `@theyahia/ozon-mcp` — Ozon Seller API
5. `@theyahia/amocrm-mcp` — amoCRM API
6. `@theyahia/cbr-mcp` — Central Bank of Russia API
7. `@theyahia/hh-mcp` — hh.ru jobs API
8. `@theyahia/yandex-metrika-mcp` — Yandex Metrika API
9. `@theyahia/unisender-mcp` — Unisender email/SMS API
10. `@theyahia/kontur-focus-mcp` — Kontur.Focus counterparty API

**Из скоринговой таблицы (40):**
11. `@theyahia/wildberries-mcp` — Wildberries Seller API
12. `@theyahia/yandex-direct-mcp` — Yandex Direct advertising API
13. `@theyahia/vk-mcp` — VK API
14. `@theyahia/gigachat-mcp` — GigaChat (Sber) AI API
15. `@theyahia/yandexgpt-mcp` — YandexGPT API
16. `@theyahia/yandex-market-mcp` — Yandex Market API
17. `@theyahia/getcourse-mcp` — GetCourse online school API
18. `@theyahia/retailcrm-mcp` — RetailCRM API
19. `@theyahia/mts-exolve-mcp` — MTS Exolve communications API
20. `@theyahia/tkassa-mcp` — T-Kassa (Tinkoff) payment API
21. `@theyahia/sms-ru-mcp` — SMS.ru API
22. `@theyahia/sendpulse-mcp` — SendPulse email/SMS API
23. `@theyahia/yandex-webmaster-mcp` — Yandex Webmaster API
24. `@theyahia/kaiten-mcp` — Kaiten project management API
25. `@theyahia/huntflow-mcp` — HuntFlow recruiting API
26. `@theyahia/robokassa-mcp` — Robokassa payment API
27. `@theyahia/salutespeech-mcp` — SaluteSpeech (Sber) API
28. `@theyahia/yandex-speechkit-mcp` — Yandex SpeechKit API
29. `@theyahia/travelpayouts-mcp` — Travelpayouts affiliate API
30. `@theyahia/kaspi-mcp` — Kaspi.kz API
31. `@theyahia/boxberry-mcp` — Boxberry delivery API
32. `@theyahia/cloudpayments-mcp` — CloudPayments API
33. `@theyahia/delovye-linii-mcp` — Delovye Linii delivery API
34. `@theyahia/sber-mcp` — Sber API
35. `@theyahia/bitrix24-mcp` — Bitrix24 CRM API
36. `@theyahia/voximplant-mcp` — Voximplant communications API
37. `@theyahia/superjob-mcp` — SuperJob jobs API
38. `@theyahia/insales-mcp` — InSales e-commerce API
39. `@theyahia/megaplan-mcp` — Megaplan CRM API
40. `@theyahia/planfix-mcp` — Planfix project management API
41. `@theyahia/elma365-mcp` — ELMA365 BPM API
42. `@theyahia/tilda-mcp` — Tilda website builder API
43. `@theyahia/jivosite-mcp` — JivoSite chat API
44. `@theyahia/mindbox-mcp` — Mindbox CDP API
45. `@theyahia/chestnyznak-mcp` — Chestniy ZNAK marking API
46. `@theyahia/roistat-mcp` — Roistat analytics API
47. `@theyahia/calltouch-mcp` — Calltouch call tracking API
48. `@theyahia/mango-office-mcp` — Mango Office telephony API
49. `@theyahia/1c-rest-mcp` — 1C REST API
50. `@theyahia/pochta-russia-mcp` — Pochta Russia API

---

### 🟡 Действие 2: Зарегистрировать на площадках (ЧАСТИЧНО 2026-03-30)

> ⚠️ **ВАЖНО:** DaData уже запустила свой официальный MCP-сервер на `https://dadata.ru/mcp/`.
> Наш dadata-mcp должен позиционироваться как: локальная npm-альтернатива с расширенным набором
> инструментов (31 vs ~4), поддержкой офлайн-режима и дополнительными API-методами.

URL репо: `https://github.com/theYahia/dadata-mcp`

#### Tier 1 — Обязательные каталоги (День 1–2)

| # | Площадка | Серверов | Как подать | Автоматизация | Статус |
|---|----------|----------|-----------|---------------|--------|
| 1 | **Official MCP Registry** | Канонический | CLI `mcp-publisher` (см. инструкцию ниже) | ✅ CLI | ⬜ |
| 2 | **mcp.so** | 19 152+ | Форма: mcp.so/submit | ❌ Руками | ✅ dadata подано |
| 3 | **PulseMCP** | 13 230+ | Автоматом из Official MCP Registry | ✅ АВТО | ⬜ ждёт Registry |
| 4 | **Glama.ai** | Крупнейший | Автоматом из GitHub/npm | ✅ АВТО | ✅ авто |
| 5 | **Smithery.ai** | 2 880+ | Требует HTTP transport — пока пропустить | ❌ Позже | ⬜ |
| 6 | **cursor.directory** | 1 800+ | Scan repo (подхватит .mcp.json) | ✅ АВТО из .mcp.json | ✅ dadata подано |
| 7 | **LobeHub MCP** | 10 000+ | PR в github.com/chatmcpclient/mcp_server_market | ✅ Claude Code делает PR | ✅ dadata PR #3, cbr PR #4 |

**Инструкция для Official MCP Registry:**

Документация: https://modelcontextprotocol.io/registry/quickstart

1. Скачать `mcp-publisher` (бинарник или Homebrew: `brew install mcp-publisher`)
   - На Windows: скачать бинарник с https://github.com/modelcontextprotocol/registry/releases
2. В репозитории dadata-mcp добавить в package.json:
   ```json
   "mcpName": "io.github.theYahia/dadata-mcp"
   ```
3. `mcp-publisher init` — создаст `server.json` (указать transport: stdio, env vars и т.д.)
4. `mcp-publisher login github` — авторизация через GitHub OAuth
5. `mcp-publisher publish` — публикация

Повторить для каждого нового MCP при релизе.

---

#### Tier 2 — Awesome-списки и каталоги с формами

| # | Площадка | Как подать | Автоматизация |
|---|----------|-----------|---------------|
| 8 | **mcpservers.org** (= wong2 + appcypher awesome-lists) | Форма: mcpservers.org/submit | ❌ Руками (бесплатно или $39 premium) |
| 9 | **mcpmarket.com** (Cline marketplace) | Форма: mcpmarket.com/submit | ❌ Руками |
| 10 | **mcp.directory** | GitHub Issue | ✅ Можно через `gh issue create` |
| 11 | **mcpserverfinder.com** (Cline) | Issue в github.com/cline/mcp-marketplace | ✅ Можно через `gh issue create` |
| 12 | **mcpserver.directory** | GitHub Issue или Google Form | ✅ Частично |

#### Tier 3 — IDE, AI-платформы, Docker

| # | Платформа | Аудитория | Как подать | Автоматизация |
|---|-----------|-----------|-----------|---------------|
| 13 | **VS Code MCP Gallery** | 15M+ MAU | Автоматом через npm — фильтр @mcp в Extensions | ✅ АВТО (npm) |
| 14 | **Windsurf MCP Marketplace** | Миллионы | Нет публичного процесса | ❌ Пропустить |
| 15 | **Claude Code Plugins** | Растущая | Форма: claude.com/plugins | ❌ Руками + ревью Anthropic |
| 16 | **Docker MCP Catalog** | Растущий | PR в github.com/docker/mcp-registry (нужен Docker-образ) | ✅ PR через CLI |
| 17 | **Continue Hub** | Растущая | Нет публичного процесса | ❌ Пропустить |
| 18 | **n8n MCP** | 80K+ GH★ | Встроенный MCP Client Tool — npm пакет обнаруживается автоматически | ✅ АВТО (npm) |

#### Tier 4 — Низкий приоритет / нет публичного процесса

| # | Площадка | Статус |
|---|----------|--------|
| 19 | MCPHub.ai | Нет ясного процесса подачи — пропустить |
| 20 | OpenTools (opentools.com) | Нет публичного процесса — пропустить |

#### Промпты для автоматизации через Claude Code

**mcp.directory — GitHub Issue:**
```
Создай GitHub Issue в репо mcp.directory для @theyahia/SERVICE-mcp.
Заголовок: "Add @theyahia/SERVICE-mcp — ОПИСАНИЕ"
Тело: название, GitHub URL, npm пакет, описание tools, Server Config JSON.
```

**mcpserverfinder.com — Issue в cline/mcp-marketplace:**
```
Создай GitHub Issue в cline/mcp-marketplace для @theyahia/SERVICE-mcp.
Приложи: GitHub URL, описание, README со всеми инструментами.
```

---

### Действие 3: Зарегистрироваться в реферальных программах

> ⚠️ **БЛОКЕР:** Нужен расчётный счёт ИП. ИП есть, счёт нужно открыть.
> TODO: Открыть расчётный счёт ИП (Тинькофф / Точка / Модуль — бесплатное обслуживание, 1 день).
> После открытия счёта — зарегистрироваться во всех рефках ниже.

| Сервис | Ссылка для регистрации | Условия |
|--------|------------------------|---------|
| **ЮKassa** | https://promo.yookassa.ru/agents | Revenue share с комиссий |
| **МойСклад** | https://partners.moysklad.ru | 75% от продаж через маркетплейс |
| **amoCRM** | https://www.amostart.ru | До 50% от лицензий |
| **СДЭК** | https://cdek.promo/partner | Фиксированная оплата за лиды |
| **Unisender** | https://affiliate.unisender.com | 25–50% от платежей |
| **CloudPayments** | https://cloudpayments.ru/agents | % от оборота |

После регистрации в каждом — сохрани реферальную ссылку. Они пойдут в README каждого MCP.

---

### ✅ Действие 4: Обновить dadata-mcp README (ВЫПОЛНЕНО 2026-03-30)

**ПРОМПТ ДЛЯ CLAUDE CODE — копировать целиком:**

```
Открой файл README.md в текущем репозитории dadata-mcp.

Добавь в самое начало файла, ПЕРЕД всем существующим контентом, следующий блок:

---
> **31 инструмент вместо ~4 у [официального DaData MCP](https://dadata.ru/mcp/).** Полное покрытие DaData API — адреса,
> компании, банки, телефоны, email, паспорта, автомобили, геолокация, 12 справочников.
> Локальная установка через `npx`, без внешнего хостинга. Часть серии [Russian API MCP](https://github.com/theYahia/russian-mcp) (50 серверов) by [@theYahia](https://github.com/theYahia).

---

Также добавь в конец README новый раздел:

## Часть серии Russian API MCP

Этот сервер — часть открытой серии MCP-серверов для российских API:

| MCP | Статус | Описание |
|-----|--------|----------|
| [@metarebalance/dadata-mcp](https://github.com/theYahia/dadata-mcp) | ✅ готов | Адреса, компании, банки, телефоны *(npm: @metarebalance)* |
| @theyahia/cbr-mcp | 📅 скоро | Курсы валют, ключевая ставка |
| @theyahia/yookassa-mcp | 📅 скоро | Платежи, возвраты, чеки 54-ФЗ |
| @theyahia/moysklad-mcp | 📅 скоро | Склад, заказы, контрагенты |
| @theyahia/cdek-mcp | 📅 скоро | Расчёт, создание, трекинг |
| @theyahia/ozon-mcp | 📅 скоро | Товары, цены, аналитика |
| @theyahia/amocrm-mcp | 📅 скоро | Сделки, контакты, воронки |
| ... | 📅 | **+43 сервера** — полный список на витрине |

**50 MCP-серверов для российских API:** [github.com/theYahia/russian-mcp](https://github.com/theYahia/russian-mcp)
```

---

### ✅ Действие 5: Создать репо-«витрину» (ВЫПОЛНЕНО 2026-03-30)

На GitHub создай новый репо: `theYahia/russian-mcp`  
Description: `Open-source MCP servers for Russian APIs — 50 servers for YooKassa, Ozon, МойСклад, СДЭК, amoCRM, Wildberries and more`
Потом запусти:

**ПРОМПТ ДЛЯ CLAUDE CODE — копировать целиком:**

```
Создай README.md для репозитория-витрины russian-mcp.

Это главная страница серии из 50 MCP-серверов для российских API от @theYahia.

Структура файла:

1. Заголовок и описание: "50 open-source MCP servers for Russian APIs"
2. Таблица ВСЕХ 50 MCP со столбцами: пакет (npm ссылка), статус (эмодзи), tools (число), описание

   Группировка по категориям:

   **E-commerce & Маркетплейсы:**
   - @theyahia/ozon-mcp — 📅 — 12 tools — Товары, цены, аналитика, FBO/FBS
   - @theyahia/wildberries-mcp — 📅 — Товары, заказы, аналитика
   - @theyahia/yandex-market-mcp — 📅 — Маркетплейс Яндекса
   - @theyahia/insales-mcp — 📅 — E-commerce платформа

   **Платежи:**
   - @theyahia/yookassa-mcp — 📅 — 10 tools — Платежи, возвраты, чеки 54-ФЗ
   - @theyahia/tkassa-mcp — 📅 — Tinkoff платежи
   - @theyahia/robokassa-mcp — 📅 — Робокасса
   - @theyahia/cloudpayments-mcp — 📅 — CloudPayments

   **Данные и обогащение:**
   - @metarebalance/dadata-mcp — ✅ v1.0 — 31 tool — Адреса, компании, банки, телефоны *(единственный пакет под @metarebalance)*
   - @theyahia/kontur-focus-mcp — 📅 — Проверка контрагентов
   - @theyahia/cbr-mcp — 📅 — 5 tools — Курсы валют, ключевая ставка
   - @theyahia/chestnyznak-mcp — 📅 — Маркировка товаров

   **CRM & Управление:**
   - @theyahia/amocrm-mcp — 📅 — 10 tools — Сделки, контакты, воронки
   - @theyahia/bitrix24-mcp — 📅 — CRM, задачи, диск
   - @theyahia/moysklad-mcp — 📅 — 10 tools — Склад, заказы, контрагенты
   - @theyahia/retailcrm-mcp — 📅 — Розничная CRM
   - @theyahia/megaplan-mcp — 📅 — CRM и управление проектами
   - @theyahia/planfix-mcp — 📅 — Управление проектами
   - @theyahia/kaiten-mcp — 📅 — Канбан и управление проектами
   - @theyahia/elma365-mcp — 📅 — BPM платформа

   **Доставка и логистика:**
   - @theyahia/cdek-mcp — 📅 — 8 tools — Расчёт, создание, трекинг
   - @theyahia/boxberry-mcp — 📅 — Доставка
   - @theyahia/delovye-linii-mcp — 📅 — Грузоперевозки
   - @theyahia/pochta-russia-mcp — 📅 — Почта России

   **Маркетинг и аналитика:**
   - @theyahia/yandex-metrika-mcp — 📅 — 6 tools — Аналитика сайта
   - @theyahia/yandex-direct-mcp — 📅 — Контекстная реклама
   - @theyahia/yandex-webmaster-mcp — 📅 — SEO и вебмастер
   - @theyahia/unisender-mcp — 📅 — Email и SMS рассылки
   - @theyahia/sendpulse-mcp — 📅 — Email/SMS маркетинг
   - @theyahia/roistat-mcp — 📅 — Сквозная аналитика
   - @theyahia/calltouch-mcp — 📅 — Коллтрекинг
   - @theyahia/mindbox-mcp — 📅 — CDP платформа

   **HR и рекрутинг:**
   - @theyahia/hh-mcp — 📅 — 8 tools — Вакансии, резюме, зарплаты
   - @theyahia/superjob-mcp — 📅 — Вакансии
   - @theyahia/huntflow-mcp — 📅 — Рекрутинг ATS

   **Коммуникации:**
   - @theyahia/vk-mcp — 📅 — Соцсеть ВКонтакте
   - @theyahia/jivosite-mcp — 📅 — Онлайн-чат
   - @theyahia/mts-exolve-mcp — 📅 — Телефония и SMS
   - @theyahia/mango-office-mcp — 📅 — Виртуальная АТС
   - @theyahia/voximplant-mcp — 📅 — Облачные коммуникации
   - @theyahia/sms-ru-mcp — 📅 — SMS-рассылки
   - @theyahia/tilda-mcp — 📅 — Конструктор сайтов

   **AI и ML:**
   - @theyahia/gigachat-mcp — 📅 — GigaChat (Сбер)
   - @theyahia/yandexgpt-mcp — 📅 — YandexGPT
   - @theyahia/salutespeech-mcp — 📅 — Распознавание речи (Сбер)
   - @theyahia/yandex-speechkit-mcp — 📅 — Распознавание речи (Яндекс)

   **Финансы и банки:**
   - @theyahia/sber-mcp — 📅 — Сбер API
   - @theyahia/1c-rest-mcp — 📅 — 1С REST API

   **Партнёрки и travel:**
   - @theyahia/travelpayouts-mcp — 📅 — Партнёрка авиабилетов
   - @theyahia/kaspi-mcp — 📅 — Kaspi.kz (Казахстан)
   - @theyahia/getcourse-mcp — 📅 — Онлайн-школы

3. Раздел "Быстрый старт" — как добавить любой из серверов в Claude Desktop / Cursor / VS Code
4. Раздел "E-commerce стек" — пример как dadata + yookassa + moysklad + cdek работают вместе
5. Раздел "Автор" — ссылка на github.com/theYahia
6. Бейджи: npm downloads, GitHub stars, License MIT
```

---

## Часть 3. Скоринг и приоритизация

### Полная скоринговая таблица

**Критерии (1–10):** А — аудитория, К — качество API, Конк — конкуренция (10 = никого), С — простота реализации, В — виральность, М — монетизация, Син — синергия с DaData/ЮKassa.

| # | Сервис | А | К | Конк | С | В | М | Син | Σ |
|---|--------|---|---|------|---|---|---|-----|---|
| 1 | Ozon Seller API | 10 | 9 | 10 | 7 | 10 | 6 | 9 | **61** |
| 2 | ЮKassa | 9 | 10 | 10 | 8 | 9 | 8 | 10 | **64** |
| 3 | amoCRM | 8 | 8 | 10 | 7 | 8 | 9 | 8 | **58** |
| 4 | МойСклад | 9 | 10 | 10 | 8 | 7 | 7 | 10 | **61** |
| 5 | Wildberries API | 10 | 8 | 5 | 7 | 10 | 5 | 9 | **54** |
| 6 | СДЭК | 8 | 9 | 10 | 7 | 7 | 5 | 9 | **55** |
| 7 | Яндекс.Метрика | 10 | 8 | 10 | 7 | 8 | 4 | 6 | **53** |
| 8 | Яндекс.Директ | 9 | 8 | 10 | 6 | 9 | 5 | 6 | **53** |
| 9 | hh.ru | 9 | 8 | 10 | 7 | 8 | 4 | 5 | **51** |
| 10 | ЦБ РФ | 7 | 6 | 10 | 10 | 6 | 2 | 8 | **49** |
| 11 | VK API | 10 | 7 | 10 | 6 | 8 | 4 | 5 | **50** |
| 12 | Контур.Фокус | 8 | 8 | 10 | 8 | 5 | 5 | 9 | **53** |
| 13 | GigaChat | 7 | 8 | 7 | 7 | 9 | 4 | 6 | **48** |
| 14 | YandexGPT | 7 | 8 | 8 | 7 | 9 | 4 | 6 | **49** |
| 15 | Яндекс.Маркет | 8 | 8 | 10 | 7 | 7 | 4 | 8 | **52** |
| 16 | Unisender | 7 | 7 | 10 | 8 | 5 | 7 | 7 | **51** |
| 17 | GetCourse | 7 | 5 | 10 | 8 | 7 | 5 | 5 | **47** |
| 18 | RetailCRM | 6 | 7 | 10 | 7 | 5 | 6 | 8 | **49** |
| 19 | МТС Exolve | 7 | 8 | 10 | 7 | 6 | 5 | 5 | **48** |
| 20 | Т-Касса | 8 | 8 | 10 | 8 | 5 | 4 | 8 | **51** |
| 21 | SMS.ru | 6 | 6 | 10 | 10 | 4 | 3 | 6 | **45** |
| 22 | SendPulse | 7 | 7 | 10 | 8 | 5 | 6 | 6 | **49** |
| 23 | Я.Вебмастер | 7 | 7 | 10 | 7 | 6 | 3 | 5 | **45** |
| 24 | Kaiten | 5 | 8 | 10 | 8 | 6 | 3 | 3 | **43** |
| 25 | HuntFlow | 5 | 8 | 10 | 7 | 5 | 4 | 4 | **43** |
| 26 | Robokassa | 6 | 6 | 10 | 9 | 4 | 5 | 7 | **47** |
| 27 | SaluteSpeech | 5 | 7 | 10 | 7 | 6 | 3 | 4 | **42** |
| 28 | Я.SpeechKit | 6 | 7 | 10 | 7 | 6 | 3 | 5 | **44** |
| 29 | Travelpayouts | 6 | 7 | 10 | 8 | 5 | 7 | 3 | **46** |
| 30 | Kaspi.kz | 5 | 7 | 10 | 7 | 6 | 4 | 7 | **46** |
| 31 | Boxberry | 5 | 6 | 10 | 7 | 4 | 3 | 7 | **42** |
| 32 | CloudPayments | 5 | 8 | 10 | 8 | 4 | 4 | 7 | **46** |
| 33 | Деловые Линии | 6 | 7 | 10 | 7 | 4 | 3 | 7 | **44** |
| 34 | Сбер API | 8 | 6 | 10 | 6 | 5 | 4 | 7 | **46** |
| 35 | Битрикс24 | 10 | 9 | 2 | 5 | 7 | 7 | 8 | **48** |
| 36 | Voximplant | 5 | 8 | 10 | 6 | 5 | 4 | 4 | **42** |
| 37 | SuperJob | 6 | 6 | 10 | 7 | 4 | 3 | 4 | **40** |
| 38 | InSales | 5 | 7 | 10 | 7 | 4 | 5 | 6 | **44** |
| 39 | Мегаплан | 4 | 6 | 10 | 7 | 3 | 3 | 5 | **38** |
| 40 | Planfix | 4 | 7 | 10 | 7 | 3 | 3 | 4 | **38** |
| 41 | ELMA365 | 4 | 7 | 10 | 6 | 4 | 3 | 5 | **39** |
| 42 | Tilda | 7 | 4 | 10 | 8 | 5 | 3 | 4 | **41** |
| 43 | JivoSite | 6 | 5 | 10 | 7 | 4 | 3 | 5 | **40** |
| 44 | Mindbox | 4 | 7 | 10 | 6 | 4 | 4 | 5 | **40** |
| 45 | Честный ЗНАК | 8 | 5 | 10 | 4 | 5 | 2 | 6 | **40** |
| 46 | Roistat | 5 | 6 | 10 | 7 | 5 | 4 | 5 | **42** |
| 47 | Calltouch | 4 | 6 | 10 | 7 | 4 | 4 | 5 | **40** |
| 48 | Mango Office | 5 | 4 | 10 | 5 | 4 | 4 | 5 | **37** |
| 49 | 1С REST API | 10 | 5 | 6 | 4 | 7 | 3 | 8 | **43** |
| 50 | Почта России | 7 | 5 | 10 | 5 | 4 | 2 | 6 | **39** |

---

> **Примечание к порядку фаз:** Фазы идут НЕ по скорингу, а по стратегической логике:
> - Фаза 1 (ЦБ РФ, Σ=49) — quick win за 1 день, без авторизации, проверка шаблона
> - Фаза 2 (ЮKassa, Σ=64) — первый монетизируемый MCP
> - Фазы 3–4 (МойСклад+СДЭК) — e-commerce стек
> - Фаза 5 (Ozon, Σ=61) — самая большая аудитория
> - Фазы покрывают топ-8 из скоринга. Остальные 42 сервиса из таблицы — после Фазы 8,
>   приоритет по убыванию Σ.

## ФАЗА 1 — ЦБ РФ MCP (1 день, quick win)

**Цель:** первый публичный релиз по новой архитектуре, первый шум, проверка шаблона.

**ПРОМПТ ДЛЯ CLAUDE CODE — копировать целиком:**

```
Создай MCP-сервер @theyahia/cbr-mcp для API Центрального Банка РФ.

Референс архитектуры: посмотри на github.com/theYahia/dadata-mcp — используй 
тот же паттерн: TypeScript, @modelcontextprotocol/sdk, Zod, stderr для логов.

Особенности этого API:
- Авторизация НЕ нужна — полностью открытый API
- Основной endpoint для JSON: https://www.cbr-xml-daily.ru/daily_json.js
- Официальный SOAP: https://www.cbr.ru/development/SXML/ (используй JSON зеркало)
- Нет rate limits, нет авторизации — самый простой возможный клиент

5 tools:

1. get_daily_rates
   Описание: Все курсы валют ЦБ РФ на указанную дату (по умолчанию сегодня)
   Params: date (string ISO, optional, default сегодня)
   Returns: объект с кодами валют и их курсами, номинал, название
   Endpoint: https://www.cbr-xml-daily.ru/daily_json.js (сегодня) или
             https://www.cbr-xml-daily.ru/archive/YYYY/MM/DD/daily_json.js (архив)

2. get_currency_rate
   Описание: Курс конкретной валюты к рублю
   Params: currency_code (string, например "USD", "EUR", "CNY"), date (optional)
   Returns: курс, номинал, название, изменение к предыдущему дню

3. get_key_rate
   Описание: Текущая ключевая ставка ЦБ РФ
   Params: нет
   Returns: ставка в процентах, дата последнего изменения
   Note: для этого используй SOAP endpoint cbr.ru или найди JSON источник

4. get_precious_metals
   Описание: Учётные цены на золото, серебро, платину, палладий
   Params: date (optional)
   Returns: цены за грамм в рублях по каждому металлу

5. convert_currency
   Описание: Конвертация суммы из одной валюты в другую через рубль
   Params: amount (number), from_currency (string), to_currency (string, default "RUB"), date (optional)
   Returns: результат конвертации, использованные курсы

Структура проекта:
src/
  index.ts
  client.ts (HTTP клиент, таймаут 10с, retry 3 раза на 5xx)
  tools/rates.ts
  tools/metals.ts
  tools/convert.ts
  types.ts

package.json:
  name: "@theyahia/cbr-mcp"
  version: "1.0.0"
  bin: { "cbr-mcp": "dist/index.js" }

README.md:
  - Заголовок с описанием
  - Раздел "Установка" для Claude Desktop, Claude Code, VS Code/Cursor, Windsurf
  - Таблица всех 5 tools
  - Примеры запросов: "Какой курс доллара сегодня?", "Переведи 1000 USD в евро", "Какая ключевая ставка?"
  - Раздел "Часть серии Russian API MCP" со ссылкой на github.com/theYahia/russian-mcp

После создания запусти npm install && npm run build и убедись что сборка чистая.
Выведи команду для публикации.
```

**После публикации — пост в Telegram @pro_mcp:**
```
Сделал MCP-сервер для ЦБ РФ — курсы валют, ключевая ставка, 
драгоценные металлы, конвертация. Без авторизации, работает через npx.

npx @theyahia/cbr-mcp

github.com/theYahia/cbr-mcp
```

---

## ФАЗА 2 — ЮKassa MCP (5–6 дней)

**Цель:** первый монетизируемый MCP. Реферальная ссылка уже готова из Действия 3.

**ПРОМПТ ДЛЯ CLAUDE CODE — копировать целиком:**

```
Создай production-ready MCP-сервер @theyahia/yookassa-mcp для ЮKassa API.

Референс: посмотри на github.com/theYahia/dadata-mcp для паттернов кода.
Стек: TypeScript, @modelcontextprotocol/sdk, Zod, UUID для idempotency keys.

АВТОРИЗАЦИЯ:
- HTTP Basic Auth: login = YOOKASSA_SHOP_ID (env), password = YOOKASSA_SECRET_KEY (env)
- Base URL: https://api.yookassa.ru/v3/
- Каждый POST-запрос должен включать заголовок Idempotence-Key: <uuid-v4> (генерировать автоматически)
- Таймаут: 10 секунд
- Retry: 3 попытки с экспоненциальным backoff для 429 и 5xx ошибок

ПЕРЕМЕННЫЕ ОКРУЖЕНИЯ:
- YOOKASSA_SHOP_ID — обязательный
- YOOKASSA_SECRET_KEY — обязательный

10 TOOLS:

1. create_payment
   POST /payments
   Params (Zod schema):
     amount: z.number().positive() — сумма в рублях
     currency: z.string().default("RUB")
     description: z.string().max(128)
     capture: z.boolean().default(true) — true = одностадийный, false = холдирование
     return_url: z.string().url().optional()
     payment_method_type: z.enum(["bank_card","sbp","yoo_money","sberbank","tinkoff_bank"]).optional()
   Returns: полный объект payment с id, status, confirmation.confirmation_url

2. get_payment
   GET /payments/{payment_id}
   Params: payment_id: z.string()
   Returns: полный объект payment

3. capture_payment
   POST /payments/{payment_id}/capture
   Params: 
     payment_id: z.string()
     amount: z.number().positive().optional() — если нужен частичный capture
   Returns: обновлённый объект payment

4. cancel_payment
   POST /payments/{payment_id}/cancel
   Params: payment_id: z.string()
   Returns: обновлённый объект payment со статусом canceled

5. list_payments
   GET /payments
   Params:
     limit: z.number().int().min(1).max(100).default(10)
     status: z.enum(["pending","waiting_for_capture","succeeded","canceled"]).optional()
     created_at_gte: z.string().optional() — ISO datetime
     created_at_lte: z.string().optional() — ISO datetime
   Returns: { items: Payment[], next_cursor?: string }

6. create_refund
   POST /refunds
   Params:
     payment_id: z.string()
     amount: z.number().positive()
     description: z.string().optional()
   Returns: полный объект refund с id, status

7. get_refund
   GET /refunds/{refund_id}
   Params: refund_id: z.string()
   Returns: полный объект refund

8. list_refunds
   GET /refunds
   Params:
     payment_id: z.string().optional()
     limit: z.number().int().min(1).max(100).default(10)
   Returns: { items: Refund[] }

9. create_receipt
   POST /receipts
   Описание: Создать кассовый чек для 54-ФЗ
   Params:
     type: z.enum(["payment","refund"])
     payment_id: z.string()
     customer: z.object({ email: z.string().email() })
     items: z.array(z.object({
       description: z.string(),
       quantity: z.number().positive(),
       amount: z.number().positive(),
       vat_code: z.number().int().min(1).max(6)
     }))
   Returns: объект receipt

10. get_balance
    GET /me
    Params: нет
    Returns: { account_id, status, test, fiscalization_enabled }

СТРУКТУРА ФАЙЛОВ:
src/
  index.ts — регистрация сервера и всех tools
  client.ts — YooKassaClient class с методами get/post, retry логикой, idempotency
  tools/
    payments.ts — tools 1-5
    refunds.ts — tools 6-8
    receipts.ts — tool 9
    balance.ts — tool 10
  schemas.ts — все Zod схемы
  types.ts — TypeScript интерфейсы для Payment, Refund, Receipt

ERROR HANDLING:
- Парсить ошибки ЮKassa: { type, id, code, description, parameter }
- Возвращать человекочитаемые сообщения на русском языке
- Для ошибок авторизации — подсказка что проверить

README.md должен содержать:
1. Одну строку описания: "MCP-сервер для ЮKassa API: платежи, возвраты, чеки 54-ФЗ. 10 инструментов."
2. Таблицу сравнения с официальным SDK (не MCP, а SDK — у ЮKassa нет MCP)
3. Установка для Claude Desktop, Claude Code, VS Code/Cursor, Windsurf
4. Таблицу всех 10 tools с колонками: tool, описание, endpoint
5. Раздел "Синергия с dadata-mcp":
   """
   Пример воркфлоу: проверка контрагента перед оплатой
   1. dadata-mcp: find_company_by_id(ИНН) → проверить что компания активна
   2. yookassa-mcp: create_payment(amount, description) → получить ссылку на оплату
   3. yookassa-mcp: get_payment(id) → проверить статус
   """
6. Примеры запросов к Claude:
   - "Создай платёж на 5000 рублей для заказа #123"
   - "Сделай частичный возврат 2500 рублей по платежу pay_xxx"
   - "Покажи все неуспешные платежи за последние 7 дней"
   - "Создай чек для платежа pay_xxx, email покупателя test@example.com"
7. Раздел "Партнёрская программа":
   "Если вы ещё не подключены к ЮKassa — [зарегистрируйтесь](https://promo.yookassa.ru/agents) и поддержите разработку этого MCP."
8. Раздел "Часть серии Russian API MCP" со ссылкой

После создания: npm install && npm run build
Если сборка чистая — вывести команду npm publish --access public
```

---

## ФАЗА 3 — МойСклад MCP (4–5 дней)

**ПРОМПТ ДЛЯ CLAUDE CODE — копировать целиком:**

```
Создай MCP-сервер @theyahia/moysklad-mcp для МойСклад JSON API 1.2.

Референс: github.com/theYahia/dadata-mcp для паттернов.
Документация API: https://dev.moysklad.ru/doc/api/remap/1.2/

АВТОРИЗАЦИЯ:
- HTTP Basic Auth: MOYSKLAD_LOGIN (env) и MOYSKLAD_PASSWORD (env)
- Альтернатива: Bearer token MOYSKLAD_TOKEN (env) — если задан, использовать его
- Base URL: https://api.moysklad.ru/api/remap/1.2/
- Content-Type: application/json;charset=utf-8
- Таймаут: 15 секунд (МойСклад иногда медленнее)
- Rate limit: 45 запросов в 3 секунды — добавить throttling

ПЕРЕМЕННЫЕ ОКРУЖЕНИЯ (одно из двух):
- MOYSKLAD_LOGIN + MOYSKLAD_PASSWORD — Basic Auth
- MOYSKLAD_TOKEN — Bearer token (приоритет если задан)

10 TOOLS:

1. search_products
   GET /entity/product?search={query}&limit={limit}
   Params: query: z.string(), limit: z.number().default(20)
   Returns: список товаров с id, name, article, salePrices, stock

2. get_product
   GET /entity/product/{id}
   Params: id: z.string()
   Returns: полная карточка товара

3. create_product
   POST /entity/product
   Params:
     name: z.string()
     article: z.string().optional()
     description: z.string().optional()
     sale_price: z.number().optional() — цена продажи в копейках (МойСклад хранит в копейках)
   Returns: созданный товар с id

4. get_stock
   GET /report/stock/all?limit={limit}
   Params: 
     product_id: z.string().optional() — если нужен остаток конкретного товара
     store_id: z.string().optional()
     limit: z.number().default(50)
   Returns: список позиций с остатками, товаром, складом

5. update_prices
   POST /entity/product/{id} (batch через прямое обновление)
   Params:
     id: z.string()
     sale_price: z.number() — новая цена продажи в рублях (конвертируй в копейки)
   Returns: обновлённый товар

6. get_counterparties
   GET /entity/counterparty?search={query}&limit={limit}
   Params: query: z.string().optional(), limit: z.number().default(20)
   Returns: список контрагентов с id, name, inn, kpp, actualAddress

7. create_customer_order
   POST /entity/customerorder
   Params:
     counterparty_id: z.string()
     positions: z.array(z.object({
       product_id: z.string(),
       quantity: z.number().positive(),
       price: z.number().positive() — в рублях, конвертируй в копейки
     }))
     description: z.string().optional()
   Returns: созданный заказ с id, name, sum

8. get_orders
   GET /entity/customerorder?limit={limit}&filter={filter}
   Params:
     limit: z.number().default(20)
     state: z.string().optional() — имя статуса для фильтрации
     date_from: z.string().optional() — ISO datetime
   Returns: список заказов с суммой, статусом, контрагентом

9. get_profit_report
   GET /report/profit/byproduct?momentFrom={from}&momentTo={to}
   Params:
     date_from: z.string() — ISO datetime
     date_to: z.string() — ISO datetime
   Returns: топ товаров по прибыли, выручка, себестоимость

10. create_supply
    POST /entity/supply
    Описание: создать приходный ордер (поступление товара)
    Params:
      supplier_id: z.string()
      positions: z.array(z.object({
        product_id: z.string(),
        quantity: z.number().positive(),
        price: z.number().positive()
      }))
    Returns: созданный документ поступления

ВАЖНО — работа с ценами:
МойСклад хранит все цены в КОПЕЙКАХ (умножай рубли на 100, делай при чтении)
В описаниях tools и в ответах всегда показывай в РУБЛЯХ для читаемости.

README.md:
1. Описание одной строкой
2. Установка для Claude Desktop, Claude Code, VS Code/Cursor, Windsurf
3. Таблица 10 tools
4. Раздел "E-commerce стек":
   """
   1. dadata-mcp: suggest_company(ИНН) → проверить контрагента
   2. moysklad-mcp: create_customer_order() → оформить заказ
   3. cdek-mcp: create_order() → создать доставку  [скоро]
   4. yookassa-mcp: create_payment() → принять оплату
   """
5. Примеры запросов:
   - "Покажи 10 товаров с наименьшим остатком на складе"
   - "Создай заказ для контрагента с ИНН 7707083893 на товар 'Ноутбук' 2 штуки"
   - "Какая выручка и прибыль за последние 30 дней?"
   - "Обнови цену товара 'Мышь беспроводная' на 1500 рублей"
6. Ссылка на partners.moysklad.ru (партнёрская программа)
7. Раздел серии

npm install && npm run build → npm publish --access public
```

---

## ФАЗА 4 — СДЭК MCP (3–4 дня)

**ПРОМПТ ДЛЯ CLAUDE CODE — копировать целиком:**

```
Создай MCP-сервер @theyahia/cdek-mcp для СДЭК API v2.

Документация: https://apidoc.cdek.ru/
Sandbox: https://api.edu.cdek.ru/v2/ (тест-credentials в документации)

АВТОРИЗАЦИЯ — OAuth 2.0 Client Credentials:
- Token endpoint: POST https://api.cdek.ru/v2/oauth/token (prod) или https://api.edu.cdek.ru/v2/oauth/token (test)
- grant_type: client_credentials
- client_id: CDEK_CLIENT_ID (env)
- client_secret: CDEK_CLIENT_SECRET (env)
- CDEK_SANDBOX: "true" (env, optional) — переключает на тестовый endpoint
- Токен истекает через 3600 секунд — кешировать и обновлять автоматически
- Base URL prod: https://api.cdek.ru/v2/
- Base URL sandbox: https://api.edu.cdek.ru/v2/

Создай TokenManager class который:
- При первом запросе получает токен
- Хранит токен и время истечения
- Автоматически обновляет за 60 секунд до истечения
- Добавляет Bearer в заголовки

8 TOOLS:

1. calculate_tariff
   POST /calculator/tariff
   Описание: Рассчитать стоимость и сроки доставки
   Params:
     tariff_code: z.number().default(136) — 136 = посылка склад-склад
     from_city_code: z.number().optional()
     from_postal_code: z.string().optional()
     to_city_code: z.number().optional()
     to_postal_code: z.string().optional()
     weight: z.number() — вес в граммах
     length: z.number().optional() — в см
     width: z.number().optional() — в см
     height: z.number().optional() — в см
   Returns: стоимость в рублях, срок доставки в рабочих днях, тариф

2. create_order
   POST /orders
   Params:
     tariff_code: z.number().default(136)
     sender: z.object({ name: z.string(), phones: z.array(z.string()) })
     recipient: z.object({ name: z.string(), phones: z.array(z.string()), email: z.string().optional() })
     to_city_code: z.number()
     to_address: z.string() — полный адрес получателя
     packages: z.array(z.object({
       weight: z.number(),
       length: z.number().optional(),
       width: z.number().optional(),
       height: z.number().optional()
     }))
     comment: z.string().optional()
   Returns: uuid заказа, cdek_number (трек-номер), статус

3. get_order
   GET /orders?cdek_number={number} или GET /orders/{uuid}
   Params: 
     cdek_number: z.string().optional()
     uuid: z.string().optional()
   Returns: полный объект заказа со статусами

4. track_shipment
   GET /orders?cdek_number={number}
   Описание: Трекинг заказа по трек-номеру СДЭК
   Params: cdek_number: z.string()
   Returns: история статусов с датами и описаниями на русском

5. list_delivery_points
   GET /deliverypoints?city_code={code}&type={type}
   Описание: Список пунктов выдачи (ПВЗ) в городе
   Params:
     city_code: z.number()
     type: z.enum(["PVZ","POSTAMAT","ALL"]).default("ALL")
     limit: z.number().default(10)
   Returns: список ПВЗ с адресами, режимом работы, координатами

6. get_cities
   GET /location/cities?country_codes[]=RU&q={query}
   Описание: Поиск городов для автодополнения
   Params: query: z.string()
   Returns: список городов с кодами СДЭК, названием, регионом

7. generate_barcode
   POST /orders/{uuid}/barcode
   GET /orders/{uuid}/barcode — получить готовый PDF
   Описание: Сформировать этикетку для заказа
   Params:
     uuid: z.string()
     format: z.enum(["A4","A5","A6"]).default("A6")
   Returns: ссылка на PDF или base64 файл

8. delete_order
   DELETE /orders/{uuid}
   Описание: Удалить заказ (только до передачи в СДЭК)
   Params: uuid: z.string()
   Returns: статус удаления

README.md:
1. Описание
2. Установка для Claude Desktop, Claude Code, VS Code/Cursor, Windsurf
3. Sandbox режим: добавить в env CDEK_SANDBOX=true для тестирования
4. Таблица tools
5. Раздел "E-commerce стек" (те же 4 шага что в moysklad-mcp)
6. Примеры:
   - "Рассчитай стоимость доставки 1 кг из Москвы в Новосибирск"
   - "Создай заказ на доставку в Краснодар, получатель Иванов, тел +79001234567"
   - "Где мой заказ 1234567890?"
   - "Покажи ПВЗ в Екатеринбурге"
7. Ссылка cdek.promo/partner
8. Раздел серии

npm install && npm run build → npm publish --access public
```

---

## ФАЗА 5 — Ozon Seller MCP (6–7 дней)

**ПРОМПТ ДЛЯ CLAUDE CODE — копировать целиком:**

```
Создай MCP-сервер @theyahia/ozon-mcp для Ozon Seller API.

Документация: https://docs.ozon.ru/api/seller/
Нет sandbox — тестирование на реальном аккаунте (создай бесплатный seller аккаунт без товаров).

АВТОРИЗАЦИЯ:
- Два заголовка: Client-Id: OZON_CLIENT_ID (env), Api-Key: OZON_API_KEY (env)
- Base URL: https://api-seller.ozon.ru/
- Все запросы POST с JSON телом (Ozon использует POST для списков)
- Таймаут: 15 секунд
- Rate limit: 100 запросов в минуту на метод — добавить throttling

ПЕРЕМЕННЫЕ ОКРУЖЕНИЯ:
- OZON_CLIENT_ID — обязательный
- OZON_API_KEY — обязательный

12 TOOLS:

1. list_products
   POST /v2/product/list
   Params:
     limit: z.number().default(100)
     last_id: z.string().optional() — для пагинации
     filter: z.object({
       visibility: z.enum(["ALL","VISIBLE","INVISIBLE","EMPTY_STOCK","NOT_MODERATED"]).optional()
     }).optional()
   Returns: список товаров с id, name, offer_id, price

2. get_product
   POST /v2/product/info
   Params: product_id: z.number() или offer_id: z.string()
   Returns: полная карточка товара

3. create_product
   POST /v2/product/import
   Params:
     items: z.array(z.object({
       name: z.string(),
       offer_id: z.string() — ваш артикул
       category_id: z.number()
       price: z.string() — цена строкой
       vat: z.string().default("0") — НДС
       weight: z.number() — в граммах
       images: z.array(z.string().url()).optional()
       description: z.string().optional()
     }))
   Returns: task_id для отслеживания импорта

4. update_stocks
   POST /v1/product/import/stocks
   Описание: Обновить остатки товаров
   Params:
     stocks: z.array(z.object({
       offer_id: z.string()
       stock: z.number().int().min(0)
       warehouse_id: z.number().optional()
     }))
   Returns: результаты обновления по каждому товару

5. update_prices
   POST /v1/product/import/prices
   Описание: Обновить цены товаров (batch до 1000)
   Params:
     prices: z.array(z.object({
       offer_id: z.string()
       price: z.string() — новая цена строкой
       old_price: z.string().optional()
     }))
   Returns: результаты обновления

6. get_categories
   POST /v2/category/tree
   Описание: Дерево категорий Ozon
   Params: category_id: z.number().default(0), language: z.string().default("RU")
   Returns: список категорий и подкатегорий

7. get_orders
   POST /v3/posting/fbs/list (FBS — со своего склада)
   Params:
     limit: z.number().default(50)
     status: z.string().optional()
     since: z.string().optional() — ISO datetime
     to: z.string().optional()
   Returns: список заказов с posting_number, status, товарами, суммой

8. get_order
   POST /v3/posting/fbs/get
   Params: posting_number: z.string()
   Returns: полный объект заказа

9. get_analytics
   POST /v1/analytics/data
   Описание: Аналитика продаж за период
   Params:
     date_from: z.string() — YYYY-MM-DD
     date_to: z.string()
     metrics: z.array(z.string()).default(["revenue","ordered_units","returns"])
     dimension: z.array(z.string()).default(["day"])
   Returns: данные по метрикам за период

10. get_finance_report
    POST /v3/finance/transaction/list
    Описание: Финансовый отчёт (начисления, комиссии)
    Params:
      date_from: z.string()
      date_to: z.string()
      limit: z.number().default(100)
    Returns: список транзакций с типами и суммами

11. list_returns
    POST /v3/returns/company/fbs
    Описание: Список возвратов
    Params:
      limit: z.number().default(50)
      status: z.string().optional()
    Returns: список возвратов с причинами

12. get_fbo_shipments
    POST /v2/posting/fbo/list
    Описание: Поставки на склад Ozon (FBO)
    Params:
      limit: z.number().default(50)
      status: z.string().optional()
    Returns: список поставок

README.md:
1. "500 000 продавцов. Первый MCP-сервер для Ozon Seller API."
2. Установка для Claude Desktop, Claude Code, VS Code/Cursor, Windsurf
3. Таблица tools
4. Раздел "Реальные задачи которые можно решить":
   - "Обнови цены на все товары в категории с маржой 15%"
   - "Покажи 10 товаров с наименьшим остатком — нужно пополнить"
   - "Какая конверсия и выручка за последние 30 дней?"
   - "Найди топ-3 товара с наибольшим количеством возвратов"
5. Раздел серии

npm install && npm run build → npm publish --access public
```

---

## ФАЗА 6 — amoCRM MCP (5–6 дней)

**ПРОМПТ ДЛЯ CLAUDE CODE — копировать целиком:**

```
Создай MCP-сервер @theyahia/amocrm-mcp для amoCRM REST API v4.

Документация: https://www.amocrm.ru/developers/content/crm_platform/api-reference
Тестовый аккаунт: создать бесплатный аккаунт на amocrm.ru для тестирования.

АВТОРИЗАЦИЯ — OAuth 2.0:
Переменные окружения:
- AMOCRM_DOMAIN — домен аккаунта, например "mycompany.amocrm.ru"
- AMOCRM_ACCESS_TOKEN — access token
- AMOCRM_REFRESH_TOKEN — refresh token (для обновления)
- AMOCRM_CLIENT_ID — client_id приложения
- AMOCRM_CLIENT_SECRET — client_secret приложения

Base URL: https://{AMOCRM_DOMAIN}/api/v4/

Реализуй TokenManager:
- При ошибке 401 автоматически обновляй токен через refresh_token
- POST https://{domain}/oauth2/access_token с grant_type=refresh_token
- Сохраняй новый access_token и refresh_token в переменные (в memory)

10 TOOLS:

1. get_leads
   GET /leads
   Params:
     limit: z.number().default(20)
     query: z.string().optional() — поиск
     status_id: z.number().optional()
     pipeline_id: z.number().optional()
     created_at_from: z.number().optional() — unix timestamp
   Returns: список сделок с id, name, price, status, responsible_user

2. create_lead
   POST /leads
   Params:
     name: z.string()
     price: z.number().optional()
     pipeline_id: z.number().optional()
     status_id: z.number().optional()
     responsible_user_id: z.number().optional()
     custom_fields: z.array(z.object({ field_id: z.number(), values: z.array(z.any()) })).optional()
   Returns: созданная сделка с id

3. update_lead
   PATCH /leads/{id}
   Params:
     id: z.number()
     name: z.string().optional()
     price: z.number().optional()
     status_id: z.number().optional()
     pipeline_id: z.number().optional()
   Returns: обновлённая сделка

4. get_contacts
   GET /contacts
   Params:
     limit: z.number().default(20)
     query: z.string().optional()
   Returns: список контактов с id, name, email, phone

5. create_contact
   POST /contacts
   Params:
     name: z.string()
     first_name: z.string().optional()
     last_name: z.string().optional()
     email: z.string().email().optional()
     phone: z.string().optional()
     company_name: z.string().optional()
   Returns: созданный контакт с id

6. get_companies
   GET /companies
   Params:
     limit: z.number().default(20)
     query: z.string().optional()
   Returns: список компаний

7. get_pipelines
   GET /leads/pipelines
   Params: нет
   Returns: список воронок с id, name, и массив статусов каждой

8. create_task
   POST /tasks
   Params:
     text: z.string() — текст задачи
     complete_till: z.number() — unix timestamp дедлайна
     task_type_id: z.number().default(1) — 1=звонок, 2=встреча, 3=письмо
     entity_type: z.enum(["leads","contacts","companies"]).optional()
     entity_id: z.number().optional()
     responsible_user_id: z.number().optional()
   Returns: созданная задача

9. add_note
   POST /leads/{entity_id}/notes (или contacts, companies)
   Params:
     entity_type: z.enum(["leads","contacts","companies"])
     entity_id: z.number()
     text: z.string()
   Returns: созданная заметка

10. search
    GET /contacts?query={q} + GET /leads?query={q}
    Описание: Глобальный поиск по всем сущностям
    Params:
      query: z.string()
      entity_types: z.array(z.enum(["leads","contacts","companies"])).default(["leads","contacts","companies"])
    Returns: объединённые результаты с указанием типа

README.md:
1. Описание
2. Настройка OAuth (как получить токены — краткое руководство)
3. Установка для Claude Desktop, Claude Code, VS Code/Cursor, Windsurf
4. Таблица tools
5. Раздел "Killer usecase — связка с dadata-mcp":
   """
   Автоматическое обогащение лида по ИНН:
   1. dadata-mcp: find_company_by_id("7707083893") → название, адрес, руководитель, статус
   2. amocrm-mcp: create_contact(name=руководитель) 
   3. amocrm-mcp: create_lead(name="Сбербанк", company=данные из DaData)
   4. amocrm-mcp: create_task(text="Позвонить", entity=сделка)
   """
6. Примеры запросов:
   - "Создай сделку 'Продажа лицензий' на 150000 рублей для компании 'Рога и Копыта'"
   - "Покажи все открытые сделки в воронке 'Новые клиенты' дороже 50000"
   - "Поставь задачу позвонить завтра в 10:00 по сделке 12345"
   - "Найди все контакты с email на @gmail.com"
7. Ссылка amostart.ru (партнёрка до 50%)
8. Раздел серии

npm install && npm run build → npm publish --access public
```

---

## ФАЗА 7 — hh.ru MCP (4 дня)

**ПРОМПТ ДЛЯ CLAUDE CODE — копировать целиком:**

```
Создай MCP-сервер @theyahia/hh-mcp для hh.ru API.

Документация: https://api.hh.ru/openapi/redoc (OpenAPI spec)
GitHub: https://github.com/hhru/api

АВТОРИЗАЦИЯ:
- Публичные endpoints (поиск вакансий, справочники) — без авторизации
- Работодательские endpoints (резюме, аналитика) — OAuth 2.0
- HH_ACCESS_TOKEN (env) — опциональный, если не задан — только публичные methods

8 TOOLS:

1. search_vacancies
   GET https://api.hh.ru/vacancies
   Params:
     text: z.string().optional() — ключевые слова
     area: z.number().optional() — код региона (1=Москва, 2=СПб)
     salary: z.number().optional() — желаемая зарплата
     currency: z.string().default("RUR")
     experience: z.enum(["noExperience","between1And3","between3And6","moreThan6"]).optional()
     employment: z.enum(["full","part","project","volunteer","probation"]).optional()
     per_page: z.number().default(20)
   Returns: список вакансий с id, name, employer, salary, url, snippet

2. get_vacancy
   GET https://api.hh.ru/vacancies/{id}
   Params: id: z.string()
   Returns: полная вакансия с описанием, требованиями, контактами

3. search_resumes (требует токен)
   GET https://api.hh.ru/resumes
   Params:
     text: z.string()
     area: z.number().optional()
     experience: z.string().optional()
     per_page: z.number().default(20)
   Returns: список резюме

4. get_resume (требует токен)
   GET https://api.hh.ru/resumes/{id}
   Params: id: z.string()
   Returns: полное резюме

5. get_salary_statistics
   GET https://api.hh.ru/salary_statistics
   Описание: Статистика зарплат по специальности и региону
   Params:
     professional_area_id: z.number().optional()
     area_id: z.number().optional()
   Returns: медианные, средние зарплаты по опыту

6. get_employers
   GET https://api.hh.ru/employers
   Params:
     text: z.string()
     area: z.number().optional()
     per_page: z.number().default(20)
   Returns: список работодателей

7. get_areas
   GET https://api.hh.ru/areas
   Описание: Справочник регионов
   Params: нет (возвращает дерево)
   Returns: список регионов РФ и СНГ с кодами

8. get_professional_roles
   GET https://api.hh.ru/professional_roles
   Описание: Справочник профессиональных ролей
   Params: нет
   Returns: категории и роли для поиска

README:
1. Описание
2. Две части: без токена (поиск) и с токеном (для работодателей)
3. Установка для Claude Desktop, Claude Code, VS Code/Cursor, Windsurf
4. Таблица tools с колонкой "Нужен токен?"
5. Примеры:
   - "Найди вакансии Python разработчика в Москве от 200000 рублей"
   - "Какая средняя зарплата Senior Backend разработчика?"
   - "Покажи вакансии в Яндексе"
6. Раздел серии

npm install && npm run build → npm publish --access public
```

---

## ФАЗА 8 — Яндекс.Метрика MCP (3–4 дня)

**ПРОМПТ ДЛЯ CLAUDE CODE — копировать целиком:**

```
Создай MCP-сервер @theyahia/yandex-metrika-mcp для Яндекс.Метрика API.

Документация: https://yandex.ru/dev/metrika/ru/
OAuth: https://yandex.ru/dev/id/doc/ru/

АВТОРИЗАЦИЯ:
- Bearer token: YANDEX_METRIKA_TOKEN (env, получить на oauth.yandex.ru)
- Base URL: https://api-metrika.yandex.net/

6 TOOLS:

1. get_counters
   GET /management/v1/counters
   Params: limit: z.number().default(10)
   Returns: список счётчиков с id, name, site, visits/day

2. get_report
   GET /stat/v1/data
   Описание: Произвольный отчёт с метриками и группировками
   Params:
     counter_id: z.number()
     date1: z.string() — YYYY-MM-DD
     date2: z.string()
     metrics: z.string().default("ym:s:visits,ym:s:users,ym:s:bounceRate")
     dimensions: z.string().optional() — например "ym:s:date"
     limit: z.number().default(100)
   Returns: данные отчёта

3. get_goals
   GET /management/v1/counter/{id}/goals
   Params: counter_id: z.number()
   Returns: список целей с id, name, type, условиями

4. export_logs
   POST /management/v1/counter/{id}/logrequests — создать запрос
   GET /management/v1/counter/{id}/logrequests/{request_id} — статус
   Описание: Экспорт сырых логов (Logs API)
   Params:
     counter_id: z.number()
     date1: z.string()
     date2: z.string()
     fields: z.string().default("ym:s:visitID,ym:s:date,ym:s:clientID,ym:s:regionCity")
   Returns: статус запроса и ссылки на части файла когда готово

5. get_visitors_overview
   GET /stat/v1/data (специализированный вызов)
   Описание: Сводка основных показателей за период
   Params:
     counter_id: z.number()
     date1: z.string()
     date2: z.string()
   Returns: визиты, пользователи, отказы, глубина, время на сайте

6. get_sources
   GET /stat/v1/data (группировка по источникам)
   Описание: Отчёт по источникам трафика
   Params:
     counter_id: z.number()
     date1: z.string()
     date2: z.string()
   Returns: топ источников с визитами, конверсией, временем

README:
1. Описание для маркетологов и веб-аналитиков
2. Получение токена: oauth.yandex.ru (краткая инструкция)
3. Установка для Claude Desktop, Claude Code, VS Code/Cursor, Windsurf
4. Таблица tools
5. Примеры:
   - "Покажи трафик за последние 7 дней по счётчику 12345678"
   - "Откуда больше всего переходов на сайт в этом месяце?"
   - "Сколько уникальных пользователей было вчера?"
6. Раздел серии

npm install && npm run build → npm publish --access public
```

---

## КОНТЕНТ-ПЛАН (параллельно с разработкой)

### Площадки для публикации контента

#### Русскоязычные медиа

| Площадка | Аудитория | Формат | Приоритет |
|----------|-----------|--------|-----------|
| **Habr.com** | 10M+/мес | Техническая статья (хабы: AI, API, ML) | 🔴 Высший |
| **vc.ru** | 21M+/мес | Статья в раздел AI (без пре-модерации) | 🔴 Высокий |
| **proglib.io** | Крупный | Guest article | 🟡 Средний |
| **tproger.ru** | Крупный | Статья/новость | 🟡 Средний |

#### Telegram-каналы и чаты

| Канал | Подписчики | Профиль |
|-------|------------|---------|
| **@pro_mcp** | — | Главный русскоязычный MCP-чат |
| **@llm_under_hood** | 15–30K | LLM-продукты — идеальная аудитория |
| **@neurohive** | 30–50K | ML/AI исследования |
| **@ai_machinelearning_big_data** | 50K+ | AI/ML новости |
| **@techsparks** | 50K+ | Технологии и AI (Себрант) |
| **@ai_newz** | 50K+ | Ежедневные AI-дайджесты |
| **@n8n_ru** | — | No-code автоматизация |
| **@make_ru_community** | — | Make/Integromat |
| **@ozon_sellers_chat** | — | После выхода Ozon MCP |
| **@amocrm_developers** | — | После выхода amoCRM MCP |

#### Международные площадки

| Площадка | Аудитория | Формат | Приоритет |
|----------|-----------|--------|-----------|
| **Hacker News** | Миллионы | Show HN: MCP Servers for Russian APIs | 🔴 Высокий |
| **Product Hunt** | Миллионы | Запуск продукта (вт/ср) | 🔴 Высокий |
| **Reddit r/ClaudeAI** | ~200K | Пост с описанием | 🔴 Высокий |
| **Reddit r/LocalLLaMA** | ~500K | Технический пост | 🔴 Высокий |
| **Discord MCP Community** | 11.8K | Showcase-пост | 🔴 Высокий |
| **Discord Claude (Anthropic)** | 77K | Showcase | 🔴 Высокий |
| **Twitter/X** | Миллионы | Тред + #MCP #ModelContextProtocol #ClaudeAI | 🔴 Высокий |
| **dev.to** | Миллионы | Статья-туториал (#ai #mcp #showdev) | 🟡 Средний |
| **LinkedIn** | B2B | Профессиональная статья | 🟡 Средний |
| **Hashnode** | 1M+ MAU | Статья | 🟡 Средний |
| **Medium** | Массовая | Статья в паблик (Towards Data Science) | 🟡 Средний |
| **IndieHackers** | Нишевая | Building in public | 🟢 Низкий |

### Habr-статьи — публиковать через 1–2 дня после выпуска каждого MCP

**Шаблон заголовка:** `[Сервис] MCP: [глагол что умеет] через Claude`

| После фазы | Заголовок статьи | Ожидаемые просмотры |
|-----------|-----------------|---------------------|
| Фаза 1 (ЦБ РФ) | «ЦБ РФ + AI: курсы валют и ключевая ставка в Claude за один вечер» | 2–5K |
| Фаза 2 (ЮKassa) | «ЮKassa MCP: AI-агент принимает платежи, делает возвраты и формирует чеки 54-ФЗ» | 5–10K |
| Фаза 3 (МойСклад+СДЭК) | «E-commerce стек через AI: 4 MCP-сервера которые работают вместе» | 8–15K |
| Фаза 5 (Ozon) | «500 000 продавцов, 0 MCP-серверов: первый AI-интерфейс для Ozon Seller API» | 10–20K |
| Фаза 6 (amoCRM) | «amoCRM + dadata-mcp: AI автоматически создаёт контакт по ИНН и ставит задачу» | 5–10K |
| Середина | «2 месяца, 10+ MCP, X установок: как занять нишу в открытом исходном коде» | 8–15K |
| Финал | «3 месяца, 15+ MCP из 50 запланированных: итоги и что дальше» | 10–20K |

**ПРОМПТ ДЛЯ CLAUDE CODE — шаблон для написания каждой статьи:**

```
Напиши статью для Habr на тему "[вставить заголовок]".

Автор: theYahia — разработчик серии open-source MCP-серверов для российских API.

Структура статьи:

1. ПРОБЛЕМА (2 абзаца)
   - Что разработчики/предприниматели делают руками сейчас
   - Почему это больно и долго

2. ЧТО ТАКОЕ MCP (3–4 абзаца, для тех кто не знает)
   - Model Context Protocol — стандарт Anthropic для подключения AI к внешним сервисам
   - Разница между SDK (писать код) и MCP (сказать Claude голосом)
   - Один реальный пример

3. ЧТО УМЕЕТ ЭТОТ MCP (таблица tools + 3 конкретных примера диалога с Claude)

4. УСТАНОВКА ЗА 5 МИНУТ
   - json блок для claude_desktop_config.json
   - команда claude mcp add для Claude Code
   - конфиг для VS Code/Cursor и Windsurf

5. ДЕМО-ВОРКФЛОУ (самый интересный usecase из README)

6. КОД (ключевые фрагменты если интересны)

7. ЧТО ДАЛЬШЕ
   - Ссылка на russian-mcp с таблицей серии
   - Призыв поставить звезду

Тон: технический, конкретный, без воды. Аудитория: разработчики и предприниматели на Habr.
Длина: 1500–2500 слов.

Ссылки для включения в статью:
- GitHub репо конкретного MCP: [вставить URL]
- npm: [вставить npm URL]  
- Серия: https://github.com/theYahia/russian-mcp
```

---

### Telegram-посты — публиковать в @pro_mcp и тематических чатах

**Для каждого нового MCP:**
```
Сделал MCP-сервер для [название] — [что умеет в одной строке].

[2–3 конкретных примера запроса]

npx @theyahia/[название]-mcp

github.com/theYahia/[название]-mcp
```

**Чаты для постинга** (полный список — см. таблицу Telegram-каналов выше в контент-плане)

---

## ACTION PLAN — публикация и продвижение

### Неделя 1 — Фундамент и каталоги

**День 1–2: Техническая подготовка**
- [ ] Дифференцировать dadata-mcp от официального dadata.ru/mcp (31 tool vs ~4, локальная установка, офлайн)
- [ ] Оптимизировать package.json всех пакетов: расширенные keywords, homepage, описания
- [ ] Добавить GitHub Topics ко всем репозиториям
- [ ] Оптимизировать README: бейджи, Quick Start для Claude/Cursor/VS Code/Windsurf

**День 3–4: Публикация в каталогах (Tier 1)**
- [ ] Official MCP Registry через `mcp-publisher`
- [ ] mcp.so — GitHub Issue
- [ ] PulseMCP — форма Submit
- [ ] Glama.ai — проверить авто-индексацию
- [ ] cursor.directory — /plugins/new
- [ ] LobeHub — кнопка «Submit MCP»

**День 5–7: Awesome-листы**
- [ ] Форма на mcpservers.org/submit (попадёт в wong2 + appcypher awesome-lists, 40K+ ★)
- [ ] Official MCP Registry через mcp-publisher (попадёт в modelcontextprotocol/servers + PulseMCP)

### Неделя 2 — Контент и сообщества

**День 8–10: Русскоязычный контент**
- [ ] Статья на Habr: «Как я создал MCP-сервер для DaData и подключил Claude к российским данным»
- [ ] Статья на vc.ru (раздел AI): бизнес-угол
- [ ] Анонсы в Telegram: @llm_under_hood, @neurohive, @pro_mcp, @ai_newz

**День 11–12: Англоязычный контент**
- [ ] dev.to: «I'm Building 50 MCP Servers for Russian APIs»
- [ ] Reddit: r/ClaudeAI + r/LocalLLaMA
- [ ] Discord: MCP Community #showcase + Claude server
- [ ] Twitter/X тред с демо + хэштеги

**День 13–14: Product-платформы**
- [ ] Show HN: «Show HN: MCP Servers for Russian APIs (DaData, YooKassa, etc.)»
- [ ] Подготовить карточку Product Hunt (запуск на вт/ср)

### Неделя 3 — Масштабирование

- [ ] Создать GitHub Pages лендинг (theyahia.github.io/russian-mcp)
- [ ] Claude Code Plugins — platform.claude.com/plugins/submit
- [ ] Windsurf MCP Marketplace
- [ ] Docker MCP Catalog — PR
- [ ] Остальные каталоги: MCPHub.ai, MCPMarket.com, mcpservers.org, mcp.directory
- [ ] Запуск на Product Hunt

### Неделя 4 — Закрепление

- [ ] LinkedIn: профессиональная статья
- [ ] Кросс-пост: Hashnode, Medium (Towards Data Science)
- [ ] proglib.io и tproger.ru
- [ ] Связаться с командой DaData — предложить листинг на solutions.dadata.ru
- [ ] Создать собственный Telegram-канал для русской MCP-экосистемы
- [ ] Настроить кросс-линковку всех пакетов между собой

---

## МЕТРИКИ — проверять каждую пятницу

| Метрика | Неделя 4 | Неделя 8 | Неделя 12 |
|---------|----------|----------|-----------|
| MCP выпущено (реальных, не пустышек) | 4 | 8 | 15+ |
| npm имён зарезервировано | 50 | 50 | 50 |
| npm downloads/нед (сумма) | 100+ | 500+ | 1500+ |
| GitHub ★ (сумма всех репо) | 50+ | 200+ | 600+ |
| Habr просмотры/мес | 10K | 30K | 70K |
| Telegram подписчики (если есть канал) | — | — | 1000+ |
| Реферальный доход (₽/мес) | 5–15K | 30–60K | 100–200K |

---

## SEO И ОПТИМИЗАЦИЯ npm

### Ключевые слова для package.json каждого MCP

```json
"keywords": [
  "mcp", "mcp-server", "model-context-protocol", "modelcontextprotocol",
  "claude", "ai", "llm", "anthropic", "cursor", "ai-tools", "ai-agent",
  "russian-api", "[service-specific-keywords]"
]
```

### GitHub Topics для каждого репозитория
`mcp-server`, `mcp`, `model-context-protocol`, `claude`, `ai`, `llm`, `russian-api`, `[service-name]`

### Поисковые запросы с нулевой конкуренцией
- `mcp server for russian apis`
- `dadata address validation ai`
- `yookassa mcp integration`
- `claude [сервис] integration`
- `cursor [сервис] mcp`

### Лендинг — GitHub Pages (Неделя 3)

```
theyahia.github.io/russian-mcp/
├── index.html       — Каталог всех 50 серверов
├── /dadata-mcp/     — Страница каждого сервера
├── /blog/           — Туториалы, анонсы
└── catalog.json     — Машиночитаемый каталог для реестров
```

Хаб-страница создаёт «эффект коллекции» — каждый из 50 серверов ведёт трафик к остальным.

---

## ВАЖНЫЕ ССЫЛКИ — иметь под рукой

### MCP-каталоги и реестры

| Ресурс | URL |
|--------|-----|
| Official MCP Registry | https://registry.modelcontextprotocol.io |
| Smithery | https://smithery.ai |
| mcp.so | https://mcp.so |
| PulseMCP | https://pulsemcp.com |
| Glama.ai | https://glama.ai/mcp/servers |
| cursor.directory | https://cursor.directory/plugins |
| LobeHub MCP | https://lobehub.com/mcp |
| Docker MCP Catalog | https://hub.docker.com/mcp |
| MCP Inspector | npx @modelcontextprotocol/inspector |
| Документация MCP SDK | https://modelcontextprotocol.io |

### Awesome-списки (для PR)

| Список | URL | Stars |
|--------|-----|-------|
| wong2/awesome-mcp-servers | https://github.com/wong2/awesome-mcp-servers | 40K+ |
| appcypher/awesome-mcp-servers | https://github.com/appcypher/awesome-mcp-servers | 10K+ |
| modelcontextprotocol/servers | https://github.com/modelcontextprotocol/servers | Офиц. |

### IDE и AI-платформы

| Ресурс | URL |
|--------|-----|
| Claude Code Plugins | https://platform.claude.com/plugins/submit |
| VS Code MCP | Встроенная галерея (@mcp фильтр) |
| Windsurf MCP Marketplace | Встроен в IDE |
| Continue Hub | https://hub.continue.dev |

### API-документации сервисов

| Ресурс | URL |
|--------|-----|
| ЮKassa sandbox | https://yookassa.ru/developers/using-api/testing |
| СДЭК sandbox | https://api.edu.cdek.ru |
| МойСклад API docs | https://dev.moysklad.ru |
| Ozon Seller API | https://docs.ozon.ru/api/seller |
| amoCRM API | https://www.amocrm.ru/developers |
| hh.ru API | https://github.com/hhru/api |
| Яндекс.Метрика API | https://yandex.ru/dev/metrika/ru |

### Международные сообщества

| Ресурс | URL |
|--------|-----|
| Discord MCP Community | ~11.8K участников |
| Discord Claude (Anthropic) | ~77K участников |
| Reddit r/ClaudeAI | ~200K подписчиков |
| Reddit r/LocalLLaMA | ~500K подписчиков |
| Twitter хэштеги | #MCP #ModelContextProtocol #ClaudeAI #AITools |

---

## ПРОЦЕСС РАЗРАБОТКИ НОВОГО MCP

> **ПРАВИЛО: Перед началом кода — ВСЕГДА составить подробный план имплементации и следовать ему.**

### Шаблон плана имплементации (создавать для каждого нового MCP)

```
## План имплементации: @theyahia/SERVICE-mcp

### 1. Исследование API
- [ ] Прочитать документацию API: [ссылка]
- [ ] Определить авторизацию (Basic Auth / OAuth / API Key / без авторизации)
- [ ] Определить base URL, rate limits, sandbox
- [ ] Проверить есть ли уже чужие MCP для этого сервиса (конкуренты)

### 2. Проектирование tools
- [ ] Список всех tools с params и returns (таблица)
- [ ] Zod-схемы для каждого tool
- [ ] Маппинг tool → endpoint

### 3. Проектирование skills
- [ ] Определить 2–5 пользовательских сценариев (slash-команды)
- [ ] Какие tools каждый skill комбинирует
- [ ] Формат ответа для каждого skill

### 4. Структура файлов
- [ ] src/index.ts, client.ts, types.ts
- [ ] src/tools/ — по файлу на группу
- [ ] .claude/skills/ — по папке на skill
- [ ] .mcp.json, README.md, LICENSE

### 5. Имплементация
- [ ] client.ts — HTTP клиент с авторизацией, retry, таймаутами
- [ ] types.ts — TypeScript интерфейсы
- [ ] tools — по одному, с тестированием
- [ ] index.ts — регистрация всех tools
- [ ] skills — SKILL.md для каждого сценария

### 6. Тестирование
- [ ] npm run build — чистая сборка
- [ ] Ручное тестирование через MCP Inspector
- [ ] Проверка обработки ошибок

### 7. Публикация (по чеклисту из мастер-плана)
- [ ] npm publish
- [ ] git push
- [ ] Площадки (Шаги 2–5 из чеклиста)
- [ ] Обновить витрину и трекер (Шаг 7)
```

> **Claude Code:** перед началом каждого нового MCP — войди в Plan Mode,
> составь план по этому шаблону, согласуй с пользователем, и только потом пиши код.

---

## ОБЩАЯ АРХИТЕКТУРА — для всех MCP одинаково

Каждый MCP следует одному паттерну из dadata-mcp. Можешь дать Claude Code этот список правил как системный контекст:

```
Правила архитектуры для всех MCP в серии @theyahia:

1. TypeScript + @modelcontextprotocol/sdk
2. Все параметры tools описаны через Zod схемы
3. Все логи — в stderr, stdout только для JSON-RPC  
4. HTTP клиент: таймаут 10–15 сек, retry 3 раза с exponential backoff на 429/5xx
5. Ошибки API возвращать в читаемом виде на русском языке
6. Переменные окружения — единственный способ передать credentials
7. bin в package.json для запуска через npx
8. README: установка для Claude Desktop + Claude Code + VS Code/Cursor + Windsurf
9. Раздел "Часть серии" с таблицей в конце каждого README
10. MIT лицензия
11. .mcp.json в корне репо (для cursor.directory)
12. mcpName в package.json (для Official MCP Registry)
13. .claude/skills/ — готовые сценарии использования (slash-команды для Claude Code)
14. После npm publish → ОБЯЗАТЕЛЬНО подать на площадки (см. чеклист ниже)
```

---

> **⚠️ ПОСЛЕ КАЖДОГО РЕЛИЗА — 3 ОБЯЗАТЕЛЬНЫХ ДЕЙСТВИЯ (5 минут):**
>
> 1. **mcp.so** → https://mcp.so/submit — заполнить форму (Name, URL, Server Config)
> 2. **cursor.directory** → https://cursor.directory/plugins/new — Scan repo (подхватит .mcp.json)
> 3. **LobeHub** → форк github.com/chatmcpclient/mcp_server_market → добавить в JSON → PR
>
> Плюс автоматически:
> - **Glama.ai** — сам найдёт из npm/GitHub
> - **PulseMCP** — подтянет из Official MCP Registry
> - **Витрина** → https://github.com/theYahia/russian-mcp — обновить 📅 → ✅

## ЧЕКЛИСТ ПУБЛИКАЦИИ НОВОГО MCP (копировать при каждом релизе)

При релизе каждого нового MCP выполняй этот чеклист. Большинство шагов одноразовые — 15–20 минут.

### Перед публикацией — обязательные файлы в репо

```
repo/
├── .mcp.json              ← для cursor.directory (Open Plugins стандарт)
├── package.json           ← keywords, bin, mcpName для Official Registry
├── README.md              ← установка для Claude Desktop/Code/VS Code/Cursor/Windsurf
└── ...
```

**Шаблон `.mcp.json`** (создавать в каждом новом репо):
```json
{
  "mcpServers": {
    "SERVICE_NAME": {
      "command": "npx",
      "args": ["-y", "@theyahia/SERVICE-mcp"],
      "env": {
        "SERVICE_API_KEY": "<YOUR_TOKEN>"
      }
    }
  }
}
```

**В package.json добавить:**
```json
"mcpName": "io.github.theYahia/SERVICE-mcp",
"keywords": [
  "mcp", "mcp-server", "model-context-protocol", "modelcontextprotocol",
  "claude", "ai", "llm", "anthropic", "cursor", "ai-tools", "ai-agent",
  "russian-api", "SERVICE-SPECIFIC-KEYWORDS"
]
```

**GitHub Topics** (ставить на каждый репо):
`mcp-server`, `mcp`, `model-context-protocol`, `claude`, `ai`, `llm`, `russian-api`, `SERVICE`

### Шаг 1 — npm publish (обновить пустышку до реального пакета)

```bash
cd SERVICE-mcp
npm run build
npm publish --access public
```

Пакет `@theyahia/SERVICE-mcp` уже зарезервирован — просто перезаписать версию.

### Шаг 2 — Каталоги

| Площадка | Автоматизация | Действие |
|----------|---------------|----------|
| **cursor.directory** | ✅ АВТО | Подхватит `.mcp.json` из репо — просто зайти и Scan repo |
| **LobeHub** | ✅ ЧЕРЕЗ CLI | Скажи Claude Code: «Подай SERVICE-mcp на LobeHub» — он сделает PR |
| **mcp.so** | ❌ РУКАМИ | https://mcp.so/submit — заполнить форму (Name, URL, Config) |
| **PulseMCP** | ✅ АВТО | Подтянет из Official MCP Registry |
| **Glama.ai** | ✅ АВТО | Сам найдёт из npm/GitHub |

**ПРОМПТ ДЛЯ CLAUDE CODE — LobeHub PR (копировать и заменить SERVICE):**
```
Подай @theyahia/SERVICE-mcp на LobeHub.
Форк уже есть: github.com/theYahia/mcp_server_market.
Создай ветку add-SERVICE-mcp, добавь в mcp_server_market.json запись для SERVICE,
сделай PR в chatmcpclient/mcp_server_market.
```

**Шаблон для mcp.so — Server Config:**
```json
{
  "mcpServers": {
    "SERVICE": {
      "command": "npx",
      "args": ["-y", "@theyahia/SERVICE-mcp"],
      "env": {
        "SERVICE_API_KEY": "<YOUR_TOKEN>"
      }
    }
  }
}
```

**Шаблон для LobeHub PR — добавить в mcp_server_market.json:**
```json
"SERVICE": {
    "command": "npx",
    "args": ["-y", "@theyahia/SERVICE-mcp"],
    "env": {
        "SERVICE_API_KEY": "<YOUR_TOKEN>"
    }
}
```

### Шаг 3 — Official MCP Registry

```bash
cd SERVICE-mcp
mcp-publisher init          # создаст server.json
mcp-publisher login github  # авторизация (один раз)
mcp-publisher publish       # публикация
```

### Шаг 4 — Остальные каталоги

| Площадка | Действие | Автоматизация |
|----------|----------|---------------|
| **mcpservers.org** | Форма mcpservers.org/submit | ❌ Руками (1 раз на MCP) |
| **mcpmarket.com** | Форма mcpmarket.com/submit | ❌ Руками |
| **mcp.directory** | Скажи Claude Code: «Подай на mcp.directory» | ✅ gh issue create |
| **mcpserverfinder.com** | Скажи Claude Code: «Подай на mcpserverfinder» | ✅ gh issue create |
| **mcpserver.directory** | GitHub Issue или Google Form | ✅ Частично |
| **Claude Code Plugins** | Форма: claude.com/plugins (ревью Anthropic) | ❌ Руками |
| **Docker MCP Catalog** | PR в github.com/docker/mcp-registry (нужен Docker-образ) | ✅ PR через CLI |
| **VS Code** | Автоматом через npm | ✅ АВТО |
| **n8n** | Автоматом через npm | ✅ АВТО |

### Шаг 5 — Awesome-списки

> wong2/awesome-mcp-servers и appcypher/awesome-mcp-servers **не принимают PR напрямую**.
> Оба берут данные из mcpservers.org — подача через форму mcpservers.org/submit (уже в Шаге 4).
> modelcontextprotocol/servers — это официальный репо, подача через Official MCP Registry (Шаг 3).

### Шаг 6 — Контент (опционально, для ключевых MCP)

- [ ] Пост в Telegram (@pro_mcp, @llm_under_hood, @neurohive)
- [ ] Статья на Habr (для крупных фаз)
- [ ] Пост на Reddit r/ClaudeAI
- [ ] Twitter/X тред

### Шаг 7 — Обновить витрину и трекер

1. Витрина: `theYahia/russian-mcp` README.md — сменить 📅 → ✅, добавить число tools
2. Трекер: `PLATFORM_TRACKER.md` — пометить ✅ на каждой площадке куда подали

---

> **НЕ ЗАБЫВАЙ:** после каждого релиза нового MCP:
> 1. Обновить витрину:
> https://github.com/theYahia/russian-mcp — сменить 📅 на ✅, добавить число tools.

> 2. Обновить трекер: `PLATFORM_TRACKER.md` — пометить статус на каждой площадке
>
> **Трекер площадок:** [PLATFORM_TRACKER.md](./PLATFORM_TRACKER.md)

*Этот план — живой документ. 50 npm-имён зарезервировано.*
