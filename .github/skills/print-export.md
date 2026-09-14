# Print & Export to PDF

## Browser Print Dialog Workflow

The app uses native browser `window.print()` — not server-side PDF generation. This keeps the stack simple and gives users full control.

**User flow:**
1. Click "Print / Save PDF" button
2. `window.print()` is called
3. Browser print dialog opens
4. User selects:
   - Printer device OR "Save as PDF"
   - Paper size (A4 portrait)
   - Margins and scaling
5. Result: PDF file saved or sent to printer

## Single Student Print

**Code:**
```typescript
const handlePrint = () => {
  const originalTitle = document.title;
  const cleanName = `${student.firstName}_${student.familyName}`.replace(/\s+/g, "_");
  document.title = `${cleanName}_Report_Card`;  // Clean PDF filename
  
  window.print();
  
  document.title = originalTitle;  // Restore after browser dialog
};
```

**Filename:**
- Browser uses `document.title` as default PDF filename
- Set to: `FirstName_LastName_Report_Card.pdf`

**Portal content:**
- Report is rendered in both:
  - Screen preview (visible, styled with shadow/border)
  - Portal to document.body (invisible, print-only)
- `window.print()` automatically finds `.print:block` content

## Bulk Print Export

**User flow:**
1. Click "Bulk Print" button
2. Select level/sub-level filters
3. Click "Generate & Print"
4. Progress bar shows three stages:
   - 20%: Preparing students
   - 60%: Formatting layout
   - 100%: Opening print dialog
5. All matching report cards render in portal
6. Browser print dialog opens (shows preview of ALL cards)
7. User can print all or select specific pages
8. Result: Multi-page PDF with one report per page

**Code flow:**
```typescript
const handleGenerateAndPrint = () => {
  setIsProcessing(true);
  
  // Stage 1: Prepare students
  setPrintableStudents(matchingStudents);  // Trigger render
  
  // Stage 2: Wait for portal render + paint
  requestAnimationFrame(() => {
    requestAnimationFrame(() => {
      setTimeout(() => {
        // Stage 3: Print
        window.print();
        setIsProcessing(false);
        // Modal stays open until user closes it
      }, 400);
    });
  });
};
```

**Multi-frame delay:**
- Frame 1: React renders new `printableStudents`
- Frame 2: Browser paints the content
- Timeout: Ensure async resources load
- Then: `window.print()` sees all cards

**Portal structure (bulk mode):**
```jsx
{createPortal(
  <div className="hidden print:block">
    {printableStudents.map(student => (
      <div key={student.studentId} className="break-after-page">
        <StudentReportCard
          student={student}
          bulkPrint={true}
          // ... other props
        />
      </div>
    ))}
  </div>,
  document.body
)}
```

**CSS page breaks:**
```css
.break-after-page {
  page-break-after: always;
}
```

Each report gets its own printed page.

## A4 Paper Sizing

**Dimensions:**
- 210mm wide × 297mm tall (A4 portrait)

**Container:**
```jsx
<div className="w-[210mm] min-h-[297mm] p-10">
  {/* Report content */}
</div>
```

**Print media rules** (globals.css):
```css
@media print {
  html, body {
    width: 210mm;
    height: 297mm;
    margin: 0;
    padding: 0;
  }

  @page {
    size: A4 portrait;
    margin: 0;
  }
}
```

**Browser behavior:**
- Print preview shows each 210mm × 297mm sheet as one page
- User can set custom margins or scaling in print dialog
- App assumes no margins (content fills edge-to-edge)

**Multi-page reports:**
- If content is taller than 297mm → browser adds extra pages automatically
- `page-break-after: always` forces breaks at specific points (e.g., after each student)

## Print-Only CSS Rules

**In globals.css:**

```css
@media print {
  /* Hide screen elements */
  .print\:hidden {
    display: none !important;
  }

  /* Show print elements */
  .print\:block {
    display: block !important;
  }

  /* Preserve colors & design */
  html, body {
    -webkit-print-color-adjust: exact !important;
    print-color-adjust: exact !important;
  }

  /* Hide everything by default */
  body * {
    visibility: hidden;
  }

  /* Only show printable content */
  .print\:block,
  .print\:block * {
    visibility: visible;
  }
}
```

**Effect:**
- All Tailwind `print:` utilities work as expected
- Page chrome (nav, buttons, modals) is hidden
- Only the report content is visible
- Colors, gradients, borders are preserved

## Color & Design Preservation

**Table borders:**
```css
border border-[#005C3C]  /* Dark green */
```

**Text colors:**
```css
text-[#E1A929]  /* Gold for headings */
text-[#005C3C]  /* Dark green for sections */
```

**Background tints:**
```css
bg-[#F0F8FF]       /* Pale blue */
bg-[#005C3C]/10    /* Green tint */
```

**Print fidelity:**
- `-webkit-print-color-adjust: exact` ensures Tailwind colors render as-is
- No grayscale or color reduction
- Watermark opacity is slightly more visible in print than screen

## Browser Print Settings

**User can adjust:**
- Printer (or "Save as PDF")
- Paper size (usually defaults to A4 if configured)
- Orientation (portrait/landscape)
- Margins (often "No Margins" or custom)
- Scale/Zoom (100% recommended)
- Include backgrounds (should be ON)
- Include graphics (should be ON)

**Recommended user settings:**
- Margins: "None" or minimal
- Scale: 100%
- Backgrounds: ON
- Duplex: optional (print single or double-sided)

## PDF Output Characteristics

**Single report PDF:**
- Filename: `FirstName_LastName_Report_Card.pdf`
- Content: 1 page (or more if report is long)
- Dimensions: A4 portrait
- Colors: Preserved (if include backgrounds is ON)

**Bulk report PDF:**
- Filename: Browser default (e.g., `document.pdf` or based on window title)
- Content: One page per student (e.g., 30 students = 30 pages)
- Each student report is one complete sheet
- Users can print all or select specific page ranges

## Gotchas & Troubleshooting

**Report looks different in print:**
- Check: Is "Include backgrounds" turned ON in print dialog?
- Check: Scaling set to 100% (not auto-scale)?
- Check: Margins set to "None" or minimal?

**Watermark not visible in PDF:**
- This is intentional (very faint)
- Can adjust opacity in `StudentReportCard.tsx` if desired

**Multi-page bulk print missing pages:**
- Ensure `page-break-after: always` is applied to student divs
- Check browser console for rendering errors
- Try smaller batches if printing hundreds of students

**Text looks blurry or small:**
- Verify A4 sizing is correct (210mm × 297mm)
- Check Tailwind sizing classes are being compiled
- Try opening print preview in different browser

**Colors don't print:**
- Browser print settings must have "Include backgrounds" enabled
- `-webkit-print-color-adjust: exact` must be present in CSS
- Printer must support color (not all do)

## Files to Check

- [StudentReportCard.tsx](../../src/components/StudentReportCard.tsx#L230) — `handlePrint()` function
- [BulkPrintModal.tsx](../../src/components/BulkPrintModal.tsx#L60) — `handleGenerateAndPrint()` function
- [globals.css](../../src/app/globals.css#L38) — `@media print` rules
- [report-generation.md](./report-generation.md) — Portal structure details

## Technical Notes

- No PDF library (like PDFkit or html2pdf) is used
- Browser's native print capability is the entire implementation
- This approach works across all browsers and devices
- Users have full control over print settings and device
- Export is instantaneous (no server processing)
