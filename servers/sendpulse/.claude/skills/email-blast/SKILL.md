---
name: email-blast
description: "Отправка email через SendPulse"
argument-hint: <mailing list name or id>
allowed-tools:
  - mcp__sendpulse__get_mailing_lists
  - mcp__sendpulse__send_email
  - mcp__sendpulse__get_campaign_statistics
---

# /email-blast

1. Call get_mailing_lists to find target list
2. Call send_email with content
3. Call get_campaign_statistics to check delivery
