---
title: "DaData MCP — Подробный план имплементации"
date: 2026-03-29
tags: [neuraldeep, mcp, dadata, implementation, plan]
status: ready-to-implement
---

# DaData MCP — Подробный план имплементации

## Обзор

Первый MCP-сервер серии NeuralDeep. Обёртка над DaData API — российским стандартом валидации и обогащения данных (адреса, компании, телефоны, email, геокодинг).

**Пакет:** `@neuraldeep/dadata-mcp`
**Репо:** `github.com/neuraldeep/dadata-mcp`
**Время:** 1-2 дня до рабочего MVP

---

## Архитектура DaData API

У DaData **два отдельных API** с разной авторизацией:

| API | Base URL | Auth | Лимит | Цена |
|-----|----------|------|-------|------|
| **Suggestions** | `suggestions.dadata.ru/suggestions/api/4_1/rs` | `Authorization: Token <KEY>` | 10 000 req/day (бесплатно), 30 req/s | FREE |
| **Cleaner** | `cleaner.dadata.ru/api/v1/clean` | `Token <KEY>` + `X-Secret: <SECRET>` | 20 req/s | 0.20 руб/запрос |

### Env-переменные
```
DADATA_API_KEY=     # обязательно для всех endpoint'ов
DADATA_SECRET_KEY=  # обязательно только для Cleaner API (phone, email, geocode)
```

---

## 7 MCP-инструментов

### Tool 1: `suggest_address` — Подсказки адресов
- **API:** Suggestions (FREE)
- **POST** `suggestions.dadata.ru/.../suggest/address`
- **Вход:**
  ```json
  {
    "query": "москва сухон",     // max 300 chars
    "count": 10,                  // max 20
    "language": "ru",             // "ru" | "en"
    "locations": [{ "region_fias_id": "..." }],  // фильтр по региону
    "from_bound": { "value": "city" },           // гранулярность от
    "to_bound": { "value": "house" }             // гранулярность до
  }
  ```
- **Выход:** `suggestions[]` — value, postal_code, region, city, street, house, geo_lat, geo_lon, fias_id, kladr_id
- **Use case:** Автокомплит адреса в формах, стандартизация адресов из CRM

---

### Tool 2: `find_company` — Поиск компании по ИНН/ОГРН
- **API:** Suggestions (FREE)
- **POST** `suggestions.dadata.ru/.../findById/party`
- **Вход:**
  ```json
  {
    "query": "7707083893",        // ИНН, ОГРН, или ИНН+КПП
    "branch_type": "MAIN",       // "MAIN" | "BRANCH"
    "type": "LEGAL"              // "LEGAL" | "INDIVIDUAL"
  }
  ```
- **Выход:** inn, kpp, ogrn, name (full/short), status (ACTIVE/LIQUIDATED), management (ФИО директора), address, okved, employee_count, finance (income/expense), branch_count
- **Use case:** Проверка контрагента, автозаполнение реквизитов, due diligence

---

### Tool 3: `suggest_company` — Поиск компании по названию
- **API:** Suggestions (FREE)
- **POST** `suggestions.dadata.ru/.../suggest/party`
- **Вход:**
  ```json
  {
    "query": "сбербанк",          // название компании, max 300 chars
    "count": 10,                   // max 20
    "type": "LEGAL",               // фильтр по типу
    "status": ["ACTIVE"],          // фильтр по статусу
    "locations": [{ "kladr_id": "77" }]  // фильтр по региону
  }
  ```
- **Выход:** То же что find_company — массив suggestions
- **Use case:** Fuzzy поиск компании когда знаешь только название

---

### Tool 4: `clean_phone` — Валидация телефона
- **API:** Cleaner (PAID — 0.20 руб)
- **POST** `cleaner.dadata.ru/api/v1/clean/phone`
- **Auth:** Token + Secret (оба обязательны!)
- **Вход:** `["раб 846)231.60.14 *139"]` (массив строк, НЕ объект!)
- **Выход:**
  ```json
  {
    "phone": "+7 846 231-60-14 доб. 139",
    "type": "Стационарный",         // Мобильный | Стационарный | Колл-центр
    "country_code": "7",
    "city_code": "846",
    "provider": "ОАО Ростелеком",
    "region": "Самарская область",
    "city": "Самара",
    "timezone": "UTC+4",
    "qc": 0                          // 0=valid, 1=questionable, 2=garbage
  }
  ```
