# @metarebalance/dadata-mcp — Current State

**Дата:** 2026-03-29
**Репо:** https://github.com/theYahia/dadata-mcp
**npm:** @metarebalance/dadata-mcp (ещё не опубликован)
**Автор:** theYahia (GitHub) / metarebalance (npm)

---

## Что построено

MCP-сервер с **полным покрытием DaData API** — первый в мире standalone npm-пакет такого уровня.

### Метрики

| Метрика | Значение |
|---------|---------|
| MCP Tools | **27** |
| MCP Resources | **2** |
| MCP Prompts | **2** |
| Тесты | **99** (все pass) |
| Строк кода (src/) | **2 423** |
| Строк тестов | **1 305** |
| Security audit | **10/10 PASS** |
| Runtime dependencies | **2** (@modelcontextprotocol/sdk, zod) |
| npm vulnerabilities | **0** |

### Все 27 tools

#### Адреса (5 tools — free)
| Tool | DaData Endpoint | Описание |
|------|----------------|----------|
| `suggest_address` | suggest/address | Автокомплит адресов с ФИАС, координатами, индексом |
| `clean_address` | clean/address | Стандартизация адреса (80+ полей, qc, координаты). Paid 0.20₽ |
| `find_by_id_address` | findById/address | Адрес по ФИАС ID, КЛАДР или кадастровому номеру |
| `geolocate_address` | geolocate/address | Обратное геокодирование (координаты → адрес) |
| `ip_locate` | iplocate/address | Город по IPv4 адресу |

#### Компании (6 tools)
| Tool | DaData Endpoint | Описание |
|------|----------------|----------|
| `suggest_company` | suggest/party | Поиск компаний по названию/ИНН/ОГРН |
| `find_company_by_id` | findById/party | Детали компании по ИНН/ОГРН (реквизиты, руководитель, ОКВЭД) |
| `find_affiliated` | findAffiliated/party | Аффилированные компании по ИНН (тариф Максимальный) |
| `find_company_by_email` | findByEmail/company | Компания по email/домену. Paid 7₽ |
| `find_brand` | findById/brand | Бренд, сайт, логотип по ИНН. Paid 7₽ |
| `find_self_employed` | findById/party (INDIVIDUAL) | Проверка самозанятого по ИНН (через ФНС) |

#### Банки (1 tool — free)
| Tool | DaData Endpoint | Описание |
|------|----------------|----------|
| `find_bank` | suggest/bank | Банк по БИК, SWIFT, ИНН, названию |

#### ФИО (2 tools)
| Tool | DaData Endpoint | Описание |
|------|----------------|----------|
| `suggest_fio` | suggest/fio | Автокомплит ФИО с определением пола. Free |
| `clean_name` | clean/name | Парсинг ФИО → фамилия/имя/отчество + пол + склонения. Paid 0.20₽ |

#### Телефоны (1 tool)
| Tool | DaData Endpoint | Описание |
|------|----------------|----------|
| `clean_phone` | clean/phone | Валидация телефона: оператор, регион, тип, таймзона. Paid 0.20₽ |

#### Email (2 tools)
| Tool | DaData Endpoint | Описание |
|------|----------------|----------|
| `clean_email` | clean/email | Валидация email: тип, одноразовость, исправление опечаток. Paid 0.20₽ |
| `suggest_email` | suggest/email | Автокомплит email. Free |

#### Паспорта (3 tools)
| Tool | DaData Endpoint | Описание |
|------|----------------|----------|
| `clean_passport` | clean/passport | Проверка паспорта по реестру МВД. Paid 0.20₽ |
| `find_fms_unit` | suggest/fms_unit | Кем выдан паспорт по коду подразделения. Free |
| `find_inn_by_passport` | (FNS proxy) | ИНН по паспортным данным (нестабильный API ФНС) |

#### Автомобили (2 tools)
| Tool | DaData Endpoint | Описание |
|------|----------------|----------|
| `clean_vehicle` | clean/vehicle | Распознание марки/модели из строки. Paid 0.20₽ |
| `suggest_car_brand` | suggest/car_brand | Справочник марок авто. Free |

