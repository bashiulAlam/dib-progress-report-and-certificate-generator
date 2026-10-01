# Report Generation

## Two Report Systems

### 1. Academic Progress Reports

#### High-Level Flow

```
User clicks eye icon (preview student)
        ↓
StudentReportCard component mounts
        ↓
Receives student data + config
        ↓
Calculates totals via calculateStudentTotal()
        ↓
ReportCardContent renders header, table, signatures
        ↓
Portal mounts invisible copy in document.body
        ↓
User clicks "Print / Save PDF"
        ↓
window.print() opens browser print dialog
        ↓
CSS @media print rules hide screen UI
        ↓
Portal content becomes visible for print
        ↓
User saves as PDF or prints to paper
```

## Component Structure

### StudentReportCard.tsx (Academic)

**Entry point:** Single component handles both single-student and bulk modes.

**Props:**
```typescript
{
  student: StudentScore;
  session: ExamSession;
  config: AppConfig;
  onClose: () => void;
  bulkPrint?: boolean;
}
```

**Modes:**

1. **Single Print Mode** (`bulkPrint = false`)
   - Returns a full JSX tree with modal overlay + preview card + portal
   - Modal shows in-browser preview with dark overlay
   - Print/Close buttons in toolbar
   - Portal renders print-only content to document.body

2. **Bulk Print Mode** (`bulkPrint = true`)
   - Returns just the bare report card (no modal wrapper)
   - Component is used inside a portal by BulkPrintModal
   - No controls, just the sheet

**Render tree (single mode):**
```
<>
  {/* Screen overlay with preview */}
  <div className="fixed inset-0 bg-black/70"> 
    <div> {/* Toolbar */} </div>
    <div className="w-[210mm] min-h-[297mm]">
      <ReportCardContent {...props} />
    </div>
  </div>

  {/* Portal to document.body (print only) */}
  {createPortal(
    <div className="hidden print:block">
      <div className="w-[210mm] min-h-[297mm]">
        <ReportCardContent {...props} />
      </div>
    </div>,
    document.body
  )}
</>
```

### ReportCardContent Component

**Pure stateless component** that renders the actual report structure.

**Sections:**

1. **Watermark**
   - Hidden behind all content
   - Faint academy logo image
   - Centered, muted grayscale

2. **Header**
   - Academy logo (dynamic size based on content density)
   - Academy name (dynamic size)
   - Report title text ("Fortschrittsbericht")
   - Term/semester label

3. **Student Identity**
   - Presentation line ("Dieser Fortschrittsbericht…")
   - Student name (dynamic size, gold underline)
   - Level and sub-level
   - Custom syllabus note if present

4. **Marks Table**
   - Standard HTML table with borders
   - Rows: subjects → sub-categories → optional subjects → co-curricular → total
   - Styled with Tailwind (`border`, `bg-[]`, `text-[]`)
   - Responsive text sizing (text-xs, text-[11px], text-[12px])

5. **Signatures Section**
   - Two-column layout
   - Teacher signature + label
   - Principal signature + label
   - Placeholder images from public/assets

## Dynamic Sizing System

Reports must fit on A4 pages even when subjects lists are long. The solution:

**Density calculation:**
```typescript
const contentDensity =
  (levelConfig?.subjects?.length ?? 0) +
  (activeOptionalSubjects?.length ?? 0) +
  (coCurricularActivities?.length ?? 0);

const densityPenalty = Math.max(0, contentDensity - 4) * 1.2;
```

**Sizing formulas:**
```typescript
const logoHeight = Math.max(26, Math.min(64, 56 - densityPenalty * 0.8));
const academyFontSize = `${Math.max(15, Math.round(18 - densityPenalty * 0.45))}px`;
const studentNameFontSize = `${Math.max(17, Math.round(21 - densityPenalty * 0.55))}px`;
```

**Effect:**
- Short report (4–6 subjects) → large header, prominent logo
- Dense report (15+ subjects) → compact header, smaller logo
- Prevents overflow; keeps layout proportional

