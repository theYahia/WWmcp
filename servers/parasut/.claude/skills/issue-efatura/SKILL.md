---
name: issue-efatura
description: Officialize a Parasut sales invoice as an e-Fatura or e-Arşiv
allowed-tools:
  - mcp__parasut__create_sales_invoice
  - mcp__parasut__issue_e_document
  - mcp__parasut__get_trackable_job
---
You need an existing sales invoice and the recipient's tax number (VKN/TCKN).
1. If the invoice does not exist yet, create it first with `create_sales_invoice`.
2. Call `issue_e_document` with the sales_invoice_id and recipient_vkn. It automatically:
   - looks up the recipient's e-Fatura inbox by VKN,
   - issues an **e-Fatura** if they are registered, or an **e-Arşiv** if not,
   - waits for the async job and returns its status.
3. If the job status is not yet `done`/`error`, call `get_trackable_job` with the returned job id to poll again.
4. Report back: which document type was issued (e-Fatura vs e-Arşiv) and the final job status.