- **Use case:** Валидация телефонов из CRM, определение оператора и региона

---

### Tool 5: `clean_email` — Валидация email
- **API:** Cleaner (PAID — 0.20 руб)
- **POST** `cleaner.dadata.ru/api/v1/clean/email`
- **Auth:** Token + Secret
- **Вход:** `["serega@yandex/ru"]` (массив строк)
- **Выход:**
  ```json
  {
    "email": "serega@yandex.ru",     // исправленный email
    "local": "serega",
    "domain": "yandex.ru",
    "type": "PERSONAL",              // PERSONAL | CORPORATE | ROLE | DISPOSABLE
    "qc": 4                          // 0=valid, 1=invalid, 3=disposable, 4=corrected
  }
  ```
- **Use case:** Чистка email-базы, отсеивание disposable адресов

---

### Tool 6: `geocode_address` — Геокодирование (адрес → координаты)
- **API:** Cleaner (PAID — 0.20 руб)
- **POST** `cleaner.dadata.ru/api/v1/clean/address`
- **Auth:** Token + Secret
- **Вход:** `["москва сухонская 11"]` (массив строк)
- **Выход:**
  ```json
  {
    "result": "г Москва, ул Сухонская, д 11",
    "postal_code": "127642",
    "geo_lat": "55.8782557",
    "geo_lon": "37.65372",
    "qc_geo": 0,                     // 0=exact, 1=nearest, 2=street, 3=city, 5=none
    "qc": 0
  }
  ```
- **Use case:** Построение маршрутов, расчёт зон доставки

---

### Tool 7: `reverse_geocode` — Обратное геокодирование (координаты → адрес)
- **API:** Suggestions (FREE)
- **POST** `suggestions.dadata.ru/.../geolocate/address`
- **Вход:**
  ```json
  {
    "lat": 55.878,
    "lon": 37.653,
    "count": 5,                    // max 20
    "radius_meters": 100           // max 1000
  }
  ```
- **Выход:** `suggestions[]` — ближайшие адреса, отсортированные по расстоянию
- **Use case:** Определение адреса по GPS, поиск ближайших объектов

---

## Структура проекта

```
dadata-mcp/
├── src/
│   ├── index.ts                  # MCP server bootstrap
│   ├── server.ts                 # Server class, tool registration
│   ├── dadata-client.ts          # HTTP client (Suggestions + Cleaner)
│   └── tools/
│       ├── suggest-address.ts    # suggest_address tool
│       ├── find-company.ts       # find_company tool
│       ├── suggest-company.ts    # suggest_company tool
│       ├── clean-phone.ts        # clean_phone tool
│       ├── clean-email.ts        # clean_email tool
│       ├── geocode-address.ts    # geocode_address tool
│       └── reverse-geocode.ts    # reverse_geocode tool
├── tests/
│   ├── client.test.ts            # Unit tests for API client
│   └── tools.test.ts             # Tool handler tests (mocked)
├── README.md                     # Русский (основной)
├── README.en.md                  # English
├── package.json
├── tsconfig.json
├── .env.example
├── .gitignore
└── LICENSE                       # MIT
```

---

## Шаг за шагом

### Фаза 1: Scaffold (30 мин)
- [ ] `npm init -y` с scope `@neuraldeep`
- [ ] Установить зависимости: `@modelcontextprotocol/sdk`, `zod`, `typescript`
- [ ] Настроить `tsconfig.json` (ES2022, ESM, strict)
- [ ] Создать `.env.example` с DADATA_API_KEY и DADATA_SECRET_KEY
- [ ] Настроить `package.json` — bin, main, exports, scripts

### Фаза 2: DaData Client (1 час)
- [ ] Базовый HTTP-клиент с двумя базовыми URL
- [ ] Авто-выбор auth: Token-only для Suggestions, Token+Secret для Cleaner
- [ ] Обработка ошибок: 401 (bad key), 403 (plan limit), 429 (rate limit)
- [ ] Типы TypeScript для всех request/response

