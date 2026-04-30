# Полное исследование для @neuraldeep/dadata-mcp

**У DaData уже есть официальный remote MCP-сервер** на `https://mcp.dadata.ru/mcp`, но он покрывает лишь 4 tools из 56+ endpoint'ов API. Ваш standalone npm-пакет с полным покрытием API, локальным stdio-транспортом, композитными tools, resources и prompts — это продукт принципиально другого уровня. Ниже — исчерпывающее исследование по всем 6 частям, которое определит архитектуру вашего сервера.

---

## ЧАСТЬ 1: DaData API — полная карта возможностей

### 56 endpoint'ов на двух доменах

DaData API работает на двух базовых доменах: **suggestions.dadata.ru** (подсказки, поиск, геолокация) и **cleaner.dadata.ru** (стандартизация). Аутентификация различается: Suggestions API требует только `Authorization: Token {API_KEY}`, а Cleaner API — дополнительный заголовок `X-Secret: {SECRET_KEY}`.

**Suggestions API (21 endpoint)** — все POST на `https://suggestions.dadata.ru/suggestions/api/4_1/rs/suggest/{type}`:

| Endpoint | Описание | Ключевые параметры |
|----------|----------|-------------------|
| `suggest/address` | Подсказки адресов | `locations`, `locations_boost`, `from_bound`/`to_bound`, `restrict_value`, `language` (ru/en), `division` |
| `suggest/party` | Подсказки компаний | `status`, `type` (LEGAL/INDIVIDUAL), `branch_type`, `locations` |
| `suggest/party_by` | Компании Беларуси | По УНП |
| `suggest/party_kz` | Компании Казахстана | По БИН |
| `suggest/bank` | Подсказки банков | По названию/БИК/SWIFT |
| `suggest/fio` | Подсказки ФИО | `parts` (SURNAME/NAME/PATRONYMIC), `gender` |
| `suggest/email` | Подсказки email | Домены |
| `suggest/fms_unit` | Отделения ФМС | По коду подразделения |
| `suggest/postal_unit` | Почтовые отделения | По индексу/адресу |
| `suggest/fns_unit` | Налоговые инспекции | По коду |
| `suggest/fts_unit` | Таможенные органы | По коду |
| `suggest/region_court` | Мировые суды | По названию |
| `suggest/metro` | Станции метро | `filters` (city) |
| `suggest/car_brand` | Марки автомобилей | По названию |
| `suggest/country` | Страны | alfa2, alfa3, code |
| `suggest/currency` | Валюты (ISO 4217) | По коду/названию |
| `suggest/okved2` | ОКВЭД 2 | По коду/описанию |
| `suggest/okpd2` | ОКПД 2 | По коду/описанию |
| `suggest/mktu` | МКТУ (товарные знаки) | По классу |
| `suggest/oktmo` | ОКТМО | По коду |

Общие параметры для всех suggest: `query` (max 300 символов), `count` (max 20, default 10).

