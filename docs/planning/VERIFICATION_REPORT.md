# Verification Report

Generated: 2026-04-01

## Summary
- Total servers: 114
- Published on npm: 113
- GitHub repos: 113
- Build passes: 113
- Has topics: 113
- Failures: 1

## Failures (need attention)

| Server | Issue |
|--------|-------|
| yandex-delivery-mcp | NOT published on npm, NO GitHub repo, build FAILS (no source files in `src/` root — only `src/lib/` and `src/tools/`, missing `src/index.ts`), no topics |

## Version Drift (local < npm — 30 servers)

These servers have a newer version on npm than in the local workspace. This is expected if publishing happens via CI or a separate workflow, but worth noting in case the local code is stale.

| Server | Local | npm |
|--------|-------|-----|
| salutespeech-mcp | 1.0.0 | 1.1.0 |
| yandex-speechkit-mcp | 1.0.0 | 1.1.0 |
| kaspi-mcp | 1.0.0 | 1.0.1 |
| jivosite-mcp | 1.0.1 | 1.1.0 |
| mango-office-mcp | 1.0.1 | 1.1.0 |
| sms-ru-mcp | 1.0.1 | 1.1.0 |
| tilda-mcp | 1.0.0 | 1.1.0 |
| vk-mcp | 1.0.1 | 1.1.0 |
| voximplant-mcp | 1.0.1 | 1.1.0 |
| elma365-mcp | 1.0.0 | 1.1.0 |
| megaplan-mcp | 1.0.0 | 1.1.0 |
| planfix-mcp | 1.0.0 | 1.1.0 |
| cbr-mcp | 1.0.0 | 1.0.1 |
| chestnyznak-mcp | 1.0.0 | 1.1.0 |
| dadata-mcp | 1.0.4 | 1.0.6 |
| 1c-rest-mcp | 1.0.0 | 1.1.0 |
| sber-mcp | 1.0.0 | 1.1.0 |
| huntflow-mcp | 1.0.0 | 1.1.0 |
| superjob-mcp | 1.0.0 | 1.1.0 |
| boxberry-mcp | 1.0.1 | 1.1.0 |
| delovye-linii-mcp | 1.0.1 | 1.1.0 |
| pochta-russia-mcp | 1.0.1 | 1.1.0 |
| calltouch-mcp | 1.0.0 | 1.2.0 |
| mindbox-mcp | 1.0.0 | 1.1.0 |
| roistat-mcp | 1.0.0 | 1.1.0 |
| sendpulse-mcp | 1.0.2 | 1.1.0 |
| unisender-mcp | 1.0.1 | 1.1.0 |
| yandex-webmaster-mcp | 1.0.1 | 1.1.0 |
| getcourse-mcp | 1.0.0 | 1.1.0 |
| robokassa-mcp | 1.0.0 | 1.1.0 |

## Note: Different npm scope

| Server | Package name |
|--------|-------------|
| dadata-mcp | @metarebalance/dadata-mcp (all others use @theyahia/) |

## Full Status

