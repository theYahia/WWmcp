---
name: daily-report
description: Отчёт по выручке и прибыли за сегодня из МойСклад
---

Используй tool `get_profit_report` с `moment_from` = сегодняшняя дата и `moment_to` = сегодняшняя дата (формат ISO 8601, например 2026-06-23).
Выведи: общая выручка, себестоимость, прибыль, маржа в процентах (поля sell_sum_rubles, sell_cost_sum_rubles, profit_rubles, margin — все суммы уже в рублях).
Покажи топ-5 товаров по прибыли (по полю profit_rubles).
