---
name: Multi-Project Tracking Best Practices — Synthesis
description: Research findings on workflow architecture, tools, and site tech stack for tracking 8+ projects
tier: heavy
date: 2026-04-27
status: synthesis
---

# Multi-Project Tracking: Research Findings & Recommendations

## TL;DR

**For solo founders/indie hackers managing 5-10+ projects:**

1. **Workflow (Obsidian + VSCode):**
   - Use **Obsidian Board.md (Kanban)** for weekly planning + current iteration
   - Add **unified project timeline view** using GitHub API aggregator (GitHub Actions Dashboard / STACKFOLO / custom Astro dashboard)
   - Store project metadata in Obsidian (`projects/` folder) with GitHub links + status
   - Sync via GitHub API + cron job (daily or on-demand)

2. **Public Roadmap Site:**
   - **Best-in-class combo:** Quartz v4 (Obsidian → static site) + GitHub API data (commits/PRs/milestones)
   - **Tech stack:** Astro/Next.js + Tailwind, hosted on Vercel/Netlify
   - **Data sync:** Git push → CI/CD auto-rebuild
   - **Time to MVP:** 2-4 hours (Quartz template + GitHub API integration)

3. **Why this works:**
   - Obsidian Board.md remains source of truth for weekly tasks (existing workflow)
   - GitHub becomes source of truth for project health signals (commits, issues, releases)
   - Quartz auto-publishes marked notes; GitHub API provides live status without manual updates
   - Zero maintenance after setup — CI/CD handles publishing

---

## Research Findings

### 1. How Indie Hackers Track Multiple Projects

**Problem statement:** "Every repo hop breaks your train of thought" (STACKFOLO blog)

**Solutions found in the wild:**

| Tool | Approach | Best for |
|------|----------|----------|
| **STACKFOLO** | Chrome extension aggregating GitHub commits from all repos into unified timeline | Seeing overall activity; catching neglected projects |
| **GitactionBoard** | GitHub Actions dashboard across multiple repos | Monitoring CI/CD health, test failures |
| **Repo Dashboard** | Local GitHub API aggregator; caches results for 5 min | Portfolio view; last-activity signals |
| **Monday.com / Smartsheet** | Traditional PPM dashboards | Team-based tracking (overkill for solo dev) |
| **Notion / Airtable** | Manual database; GitHub integration via Zapier | Documentation hub; not automated |

**Winner for solo devs:** Custom Astro/Next dashboard querying GitHub API directly (30-60 min build)

---

### 2. Obsidian → Public Site Options

**Key finding:** Quartz v4 is the de facto open-source standard.

#### **Quartz v4 (Recommended)**

- **What it does:** Transforms Obsidian vault → static HTML site (build on push via GitHub Actions)
- **Control:** Mark notes with `publish: true` in frontmatter; other notes stay private
- **Tech:** TypeScript + Vite, ~15KB JavaScript per page, SEO-friendly
- **Case study:** Oliver Falvai published 700+ notes using Quartz + Netlify CI/CD in one step
  - Workflow: edit in Obsidian → git push → Netlify rebuild → live 3 min later
  - Cost: free (GitHub + Netlify)
  
- **Setup time:** 1-2 hours (fork repo, customize `quartz.config.ts`, add GitHub CI)
  
#### **Obsidian Publish (Official)**

- **Pros:** Built-in, no GitHub knowledge required
- **Cons:** $8/month per site, hosted on Obsidian servers, closed-source, limited customization
- **Verdict:** Better for non-technical users or sensitive/NDA content

#### **Digital Garden Plugin**

- **Similar to Quartz** but less maintained; fewer examples in wild
- **Verdict:** Skip unless you have a specific reason

**Recommendation:** Use **Quartz for public roadmap**, **Obsidian Publish for private knowledge base** (if desired).

---

### 3. Project Health Signals: What to Display

From GitHub API research, the most useful signals for solo devs are:

```
Per project:
  ├─ Last commit (date)
  ├─ Recent activity (commits in last 7/30 days)
  ├─ Open issues / PRs count
  ├─ Latest release / tag
  └─ Repo health (stars, forks, watchers)

Timeline view:
  └─ Chronological commits across all repos (catches gaps)
```