## Data Flow to Report

**Input:**
```typescript
student: StudentScore
config: AppConfig
levelConfig: LevelConfig | undefined
```

**Calculated values:**
```typescript
totalScore, maxPossibleScore  // from calculateStudentTotal()
activeOptionalSubjects        // filtered from config
coCurricularActivities       // from config
logoHeight, academyFontSize  // from density calculation
```

**Passed to ReportCardContent:**
```typescript
const contentProps = {
  student,
  session,
  config,
  levelConfig,
  subLevelConfig,
  totalScore,
  maxPossibleScore,
  coCurricularActivities,
  activeOptionalSubjects,
  logoHeight,
  academyFontSize,
  studentNameFontSize,
};
```

## Portal Rendering Strategy

**Why portals?**
- Screen preview and print content can coexist in DOM
- CSS `@media print` selectively hides/shows each
- Browser print dialog only sees print-visible content
- Prevents print dialog from showing modal controls

**How it works:**

```typescript
// Screen version (visible by default)
<div className="fixed inset-0 ... print:hidden">
  {/* Modal overlay + preview + controls */}
</div>

// Print version (hidden by default, visible in print)
{createPortal(
  <div className="hidden print:block">
    {/* Clean report sheet */}
  </div>,
  document.body
)}
```

**CSS media rules** in `globals.css`:
- `@media print { .print:hidden { display: none !important; } }`
- `@media print { .print:block { display: block !important; } }`

## Timing & Render Guarantee

For bulk print, the app must ensure the portal is fully rendered before `window.print()`.

```typescript
setProgress(60);
setStatusMessage("Formatting multi-page print layout...");

// Frame 1: React re-renders
requestAnimationFrame(() => {
  // Frame 2: Browser paints
  requestAnimationFrame(() => {
    // Frame 3: Safety delay for async renders
    setTimeout(() => {
      window.print();
    }, 400);
  });
});
```

This guarantees:
1. React has updated the portal with new printable students
2. Browser has painted the content
3. Any async resources are loaded
4. `window.print()` will see the rendered content

## Print Stylesheet Rules

**Key rules in `src/app/globals.css`:**

```css
@media print {
  /* Hide screen elements */
  .print:hidden {
    display: none !important;
  }

  /* Show only print content */
  .print:block,
  .print:block * {
    visibility: visible;
  }

  /* A4 sizing */
  html, body {
    width: 210mm;
    height: 297mm;
    margin: 0;
    padding: 0;
    background: #ffffff;
    -webkit-print-color-adjust: exact;
    print-color-adjust: exact;
  }

  /* Report card container */
  .print:block {
    position: absolute;
    left: 0;
    top: 0;
    width: 100%;
  }
}
```

## Styling Approach

**Tailwind CSS:**
- Layout: `flex`, `flex-col`, `justify-between`, `absolute`, `relative`
- Sizing: `w-[]`, `min-h-[]`, `p-[]`
- Colors: `text-[]`, `bg-[]`, `border-[]`
- Print modifiers: `print:hidden`, `print:block`

**Inline styles:**
- Dynamic sizing (logo height, font sizes)
- Watermark opacity and filters

**No component-scoped styles:**
- All CSS is global or Tailwind
- Simplifies print rule application

## Example: Minimal Report

```jsx
<ReportCardContent
  student={{ firstName: "Alice", familyName: "Smith", level: "year-10", ... }}
  config={{ academyName: "Academy", levels: [...] }}
  logoHeight={56}
  academyFontSize="18px"
  studentNameFontSize="21px"
  totalScore={170}
  maxPossibleScore={200}
/>
```

Renders:
1. Watermark (barely visible)
2. Header with logo, academy name, term
3. "This report is presented to Alice Smith"
4. Table with subjects and scores
5. Total row: 170 / 200
6. Signatures section

### 2. Ramadan Competition Reports