### Фаза 3: MCP Tools (2-3 часа)
- [ ] Зарегистрировать 7 tools с описаниями на английском
- [ ] Zod-валидация входных параметров для каждого tool
- [ ] Форматирование ответов — человекочитаемый текст + JSON data
- [ ] Graceful degradation: если SECRET_KEY не задан, Cleaner tools возвращают ошибку

### Фаза 4: Polish (1-2 часа)
- [ ] README.md с: описание, скриншоты/gif, установка, Claude Desktop config
- [ ] README.en.md — English version
- [ ] Тесты (unit, mocked API responses)
- [ ] Проверить работу с Claude Desktop локально
- [ ] Проверить npx запуск: `npx @neuraldeep/dadata-mcp`

### Фаза 5: Публикация (30 мин)
- [ ] `npm publish --access public`
- [ ] Создать GitHub repo, push code
- [ ] Залистить на glama.ai
- [ ] Залистить на smithery.ai
- [ ] Залистить на mcp.so
- [ ] Пост в Telegram AI-каналы

---

## package.json (шаблон)

```json
{
  "name": "@neuraldeep/dadata-mcp",
  "version": "1.0.0",
  "description": "MCP server for DaData API — Russian address, company, phone & email validation",
  "keywords": ["mcp", "dadata", "russia", "address", "company", "validation", "geocoding"],
  "author": "neuraldeep",
  "license": "MIT",
  "type": "module",
  "main": "dist/index.js",
  "bin": {
    "dadata-mcp": "dist/index.js"
  },
  "scripts": {
    "build": "tsc",
    "start": "node dist/index.js",
    "dev": "tsx src/index.ts",
    "test": "vitest"
  },
  "dependencies": {
    "@modelcontextprotocol/sdk": "^1.12.0",
    "zod": "^3.24.0"
  },
  "devDependencies": {
    "typescript": "^5.7.0",
    "tsx": "^4.19.0",
    "vitest": "^3.0.0",
    "@types/node": "^22.0.0"
  }
}
```

---

## Claude Desktop config (для README)

```json
{
  "mcpServers": {
    "dadata": {
      "command": "npx",
      "args": ["-y", "@neuraldeep/dadata-mcp"],
      "env": {
        "DADATA_API_KEY": "ваш_api_ключ",
        "DADATA_SECRET_KEY": "ваш_secret_ключ"
      }
    }
  }
}
```

---

## Ключевые решения

| Вопрос | Решение | Почему |
|--------|---------|--------|
| Язык описаний tools | Английский | MCP-клиенты (Claude, Cursor) работают на английском; русское описание хуже парсится |
| Формат ответов | Markdown-текст + raw JSON | AI-агент лучше работает со структурированным текстом |
| Cleaner без SECRET_KEY | Graceful error | Не ломаем весь сервер, просто 4 free tools работают |
| Rate limiting | Не реализуем в v1 | DaData сам вернёт 429, мы передадим ошибку |
| Batch requests | v2 | Cleaner принимает массив, но для v1 достаточно single |

---

## Риски и митигации

| Риск | Митигация |
|------|-----------|
| DaData заблокирует ключ при злоупотреблении | Документировать лимиты в README, добавить warning в tool description |
| npm scope @neuraldeep занят | Проверить заранее, альтернатива: `dadata-mcp` без scope |
| MCP SDK breaking changes | Зафиксировать версию в package.json |
| Cleaner API платный — юзеры не захотят | 4 из 7 tools бесплатные, этого достаточно для вау-эффекта |

---

## Killer Demo для README / Habr

```
User: Найди компанию по ИНН 7707083893

Agent (через DaData MCP):
📋 ПАО СБЕРБАНК
├── ИНН: 7707083893 | КПП: 773601001 | ОГРН: 1027700132195
├── Статус: ACTIVE (с 16.08.2002)
├── Руководитель: Греф Герман Оскарович
├── Адрес: 117312, г Москва, ул Вавилова, д 19
├── ОКВЭД: 64.19 — Денежное посредничество прочее
├── Сотрудников: 100 000+
└── Филиалов: 92
```

---

## Следующий шаг

**Создать репо и начать кодить.** Фаза 1 + 2 = ~1.5 часа до рабочего API-клиента. Фаза 3 = +2-3 часа до полного MCP-сервера. К концу дня — готовый пакет для npm publish.
