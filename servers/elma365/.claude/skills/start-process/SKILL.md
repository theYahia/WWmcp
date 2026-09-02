---
name: skill-start-process
description: "Запусти бизнес-процесс — запуск процесса ELMA365 по коду"
argument-hint: <код_процесса> [параметры]
allowed-tools:
  - Bash
  - Read
---

# /skill-start-process — Запусти бизнес-процесс

Запускает бизнес-процесс в ELMA365 по его коду с опциональными параметрами контекста.

## Алгоритм

1. Получи код процесса от пользователя
2. Если нужно — запроси входные параметры
3. Вызови `start_process` с кодом и контекстом
4. Покажи результат запуска

## Формат ответа

```
## Процесс запущен

- Код: approval_flow
- ID экземпляра: abc-123-def
- Статус: Запущен
- Контекст: { "amount": 50000 }
```

## Примеры

```
/skill-start-process approval_flow
/skill-start-process onboarding {"employee": "Иванов"}
```