**Find By ID API (19 endpoint'ов)** — POST на `https://suggestions.dadata.ru/suggestions/api/4_1/rs/findById/{type}`:
`address`, `fias`, `party`, `party_by`, `party_kz`, `bank`, `fms_unit`, `fns_unit`, `fts_unit`, `postal_unit`, `delivery` (ID городов СДЭК/Boxberry/DPD), `country`, `currency`, `okved2`, `okpd2`, `mktu`, `oktmo`, `region_court`, `brand` (7₽/запрос).

**Специальные endpoint'ы (2)**:
- `POST .../findAffiliated/party` — аффилированные компании по ИНН (только тариф «Максимальный»), параметр `scope`: `["FOUNDERS","MANAGERS"]`
- `POST .../findByEmail/company` — компания по email (7₽/запрос)

**Geolocate API (2)**: `geolocate/address` (обратное геокодирование по lat/lon, radius_meters) и `geolocate/postal_unit`.

**IPLocate (1)**: GET/POST `.../iplocate/address` — город по IP-адресу.

**Cleaner API (8 endpoint'ов)** — POST на `https://cleaner.dadata.ru/api/v1/clean/{type}`. Требует Secret Key. Оплата **20 коп./запись** (не входит в подписку):
`clean/address` (~80 полей + qc/qc_geo/qc_complete/qc_house), `clean/phone`, `clean/name`, `clean/email`, `clean/passport`, `clean/birthdate`, `clean/vehicle`, и **композитный** `clean` (несколько типов за один запрос через `structure`).

**Profile API (3)**: `GET /api/v2/profile/balance`, `GET /api/v2/stat/daily`, `GET /api/v2/version` (даты обновления справочников ФИАС, ЕГРЮЛ, банков).

### Неочевидные возможности и параметры

**`from_bound` / `to_bound`** — контроль гранулярности подсказок адресов. Значения: `country`, `region`, `area`, `city`, `city_district`, `settlement`, `street`, `house`, `flat`. Например, `{"from_bound":{"value":"city"},"to_bound":{"value":"settlement"}}` вернёт только населённые пункты.

**`locations_boost`** — приоритизация без исключения. В отличие от `locations` (жёсткий фильтр), `locations_boost` поднимает указанные регионы вверх списка, не отсекая остальные. Критически важно для UX при автодополнении.

**`locations` с `{"country":"*"}`** — поиск по всем странам мира (Россия — до квартиры, Беларусь/Казахстан/Узбекистан — до дома, остальные — до города).

**`division`** — переключение между административным и муниципальным делением (`"administrative"` / `"municipal"`).

**`language: "en"`** — транслитерация адресов на английский.

**`findAffiliated/party`** — малоизвестный endpoint для поиска связанных компаний по ИНН учредителя/руководителя. Работает только на тарифе «Максимальный».

**`findById/delivery`** — получение ID городов для служб доставки (СДЭК, Boxberry, DPD) по КЛАДР/ФИАС ID. Полезно для логистических решений.

**Композитная стандартизация** (`POST cleaner.dadata.ru/api/v1/clean`) — одним запросом чистятся ФИО + адрес + телефон. Body: `{"structure":["NAME","ADDRESS","PHONE"],"data":[["Федотов Алексей","Москва, Сухонская 11","8 916 823 3454"]]}`.

**Синергия endpoint'ов**:
- `suggest/address` → `clean/address` → `geolocate/address` — от неточного ввода до проверенных координат
- `findById/party` (по ИНН) → `findAffiliated/party` — полная карта связей компании
- `iplocate/address` → `suggest/address` (с `locations_boost` по определённому городу) — персонализированный автокомплит

### Rate limits и ограничения

| Параметр | Значение |
|----------|---------|
| Запросов в секунду | **30** на IP |
| Новых соединений в минуту | **60** на IP |
| Максимальная длина query | **300** символов |
| Максимум count | **20** |
| Максимум условий в locations | **10** |
| HTTP-код при превышении | **429** |
| Восстановление после 429 | ~5 минут |
| Дневной лимит (бесплатный) | **10 000** запросов |
| Дневной лимит (Расширенный) | **100 000** запросов |
| Дневной лимит (Максимальный) | **200K–3M** запросов |
| Сброс лимита в полночь | **00:00 МСК** |

При исчерпании дневного лимита подписочные сервисы останавливаются до полуночи; pay-per-use (Clean) продолжает работать при положительном балансе.

**Данные по тарифам**:
- **Бесплатный**: базовые поля адресов, основной ОКВЭД компании, ИНН/КПП/ОГРН, статус, адрес, руководитель
- **Расширенный** (+14K₽/год): расстояние до МКАД/КАД, все ОКВЭДы, кол-во сотрудников, система налогообложения
- **Максимальный** (+56K₽/год): кадастровый номер, таймзона, метро, площадь/цена квартиры, учредители, руководители, финансы (выручка/прибыль), лицензии, телефоны/email, аффилированные лица, штрафы/задолженности, реестр МСП

**Коды качества (qc)** в Clean API: `0` = полностью распознан, `1` = с допущениями, `2` = частично, `3` = не распознан. **qc_geo**: `0` = точные координаты, `1` = ближайший дом, `2` = улица, `3` = населённый пункт, `4` = город, `5` = координаты не определены.

**Поведение с невалидными данными**: пустая строка → пустой массив suggestions; мусор → qc > 0 или пустой результат; иностранные адреса — поддерживаются до уровня города для большинства стран.

---

## ЧАСТЬ 2: Конкурентный анализ

### Официальный MCP-сервер DaData — ваш главный конкурент

DaData запустила **собственный remote MCP-сервер** на `https://mcp.dadata.ru/mcp`. Это критическая находка, меняющая позиционирование вашего проекта.

**Что предлагает официальный MCP**:

```json
{
  "mcpServers": {
    "dadata": {
      "url": "https://mcp.dadata.ru/mcp?token=${API_KEY}:${SECRET_KEY}"
    }
  }
}
```

Для Claude Desktop требуется `supergateway` как stdio-proxy:
```json
{
  "mcpServers": {
    "dadata": {
      "command": "npx",
      "args": ["-y", "supergateway", "--streamableHttp",
        "https://mcp.dadata.ru/mcp", "--oauth2Bearer", "${API_KEY}:${SECRET_KEY}"]
    }
  }
}
```

**Официальный MCP покрывает всего ~4 tool'а**: `find_party` (компания по ИНН, бесплатно), `clean_address` (стандартизация, 20 коп.), `find_company_by_email` и `find_company_by_domain` (7₽/запрос). Это **менее 10% от полного API**.

**Чего НЕТ в официальном MCP**:
- **Suggest** (автодополнение адресов, ФИО, банков, email) — самые популярные endpoint'ы
- **Geolocate / IPLocate** — обратное геокодирование
- **Clean** (телефоны, ФИО, email, паспорта, даты рождения, авто)
- **FindById** для банков, ФМС, ОКПД, ОКТМО и др.
- **FindAffiliated** — поиск аффилированных компаний
- **Profile API** — баланс и статистика
- **Resources и Prompts** — никакой контекстной информации для AI
- **Batch-операции**
- **Композитные tools** (проверка контрагента, обогащение лида)

### Composio DaData — единственная альтернатива

Composio.dev предлагает hosted MCP-прокси с ~40 tools для DaData. Покрытие API хорошее, но:

- **Требует аккаунт Composio + API-ключ** — дополнительный посредник
- **Учётные данные DaData хранятся на серверах Composio** — проблема безопасности для русских enterprise
- **Добавляет латентность** (запрос через инфраструктуру Composio)
- **Нет Resources/Prompts** — только generic tool обёртки
- **Нет batch-операций, findAffiliated, гранулярных suggest-параметров**
- **Нет локального/offline режима**

### Существующие SDK — что позаимствовать

| SDK | Репозиторий | Звёзды | Хорошее | Плохое |
|-----|-------------|--------|---------|--------|
| Python | hflabs/dadata-py | 91 | async, context manager, httpx, CalVer | Raw dicts, нет типов |
| C# | hflabs/dadata-csharp | 67 | Разделение по доменам (Clean/Suggest/Outward/Profile) | Много классов |
| Go | ekomobile/dadata | 26 | CredentialProvider interface, env vars по умолчанию | Community |
| Ruby | amdest/dadata | – | Explicit error classes (ApiError, TimeoutError) | Мало звёзд |

**Критический факт: на npm НЕТ maintained серверного TypeScript-клиента для DaData.** `@via-profit/dadata` (полные типы) устарел. `react-dadata` (109 звёзд) — только фронтенд. Ваш MCP-сервер попутно станет **лучшим серверным TS-клиентом DaData**.

### Лучшие MCP-серверы для ориентира

| Сервер | Звёзды | Особенности |
|--------|--------|-------------|
| modelcontextprotocol/servers (монорепо) | ~82K | Reference: Filesystem, Memory, Git, Fetch, Everything |
| upstash/context7 | ~50K | Документация библиотек для LLM |
| github/github-mcp-server | ~25K | Полное покрытие GitHub API |
| crystaldba/postgres-mcp | ~2.4K | SQL-инструменты + Resources (схема) |
| cloudflare/mcp-server-cloudflare | Notable | Workers, KV, R2, D1 — multi-service |

**Паттерны из топ-серверов**: snake_case для инструментов (~95%), env vars через конфигурацию клиента, `isError: true` для ошибок (LLM их видит и может retry), Markdown + JSON гибрид для ответов, README с JSON-конфигами для Claude Desktop и VS Code.

---

## ЧАСТЬ 3: Архитектурные решения

### Оптимальный набор MCP tools

Принцип: **проектируйте для намерений, а не для endpoint'ов.** Рекомендация экосистемы — **5–15 tools на сервер** (максимум 50). Предлагаю **12 tools** в v1, разделённых на 3 уровня.

#### Must-have tools (v1 launch, 8 tools)

**1. `suggest_address`** — автодополнение адресов
```typescript
// Description: "Autocomplete Russian addresses. Returns up to 20 suggestions with postal code, FIAS ID, coordinates, and administrative structure. Supports bounds (from city to house level), location filters, and English transliteration."
inputSchema: {
  query: z.string().min(1).max(300).describe("Partial address in any format"),
  count: z.number().int().min(1).max(20).default(5),
  language: z.enum(["ru", "en"]).default("ru"),
  from_bound: z.enum(["country","region","area","city","settlement","street","house"]).optional(),
  to_bound: z.enum(["country","region","area","city","settlement","street","house"]).optional(),
  locations: z.array(z.record(z.string())).optional()
    .describe("Filter by region/city KLADR/FIAS IDs or country_iso_code")
}
// Use case: Форма заказа, CRM, любой интерфейс ввода адреса
```

**2. `suggest_company`** — поиск компаний
```typescript
// Description: "Search Russian companies and entrepreneurs by name, INN, or OGRN. Returns company details including legal name, INN, KPP, OGRN, address, CEO, status, and main OKVED."
inputSchema: {
  query: z.string().min(1).max(300).describe("Company name, INN, or OGRN"),
  count: z.number().int().min(1).max(20).default(5),
  status: z.array(z.enum(["ACTIVE","LIQUIDATING","LIQUIDATED","BANKRUPT","REORGANIZING"])).optional(),
  type: z.enum(["LEGAL","INDIVIDUAL"]).optional()
}
// Use case: Заполнение реквизитов контрагента, поиск компаний
```

**3. `find_company_by_id`** — детальная информация о компании по ИНН/ОГРН
```typescript
// Description: "Get detailed company information by INN or OGRN. Returns registration data, status, address, management, founders (paid tiers), financials (paid tiers), and all OKVEDs."
inputSchema: {
  query: z.string().describe("Company INN (10 or 12 digits) or OGRN (13 or 15 digits)"),
  branch_type: z.enum(["MAIN","BRANCH"]).optional(),
  kpp: z.string().optional().describe("KPP for specific branch")
}
// Use case: Проверка контрагента, заполнение карточки компании
```

**4. `find_bank`** — информация о банке по БИК/SWIFT
```typescript
// Description: "Find bank by BIC, SWIFT code, INN, or registration number. Returns full bank details including correspondent account, address, and operational status."
inputSchema: {
  query: z.string().describe("Bank BIC, SWIFT, INN, or registration number"),
  count: z.number().int().min(1).max(20).default(5)
}
```

**5. `clean_address`** — стандартизация адреса
```typescript
// Description: "Standardize and validate a Russian address. Returns ~80 structured fields: postal code, FIAS/KLADR IDs, coordinates, quality codes (qc: 0=exact, 1=partial, 2=unrecognized), timezone, metro, OKATO/OKTMO. Requires DADATA_SECRET_KEY."
inputSchema: {
  address: z.string().min(1).describe("Address in any format to standardize")
}
```

**6. `clean_phone`** — стандартизация телефона
```typescript
// Description: "Validate and standardize a phone number. Returns formatted number, carrier, region, city, timezone, and type (mobile/landline). Quality code qc: 0=valid, 1=partial, 2=invalid."
inputSchema: {
  phone: z.string().min(1).describe("Phone number in any format")
}
```

**7. `geolocate_address`** — обратное геокодирование
```typescript
// Description: "Find nearest addresses by geographic coordinates (reverse geocoding). Returns addresses within specified radius sorted by distance."
inputSchema: {
  lat: z.number().min(-90).max(90).describe("Latitude"),
  lon: z.number().min(-180).max(180).describe("Longitude"),
  radius_meters: z.number().min(1).max(1000).default(100).optional(),
  count: z.number().int().min(1).max(20).default(5)
}
```

**8. `ip_locate`** — город по IP
```typescript
// Description: "Determine Russian city by IP address. Returns city name, FIAS ID, coordinates, and full address data."
inputSchema: {
  ip: z.string().describe("IPv4 address to locate")
}
```

#### Nice-to-have tools (v1.1, 4 tools)

**9. `suggest_fio`** — подсказки ФИО с определением пола

**10. `clean_name`** — стандартизация ФИО (парсинг на фамилию/имя/отчество, определение пола)

**11. `find_affiliated_companies`** — поиск аффилированных компаний по ИНН (требует тариф «Максимальный»)

**12. `get_balance`** — проверка баланса и статистики аккаунта DaData

#### Композитные tools (v2)

**`validate_counterparty`** — всесторонняя проверка контрагента:
```typescript
// Внутри: findById/party → анализ статуса → проверка адреса → findAffiliated
// Description: "Comprehensive counterparty due diligence. Takes INN, returns company details, registration status, address validation, risk flags (recent registration, liquidation, bankruptcy), and affiliated companies if available."
```

**`enrich_lead`** — обогащение лида по неполным данным:
```typescript
// Внутри: clean/name + clean/phone + clean/email + suggest/party (по домену email)
// Description: "Enrich a business lead from partial data (name, phone, email). Returns standardized name with gender, validated phone with carrier, email validation, and employer company if corporate email detected."
```

**`smart_address_resolve`** — цепочка: подсказка → стандартизация → геокодирование:
```typescript
// Внутри: suggest/address → clean/address → проверка qc
// Description: "Resolve an ambiguous address through multi-step validation. Returns the best matching standardized address with coordinates, quality assessment, and confidence level."
```

### Resources — контекст для AI-агента

MCP Resources — статические данные, загружаемые в контекст LLM. Для DaData:

```typescript
// 1. Справочник кодов качества
server.resource(
  "quality-codes",
  "dadata://reference/quality-codes",
  { title: "DaData Quality Codes Reference", mimeType: "text/markdown" },
  async () => ({
    contents: [{
      uri: "dadata://reference/quality-codes",
      text: `# DaData Quality Codes\n\n## Address (qc)\n- 0: Exactly recognized\n- 1: Recognized with assumptions\n- 2: Partially recognized\n- 3: Not recognized\n\n## Geocoding (qc_geo)\n- 0: Exact coordinates\n- 1: Nearest house\n- 2: Nearest street\n- 3: Nearest settlement\n- 4: Nearest city\n- 5: Coordinates unavailable\n\n## Phone (qc)\n- 0: Valid phone\n- 1: Partially valid\n- 2: Invalid phone`
    }]
  })
);