#### High-Level Flow

```
Admin clicks "Bulk Print" button in Ramadan view
        ↓
RamadanReportBulkPrintModal opens
        ↓
User enters issue date and place
        ↓
Clicks "Generate & Print"
        ↓
App filters students with assigned verdicts
        ↓
Generates RamadanPerformanceData for each
        ↓
Prepares progress updates (Stage 1: 20%)
        ↓
Requests animation frame for portal render (Stage 2: 60%)
        ↓
Renders all reports to document.body portal
        ↓
Triggers window.print() (Stage 3: 100%)
        ↓
Browser print dialog shows multi-page preview
        ↓
User prints to paper or saves as PDF
```

#### Component: RamadanReportCard.tsx

**Entry point:** Print-friendly certificate for Ramadan competition participants.

**Props:**
```typescript
{
  data: RamadanPerformanceData;
  issueDate: string;         // e.g., "15.03.2026"
  issuePlace?: string;       // e.g., "Berlin"
  address?: string;          // Academy address
  competitionYear?: number;  // e.g., 2026
}
```

**Data Input Structure:**
```ts
interface RamadanPerformanceData {
  studentId: string;
  studentName: string;
  ageGroup: string;  // e.g., "7 - 8"
  verdict: string;   // e.g., "Basic"
  criteriaResults: Array<{
    criterion: string;
    result: string;  // "Vollständig erreicht", "Teilweise erreicht", "Nicht erreicht"
  }>;
  additionalTasks?: string;    // comma-separated, e.g., "Taraweeh, Tahajjud"
  bonusAmount?: string | number;
  prizeMoney: string;  // e.g., "25,00 €"
}
```

**Report Structure:**

1. **Header Section**
   - Academy logo (top-right)
   - Academy name and branding
   - Arabic Basmalah (بِسْمِ ٱللَّهِ ٱلرَّحْمَٰنِ ٱلرَّحِيمِ)
   - German translation of Basmalah
   - Report title: "Der produktive Ramadan der Kinder"
   - Year badge showing both CE and AH years

2. **Student Identity Block**
   - DIN 5008 compliant address-style box
   - Student name (prominent)
   - Age group label
   - Final verdict/classification

3. **Criteria Evaluation Table**
   - Target criteria column (from age group requirements)
   - Achievement level column (fully/partially/not achieved)
   - Additional activities row
   - Custom tasks/notes row
   - Conditional bonus row

4. **Prize Award Section**
   - Highlighted in emerald green
   - Base prize money + bonus (if applicable)
   - Clear monetary value display

5. **Spiritual Content**
   - Qur'anic verse (Arabic + German translation)
   - Motivational message in German
   - Encouragement for continued effort

6. **Footer**
   - Issue date and place
   - Signature line for school principal
   - Academy name and authority

#### Data Generation Flow

**In ProductiveRamadanView.tsx:**
```ts
// Filter students with verdicts
const participantsWithPerformance = useMemo<RamadanPerformanceData[]>(() => {
  return students
    .filter((std) => std.performance && std.performance.verdict)
    .map((std) => {
      const perf = std.performance!;
      
      // Extract target criteria results
      const targetRules = Object.entries(perf.targetCriteria).map(([rule, rating]) => ({
        criterion: rule,
        result: getRatingLabel(rating)  // "Vollständig erreicht" etc.
      }));
      
      // Filter additional activities based on config
      const extraActivities = additionalCriteriaConfig
        .filter((item) => perf.additionalCriteria[item.id])
        .map((item) => item.label);
      
      // Parse custom tasks (one per line -> comma-separated)
      const customTasks = (perf.customCriteria || "")
        .split("\n")
        .filter((line) => line.trim());
      
      // Combine all tasks
      const allTasks = [...extraActivities, ...customTasks];
      
      // Calculate prize
      const verdict = verdictOptions.find((v) => v.name === perf.verdict);
      const basePrize = verdict?.prizeMoney || 0;
      const bonusAmount = perf.bonusPoints ? bonusPrizeMoney : 0;
      const totalPrize = basePrize + bonusAmount;
      
      return {
        studentId: std.id,
        studentName: std.name,
        ageGroup: std.ageGroup,
        verdict: perf.verdict,
        criteriaResults: targetRules,
        additionalTasks: allTasks.length > 0 ? allTasks.join(", ") : undefined,
        bonusAmount: perf.bonusPoints ? `+${bonusPrizeMoney} €` : undefined,
        prizeMoney: `${totalPrize},00 €`
      };
    });
}, [students, verdictOptions, bonusPrizeMoney, additionalCriteriaConfig]);
```

