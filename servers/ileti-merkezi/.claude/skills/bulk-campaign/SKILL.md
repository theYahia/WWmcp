---
name: bulk-campaign
description: Send a bulk SMS campaign in Turkey — balance check, opt-out filter, İYS consent, delivery report
argument-hint: <recipients> "<message>" [schedule DD/MM/YYYY HH:MM]
---

# /bulk-campaign — Bulk SMS with pre-flight checks

## Algorithm

1. Call `get_balance`. Compare credits to recipient count times segments per message.
   If short, stop and report the shortfall — a partial send is worse than none.
2. Call `get_blacklist` (paginate with `page` / `row_count`) and remove every blacklisted
   number from the recipient array. Sending to opt-outs is a compliance problem in Turkey.
3. Call `get_sender` and pick an approved sender header (başlık).
4. Marketing content requires İYS consent under Law 6563. Spot-check recipients with
   `iys_check` (brand code + `MESAJ` channel) when the list origin is unclear, and register
   collected consents with `iys_register` before sending.
5. Show the user the final count, the message text, the segment count and the credit cost.
   Get explicit confirmation before sending.
6. Call `send_sms` with `to` as the **array** of numbers, `message`, `sender`, and
   `message_type: "commercial"` for marketing (this sets the İYS flag). Optionally
   `schedule_at` (`DD/MM/YYYY HH:MM`) for a timed send — cancel it later with `cancel_order`.
7. Call `get_report` with the `order_id` from the response to read delivery. Poll again later
   for a settled figure — a report taken immediately is incomplete.

## Response format

```
## Bulk SMS campaign

**Recipients**: 1,240 (18 removed as blacklisted)
**Sender**: SIRKETADI
**message_type**: commercial (İYS flag on)
**Segments per message**: 2 (Unicode — Turkish characters)
**Credits used**: 2,480
**Scheduled**: immediate

### Delivery (order_id 99182)
| State | Count |
|-------|-------|
| DELIVERED (111) | 1,201 |
| UNDELIVERED (112) | 22 |
| WAITING (110) | 17 |
```

## Notes

- Bulk and single sends are the same tool: `send_sms` with `to` as an array (up to 50 000).
- Always subtract the blacklist yourself — the API will not do it for you.
- `get_reports` (plural) lists order summaries over a date range of at most 10 days; use it to
  review past campaigns. `get_report` (singular) drills into one order.
- A scheduled order can be pulled back with `cancel_order` until it is dispatched.

## Examples

```
/bulk-campaign customers.txt "Kampanya: %20 indirim"
/bulk-campaign customers.txt "Yeni urunlerimiz yayinda" 05/09/2026 10:00
```