// 2. Описание возможностей API
server.resource(
  "capabilities",
  "dadata://docs/capabilities",
  { title: "DaData API Capabilities", mimeType: "text/markdown" },
  async () => ({ contents: [{ uri: "dadata://docs/capabilities",
    text: "# What DaData can do\n\n## Free tier (10K req/day)\n- Address autocomplete (Russia to apartment, world to city)\n- Company search by name/INN/OGRN\n- Bank by BIC/SWIFT\n- Reverse geocoding\n- IP geolocation\n\n## Paid (20 kop/record)\n- Address standardization (80+ fields)\n- Phone validation\n- Name parsing\n- Email validation\n- Passport check\n\n## Premium tiers\n- Company founders, financials\n- Affiliated companies\n- Licenses, fines, debts"
  }] })
);

// 3. Справочник статусов компаний
server.resource(
  "company-statuses",
  "dadata://reference/company-statuses",
  { title: "Company Status Reference", mimeType: "application/json" },
  async () => ({ contents: [{ uri: "dadata://reference/company-statuses",
    text: JSON.stringify({
      "ACTIVE": "Действующая",
      "LIQUIDATING": "Ликвидируется",
      "LIQUIDATED": "Ликвидирована",
      "BANKRUPT": "В стадии банкротства",
      "REORGANIZING": "Реорганизуется"
    }, null, 2)
  }] })
);
```

### Prompts — шаблоны для типовых задач

```typescript
server.prompt(
  "check_counterparty",
  {
    inn: z.string().describe("Company INN to check")
  },
  ({ inn }) => ({
    messages: [{
      role: "user",
      content: {
        type: "text",
        text: `Проведи проверку контрагента ИНН ${inn}:\n\n1. Используй find_company_by_id для получения данных\n2. Проверь статус (ACTIVE/LIQUIDATED/BANKRUPT)\n3. Оцени дату регистрации (новая компания = риск)\n4. Проверь адрес на массовость\n5. Выдай заключение: надёжный / требует внимания / высокий риск`
      }
    }]
  })
);

