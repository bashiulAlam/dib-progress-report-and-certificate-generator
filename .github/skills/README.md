# Project Skills Index

This directory captures the core project knowledge for AI-assisted development and technical onboarding.

## Project Summary

A comprehensive Next.js application for **Islamic academy management** supporting two main workflows:

1. **Academic Progress Reporting** — Student grading, score calculation, and report card generation
2. **Ramadan Competition Management** — Student evaluation, achievement tracking, and certificate generation

Both modules support:
- Student roster management and CSV import
- Configurable evaluation criteria
- Dynamic additional requirements/activities
- Bulk print workflows to PDF
- Session persistence and archival

## Core Modules

### Progress Report Module
- Manual student data entry
- Level and sub-level filtering
- Per-subject scoring with optional subjects
- Co-curricular activity scoring
- Configurable term/session management
- Single and bulk print to PDF
- Draft persistence in localStorage

### Ramadan Competition Module
- Age-based student grouping
- Dynamic performance evaluation forms
- Configurable criteria and verdict system
- Hijri/Gregorian date display
- German-language certificate generation
- Spiritual motivational content
- Session export/import support

## Files in This Skills Directory

- [features.md](./features.md) — Complete feature descriptions for both modules, workflows, and user actions
- [config-settings.md](./config-settings.md) — Configuration schemas for academic levels and Ramadan settings
- [report-generation.md](./report-generation.md) — How reports are built, rendered, and printed
- [print-export.md](./print-export.md) — Browser print workflow, PDF export, and bulk operations
- [design.md](./design.md) — Visual design systems, typography, colors, and layout rules
- [scoring-logic.md](./scoring-logic.md) — Score calculation algorithms for academic reports

## Primary Source Files

### Shared Infrastructure
- `src/components/` — Reusable UI components
- `src/lib/types.ts` — Core domain types
- `src/lib/config.ts` — Configuration helpers
- `src/app/page.tsx` — Main entry point
- `src/app/globals.css` — Global styles and print CSS

### Academic Progress Module
- `src/components/StudentReportCard.tsx` — Report card component
- `src/components/BulkPrintModal.tsx` — Bulk print workflow
- `src/lib/score-calculator.ts` — Score aggregation logic
- `data/config.json` — Academy and level configuration

### Ramadan Competition Module
- `src/components/ramadan/ProductiveRamadanView.tsx` — Main view with admin settings
- `src/components/ramadan/RamadanReportCard.tsx` — Certificate template
- `src/components/ramadan/RamadanReportBulkPrintModal.tsx` — Bulk print workflow
- `src/data/ramadanRequirements.ts` — Age groups, verdicts, default criteria
- `src/data/ramadanDateUtils.ts` — Hijri year conversion utilities

## Quick Start for New Developers

1. **Understanding the App:**
   - Start with [features.md](./features.md) for functional overview
   - Check [config-settings.md](./config-settings.md) for data structures

2. **Working with Workflows:**
   - Review [report-generation.md](./report-generation.md) for component architecture
   - Read [print-export.md](./print-export.md) for print flow details

3. **Visual Development:**
   - See [design.md](./design.md) for styling guidelines
   - Check `src/app/globals.css` for print and responsive rules

4. **Algorithm Understanding:**
   - Read [scoring-logic.md](./scoring-logic.md) for calculation details
   - Review `src/lib/score-calculator.ts` source code

## Key Development Concepts

### State Management
- Client-side session state for editing
- localStorage for draft persistence
- URL query parameters for navigation

### Data Flow Pattern
1. Load/create session from localStorage or upload
2. Display data in editable forms
3. Generate reports from current state + config
4. Portal renders printable content separately
5. Browser print dialog handles output

### Configuration as Code
- Academic config: `data/config.json` + `src/lib/types.ts`
- Ramadan config: hardcoded defaults + localStorage overrides
- Settings UI provides live editing

### Print Strategy
- Native browser `window.print()` for simplicity
- Portal-based rendering keeps print content isolated
- CSS `@media print` rules for styling
- Multi-frame delays ensure async content loads before print

### Internationalization
- Academic reports default to English
- Ramadan reports use German language
- Support for Arabic script (Basmalah) in Ramadan module

## Testing Common Features

**To test academic reports:**
- Upload student data CSV
- Assign scores and verify calculations
- Generate single/bulk reports
- Check print preview and PDF output

**To test Ramadan module:**
- Create new competition or load existing
- Upload student roster
- Evaluate student performance
- Configure criteria and verdicts via settings
- Generate and print certificates
- Export/import session files

## Important Notes for Maintainers

- Both modules use separate configuration systems (intentional)
- localStorage keys must not conflict between modules
- Print CSS rules affect both report types — test both after changes
- Hijri year conversion depends on browser Intl API support
- German language labels in Ramadan module can be customized per institution