| # | Server | npm | GitHub | Build | Topics |
|---|--------|-----|--------|-------|--------|
| 1 | gigachat-mcp | 3.0.0 = 3.0.0 | OK | OK | YES |
| 2 | salutespeech-mcp | 1.0.0 < 1.1.0 | OK | OK | YES |
| 3 | yandex-cloud-mcp | 1.0.0 = 1.0.0 | OK | OK | YES |
| 4 | yandexgpt-mcp | 3.0.0 = 3.0.0 | OK | OK | YES |
| 5 | yandex-speechkit-mcp | 1.0.0 < 1.1.0 | OK | OK | YES |
| 6 | africas-talking-mcp | 1.0.0 = 1.0.0 | OK | OK | YES |
| 7 | asaas-mcp | 1.0.0 = 1.0.0 | OK | OK | YES |
| 8 | bepaid-mcp | 1.0.0 = 1.0.0 | OK | OK | YES |
| 9 | bog-ipay-mcp | 1.0.0 = 1.0.0 | OK | OK | YES |
| 10 | chargily-mcp | 1.0.0 = 1.0.0 | OK | OK | YES |
| 11 | click-mcp | 1.0.0 = 1.0.0 | OK | OK | YES |
| 12 | correios-mcp | 1.0.0 = 1.0.0 | OK | OK | YES |
| 13 | easypaisa-mcp | 1.0.0 = 1.0.0 | OK | OK | YES |
| 14 | facturapi-mcp | 1.0.0 = 1.0.0 | OK | OK | YES |
| 15 | factura-uz-mcp | 1.0.0 = 1.0.0 | OK | OK | YES |
| 16 | foodics-mcp | 1.1.0 = 1.1.0 | OK | OK | YES |
| 17 | forte-bank-mcp | 1.0.0 = 1.0.0 | OK | OK | YES |
| 18 | getir-mcp | 1.0.0 = 1.0.0 | OK | OK | YES |
| 19 | halyk-epay-mcp | 1.0.0 = 1.0.0 | OK | OK | YES |
| 20 | hepsiburada-mcp | 1.0.0 = 1.0.0 | OK | OK | YES |
| 21 | hotmart-mcp | 1.0.0 = 1.0.0 | OK | OK | YES |
| 22 | idpay-mcp | 1.0.0 = 1.0.0 | OK | OK | YES |
| 23 | ifood-mcp | 1.0.0 = 1.0.0 | OK | OK | YES |
| 24 | ileti-merkezi-mcp | 1.0.0 = 1.0.0 | OK | OK | YES |
| 25 | is-bankasi-mcp | 1.0.0 = 1.0.0 | OK | OK | YES |
| 26 | iyzico-mcp | 1.0.1 = 1.0.1 | OK | OK | YES |
| 27 | jazzcash-mcp | 1.0.0 = 1.0.0 | OK | OK | YES |
| 28 | kaspi-mcp | 1.0.0 < 1.0.1 | OK | OK | YES |
| 29 | kavenegar-mcp | 1.0.0 = 1.0.0 | OK | OK | YES |
| 30 | maib-mcp | 1.0.0 = 1.0.0 | OK | OK | YES |
| 31 | midtrans-mcp | 1.0.1 = 1.0.1 | OK | OK | YES |
| 32 | momo-vn-mcp | 1.0.1 = 1.0.1 | OK | OK | YES |
| 33 | moyasar-mcp | 1.1.0 = 1.1.0 | OK | OK | YES |
| 34 | neshan-maps-mcp | 1.0.0 = 1.0.0 | OK | OK | YES |
| 35 | nfeio-mcp | 1.0.0 = 1.0.0 | OK | OK | YES |
| 36 | nomba-mcp | 1.0.0 = 1.0.0 | OK | OK | YES |
| 37 | pagarme-mcp | 1.0.0 = 1.0.0 | OK | OK | YES |
| 38 | parasut-mcp | 1.0.0 = 1.0.0 | OK | OK | YES |
| 39 | payfast-mcp | 1.0.0 = 1.0.0 | OK | OK | YES |
| 40 | payme-mcp | 1.0.0 = 1.0.0 | OK | OK | YES |
| 41 | paymongo-mcp | 1.0.1 = 1.0.1 | OK | OK | YES |
| 42 | paytabs-mcp | 1.1.0 = 1.1.0 | OK | OK | YES |
| 43 | rajaongkir-mcp | 1.0.1 = 1.0.1 | OK | OK | YES |
| 44 | salla-mcp | 1.1.0 = 1.1.0 | OK | OK | YES |
| 45 | tabby-mcp | 1.1.0 = 1.1.0 | OK | OK | YES |
| 46 | tap-payments-mcp | 1.1.0 = 1.1.0 | OK | OK | YES |
| 47 | tbc-bank-mcp | 1.0.0 = 1.0.0 | OK | OK | YES |
| 48 | termii-mcp | 1.0.0 = 1.0.0 | OK | OK | YES |
| 49 | trendyol-mcp | 1.0.0 = 1.0.0 | OK | OK | YES |
| 50 | unifonic-mcp | 1.1.0 = 1.1.0 | OK | OK | YES |
| 51 | vnpay-mcp | 1.0.1 = 1.0.1 | OK | OK | YES |
| 52 | xendit-mcp | 1.0.1 = 1.0.1 | OK | OK | YES |
| 53 | yoco-mcp | 1.0.0 = 1.0.0 | OK | OK | YES |
| 54 | zalo-oa-mcp | 1.0.1 = 1.0.1 | OK | OK | YES |
| 55 | zarinpal-mcp | 1.0.1 = 1.0.1 | OK | OK | YES |
| 56 | jivosite-mcp | 1.0.1 < 1.1.0 | OK | OK | YES |
| 57 | mango-office-mcp | 1.0.1 < 1.1.0 | OK | OK | YES |
| 58 | mts-exolve-mcp | 3.0.0 = 3.0.0 | OK | OK | YES |
| 59 | sms-ru-mcp | 1.0.1 < 1.1.0 | OK | OK | YES |
| 60 | tilda-mcp | 1.0.0 < 1.1.0 | OK | OK | YES |
| 61 | vk-mcp | 1.0.1 < 1.1.0 | OK | OK | YES |
| 62 | voximplant-mcp | 1.0.1 < 1.1.0 | OK | OK | YES |
| 63 | yandex-360-mcp | 1.0.0 = 1.0.0 | OK | OK | YES |
| 64 | amocrm-mcp | 2.0.1 = 2.0.1 | OK | OK | YES |
| 65 | bitrix24-mcp | 3.0.0 = 3.0.0 | OK | OK | YES |
| 66 | elma365-mcp | 1.0.0 < 1.1.0 | OK | OK | YES |
| 67 | kaiten-mcp | 3.0.0 = 3.0.0 | OK | OK | YES |
| 68 | megaplan-mcp | 1.0.0 < 1.1.0 | OK | OK | YES |
| 69 | moysklad-mcp | 3.0.0 = 3.0.0 | OK | OK | YES |
| 70 | planfix-mcp | 1.0.0 < 1.1.0 | OK | OK | YES |
| 71 | retailcrm-mcp | 2.0.0 = 2.0.0 | OK | OK | YES |
| 72 | yandex-tracker-mcp | 1.0.0 = 1.0.0 | OK | OK | YES |
| 73 | 2gis-mcp | 1.0.0 = 1.0.0 | OK | OK | YES |
| 74 | casebook-mcp | 1.0.0 = 1.0.0 | OK | OK | YES |
| 75 | cbr-mcp | 1.0.0 < 1.0.1 | OK | OK | YES |
| 76 | chestnyznak-mcp | 1.0.0 < 1.1.0 | OK | OK | YES |
| 77 | dadata-mcp | 1.0.4 < 1.0.6 | OK | OK | YES |
| 78 | kontur-focus-mcp | 3.0.0 = 3.0.0 | OK | OK | YES |
| 79 | spark-interfax-mcp | 1.0.0 = 1.0.0 | OK | OK | YES |
| 80 | yandex-maps-mcp | 1.0.0 = 1.0.0 | OK | OK | YES |
| 81 | 1c-rest-mcp | 1.0.0 < 1.1.0 | OK | OK | YES |
| 82 | alfa-bank-mcp | 1.0.0 = 1.0.0 | OK | OK | YES |
| 83 | atol-online-mcp | 1.0.0 = 1.0.0 | OK | OK | YES |
| 84 | kontur-diadoc-mcp | 1.0.0 = 1.0.0 | OK | OK | YES |
| 85 | sber-mcp | 1.0.0 < 1.1.0 | OK | OK | YES |
| 86 | tochka-bank-mcp | 1.0.0 = 1.0.0 | OK | OK | YES |
| 87 | hh-mcp | 2.0.0 = 2.0.0 | OK | OK | YES |
| 88 | huntflow-mcp | 1.0.0 < 1.1.0 | OK | OK | YES |
| 89 | superjob-mcp | 1.0.0 < 1.1.0 | OK | OK | YES |
| 90 | ati-su-mcp | 1.0.0 = 1.0.0 | OK | OK | YES |
| 91 | boxberry-mcp | 1.0.1 < 1.1.0 | OK | OK | YES |
| 92 | cdek-mcp | 2.0.1 = 2.0.1 | OK | OK | YES |
| 93 | delovye-linii-mcp | 1.0.1 < 1.1.0 | OK | OK | YES |
| 94 | pochta-russia-mcp | 1.0.1 < 1.1.0 | OK | OK | YES |
| 95 | yandex-delivery-mcp | NOT PUBLISHED | NO REPO | FAIL | NONE |
| 96 | appmetrica-mcp | 1.0.0 = 1.0.0 | OK | OK | YES |
| 97 | calltouch-mcp | 1.0.0 < 1.2.0 | OK | OK | YES |
| 98 | mindbox-mcp | 1.0.0 < 1.1.0 | OK | OK | YES |
| 99 | roistat-mcp | 1.0.0 < 1.1.0 | OK | OK | YES |
| 100 | sendpulse-mcp | 1.0.2 < 1.1.0 | OK | OK | YES |
| 101 | tgstat-mcp | 1.0.0 = 1.0.0 | OK | OK | YES |
| 102 | unisender-mcp | 1.0.1 < 1.1.0 | OK | OK | YES |
| 103 | vk-ads-mcp | 1.0.0 = 1.0.0 | OK | OK | YES |
| 104 | yandex-direct-mcp | 3.0.0 = 3.0.0 | OK | OK | YES |
| 105 | yandex-metrika-mcp | 2.1.0 = 2.1.0 | OK | OK | YES |
| 106 | yandex-webmaster-mcp | 1.0.1 < 1.1.0 | OK | OK | YES |
| 107 | getcourse-mcp | 1.0.0 < 1.1.0 | OK | OK | YES |
| 108 | travelpayouts-mcp | 2.0.0 = 2.0.0 | OK | OK | YES |
| 109 | cloudpayments-mcp | 2.0.0 = 2.0.0 | OK | OK | YES |
| 110 | prodamus-mcp | 1.0.0 = 1.0.0 | OK | OK | YES |
| 111 | robokassa-mcp | 1.0.0 < 1.1.0 | OK | OK | YES |
| 112 | sberbank-acquiring-mcp | 1.0.0 = 1.0.0 | OK | OK | YES |
| 113 | tkassa-mcp | 2.0.0 = 2.0.0 | OK | OK | YES |
| 114 | yookassa-mcp | 2.0.0 = 2.0.0 | OK | OK | YES |
