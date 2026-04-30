---
name: Multi-Project Tracking Best Practices
description: Research into workflow, tools, and patterns for tracking 8+ projects simultaneously with unified big-picture view
tier: heavy
date: 2026-04-27
---

# Multi-Project Tracking: Brief

## Problem

Managing 8+ projects in parallel (OpenClaw, QvacSnowBall, NutriAI, MamaSupport, Steam, EdTech, mcp-servers, CexStableBots). Current workflow: Obsidian Board.md (Kanban by week) + VSCode Claude Code. 

**Pain points:**
- Board.md shows only current iteration (1 week), not overall project health
- No unified "big picture" dashboard — must jump between repos
- Hard to see: which projects are blocked, which are live, which need attention
- No public/semi-public roadmap to share progress

## Decision Being Made

1. **Workflow**: How to organize Obsidian + VSCode for tracking 5-10 projects + context switching
2. **Dashboard site**: What tech stack / template to use for live roadmap (public eventually)

## Killer Questions

1. What do indie hackers / solo devs with multiple projects use? (Kanban, timeline, badges?)
2. What's the single best "project health" signal to track? (commits/week, open PRs, milestones?)
3. Do people use Obsidian Publish / Quartz / custom builds for this, or separate tool?
4. Can we auto-sync Board.md + GitHub data into a unified dashboard?
5. What's the simplest viable roadmap site design (like efrogs)?

## What I Already Know

- Obsidian Board.md works well for weekly planning (Kanban: Inbox → Работе → Готово)
- Obsidian Publish exists but is hosted on Obsidian servers (may be privacy concern)
- GitHub README badges exist (passing/failing tests, activity)
- "Roadmap" usually means timeline + milestone view for public consumption
- Open-source projects (kubernetes, deno, etc.) use GitHub Projects + custom dashboards

## Prior Beliefs (to test)

- Solo devs don't need complex tools — simple aggregation of README badges + git activity is enough
- Best practice is "mirror projects locally in Obsidian, pull git data via API"
- Quartz (Obsidian → static HTML) could work for roadmap site

## Research Scope & Budget

**Scope:** indie hacker workflows, minimal open-source roadmap tools, Obsidian tooling, GitHub API integration patterns

**Budget:** 1-2 hours (Brave sweep + synthesis, no deep implementation)

**Output:** 
- Recommended workflow architecture (Obsidian + VSCode + CI/CD integration)
- Recommended site stack (e.g., "Astro + GitHub API + Obsidian data")
- Examples / case studies (efrogs, other founders, open-source projects)
- Decision: build vs. use existing tool

## Sources Strategy

Primary: indie hackers (indiehackers.com, twitter threads), open-source founders (GitHub repos), Obsidian community

Secondary: HN discussions, Product Hunt launches

Tertiary: Documentation (GitHub API, Obsidian plugins)

---

**Next**: Brave sweep (7 queries) → parse snippets → WebFetch top 5-7 → synthesis
