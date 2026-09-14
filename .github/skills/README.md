# Project Skills Index

This directory captures the core project knowledge for future AI-assisted work and onboarding.

## Files

- [design.md](./design.md) — report-card visual system, print layout, typography, branding, and watermark approach
- [features.md](./features.md) — application capabilities, workflows, and key user/admin actions
- [config-settings.md](./config-settings.md) — app configuration schema, saved drafts, and admin settings structure
- [scoring-logic.md](./scoring-logic.md) — how scores, totals, and optional subjects are calculated

## Quick Project Summary

This project is a Next.js app for generating student progress reports and certificates. It supports:

- manual student data entry and editing
- level and sub-level filtering
- per-subject scoring and optional subject handling
- co-curricular activity scoring
- term/session management
- single and bulk print flows to PDF
- saved draft sessions and admin config persistence

## Primary Source Files

- `src/components/StudentReportCard.tsx` — printable single report sheet and watermark/layout design
- `src/components/BulkPrintModal.tsx` — bulk generation and print flow
- `src/lib/types.ts` — core domain types
- `src/lib/config.ts` — config file read/write helpers
- `src/lib/score-calculator.ts` — score aggregation logic
- `src/app/page.tsx` — main workflow and session management
- `data/config.json` — runtime configuration for academy and levels
