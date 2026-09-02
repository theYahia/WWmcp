# scripts/

## catalog.mjs — источник правды о числах

Считает серверы, версии и tools. Числа берутся **живьём**: каждый сервер поднимается через
stdio и отвечает на `listTools()` (`runSmokeTest` из `@theyahia/mcp-core/testing/smoke`).

Статический подсчёт по грепу врёт и использоваться не должен:

| Сервер | Почему греп ошибается |
|---|---|
| `wildberries` | регистрация в цикле `for (const [name, def] of Object.entries(toolDefinitions))` — греп даёт 3 при реальных 30 |
| `huntflow` | свои обёртки `registerStructured` / `registerText` |
| `retailcrm` | набор зависит от `isReadonly()` |
| `aprovodka` | набор зависит от `ONEC_SERVICES` и `ONEC_WRITE_MODE` |

### Запуск

```bash
pnpm build                              # обязательно: скрипт читает servers/*/dist/index.js
node scripts/catalog.mjs                # перегенерировать scripts/catalog.json
node scripts/catalog.mjs --check        # только проверить, exit 1 при дрейфе (для CI)
node scripts/catalog.mjs --write-readme # + вписать числа в README.md / README.ru.md / docs/index.html
```

Серверы пишут свои логи в stderr — для чистого вывода добавь `2>/dev/null`.

### Что считается дрейфом (→ exit 1 при `--check`)

1. `TOOL_COUNT` в коде ≠ то, что вернул `listTools()`;
2. сервер не поднялся;
3. числа в `README.md` / `README.ru.md` / `docs/index.html` разошлись с живыми;
4. `scripts/catalog.json` устарел.

### `--write-readme` правит только свои строки

По умолчанию **выключен**. В каталоге README 114 строк, из которых ~68 — standalone-репо,
которых в монорепе нет; слепая перезапись их удалит. Скрипт трогает строку, только если
пакет из неё реально существует в `servers/`, и меняет в ней лишь версию и число tools —
описания остаются рукописными. Без флага изменения печатаются диффом и никуда не пишутся.

### Env

Креды подставляются заглушками, имена вытаскиваются из `process.env.X` в исходниках
сервера — руками карту вести не надо. Переменные, меняющие **поведение** (`*_READONLY`,
`ONEC_SERVICES`, `ONEC_WRITE_MODE`, `*_SANDBOX`, `PORT`, `MCP_*` и т.п.), намеренно
не выставляются: каталог отражает конфигурацию по умолчанию. `aprovodka` и `retailcrm`
помечаются в выводе как «при настройках по умолчанию».

### catalog.json

Читай его, а не считай заново. Формат:

```jsonc
{
  "generatedAt": "...",
  "servers": 46, "serversConnected": 46, "totalTools": 501,
  "entries": [{
    "dir": "wildberries", "name": "@theyahia/wildberries-mcp", "version": "3.1.0",
    "description": "...", "connected": true, "toolCount": 30, "tools": ["..."],
    "declaredToolCount": 30,      // null, если TOOL_COUNT не объявлен числом
    "envDependent": false,
    "shortDescriptions": [],      // тулы с описанием < 20 символов
    "error": null
  }]
}
```
