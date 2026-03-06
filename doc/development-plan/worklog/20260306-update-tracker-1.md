# Update Tracker: Progress Report #1

**Date:** 2026-03-06
**Spec:** `doc/development-plan/20260306-feature-update-tracker.md` (Section 11)
**Phase:** Phase 3: Advanced

---

## Progress: 10 / 11 steps complete

| # | Step | Status |
|---|------|--------|
| 1 | DB schema + migration | Done |
| 2 | Admin API (version registration, impact mapping) | Done |
| 3 | Public API (summary, tool detail, recent updates) | Done |
| 4 | Auto-check service (npm/GitHub version polling) | Done |
| 5 | Freshness Overview screen (Web) | Done |
| 6 | Tool Detail screen (Web) | Done |
| 7 | Admin Management screen (Web) | Done |
| 8 | Home Dashboard widget integration | Done |
| 9 | Lesson View version tag | Done |
| 10 | Mobile screens | Done |
| 11 | Push notification on content update | Not started |

---

## What was done

- Prisma: 3 new models (`ToolTrackingConfig`, `ToolVersion`, `ContentUpdateImpact`) + migration applied
- Shared packages: types, zod schemas, api-client methods all added
- Backend: 4 public endpoints + 7 admin endpoints + version checker service (npm/GitHub)
- Frontend Web: 5 pages (Freshness Overview, Tool Detail, Version Detail, Admin Management) + sidebar nav + dashboard widget + lesson version tags
- Frontend Mobile: 2 screens (FreshnessOverview, ToolDetail) + UpdateStack navigation + "Updates" bottom tab
  - Horizontal swipe carousel for tool cards
  - Version timeline with dots, change lists, affected lessons
  - Status badges, priority indicators, breaking change tags
- Infra: seed script + GitHub Actions cron for auto version checking

## Bugfixes

- Prisma `Json` type cast error on VPS Docker build — fixed with `as unknown as` cast
- Prisma client pnpm store sync issue (local dev only, Docker unaffected)

## Next steps

1. **Push notification on content update** — notify users when affected modules are updated
