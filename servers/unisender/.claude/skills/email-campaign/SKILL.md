---
name: email-campaign
description: "Создание и отправка email-рассылки через UniSender"
argument-hint: <list_id or list name>
allowed-tools:
  - Bash
  - Read
---

# /email-campaign

1. Call get_lists to find target list
2. Call create_email with subject and body
3. Call send_email to the list
4. Report delivery status