server.prompt(
  "clean_contact_database",
  {
    data_description: z.string().describe("Description of data to clean")
  },
  ({ data_description }) => ({
    messages: [{
      role: "user",
      content: {
        type: "text",
        text: `Помоги очистить базу контактов: ${data_description}\n\nДля каждой записи:\n1. Стандартизируй адрес через clean_address\n2. Валидируй телефон через clean_phone\n3. Проверь ФИО через suggest_fio\n4. Оцени качество данных по кодам qc\n5. Сформируй отчёт с проблемными записями`
      }
    }]
  })
);
```

### Формат ответов — JSON с человекочитаемыми пояснениями

Рекомендую **hybrid-формат**: структурированный JSON с добавленными полями-пояснениями.

```typescript
// ✅ ХОРОШО — обогащённый ответ
function formatAddressResult(data: any) {
  return {
    address: data.result,
    postal_code: data.postal_code,
    region: data.region_with_type,
    city: data.city_with_type,
    street: data.street_with_type,
    house: data.house,
    geo: data.geo_lat ? { lat: data.geo_lat, lon: data.geo_lon } : null,
    fias_id: data.fias_id,
    // Человекочитаемые пояснения
    quality: QC_LABELS[data.qc],  // "Адрес распознан уверенно"
    geo_quality: QC_GEO_LABELS[data.qc_geo], // "Точные координаты"
    confidence: data.qc === 0 ? "high" : data.qc === 1 ? "medium" : "low"
  };
}

