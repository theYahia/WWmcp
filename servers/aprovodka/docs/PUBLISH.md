# Публикация aprovodka — runbook

Один файл на весь выпуск. Всё, что автоматизируемо, уже сделано в репозитории;
здесь только шаги, требующие входа в аккаунт или решения человека.

**Состояние на 2026-08-04.** `@theyahia/aprovodka` на npm отдаёт **404** — пакет
никогда не публиковался. В MCP Registry живёт только старое имя
`io.github.theYahia/1c-rest-mcp` (версии 1.0.1 и 1.2.1, обе `active`). Карточки
Smithery нет ни под старым, ни под новым слугом.

---

## 0. Почему 404 держался так долго

Не из-за 2FA. Причина была структурной, и её сняли в этой ветке:

- на `main` пакет был **запрещён к публикации** с 23.06 (PR #51): `private: true`
  в манифесте + `ignore: ["@theyahia/1c-rest-mcp"]` в `.changeset/config.json`;
- посылка PR #51 («canonical home — отдельный репозиторий, он и публикует») не
  выполнялась: в `theYahia/aprovodka` лежит код **v3.2.0 под старым именем**, а
  релизного workflow там нет вообще, только `ci.yml`;
- вся работа по aprovodka сидела на ветке `feat/wildberries-multi-host` вперемешку
  с чужими коммитами, а блиц 04.08 вообще не был закоммичен.

**Решение:** публикуем из монорепо — там новейший код, тесты и релизный CI.
`theYahia/aprovodka` остаётся витриной (8★ и редирект со старого URL сохранены).

---

## 1. Проверено автоматикой — повторять не нужно

| Что | Результат |
|---|---|
| `workspace:*` резолвится при упаковке | ✅ в манифесте тарбола `"@theyahia/mcp-core": "1.1.0"`, а не `workspace:*` |
| Тарбол ставится с нуля | ✅ `npm i` из `.tgz` → 95 пакетов, `mcp-core@1.1.0` тянется с npm |
| Установленный пакет стартует | ✅ `/health` → `{"server":"aprovodka","version":"4.1.0","tools":34}` |
| `private: true` в манифесте | ✅ отсутствует |
| `.changeset/config.json` | ✅ `ignore` пуст, мёртвого `@theyahia/1c-rest-mcp` нет |
| MCPB-бандл | ✅ `mcpb/aprovodka-4.1.0.mcpb`, 3.3 МБ, манифест проходит схему, 34 инструмента |
| Сервер из распакованного бандла | ✅ стартует, отдаёт 34 инструмента |

Пересобрать бандл после правок кода: `pnpm build && node scripts/build-mcpb.mjs`.

---

## 2. npm — публикация

`.changeset/` намеренно пуст, поэтому `changesets/action` на `main` **не** будет
открывать промежуточный Version-Packages PR, а сразу выполнит `pnpm release`
(= `turbo build && changeset publish`). `changeset publish` публикует любой пакет,
чьей локальной версии нет в реестре, — то есть `aprovodka@4.1.0`.

**Основной путь — просто смержить PR в `main`.** OTP не требуется: CI
аутентифицируется секретом `NPM_TOKEN`.

⚠️ Валидность `NPM_TOKEN` снаружи проверить нельзя. Если Actions упадёт на
`npm publish`, есть ручной путь:

```bash
cd D:/Yahia/active/wwmcps/WWmcp/servers/aprovodka
# именно pnpm: npm publish НЕ понимает workspace: и опубликует битый манифест
pnpm publish --access public --no-git-checks --otp=NNNNNN
```

`--no-git-checks` обязателен: pnpm по умолчанию отказывается публиковать из
грязного дерева и не с ветки `main`.

Проверка:

```bash
npm view @theyahia/aprovodka version              # → 4.1.0
npm view @theyahia/aprovodka dependencies         # → @theyahia/mcp-core: 1.1.0
```

### Увести старое имя

```bash
npm deprecate @theyahia/1c-rest-mcp "Renamed to @theyahia/aprovodka. Install @theyahia/aprovodka instead."
```

Unpublish недоступен спустя 72 ч, поэтому старое имя останется на npm навсегда —
задача только в том, чтобы оно указывало на новое. Alias-шима сознательно нет:
он не дал бы ничего сверх указателя, зато потребовал бы вечной поддержки.
Цена вопроса мала: у старого пакета 563 загрузки/мес, названных пользователей нет.

---

## 3. MCP Registry

Требует npm-публикации из шага 2 (реестр проверяет наличие пакета).

```bash
mcp-publisher login github
mcp-publisher publish                     # читает server.json
curl -s "https://registry.modelcontextprotocol.io/v0/servers?search=aprovodka"
```

Только **после** того, как новая запись подтвердилась поиском, снимаем старую.
Жёсткого DELETE у реестра нет (501), имя записи неизменяемо — рабочий путь через
смену статуса, и он требует лишь доступа `publish/edit`, admin не нужен:

```bash
mcp-publisher status --status deprecated --all-versions -y io.github.theYahia/1c-rest-mcp
# убедиться, что новая запись отдаётся поиском, и только тогда:
mcp-publisher status --status deleted    --all-versions -y io.github.theYahia/1c-rest-mcp
```

---

## 4. Smithery

Карточки нет ни под одним слугом → это **первичная публикация**, а не обновление.
`smithery.yaml` со `startCommand` платформой больше не читается: для stdio-сервера
остался единственный путь — MCPB-бандл.

```bash
smithery auth login                       # OAuth в браузере
smithery auth whoami
smithery namespace list                   # проверить, нет ли unlisted-карточки со старым слугом
smithery namespace create theyahia        # если namespace ещё нет (Hobby-free = до 3)
smithery mcp publish ./mcpb/aprovodka-4.1.0.mcpb -n theyahia/aprovodka
```

Проверка: `curl -s https://registry.smithery.ai/servers/theyahia/aprovodka` → 200.

Если на шаге `namespace list` старая карточка `theyahia/1c-rest-mcp` всё-таки
найдётся — вместо публикации делается перенос
`POST /servers/theyahia/1c-rest-mcp/transfer` с `targetSlug: "aprovodka"`
(`targetOrganizationId` виден только в аккаунте). Редирект со старого слуга нигде
не документирован — считать, что его нет, и обновить ссылки.

---

## 5. Порядок и что от чего зависит

```
мерж PR в main
      ├─► npm publish (CI, автоматически)
      │        ├─► npm deprecate старого имени        (руками, 1 мин)
      │        ├─► MCP Registry publish → снять старую (руками, 15 мин)
      │        └─► Smithery publish бандла             (руками, 15 мин)
      └─► домены aprovodka.ru / .com                   (независимо, ~1 700 ₽)
```

Домены стоит занять **до** того, как имя разойдётся по реестрам. На 04.08
`aprovodka.ru`, `.com`, `.dev` и `апроводка.рф` свободны; `.ru` 199-200 ₽
регистрация / 399-420 ₽ продление, `.com` 1490-1560 / 1790-1810 ₽. Цена `.dev`
у российских регистраторов не подтверждена.

---

## 6. После публикации

- В `theYahia/aprovodka` поправить `package.json` — он до сих пор объявляет себя
  `@theyahia/1c-rest-mcp` v3.2.0. Репозиторий — витрина; код живёт в монорепо.
- Обновить `ROADMAP.md`: пункты «npm publish», «MCP Registry — публикация»,
  «Smithery — публикация» закрываются, дашборд `:4444/#1c` читает их оттуда.