**Why these matter:**
- "Last commit: 12 days ago" makes it hard to pretend you're still working on something
- Timeline view reveals which projects are collecting dust
- Activity frequency (commits/week) is better signal than lines-of-code for solo dev

---

### 4. Recommended Architecture

```
┌─────────────────────────────────────────────────┐
│        Your Mental Model (per project)          │
├─────────────────────────────────────────────────┤
│  Obsidian Board.md (weekly tasks)               │
│  ↓                                               │
│  GitHub (source of truth for code + history)   │
│  ↓                                               │
│  Public Roadmap Site (Quartz + GitHub API)    │
└─────────────────────────────────────────────────┘

Weekly loop:
  1. Check Board.md in Obsidian → see this week's work
  2. Open roadmap site → see all projects' health at a glance
  3. Jump to GitHub/VSCode to code
  4. Code gets committed, roadmap auto-updates (no manual sync)
```

**Key principle:** Single source of truth per domain:
- **Weekly planning** → Board.md (already working)
- **Code + history** → GitHub (already working)
- **Public narrative** → Roadmap site (new, auto-synced)

---

### 5. Tech Stack Recommendations

#### **Private Dashboard (For You)**

Option A (Simple): Astro + GitHub API
```
Time: 2-4 hours
Files: 
  - pages/dashboard.astro (fetch GitHub API, render cards)
  - styles/ (Tailwind)
Deploy: Vercel (free tier ok for this)
Update: Manual trigger or cron job to rebuild
```

Option B (Very Simple): Browser extension like STACKFOLO
```
Time: 0 hours (existing tool)
Cost: Free
Update: Real-time
Limitation: only shows commits, not PRs/issues
```

**Pick Option A if:** You want to see full GitHub data (issues, PRs, releases)  
**Pick Option B if:** You just want to see activity + are happy with Chrome

#### **Public Roadmap Site (To Share)**

**Stack:** Quartz v4 + GitHub API integration

```
Frontend:
  - Quartz v4 (TypeScript + Vite)
  - Tailwind CSS (default in Quartz v4)
  - Custom component for GitHub data (commits, releases, badges)

Backend:
  - GitHub API (no backend needed; fetch client-side or via build step)
  - Obsidian vault as content source

Hosting:
  - Vercel (preferred) or Netlify (free tier)
  - CI/CD: GitHub Actions auto-rebuilds on push

Build flow:
  1. Edit notes in Obsidian
  2. Mark as publish: true
  3. Git push
  4. GitHub Actions runs "npx quartz build"
  5. Output → Vercel
  6. Live 2-3 minutes later
```

**Cost:** $0 (Quartz = free, Vercel = free tier ok, GitHub API = free tier ok for 8 projects)

**Time to MVP:** 3-4 hours
- 1h: Fork Quartz, add custom component for GitHub data
- 1h: Create pages/projects template in Obsidian
- 1h: Set up GitHub Actions CI
- 1h: Deploy to Vercel, test

---

### 6. What I Didn't Find (Disconfirming Search)

**Searched for but NOT found in the wild:**
- Founders using a *single* tool for both private planning + public roadmap (they use 2-3 tools)
- Automatic sync of Obsidian Board.md columns (Inbox/Работе/Готово) to public site without code
- "Roadmap as a service" that indie hackers prefer (most build custom or use README badges)

**Implication:** No magic off-the-shelf tool exists; you'll need 30-60 min of integration work.

---

### 7. Best Practices from Indie Hackers

From DEV.to + Indie Hackers threads:

1. **Principle: "Visibility breeds accountability"**
   - Public roadmap forces you to commit to milestones
   - Showing "last commit: 10 days ago" publicly motivates finishing projects

2. **Principle: "Show work, not polish"**
   - Simple timeline is better than a fancy Gantt chart
   - Commits are better than manually-updated "% complete"

3. **Principle: "Let tools fight their own battles"**
   - GitHub for code/history, Obsidian for notes, roadmap for narrative
   - Don't try to unify everything — accept minimal glue code

4. **Principle: "Ship the tool first, then perfect it"**
   - Build MVP dashboard in 3h, then iterate based on what you actually use

---

## Action Plan

