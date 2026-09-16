---
name: recurrent-payment
description: Подписки T-Kassa — привязка карты покупателя и автосписание по RebillId
argument-hint: "<customer_key> [сумма]"
---

# /recurrent-payment — Автоплатежи и карты

## Алгоритм — первичная привязка карты

1. `add_customer` (customer_key — ваш уникальный ID покупателя, email, phone) — зарегистрируй покупателя.
2. `init_payment` (amount в рублях, order_id, description, customer_key, recurrent: "Y", success_url, fail_url, notification_url) — первый платёж **обязан** идти с признаком recurrent, иначе карта не привяжется и автосписаний не будет.
3. Отдай покупателю PaymentURL из ответа, дождись оплаты, проверь `get_payment_state` (payment_id).
4. RebillId приходит в уведомлении на notification_url. Это ключ карты для последующих списаний — сохрани его на своей стороне.

## Алгоритм — списание по подписке

1. `get_card_list` (customer_key) — привязанные карты покупателя, маскированные номера и CardId.
2. `charge_payment` (payment_id — исходный платёж с recurrent, rebill_id — карта, amount) — автосписание. Форма оплаты покупателю не показывается.
3. `get_payment_state` (payment_id) — подтверди успех, не считай платёж прошедшим по факту вызова.
4. Чек по факту оказания услуги — `send_closing_receipt` (payment_id, email, phone, taxation, items).

## Отвязка и удаление

- `remove_card` (customer_key, card_id) — снять одну карту, CardId берётся из `get_card_list`.
- `remove_customer` (customer_key) — удалить покупателя **вместе со всеми его картами**. Действие необратимое, подтверждай отдельно.
- Проверить, заведён ли покупатель, — `get_customer` (customer_key).

## Важно

- Списание без согласия держателя карты — прямой путь к чарджбэку. Автосписание запускать только по правилу, которое пользователь подтвердил (сумма, периодичность, за что).
- Забыли recurrent: "Y" в первом платеже — RebillId не появится; лечится только новым первичным платежом, задним числом карту не привязать.
- customer_key — ваш идентификатор, а не выданный банком; он же связывает карты с покупателем.

## Формат ответа

```
## Автоплатёж T-Kassa

**Покупатель**: cust-1042 (ivan@mail.ru)
**Карты**: 430000******0777 (CardId 55120)
**Списание**: 1 490 ₽ по RebillId 9912834
**Статус**: CONFIRMED

Чек отправлен на ivan@mail.ru.
```

## Примеры

```
/recurrent-payment cust-1042
/recurrent-payment cust-1042 1490
/recurrent-payment покажи карты cust-1042
```