// Маппинг кодов качества
const QC_LABELS: Record<number, string> = {
  0: "Address recognized with certainty",
  1: "Address recognized with assumptions — verify manually",
  2: "Address partially recognized — only city/region level",
  3: "Address not recognized — input may be invalid"
};
```

**Пустые результаты** — НЕ ошибка:
```typescript
if (data.suggestions.length === 0) {
  return {
    content: [{ type: "text", text: JSON.stringify({
      status: "no_results",
      message: `No results found for "${query}". Try a shorter or different query.`,
      suggestions: ["Try removing apartment/flat number", "Check for typos", "Use a broader query"]
    }, null, 2) }]
  };
}
```

**Частичные результаты** — явная индикация:
```typescript
return {
  content: [{ type: "text", text: JSON.stringify({
    status: "partial",
    message: "Address recognized to city level only (house number not found)",
    result: { /* ... */ },
    quality: { qc: 2, qc_geo: 4, confidence: "low" },
    warnings: ["House not found in FIAS database", "Geocoding at city centroid only"]
  }, null, 2) }]
};
```

---

## ЧАСТЬ 4: Техническая реализация

### Стек и структура проекта

```
@neuraldeep/dadata-mcp/
├── src/
│   ├── index.ts            # Entry: server setup + stdio transport
│   ├── config.ts           # Env validation (Zod)
│   ├── client.ts           # DaData HTTP client (fetch + retry + timeout)
│   ├── tools/
│   │   ├── suggest.ts      # suggest_address, suggest_company, suggest_fio
│   │   ├── clean.ts        # clean_address, clean_phone, clean_name
│   │   ├── find.ts         # find_company_by_id, find_bank, find_affiliated
│   │   ├── geo.ts          # geolocate_address, ip_locate
│   │   └── profile.ts      # get_balance
│   ├── resources/
│   │   └── reference.ts    # Quality codes, statuses, capabilities
│   ├── prompts/
│   │   └── workflows.ts    # check_counterparty, clean_database
│   ├── lib/
│   │   ├── cache.ts        # TTL in-memory cache
│   │   ├── rate-limiter.ts # Token bucket rate limiter
│   │   └── formatters.ts   # Response formatting helpers
│   └── types.ts            # DaData API response types
├── package.json
├── tsconfig.json
├── README.md
├── LICENSE (MIT)
└── CONTRIBUTING.md
```

**package.json** (ключевые поля):
```json
{
  "name": "@neuraldeep/dadata-mcp",
  "version": "1.0.0",
  "type": "module",
  "bin": { "dadata-mcp": "./dist/index.js" },
  "files": ["dist"],
  "engines": { "node": ">=18.0.0" },
  "scripts": {
    "build": "tsc && chmod 755 dist/index.js",
    "prepare": "npm run build",
    "inspector": "npx @modelcontextprotocol/inspector node dist/index.js"
  },
  "dependencies": {
    "@modelcontextprotocol/sdk": "^1.28.0",
    "zod": "^3.24.0"
  },
  "publishConfig": { "access": "public" },
  "keywords": ["mcp","mcp-server","dadata","address","geocoding","russia","ai","claude"]
}
```

**tsconfig.json**:
```json
{
  "compilerOptions": {
    "target": "ES2022",
    "module": "Node16",
    "moduleResolution": "Node16",
    "outDir": "./dist",
    "rootDir": "./src",
    "strict": true,
    "declaration": true,
    "sourceMap": true,
    "esModuleInterop": true,
    "skipLibCheck": true
  },
  "include": ["src/**/*"],
  "exclude": ["node_modules", "dist", "**/*.test.ts"]
}
```

**Шебанг** в `src/index.ts`:
```typescript
#!/usr/bin/env node
import { McpServer } from "@modelcontextprotocol/sdk/server/mcp.js";
import { StdioServerTransport } from "@modelcontextprotocol/sdk/server/stdio.js";
```

### HTTP-клиент — native fetch (zero deps)

```typescript
// src/client.ts
const DEFAULT_TIMEOUT = 10_000;
const MAX_RETRIES = 3;

interface DaDataConfig {
  apiKey: string;
  secretKey?: string;
}

function getConfig(): DaDataConfig {
  const apiKey = process.env.DADATA_API_KEY;
  if (!apiKey) {
    throw new Error("DADATA_API_KEY environment variable is required");
  }
  return { apiKey, secretKey: process.env.DADATA_SECRET_KEY };
}

async function fetchWithTimeout(url: string, options: RequestInit, timeoutMs = DEFAULT_TIMEOUT): Promise<Response> {
  const controller = new AbortController();
  const timeout = setTimeout(() => controller.abort(), timeoutMs);
  try {
    return await fetch(url, { ...options, signal: controller.signal });
  } finally {
    clearTimeout(timeout);
  }
}

