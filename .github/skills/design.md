# Design Knowledge

## Visual Style

The report card is styled as a polished academic document with a premium institutional look.

- Green primary palette using dark green / emerald tones for headings and formal sections
- Gold accent color for secondary emphasis and highlights
- White paper background on a bordered A4-like sheet
- Serif typography for the formal certificate/report feel
- Clean modern sans-serif for metadata and labels

Key color usage:

- `#005C3C` — dark green / primary brand and table borders
- `#E1A929` — gold accent / title emphasis
- pale blue backgrounds for some table sections
- neutral grays for secondary text

## Report Structure

The printed card typically has this flow:

1. top branding block
   - academy logo
   - academy name
   - report title
   - semester/term label
2. student identity block
   - “This report is proudly presented to …”
   - student name
   - department/level and sub-level
   - custom syllabus note if present
3. marks table
   - subject rows and sub-category rows
   - optional subject rows
   - co-curricular activity rows
   - total row
4. signatures section
   - teacher signature
   - principal signature

## Print Layout Rules

- The report is designed for A4 portrait output
- The container is sized to `210mm x 297mm` and uses a bordered paper panel
- Print output should preserve colors and design without browser chrome
- Print mode should hide screen UI, preview controls, and other page chrome
- A watermark can be used as a faint background mark without reducing readability

## Current Design Constraints

- Long reports must not overflow or push the table out of the page
- The header area must remain compact enough for dense tables with many rows
- The logo is intentionally kept prominent but must be allowed to scale down for heavier subject lists
- The sheet should look premium even when printed to PDF

## Watermark Guidance

The watermark should:

- be centered behind the main report content
- use low opacity (very faint)
- be muted/desaturated so it does not compete with real content
- be present in print/PDF output, not just screen preview

Recommended approach:

- use the same academy logo in grayscale or muted color
- keep opacity around 0.04–0.08 when printed
- avoid high contrast filters that make the watermark too visible

## Ramadan Report Design

The Ramadan competition report uses a complementary professional style:

**Language & Script:**
- Primary text in German
- Arabic Qur'anic elements (Basmalah in original Arabic script)
- German translations provided for Arabic text

**Color Palette:**
- Dark emerald green (#005C3C) for headings and table borders
- Gold/amber (#E1A929) for secondary emphasis
- White paper background with subtle borders
- Neutral grays for secondary content
- Green highlight for prize award section

**Typography:**
- Serif fonts for formal title and certificate feel
- Sans-serif for metadata and table content
- Bold weights for verdict/achievement labels

**Structure:**
- Header with academy branding and Arabic/German bilingual greeting
- Clear student identity section
- Criteria evaluation table with color-coded results
- Prominent prize money award display
- Motivational spiritual content section
- Professional signature area

**Key Design Elements:**
1. **Basmalah Display** — Arabic text rendered in original script with German translation
2. **Achievement Rating Labels** — Consistent German terminology:
   - "Vollständig erreicht" (Fully achieved)
   - "Teilweise erreicht" (Partially achieved)
   - "Nicht erreicht" (Not achieved)
3. **Year Display** — Shows both Gregorian and Hijri calendars
4. **Watermark** — Faint academy logo background
5. **Certificate Aesthetic** — Professional award-style layout

**Print Considerations:**
- Optimized for A4 portrait format
- Color-safe design (prints well in B&W and color)
- Page breaks handled automatically in bulk mode
- Watermark visibility preserved in PDF export

## Important Files

### Academic Reports
- `src/components/StudentReportCard.tsx` — report layout and visual styling
- `src/app/globals.css` — print-specific CSS rules and layout behavior
- `src/components/CornerOrnament.tsx` — decorative border design

### Ramadan Reports
- `src/components/ramadan/RamadanReportCard.tsx` — Ramadan certificate design and layout
- `src/components/ramadan/RamadanReportBulkPrintModal.tsx` — bulk print flow UI
- `src/data/ramadanDateUtils.ts` — year conversion and formatting utilities
