# VERIFICATION — живые проверки предположений об API

Имена методов и параметры проверены по официальным клиентам Voximplant
(`voximplant/apiclient-nodejs`, `-go`). Здесь — то, что стоит подтвердить на **живом**
аккаунте, потому что зависит от рантайма/тарифа или не выводится из типов однозначно.
Пункты, помеченные `VERIFY:`, продублированы комментариями в коде рядом с местом.

Подставьте `ACCOUNT_ID` и `API_KEY` и выполните curl. База: `https://api.voximplant.com/platform_api`.

---

### 1. `get_account_info` — секреты не утекают `VERIFY:`

`GetAccountInfo` по докам Go/Node SDK возвращает `api_key` (и `callback_salt`). Убедитесь,
что сырой ответ их содержит, а наш витлист (`src/lib/shape.ts → SAFE_ACCOUNT_FIELDS`) — нет.

```bash
curl -s "https://api.voximplant.com/platform_api/GetAccountInfo?account_id=ACCOUNT_ID&api_key=API_KEY&return_live_balance=true" | grep -o '"api_key"' && echo "RAW содержит api_key (ожидаемо) — витлист обязан его срезать"
```

Если в сыром ответе поля `api_key`/`callback_salt` НЕТ — отлично, но витлист всё равно нужен как защита. Если появятся новые секретные поля — добавьте их в исключения витлиста.

### 2. `get_sms_history` — регистр метода `VERIFY:`

Корректное имя — `GetSmsHistory` (НЕ `GetSMSHistory`). Проверьте, что all-caps реально даёт ошибку:

```bash
curl -s "https://api.voximplant.com/platform_api/GetSMSHistory?account_id=ACCOUNT_ID&api_key=API_KEY&from_date=2025-01-01%2000:00:00&to_date=2025-01-02%2000:00:00" | head -c 300   # ожидается ошибка
curl -s "https://api.voximplant.com/platform_api/GetSmsHistory?account_id=ACCOUNT_ID&api_key=API_KEY&from_date=2025-01-01%2000:00:00&to_date=2025-01-02%2000:00:00" | head -c 300   # ожидается результат
```

### 3. `get_acd_state` — параметр очереди `VERIFY:`

Заменяет несуществующий `GetActiveSessions`. Параметр — `acd_queue_id` (число / список через запятую / `any`).

```bash
curl -s "https://api.voximplant.com/platform_api/GetACDState?account_id=ACCOUNT_ID&api_key=API_KEY&acd_queue_id=any" | head -c 400
```

### 4. `start_call` — соглашение по customData `VERIFY:`

У `StartScenarios` НЕТ параметра `destination`. Мы кладём `{"destination":"...","caller_id":"..."}`
в `script_custom_data`. Сценарий VoxEngine обязан прочитать его и позвонить:

```javascript
// внутри сценария VoxEngine:
const data = JSON.parse(VoxEngine.customData() || "{}");
const call = VoxEngine.callPSTN(data.destination, data.caller_id);
```

Проверьте, что ваш сценарий парсит именно этот JSON (или передайте `script_custom_data` целиком в своём формате).

### 5. `send_a2p_sms` — разделитель списка получателей `VERIFY:`

`A2PSendSms.dst_numbers` принимает список номеров. Мы сериализуем массив через `;`
(`src/tools/a2p.ts`). Если API ожидает другой разделитель (`,`) — поправьте `join(";")`.
⚠️ Это **платная отправка** — тестируйте на одном своём номере.

```bash
curl -s -X POST "https://api.voximplant.com/platform_api/A2PSendSms" \
  -d "account_id=ACCOUNT_ID" -d "api_key=API_KEY" \
  -d "src_number=SENDER" -d "dst_numbers=+79001234567" -d "text=test" | head -c 400
```

### 6. `update_scenario` — POST с крупным скриптом

Убедитесь, что большой скрипт проходит (раньше GET-query ломался на лимите URL):

```bash
curl -s -X POST "https://api.voximplant.com/platform_api/SetScenarioInfo" \
  -d "account_id=ACCOUNT_ID" -d "api_key=API_KEY" \
  -d "scenario_id=SCENARIO_ID" --data-urlencode "script=$(printf 'x%.0s' {1..6000})" | head -c 300
```