export async function callSuggestionsAPI(endpoint: string, body: object) {
  const { apiKey } = getConfig();
  return callAPI(
    `https://suggestions.dadata.ru/suggestions/api/4_1/rs/${endpoint}`,
    body,
    { "Authorization": `Token ${apiKey}` }
  );
}

export async function callCleanerAPI(type: string, values: string[]) {
  const { apiKey, secretKey } = getConfig();
  if (!secretKey) {
    return {
      content: [{ type: "text" as const, text: "DADATA_SECRET_KEY is required for standardization. Set it in your MCP client config." }],
      isError: true
    };
  }
  return callAPI(
    `https://cleaner.dadata.ru/api/v1/clean/${type}`,
    values,
    { "Authorization": `Token ${apiKey}`, "X-Secret": secretKey }
  );
}

async function callAPI(url: string, body: unknown, headers: Record<string, string>) {
  for (let attempt = 0; attempt <= MAX_RETRIES; attempt++) {
    try {
      const response = await fetchWithTimeout(url, {
        method: "POST",
        headers: { "Content-Type": "application/json", "Accept": "application/json", ...headers },
        body: JSON.stringify(body)
      });

      if (response.ok) return { data: await response.json(), error: null };

      // Retry on 429 and 5xx
      if ((response.status === 429 || response.status >= 500) && attempt < MAX_RETRIES) {
        const waitMs = Math.min(1000 * Math.pow(2, attempt), 8000);
        await new Promise(r => setTimeout(r, waitMs));
        continue;
      }

      return { data: null, error: mapHttpError(response.status) };
    } catch (err) {
      if (err instanceof DOMException && err.name === "AbortError") {
        return { data: null, error: "Request timed out after 10s. DaData may be experiencing issues." };
      }
      if (attempt < MAX_RETRIES) continue;
      return { data: null, error: `Network error: ${err instanceof Error ? err.message : String(err)}` };
    }
  }
  return { data: null, error: "Max retries exceeded" };
}

function mapHttpError(status: number): string {
  const errors: Record<number, string> = {
    401: "Invalid API key. Check DADATA_API_KEY at https://dadata.ru/profile/#info",
    402: "Insufficient balance or daily limit exceeded (10K free requests/day)",
    403: "Access forbidden. DADATA_SECRET_KEY may be required for this endpoint",
    405: "Method not allowed",
    413: "Request too large (query exceeds 300 characters)",
    429: "Rate limit exceeded. Wait ~5 minutes before retrying"
  };
  return errors[status] || (status >= 500 ? `DaData server error (${status}). Try again later.` : `HTTP ${status}`);
}
```

### Error handling — два ключевых принципа

**Принцип 1: Всегда `isError: true`, никогда не throw.** LLM видит tool execution errors и может retry. Protocol-level errors невидимы для модели.

```typescript
function errorResponse(message: string) {
  return { content: [{ type: "text" as const, text: message }], isError: true };
}

function successResponse(data: unknown) {
  return { content: [{ type: "text" as const, text: JSON.stringify(data, null, 2) }] };
}
```

**Принцип 2: Предупреждайте о missing secrets лениво.** При запуске — warning в stderr, при вызове clean tool — actionable error:

```typescript
// При запуске (stderr, не stdout!)
if (!process.env.DADATA_API_KEY) {
  console.error("[dadata-mcp] WARNING: DADATA_API_KEY not set. All tools will return errors.");
}
if (!process.env.DADATA_SECRET_KEY) {
  console.error("[dadata-mcp] INFO: DADATA_SECRET_KEY not set. Clean/standardize tools unavailable.");
}
```

### Тестирование

**DaData не имеет sandbox-окружения.** Их официальная позиция: «Тестовый контур не планируем, можно использовать продуктовый в рамках лимитов». Бесплатный тариф (10K запросов/день) достаточен для интеграционных тестов.

**Unit-тесты** — mock fetch через Vitest:
```typescript
import { describe, it, expect, vi } from 'vitest';
const mockFetch = vi.fn();
globalThis.fetch = mockFetch;

describe('suggest_address', () => {
  it('returns formatted suggestions', async () => {
    mockFetch.mockResolvedValueOnce({
      ok: true, status: 200,
      json: async () => ({ suggestions: [{ value: "г Москва, ул Сухонская, д 11", data: { postal_code: "127642" } }] })
    });
    const result = await handleSuggestAddress({ query: "мск сухонская 11", count: 5 });
    expect(result.content[0].text).toContain("127642");
  });

  it('returns isError on 401', async () => {
    mockFetch.mockResolvedValueOnce({ ok: false, status: 401 });
    const result = await handleSuggestAddress({ query: "test", count: 5 });
    expect(result.isError).toBe(true);
  });
});
```

**MCP Inspector** — интерактивное тестирование:
```bash
DADATA_API_KEY=xxx npx @modelcontextprotocol/inspector node dist/index.js
# Открывает UI на http://localhost:6274 — можно вызывать tools, видеть JSON-RPC логи
```

**Верификация в Claude Desktop**:
1. Добавить конфиг в `~/Library/Application Support/Claude/claude_desktop_config.json`
2. Перезапустить Claude (Cmd+R)
3. Иконка молотка в поле ввода → список tools
4. Спросить: «Найди компанию по ИНН 7707083893»

### Публикация на npm

```bash
# Первая публикация
npm login
npm publish --access public