#### Bulk Print Modal Flow

**In RamadanReportBulkPrintModal.tsx:**
```ts
const handleGenerateAndPrint = async () => {
  setIsProcessing(true);
  setProgress(20);
  setStatusMessage("Preparing students...");
  
  // Stage 1: Filter and prepare data
  const filtered = studentsData.filter(/* ... */);
  setPrintableStudents(filtered);
  
  setProgress(60);
  setStatusMessage("Formatting reports...");
  
  // Stage 2: Wait for React render + browser paint
  requestAnimationFrame(() => {
    requestAnimationFrame(() => {
      setTimeout(() => {
        setProgress(100);
        
        // Stage 3: Open print dialog
        window.print();
        setIsProcessing(false);
        // Modal stays open until user closes
      }, 400);
    });
  });
};
```

**Portal structure:**
```jsx
{createPortal(
  <div className="hidden print:block">
    <style>{`
      @media print {
        .break-after-page {
          page-break-after: always;
          break-after: page;
        }
      }
    `}</style>
    {printableStudents.map((studentData) => (
      <div key={studentData.studentId} className="break-after-page">
        <RamadanReportCard
          data={studentData}
          issueDate={issueDate}
          issuePlace={issuePlace}
          address={address}
          competitionYear={competitionYear}
        />
      </div>
    ))}
  </div>,
  document.body
)}
```

#### Hijri Year Conversion

**Utility function in src/data/ramadanDateUtils.ts:**
```ts
export const getHijriYear = (gregorianYear: number): string => {
  try {
    // Use native Intl API with islamic-umalqura calendar
    const sampleDate = new Date(gregorianYear, 2, 15);  // March 15
    const formatter = new Intl.DateTimeFormat("en-US-u-ca-islamic-umalqura", {
      year: "numeric",
    });
    const parts = formatter.formatToParts(sampleDate);
    const hijriPart = parts.find((p) => p.type === "year");
    return hijriPart ? hijriPart.value.replace(/\D/g, "") : "";
  } catch {
    // Fallback to basic islamic calendar if umalqura not available
    return "";
  }
};
```

**Hijri year displayed as:**
```
2026 CE • 1447 AH
```

## Files & Line References

### Academic Reports
- [StudentReportCard.tsx](../../src/components/StudentReportCard.tsx#L1) — Main component
- [BulkPrintModal.tsx](../../src/components/BulkPrintModal.tsx#L1) — Bulk print workflow

### Ramadan Reports
- [RamadanReportCard.tsx](../../src/components/ramadan/RamadanReportCard.tsx#L1) — Report template
- [RamadanReportBulkPrintModal.tsx](../../src/components/ramadan/RamadanReportBulkPrintModal.tsx#L1) — Bulk print modal
- [ProductiveRamadanView.tsx](../../src/components/ramadan/ProductiveRamadanView.tsx#L1) — Main workflow
- [ramadanDateUtils.ts](../../src/data/ramadanDateUtils.ts#L1) — Year conversion
- [ReportCardContent](../../src/components/StudentReportCard.tsx#L27) — Content renderer
- [globals.css](../../src/app/globals.css#L38) — Print media rules
- [BulkPrintModal.tsx](../../src/components/BulkPrintModal.tsx#L1) — Bulk orchestration
