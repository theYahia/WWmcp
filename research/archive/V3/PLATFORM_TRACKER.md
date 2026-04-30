# Трекер публикации MCP-серверов на площадках

Обновлять после каждой подачи. ✅ = подано, ⏳ = ждёт ревью, ❌ = не подано, 🔄 = авто.

**Всего выпущено: 11 MCP** (dadata, cbr, yookassa, tkassa, robokassa, cloudpayments, hh, superjob, huntflow, kontur-focus, chestnyznak)

---

## Tier 1 — Основные каталоги

| MCP | mcp.so | cursor.dir | LobeHub | Official Reg. | Glama | PulseMCP |
|-----|--------|------------|---------|---------------|-------|----------|
| dadata-mcp | ✅ ⏳ | ✅ | ✅ PR#3 | ❌ | 🔄 авто | ❌ ждёт Reg. |
| cbr-mcp | ❌ | ❌ | ✅ PR#4 | ❌ | 🔄 авто | ❌ ждёт Reg. |
| yookassa-mcp | ❌ | ❌ | ✅ PR#5 | ❌ | 🔄 авто | ❌ ждёт Reg. |
| tkassa-mcp | ❌ | ❌ | ✅ PR#6 | ❌ | 🔄 авто | ❌ ждёт Reg. |
| robokassa-mcp | ❌ | ❌ | ✅ PR#6 | ❌ | 🔄 авто | ❌ ждёт Reg. |
| cloudpayments-mcp | ❌ | ❌ | ✅ PR#6 | ❌ | 🔄 авто | ❌ ждёт Reg. |
| hh-mcp | ❌ | ❌ | ✅ PR#6 | ❌ | 🔄 авто | ❌ ждёт Reg. |
| superjob-mcp | ❌ | ❌ | ✅ PR#6 | ❌ | 🔄 авто | ❌ ждёт Reg. |
| huntflow-mcp | ❌ | ❌ | ✅ PR#6 | ❌ | 🔄 авто | ❌ ждёт Reg. |
| kontur-focus-mcp | ❌ | ❌ | ✅ PR#6 | ❌ | 🔄 авто | ❌ ждёт Reg. |
| chestnyznak-mcp | ❌ | ❌ | ✅ PR#6 | ❌ | 🔄 авто | ❌ ждёт Reg. |

**Итого Tier 1:** LobeHub ✅ все 11 | mcp.so ✅ 1 из 11 | cursor.dir ✅ 1 из 11 | Official Reg. ❌ 0

## Tier 2 — Каталоги с формами и issues

| MCP | mcpservers.org | mcpmarket.com | mcp.directory | cline/mcp-marketplace | mcpserver.dir |
|-----|----------------|---------------|---------------|-----------------------|---------------|
| dadata-mcp | ❌ | ❌ | ❌ | ✅ #1118 | ❌ |
| cbr-mcp | ❌ | ❌ | ❌ | ✅ #1119 | ❌ |
| yookassa-mcp | ❌ | ❌ | ❌ | ✅ #1121 | ❌ |
| tkassa-mcp | ❌ | ❌ | ❌ | ✅ #1123 | ❌ |
| robokassa-mcp | ❌ | ❌ | ❌ | ✅ #1124 | ❌ |
| cloudpayments-mcp | ❌ | ❌ | ❌ | ✅ #1125 | ❌ |
| hh-mcp | ❌ | ❌ | ❌ | ✅ #1126 | ❌ |
| superjob-mcp | ❌ | ❌ | ❌ | ✅ #1127 | ❌ |
| huntflow-mcp | ❌ | ❌ | ❌ | ✅ #1128 | ❌ |
| kontur-focus-mcp | ❌ | ❌ | ❌ | ✅ #1129 | ❌ |
| chestnyznak-mcp | ❌ | ❌ | ❌ | ✅ #1130 | ❌ |

**Итого Tier 2:** cline ✅ все 11 | остальные ❌ (руками, по 2 мин)

## Tier 3 — IDE и платформы

| MCP | VS Code | n8n | Claude Plugins | Docker MCP |
|-----|---------|-----|----------------|------------|
| *(все 11)* | 🔄 авто через npm | 🔄 авто через npm | ❌ | ❌ |

---

## Сводка по площадкам

| Площадка | Подано | Из 11 | Автоматизация |
|----------|-------|-------|---------------|
| **LobeHub** | 11 | 100% | ✅ Claude Code делает PR |
| **cline/mcp-marketplace** | 11 | 100% | ✅ Claude Code делает Issue |
| **Glama.ai** | 11 | 100% | 🔄 Авто из npm |
| **VS Code** | 11 | 100% | 🔄 Авто из npm |
| **n8n** | 11 | 100% | 🔄 Авто из npm |
| **mcp.so** | 1 | 9% | ❌ Руками |
| **cursor.directory** | 1 | 9% | ❌ Руками (scan repo) |
| **mcpservers.org** | 0 | 0% | ❌ Руками |
| **mcpmarket.com** | 0 | 0% | ❌ Руками |
| **mcp.directory** | 0 | 0% | ❌ Руками (или gh issue) |
| **mcpserver.directory** | 0 | 0% | ❌ Руками |
| **Official MCP Registry** | 0 | 0% | ✅ CLI (mcp-publisher) |
| **PulseMCP** | 0 | 0% | 🔄 Авто из Official Reg. |
| **Claude Plugins** | 0 | 0% | ❌ Руками + ревью |
| **Docker MCP** | 0 | 0% | ❌ Нужен Docker образ |

**Автоматические (5):** LobeHub, cline, Glama, VS Code, n8n — ✅ все 11 подано
**Руками нужно (7):** mcp.so, cursor.dir, mcpservers.org, mcpmarket.com, mcp.directory, mcpserver.dir, Claude Plugins
**Инфраструктура (2):** Official Registry (нужен mcp-publisher), Docker (нужен Dockerfile)

---

*Пропущены: Windsurf, Continue Hub, MCPHub.ai, OpenTools — нет публичного процесса подачи.*
