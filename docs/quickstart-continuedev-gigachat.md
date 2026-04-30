# Быстрый старт: MCP-серверы @theyahia + Continue.dev + GigaChat

Пошаговая инструкция для разработчиков из России: как подключить MCP-серверы для МойСклад, СДЭК, ЦБ РФ и других сервисов к вашей IDE через Continue.dev и GigaChat.

**Почему этот стек:**
- **Continue.dev** — бесплатный open-source AI-ассистент для VS Code и JetBrains с полной поддержкой MCP
- **GigaChat** — LLM от Сбера, доступен в РФ без VPN
- **gpt2giga** — прокси от Сбера, перенаправляет OpenAI-совместимые запросы в GigaChat API
- **@theyahia/\* MCP-серверы** — готовые серверы для российских API (МойСклад, СДЭК, ЦБ РФ и др.)

---

## Предварительные требования

- **Node.js >= 18** — [nodejs.org](https://nodejs.org/)
- **Python >= 3.9** — для установки gpt2giga
- **VS Code** или **JetBrains IDE** (IntelliJ, WebStorm, PyCharm и др.)
- **GigaChat API ключ** — получить на [developers.sber.ru](https://developers.sber.ru/portal/products/gigachat-api)

---

## Шаг 1: Установка Continue.dev

### VS Code

1. Открыть Extensions (`Ctrl+Shift+X`)
2. Найти **Continue**
3. Нажать **Install**
4. После установки в боковой панели появится иконка Continue

### JetBrains (IntelliJ, WebStorm, PyCharm)

1. `Settings` → `Plugins` → `Marketplace`
2. Найти **Continue**
3. Нажать **Install**, перезапустить IDE

---

## Шаг 2: Настройка GigaChat через gpt2giga

### Вариант A: gpt2giga прокси (рекомендуется)

gpt2giga — официальный прокси от Сбера. Поднимает локальный OpenAI-совместимый сервер, который транслирует запросы в GigaChat API.

```bash
# Установка
pip install gpt2giga

# Запуск прокси
gpt2giga --port 8080 --gigachat-api-key YOUR_GIGACHAT_API_KEY
```

Прокси будет доступен на `http://localhost:8080/v1` — этот endpoint совместим с OpenAI API.

> **Где взять ключ:** [developers.sber.ru](https://developers.sber.ru/portal/products/gigachat-api) → Создать проект → Получить authorization key (base64-строка).

### Вариант B: mcp_client_cli_gigachat (CLI-клиент)

Если нужен отдельный CLI-клиент для MCP без IDE:

```bash
pip install mcp_client_cli_gigachat

# Запуск с конфигом
mcp-client-cli --config config.json "Какой курс доллара сегодня?"
```

---

## Шаг 3: Конфигурация Continue.dev

Откройте конфиг Continue.dev:
- **VS Code:** `Ctrl+Shift+P` → `Continue: Open config.json`
- **JetBrains:** `Settings` → `Tools` → `Continue` → `Open config.json`
- **Или вручную:** `~/.continue/config.json`

Замените содержимое на:

```json
{
  "models": [
    {
      "title": "GigaChat",
      "provider": "openai",
      "model": "GigaChat-Pro",
      "apiBase": "http://localhost:8080/v1",
      "apiKey": "not-needed"
    }
  ],
  "tabAutocompleteModel": {
    "title": "GigaChat Autocomplete",
    "provider": "openai",
    "model": "GigaChat",
    "apiBase": "http://localhost:8080/v1",
    "apiKey": "not-needed"
  },
  "mcpServers": [
    {
      "name": "moysklad",
      "command": "npx",
      "args": ["-y", "@theyahia/moysklad-mcp"],
      "env": {
        "MOYSKLAD_TOKEN": "your-moysklad-token"
      }
    },
    {
      "name": "cdek",
      "command": "npx",
      "args": ["-y", "@theyahia/cdek-mcp"],
      "env": {
        "CDEK_CLIENT_ID": "your-client-id",
        "CDEK_CLIENT_SECRET": "your-client-secret"
      }
    },
    {
      "name": "cbr",
      "command": "npx",
      "args": ["-y", "@theyahia/cbr-mcp"],
      "env": {}
    }
  ]
}
```

### Доступные MCP-серверы @theyahia

| Пакет | Описание | Авторизация |
|-------|----------|-------------|
| `@theyahia/moysklad-mcp` | МойСклад ERP — товары, остатки, заказы, контрагенты | Bearer-токен или логин/пароль |
| `@theyahia/cdek-mcp` | СДЭК — тарифы, заказы, ПВЗ, трекинг | OAuth2 (client_id + secret) |
| `@theyahia/cbr-mcp` | ЦБ РФ — курсы валют, ключевая ставка, металлы | Не требуется |
| `@theyahia/cloudpayments-mcp` | CloudPayments — платежи, подписки | API-ключ |
| `@theyahia/robokassa-mcp` | Робокасса — платежи | Логин + пароль |
| `@theyahia/bitrix24-mcp` | Битрикс24 — CRM, задачи, контакты | Вебхук-токен |
| `@theyahia/getcourse-mcp` | GetCourse — пользователи, заказы | API-ключ |
| `@theyahia/tkassa-mcp` | Т-Касса (Тинькофф) — платежи, чеки | Терминал + пароль |
| `@theyahia/travelpayouts-mcp` | Travelpayouts — авиабилеты, отели | API-токен |
| `@theyahia/payme-mcp` | Payme (Узбекистан) — платежи | API-ключ |
| `@theyahia/cbu-mcp` | ЦБ Узбекистана — курсы валют | Не требуется |

---

## Шаг 4: Первый запрос

Убедитесь, что gpt2giga прокси запущен, затем в чате Continue.dev попробуйте:

### Курсы валют (cbr — без авторизации, самый простой тест)
```
Какой сегодня курс доллара и евро к рублю?
```

### МойСклад
```
Покажи остатки товаров на складе "Основной"
```

```
Создай новый заказ покупателя для контрагента "ООО Ромашка" с товаром "Виджет" x10
```

### СДЭК
```
Рассчитай стоимость доставки из Москвы в Новосибирск, посылка 2 кг, 30x20x15 см
```

```
Найди ближайшие ПВЗ СДЭК в Казани
```

### Комбинированные запросы
```
Посмотри курс доллара на сегодня, затем покажи все заказы в МойСклад за последнюю неделю
```

---

## Шаг 5: Альтернативы GigaChat

Если GigaChat не подходит, есть другие варианты для работы из России:

### Cursor ($20/мес)

Cursor — форк VS Code со встроенным AI. Работает в РФ, оплата через [Wise](https://wise.com) или [Oplatym.ru](https://oplatym.ru). Поддерживает MCP из коробки.

Настройка MCP в Cursor: `Settings` → `MCP` → добавить серверы в том же формате.

### YandexGPT через Yandex AI Studio

Yandex запустил [MCP Hub](https://yandex.cloud/ru/docs/ai-studio/) — можно подключать MCP-серверы напрямую через Yandex Cloud. Настройка через Yandex Cloud Console.

### Ollama (локальные модели)

Полностью офлайн вариант. Без ключей, без оплаты.

```bash
# Установка Ollama
curl -fsSL https://ollama.com/install.sh | sh

# Скачать модель
ollama pull qwen2.5:14b
```

Конфиг Continue.dev для Ollama:

```json
{
  "models": [
    {
      "title": "Qwen 2.5 (локальная)",
      "provider": "ollama",
      "model": "qwen2.5:14b"
    }
  ]
}
```

> Для MCP-инструментов нужна модель с поддержкой tool calling. Рекомендуемые: `qwen2.5:14b`, `mistral-small`, `llama3.1:8b`.

---

## Устранение неполадок

### gpt2giga не запускается

```
ERROR: Could not find a version that satisfies the requirement gpt2giga
```

**Решение:** Убедитесь что Python >= 3.9:
```bash
python --version
pip install --upgrade pip
pip install gpt2giga
```

### Continue.dev не видит MCP-серверы

**Симптом:** В чате нет инструментов, модель отвечает "я не могу подключиться к API".

**Решение:**
1. Проверьте что Node.js >= 18: `node --version`
2. Проверьте что npx работает: `npx -y @theyahia/cbr-mcp` (должен запуститься сервер)
3. Перезапустите Continue.dev: `Ctrl+Shift+P` → `Continue: Reload`
4. Проверьте логи: `Ctrl+Shift+P` → `Continue: View Logs`

### MCP-сервер падает с ошибкой авторизации

```
Error: 401 Unauthorized
```

**Решение:**
- **МойСклад:** Токен генерируется в Настройки → Безопасность → Токены. Формат: `Bearer xxxxxx`
- **СДЭК:** Используйте тестовые ключи для отладки: `client_id: EMscd6r9JnFiQ3bLoyjJY6eM78JrJceI`, `client_secret: PjLZkKBHEiLK3YsjtNrt3TGNG0ahs3kG`
- **cbr:** Авторизация не нужна — если падает, проблема в сети

### GigaChat возвращает ошибки

```
Error: 429 Too Many Requests
```

**Решение:** GigaChat имеет лимиты на бесплатном тарифе. Варианты:
- Подождать 1 минуту и повторить
- Перейти на платный тариф на developers.sber.ru
- Использовать модель `GigaChat` вместо `GigaChat-Pro` (меньше лимиты, но быстрее)

### npx скачивает пакеты при каждом запуске

**Решение:** Установите серверы глобально:
```bash
npm install -g @theyahia/moysklad-mcp @theyahia/cdek-mcp @theyahia/cbr-mcp
```

Затем в конфиге используйте полный путь вместо npx:
```json
{
  "name": "moysklad",
  "command": "moysklad-mcp",
  "args": [],
  "env": {
    "MOYSKLAD_TOKEN": "your-token"
  }
}
```

---

## Полезные ссылки

- [Continue.dev документация](https://docs.continue.dev/)
- [Continue.dev MCP guide](https://docs.continue.dev/customize/tools#mcp-tools)
- [GigaChat API](https://developers.sber.ru/portal/products/gigachat-api)
- [gpt2giga на PyPI](https://pypi.org/project/gpt2giga/)
- [mcp_client_cli_gigachat на PyPI](https://pypi.org/project/mcp-client-cli-gigachat/)
- [@theyahia на npm](https://www.npmjs.com/~theyahia)
