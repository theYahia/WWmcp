---
name: skill-send-email
description: "Отправка email через SendPulse: рассылка по списку или одиночное SMTP-письмо"
trigger: "Отправь email через SendPulse"
allowed-tools:
  - mcp__sendpulse__get_mailing_lists
  - mcp__sendpulse__send_email
  - mcp__sendpulse__smtp_send_email
  - mcp__sendpulse__get_campaign_statistics
---

# Отправка email через SendPulse

Когда пользователь просит отправить email:

1. Спроси у пользователя (если не указано):
   - Кому (email получателя)
   - Тема письма
   - Текст или HTML-тело
   - Из какого списка рассылки (list_id) — или использовать SMTP для одиночного письма

2. Для массовой рассылки используй инструмент `send_email`:
   - sender_name, sender_email, subject, body, list_id

3. Для одиночного письма используй `smtp_send_email`:
   - to_name, to_email, sender_name, sender_email, subject, body_html

4. После отправки покажи результат и предложи проверить статистику.
