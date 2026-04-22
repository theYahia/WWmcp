# Deep Research: AI Skills Strategy for MCP Server Ecosystem

## CONTEXT

We have 47 MCP servers for Russian/CIS APIs (npm org: @theyahia), upgrading to production-grade. Each server exposes tools (create_payment, search_vacancies, etc.) that AI agents can call.

**Skills** are the next layer — pre-built prompts/workflows/scenarios that USE the tools. Think of it as: tools = raw capabilities, skills = ready-to-use solutions.

We need to understand:
1. What IS a skill in the MCP/AI agent ecosystem?
2. What skill formats exist (Claude Code skills, Cursor rules, Dify workflows, n8n templates)?
3. How do the best MCP servers package skills alongside tools?
4. What skill architecture should we adopt for 47+ servers across 11 categories?

## RESEARCH TASK

### Part 1: Skill Formats & Standards

Research ALL existing skill/workflow/prompt formats in the AI agent ecosystem:

**Claude Code Skills:**
- How does Claude Code define skills? (slash commands, .claude/ directory)
- What's the format? (markdown? yaml? json?)
- How are they installed? (npx skillsbd add?)
- What's neuraldeep.ru's skill format?
- Examples of well-made Claude Code skills on GitHub

**MCP Prompts (built-in):**
- MCP protocol supports "prompts" alongside "tools" and "resources"
- How do existing MCP servers define prompts?
- What's the schema? (name, description, arguments, messages)
- Best examples of MCP servers with good prompts

**Cursor Rules / .cursorrules:**
- Format and structure
- How can MCP-related rules be packaged?
- Examples

**Dify Workflows:**
- How Dify defines multi-step workflows using tools
- Can we export workflows as templates?
- DSL format

**n8n Templates:**
- n8n workflow templates that use MCP nodes
- JSON format
- Community sharing

**LangChain/CrewAI:**
- Agent definitions with tool assignments
- Task/crew templates
- YAML configs

**Other formats:**
- OpenAI GPTs (custom instructions)
- Anthropic tool_use prompt patterns
- Any "skill marketplace" or "prompt marketplace" that packages MCP tool usage

### Part 2: What Makes a GREAT Skill

Analyze the best-performing skills/workflows in the ecosystem:

- What's the ideal complexity? (single-tool vs multi-tool vs multi-server)
- How specific should descriptions be? (vague "manage orders" vs specific "create Wildberries order with CDEK delivery")
- Should skills include example inputs/outputs?
- How do skills handle errors and edge cases?
- Should skills be composable (skill A calls skill B)?
- What metadata do skills need? (category, tags, required servers, required env vars)

### Part 3: Skill Categories That Sell

Research which types of skills/automations are most demanded:

**By business process:**
- E-commerce operations (order → payment → delivery → tracking)
- Marketing automation (campaign → analytics → report)
- HR pipeline (search → screen → schedule → hire)
- Financial operations (invoice → payment → reconciliation → report)
- Customer service (ticket → lookup → resolve → follow-up)

**By user persona:**
- Solo entrepreneur ("run my Ozon store with AI")
- Marketing manager ("weekly analytics report")
- Developer ("deploy, monitor, debug")
- Accountant ("reconcile payments, generate reports")
- HR manager ("find candidates, schedule interviews")

**By value proposition:**
- Time-saving (automate 2-hour task into 30 seconds)
- Error-reducing (validate data before sending)
- Insight-generating (combine data from multiple sources)
- Decision-supporting (analyze options, recommend action)

### Part 4: Competitive Analysis

What skills/workflows do these platforms offer?

- **Composio**: how do they package multi-tool workflows?
- **Zapier AI Actions**: what are their most popular automations?
- **n8n**: top templates by category
- **Make (Integromat)**: most-used scenarios
- **Dify**: marketplace workflows
- **neuraldeep.ru**: what skills are listed? format? installation?
- **Any Russian-language AI skill/automation platforms**

### Part 5: Architecture Recommendation

Based on all research, recommend:

1. **Primary skill format** — which format to adopt as our standard?
2. **Skill taxonomy** — how to categorize and organize skills
3. **Packaging** — how skills ship with MCP servers (embedded vs separate)
4. **Distribution** — where and how to publish skills
5. **Monetization** — free skills vs premium skills
6. **Multi-server skills** — how to define skills that span multiple MCP servers

## OUR 47 SERVERS (grouped by category)

For context, here are our servers that need skills:

**Payments (4):** yookassa, tkassa, robokassa, cloudpayments
**Data (4):** dadata, kontur-focus, cbr, chestnyznak
**CRM (8):** amocrm, bitrix24, moysklad, retailcrm, megaplan, planfix, kaiten, elma365
**Logistics (4):** cdek, boxberry, delovye-linii, pochta-russia
**Marketing (8):** yandex-metrika, yandex-direct, yandex-webmaster, unisender, sendpulse, roistat, calltouch, mindbox
**HR (3):** hh, superjob, huntflow
**Comms (7):** vk, jivosite, mts-exolve, mango-office, voximplant, sms-ru, tilda
**AI/ML (4):** gigachat, yandexgpt, salutespeech, yandex-speechkit
**Finance (2):** sber, 1c-rest
**Other (2):** travelpayouts, getcourse
**CIS (1):** kaspi

## OUTPUT FORMAT

### Section 1: Skill Format Comparison
Table comparing all formats: Claude Code, MCP Prompts, Cursor, Dify, n8n, LangChain

### Section 2: Recommended Skill Architecture
- Standard format with schema
- File structure
- Metadata fields
- Example skill definition

### Section 3: Skill Catalog Plan
For EACH of our 11 server categories:
- 3-5 single-server skills (with exact descriptions)
- 2-3 multi-server skills (cross-category combos)
- Target persona for each skill

### Section 4: TOP-20 Killer Skills
The 20 most valuable skills we can build, ranked by:
- User demand (how many people need this?)
- Wow factor (does it demonstrate AI power?)
- Revenue potential (would someone pay for this?)
- Technical feasibility (can we build it now?)

### Section 5: Implementation Roadmap
- Phase 1: Skills for Wave 0 servers (the 10 we're upgrading now)
- Phase 2: Skills for Wave 1 CIS servers
- Phase 3: Cross-server killer combos
- Estimated effort per skill

## CRITICAL INSTRUCTIONS

1. Actually research neuraldeep.ru skill format — it's a real platform listing our servers
2. Check GitHub for "claude code skills" and "mcp prompts" examples
3. Look at Composio's workflow templates specifically
4. The Russian market context matters — skills should address Russian business processes (1C accounting, CDEK delivery, 54-FZ receipts, etc.)
5. Multi-server skills (e.g., МойСклад + СДЭК + YooKassa) are our UNIQUE competitive advantage — nobody else has CIS-integrated multi-service workflows
6. Be specific — don't say "order management skill", say exactly what the skill does step by step
7. Include actual prompt text for the top 10 skills