#### Логистика (1 tool — free)
| Tool | DaData Endpoint | Описание |
|------|----------------|----------|
| `find_delivery_city` | findById/delivery | ID города в СДЭК, Boxberry, DPD по КЛАДР |

#### Почта и страны (2 tools — free)
| Tool | DaData Endpoint | Описание |
|------|----------------|----------|
| `find_postal_unit` | suggest/postal_unit | Почтовое отделение по индексу + график работы |
| `suggest_country` | suggest/country | Справочник стран ISO 3166 |

#### Справочники (1 tool — 9 директорий в одном, free)
| Tool | Директории |
|------|-----------|
| `lookup_reference` | ОКВЭД 2, ОКПД 2, ОКТМО, станции метро, налоговые инспекции (ФНС), таможни (ФТС), суды, валюты (ISO 4217), МКТУ (товарные знаки) |

#### Профиль (1 tool)
| Tool | DaData Endpoint | Описание |
|------|----------------|----------|
| `get_balance` | profile/balance + stat/daily | Баланс аккаунта и дневная статистика |

### 2 Resources
- `quality-codes` — справочник кодов качества (qc, qc_geo) для AI-агентов
- `capabilities` — что DaData может: free vs paid, лимиты

### 2 Prompts
- `check_counterparty` — проверка контрагента по ИНН (multi-step)
- `validate_address` — валидация адреса с оценкой качества (multi-step)

---

## Архитектура

```
src/
├── index.ts                 # Entry point — MCP server bootstrap (stdio)
├── client.ts                # HTTP client (2 домена, retry, timeout, path traversal protection)
├── types.ts                 # Все TypeScript типы API responses
├── lib/formatters.ts        # success()/error() helpers, QC labels, epoch→date
├── tools/
│   ├── suggest.ts           # suggest_address, suggest_company, suggest_fio
│   ├── find.ts              # find_company_by_id, find_bank, find_by_id_address, find_delivery_city
│   ├── clean.ts             # clean_address, clean_phone, clean_email, clean_name
│   ├── geo.ts               # geolocate_address, ip_locate
│   ├── passport.ts          # clean_passport, find_fms_unit, find_inn_by_passport
│   ├── company-extra.ts     # find_affiliated, find_company_by_email, find_brand, find_self_employed
│   ├── email-extra.ts       # suggest_email
│   ├── vehicle.ts           # clean_vehicle, suggest_car_brand
│   ├── postal.ts            # find_postal_unit, suggest_country
│   ├── reference.ts         # lookup_reference (9 directories)
│   └── profile.ts           # get_balance
├── resources/reference.ts   # quality-codes, capabilities
└── prompts/workflows.ts     # check_counterparty, validate_address
```

### Security
- API ключи никогда не логируются и не попадают в ответы
- Все inputs валидируются Zod (длина, типы, regex для IP)
- Path traversal заблокирован regex на всех endpoint'ах
- Timeout 10s на все запросы, retry с backoff только на 429/5xx
- stdout зарезервирован для JSON-RPC, логи только в stderr
- getApiKey() никогда не бросает uncaught exception

---

## Конкуренты

| Конкурент | Tools | Недостатки |
|-----------|:-----:|-----------|
| **Официальный MCP DaData** (mcp.dadata.ru) | 4 | Remote-only, нужен proxy, нет resources/prompts |
| **Composio DaData** | ~40 | Требует аккаунт Composio, ключи хранятся у них, нет resources/prompts |
| **Наш @metarebalance/dadata-mcp** | **27** | Локальный npm, полное покрытие, resources, prompts, 99 тестов |

---

## Что НЕ сделано

- npm publish (пакет не опубликован)
- Листинг в каталогах (neuraldeep.ru, glama.ai, smithery.ai, mcp.so)
- README не обновлён под 27 tools (всё ещё показывает 8)
- Нет GIF-демо
- Нет статьи на Habr
- Нет Telegram-канала
- Реферальная программа DaData не активирована
- Композитные tools (validate_counterparty, enrich_lead) — v2
- Кеширование, Docker — v2