# Обновления
npm version patch  # minor / major
npm publish
```

Конфигурация для пользователей (Claude Desktop):
```json
{
  "mcpServers": {
    "dadata": {
      "command": "npx",
      "args": ["-y", "@neuraldeep/dadata-mcp"],
      "env": {
        "DADATA_API_KEY": "<your-api-key>",
        "DADATA_SECRET_KEY": "<your-secret-key>"
      }
    }
  }
}
```

---

## ЧАСТЬ 5: Go-to-Market

### Позиционирование vs. официальный MCP DaData

Ваш ключевой дифференциатор: **официальный MCP покрывает 4 tool'а, ваш — 12+ с resources, prompts, кешированием, и работает как локальный npm-пакет без прокси.** Формулировка для README:

> "While DaData offers an official remote MCP server with basic company lookup and address cleaning, @neuraldeep/dadata-mcp provides **full API coverage** (12+ tools across all 56 endpoints), MCP Resources for reference data, Prompt templates for common workflows, in-memory caching, and works as a **local npm package** — no proxy needed."

### README — структура для максимума звёзд

```markdown
# 🏠 @neuraldeep/dadata-mcp

> Full-featured MCP server for DaData.ru — Russian address validation, company enrichment & data cleansing for AI agents

[![npm](https://img.shields.io/npm/v/@neuraldeep/dadata-mcp)](...)
[![License: MIT](https://img.shields.io/badge/License-MIT-yellow.svg)](...)
[![MCP Compatible](https://img.shields.io/badge/MCP-compatible-green)](...)

[GIF демо — 15-20 секунд, показывающий диалог с Claude]

## ✨ Features
- 🔍 **12 tools** covering addresses, companies, banks, phones, names, geocoding
- 📚 MCP Resources with quality code reference, company statuses
- 💡 Prompt templates for counterparty checks and data cleaning
- ⚡ In-memory caching, rate limiting, exponential backoff
- 🇷🇺 First comprehensive DaData MCP — covers 56 API endpoints

## 🚀 Quick Start (2 minutes)

### Claude Desktop
[JSON config block]

### VS Code / Cursor
[JSON config block]

### Claude Code
claude mcp add dadata -- npx -y @neuraldeep/dadata-mcp

## 🛠 Available Tools
[Таблица всех tools с описаниями]

## 📖 Example Prompts
"Проверь контрагента ИНН 7707083893"
"Стандартизируй адрес: мск сухонская 11 кв 89"
"Найди ближайшие адреса к координатам 55.7558, 37.6173"

## ⚙️ Environment Variables
[Таблица]

## 📦 Development
[Clone, install, build, test]

## License
MIT
```

**Запись GIF-демо**: используйте **VHS** (charmbracelet/vhs) — пишете скрипт терминального демо как код, вывод — воспроизводимый GIF. Альтернатива — **asciinema** + **agg** для конвертации.

### Листинг в каталогах (12+ площадок)

| Каталог | Приоритет | Как добавить |
|---------|-----------|-------------|
| **Official MCP Registry** | 🔴 Первый | CLI: `smithery mcp publish`, namespace через GitHub OAuth |
| **github.com/modelcontextprotocol/servers** | 🔴 Обязательно | PR в секцию community servers |
| **glama.ai** | 🔴 Важно | Кнопка «Add Server» на glama.ai/mcp/servers (20K+ серверов) |
| **smithery.ai** | 🔴 Важно | CLI: `npx @smithery/cli` → publish |
| **mcp.so** | 🟡 Полезно | Issue в github.com/chatmcp/mcpso (19K+ серверов) |
| **PulseMCP** | 🟡 Полезно | pulsemcp.com/servers (13K+ серверов) |
| **mcp.directory** | 🟡 Полезно | «Largest curated directory», one-click install badges |
| **mcpservers.org** | 🟡 | Awesome MCP Servers коллекция |
| **mcpserverfinder.com** | 🟡 | С рейтингами |
| **Docker MCP Catalog** | 🟢 Опционально | PR в github.com/docker/mcp-registry |
| **LobeHub** | 🟢 | lobehub.com/mcp |
| **MCPize** | 🟢 | Для монетизации |

### Habr-стратегия

DaData/HFLabs **имеет корпоративный блог на Habr** (habr.com/ru/companies/hflabs/) и позиционирует свой MCP-сервер для AI. Они активно продвигают партнёрские интеграции.

**Рекомендуемый формат**: туториал с элементами кейса. Заголовок: «Как я сделал MCP-сервер для DaData: подключаем Claude к российским API за 5 минут».

**Хабы**: Программирование, API, Open Source, Искусственный интеллект, Node.js.

**Время публикации**: вторник–четверг, **13:00–15:00 МСК** (обеденный пик трафика). Избегать пятничных вечеров и выходных.

**Контакт с DaData**: свяжитесь до публикации. Они продвигают партнёрские решения через блог, рассылку и Telegram. Высока вероятность репоста.

### Telegram-посев

Целевые каналы для анонса:

| Канал | Фокус | Релевантность |
|-------|-------|---------------|
| **LLM продакшн** | Практическое использование LLM, MCP | 🔴 Идеальный |
| **AI Happens** (@AIhappens) | AI новости, практика | 🔴 Высокая |
| **Tproger AI** | AI для разработчиков | 🔴 Высокая |
| **Machinelearning** | ML/AI новости | 🟡 Широкая аудитория |
| **GPT Main News** | ChatGPT/нейросети | 🟡 Массовая |

**Формат поста**: 3–5 абзацев, проблема → решение → код → ссылка на GitHub/Habr. Обязательно скриншот или GIF работы с Claude.

**Канал @neuraldeep**: да, создайте, но как лёгкий changelog-канал (1 пост/неделю). Включите комментарии. Закрепите ссылки на GitHub, npm, Habr.

---

## ЧАСТЬ 6: Развитие и монетизация

### Roadmap v2

**v1.1** (через 2–4 недели после launch):
- `suggest_fio`, `clean_name`, `clean_email`, `clean_passport`
- In-memory TTL-кеш (clean: 1 час, suggest: 60 сек, findById: 1 час, reference: 24 часа)
- Token bucket rate limiter (защита от превышения 30 req/s)
- Docker-образ

**v2.0** (через 2–3 месяца):
- **Композитные tools**: `validate_counterparty`, `enrich_lead`, `smart_address_resolve`
- **Batch-операции**: `batch_clean_addresses`, `batch_clean_phones`
- Поддержка Streamable HTTP транспорта (для remote deployment)
- Интернационализация: Беларусь (`party_by`), Казахстан (`party_kz`)
- Полное покрытие всех 56 endpoint'ов (ОКПД, МКТУ, ОКТМО, суды, таможни, метро)

**v3.0** (6+ месяцев):
- Интеграция с другими MCP-серверами: МойСклад (sync контрагентов), ЮKassa (проверка получателей)
- Analytics dashboard (какие tools чаще вызываются, топ ошибок)
- Webhook/subscription уведомления об изменении статуса компании (через periodic polling)

### Монетизация — реферальная программа DaData как первый доход

**DaData выплачивает 30% от дохода с привлечённых клиентов.** Это единственная наиболее очевидная и немедленная возможность заработка.

Подайте заявку на dadata.ru/referral/, получите реферальную ссылку и встройте в onboarding-flow MCP-сервера: когда пользователь ещё не имеет ключа DaData, направляйте его на регистрацию через вашу реферальную ссылку.

**Стратегия монетизации по фазам**:

1. **Фаза 1 (Launch)**: бесплатный open-source + реферальная ссылка DaData (30% revenue share). Каждый новый пользователь вашего MCP, зарегистрировавшийся через реферальную ссылку — пассивный доход.

2. **Фаза 2 (Traction)**: hosted версия через **MCPize** (85/15 revenue share) или **Apify** (pay-per-event). Пользователи без Node.js могут платить за managed MCP endpoint.

3. **Фаза 3 (Scale)**: premium-фичи — persistent кеш (Redis), batch tools с очередями, priority support, SLA. Модель: free tools для Suggestions API + premium для композитных и Cleaner tools.

### Community building

**CONTRIBUTING.md** должен включать:
- Vision проекта и как каждый endpoint = отдельная contribution opportunity
- Development setup (clone → npm install → npm run build → npm run inspector)
- Как добавить новый DaData tool (шаблон-boilerplate)
- Требования к тестам (unit test для каждого tool)
- PR процесс (commit messages, review timeline)

**Issues для запуска** с labels `good first issue` + `help wanted`:
- «Add suggest_fio tool» — один на каждый неимплементированный endpoint
- «Add Docker support»
- «Improve error messages for edge cases»
- «Add response caching»

**GitHub Discussions**:
- «🙋 Как вы используете dadata-mcp?»
- «💡 Какие tools вам нужны?»
- «❓ Q&A — Помощь с настройкой»

---

## Антипаттерны — чего НЕ делать

**НЕ оборачивайте каждый endpoint в отдельный tool.** 56 tools сломают tool selection accuracy LLM. Группируйте по intent (suggest_address, не suggest_address + findById_address + geolocate_address + iplocate_address как 4 отдельных tool'а).

**НЕ возвращайте raw API response.** DaData может вернуть 80+ полей для адреса. Вырезайте только существенные поля + добавляйте quality labels. Каждый байт = токены LLM.

**НЕ используйте `console.log()`.** MCP использует stdout для JSON-RPC. Только `console.error()` для логов.

**НЕ бросайте exceptions.** Всегда возвращайте `{ isError: true, content: [...] }` — LLM увидит ошибку и сможет retry.

**НЕ валидируйте env vars жёстко при запуске.** Если DADATA_SECRET_KEY не задан — не крашьте сервер. Suggest tools работают без него. Крашьте только если DADATA_API_KEY отсутствует.

**НЕ называйте пакет `mcp-dadata-server`.** Конвенция экосистемы — `{name}-mcp` без слова «server» (63% серверов его опускают). `@neuraldeep/dadata-mcp` — правильное имя.

**НЕ делайте descriptions tool'ов длиннее 200 символов.** Анализ экосистемы показал: серверы с краткими описаниями (PostgreSQL MCP, 46 токенов) получают оценку A+, а с раздутыми (Context7, 510 токенов) — 7.5/100 по tool quality.

---

## Launch Week — план действий

**День 0 (до запуска)**: отполировать README с GIF, badges, двуязычными секциями. Создать CONTRIBUTING.md. Подать заявку на реферальную программу DaData. Связаться с командой DaData.

**День 1**: `npm publish --access public`. Submit в Official MCP Registry + PR в modelcontextprotocol/servers.

**Дни 2–3**: Submit в Glama.ai, Smithery.ai, mcp.so, PulseMCP, mcp.directory. Создать @neuraldeep Telegram канал.

**Дни 4–7**: Публикация на Habr (вт–чт, 13:00 МСК). Посев в Telegram-каналах. Создать `good first issue` на GitHub.

**Неделя 2+**: Follow-up с DaData о партнёрстве. Мониторинг issues/PR. Начать работу над v1.1 (кеширование + дополнительные tools).