### Immediate (This week)

- [ ] **Private dashboard:** Build Astro dashboard querying GitHub API for all 8 projects
  - Time: 2-3 hours
  - Output: `https://yourdomain.com/dashboard` showing last commits + open issues per project
  - Deploy: Vercel

- [ ] **Archive OpenClaw in Board.md:** Move card to ## Archive section (2 min)

### Short-term (Next 2 weeks)

- [ ] **Public roadmap site:** Fork Quartz v4, customize for your projects
  - Time: 3-4 hours
  - Create `projects/` folder in vault; add per-project pages with GitHub badges
  - Set up GitHub Actions CI

- [ ] **GitHub integration:** Add GitHub API queries to Quartz build step
  - Show "Last commit: X days ago" on each project page
  - Show commit count per week

### Future (Polish)

- [ ] Weekly cron job to auto-update project metadata (last commit, open issues)
- [ ] Embed Obsidian Board.md as weekly progress report on site
- [ ] Add milestones / changelog timeline to public site

---

## Steel-Man: What Could Go Wrong

| Risk | Mitigation |
|------|-----------|
| GitHub API rate limit (60 req/hour unauthenticated) | Use personal access token (5000 req/hour) |
| Quartz build fails on bad Markdown | Add linting to CI (pre-commit hook) |
| Manual sync burden (forgetting to git push) | Set up auto-commit cron job |
| Roadmap becomes stale | Use live GitHub API on client-side instead of build-time |
| Private notes leak to public | Obsidian + Quartz already has `publish: true` gating |

---

## Sensitivity Table: When Each Option Makes Sense

| Scenario | Use | Why |
|----------|-----|-----|
| You want **zero setup overhead** | STACKFOLO extension | Instant, no coding |
| You want to **see project health** | Astro dashboard | Simple, shows all signals |
| You want **public portfolio** | Quartz + GitHub API | Professional, auto-updated |
| You want **team features** | Notion/Airtable (not recommended for solo) | Skip for now; overkill |
| You want **private knowledge base** | Obsidian Publish | Separate tool; not for roadmap |

---

## Thesis Integrity Check

**Original question:** How to track 8+ projects with unified big-picture view?

**Answer delivered:**
- ✅ Workflow (Board.md + GitHub API dashboard)
- ✅ Public roadmap site (Quartz + custom GitHub integration)
- ✅ No-code option (STACKFOLO for quick wins)
- ✅ Code-based option (Astro dashboard, 3h build)

**Confidence level:** 85% (tested solutions; not all combinations exist in wild, but patterns are clear)

**Loads:** Decision no longer blocked. Can proceed with either private dashboard or public roadmap or both.

---

## Sources Used

- [STACKFOLO: Track GitHub Commits Across Projects - DEV Community](https://dev.to/stackfolo/how-i-track-github-commits-across-all-my-side-projects-in-one-place-5a89)
- [My Quartz + Obsidian Publishing Setup - Oliver Falvai](https://oliverfalvai.com/evergreen/my-quartz-+-obsidian-note-publishing-setup)
- [Indie Hacker Tools 2025 - Built This Week](https://www.builtthisweek.com/blog/indie-hacker-tools-2025)
- [Top Indie Hacker Tools 2025 - Built This Week](https://www.builtthisweek.com/blog/indie-hacker-tools-2025-37f83)
- [Best Task Manager for Solo Developers 2025 - Solocrafter](https://www.solocrafter.com/blog/best-task-manager-solo-developers)
- [GitactionBoard - Ultimate Dashboard for GitHub Actions](https://github.com/otto-de/gitactionboard)
- [GitHub Action Dashboard Repository](https://github.com/chriskinsman/github-action-dashboard)
- [Repo Dashboard - Local GitHub Visibility Tool](https://albertoroura.com/repo-dashboard-local-github-visibility-tool/)
- [GitHub Dashing - Dashboard Framework](https://github.com/chillu/github-dashing)
- [Quartz - Publish Obsidian Vault](https://www.ssp.sh/brain/quartz-publish-obsidian-vault/)
- [Building a Digital Garden with Quartz](https://notes.hamatti.org/technology/building-a-digital-garden-with-obsidian-and-quartz)
