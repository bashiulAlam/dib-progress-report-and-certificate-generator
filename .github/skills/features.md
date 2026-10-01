# Features Knowledge

## Application Modules

The app supports two main workflows:

1. **Progress Report Module** — Academic student performance scoring and reporting
2. **Ramadan Competition Module** — Islamic studies competition management and certification

## Core Features

### 1. Student Progress Reporting

The app lets users manage a list of students and their results by term/semester. Each student has:

- first name and family name
- level
- sub-level
- score map by subject or category
- optional custom syllabus notes
- total score and maximum possible score

### Subject and Category Scoring

Each level can define a list of subjects with evaluation types and maximum values.

Supported patterns:

- subject with direct numeric score
- subject with sub-categories
- grade-based evaluation (string-based grade entries)
- optional subjects
- co-curricular activities

### Admin Configuration

The app supports a configuration-driven architecture for academy and academic setup:

- academy name
- levels
- sub-levels
- subject definitions
- optional subjects
- activity definitions
- custom syllabus support

This config is saved in `data/config.json` and can be edited through the admin UI or data file workflows.

### Bulk Print Workflow

Bulk print enables generating a print-ready set of report cards for all matching students in a selected level/sub-level group.

Flow:

1. choose level/sub-level filter
2. prepare printable students in modal state
3. render report cards in a print portal
4. trigger browser print dialog
5. allow the user to close the bulk modal manually after print completion

### Single Report Preview

Each student can also be previewed individually.

This flow includes:

- modal preview on-screen
- print/save PDF button
- portal print target for clean print output
- close action to dismiss the preview

### Draft Persistence

The app stores the current unsaved session in localStorage and exposes saved JSON session drafts.

This supports:

- temporary editing without immediate file save
- reopening saved session drafts
- saving term-based session files

### File Handling

Users can:

- save a session as a JSON draft
- load a saved file
- delete a saved session draft
- work with a current active file in the app state

## Workflow Notes

The app is intentionally designed around the following pattern:

- data lives in client-side session state for editing
- config is loaded from server-side config API
- reports are generated from current data plus config metadata
- print output uses a dedicated portal to isolate printable content

## Additional Improvements Worth Considering

These would be useful future additions:

- import/export CSV for student data
- report templates with alternate themes
- per-term custom text blocks
- signatures upload/management
- PDF generation via server-side rendering instead of browser print
- sorting and search for student table rows
- validation for missing scores or invalid values
- batch editing for students

### 2. Ramadan Competition Management

**Purpose:** Manage student participation in annual Ramadan competition with performance evaluation and certificates.

**Key Features:**

#### Age-Based Student Groups
- Students automatically sorted into age groups (< 7, 7-8, 9-10, 11-13, > 13 years)
- Each age group has defined target criteria requirements
- Age can be entered inline; age group recalculates automatically
- Group assignment visible in student roster

#### Performance Evaluation
For each student, admin/teacher evaluates:
- **Target criteria** — success level for each age-group requirement (fully/partially/not achieved)
- **Additional activities** — checkbox list for optional mosque/Ramadan activities
  - Examples: Quran reading, Tahajjud, Taraweeh, Overnight in mosque, Sadaqah, etc.
  - List is configurable and persists across evaluations
- **Custom notes** — free-text input for special achievements or additional tasks
- **Verdict** — final classification from configurable list (Entry, Basic, Advanced, etc.)
- **Bonus points** — optional bonus award with configurable amount

#### Dynamic Criteria Configuration
Admin panel (Settings ⚙️) allows managing additional criteria:
- Add new activity/requirement labels
- Remove existing criteria
- Reset to default set
- Changes persist in localStorage
- Form updates reflect changes immediately
- Organized in "Additional Criteria" settings tab

#### Report Generation
Generates formatted German-language performance certificates for students with verdicts showing:
- Student name and age group classification
- Final verdict/classification with prize money
- Hijri and Gregorian year display
- Achieved criteria with success ratings table
- Completed additional activities listed
- Total prize award (base + bonus)
- Spiritual encouragement message with Qur'anic verse

**File locations:**
- `src/components/ramadan/ProductiveRamadanView.tsx` — main workflow, student roster, performance modal, admin settings
- `src/components/ramadan/RamadanReportCard.tsx` — single report card template (printable)
- `src/components/ramadan/RamadanReportBulkPrintModal.tsx` — bulk print interface and workflow
- `src/data/ramadanRequirements.ts` — age group definitions, verdict options, default criteria
- `src/data/ramadanDateUtils.ts` — Hijri/Gregorian year conversion utilities

#### Data Persistence
- Student list and performance data saved to browser localStorage
- Can export entire session as JSON file
- Can load/import previously saved competition years
- Settings (age groups, verdicts, additional criteria) also persist separately
- Supports multiple competition year archives

## Workflow Patterns

**Progress Report Workflow:**
- Enter student data manually or upload CSV
- Assign scores per subject/category
- Generate individual or bulk reports
- Print to PDF or paper

**Ramadan Competition Workflow:**
- Load or create new competition (year-based)
- Upload student roster with names/ages
- Evaluate each student's performance
- Configure criteria and awards as needed
- Generate performance certificates
- Bulk print all reports

## Additional Improvements Worth Considering

These would be useful future additions:

- Ramadan competition year archival and historical comparison
- Performance statistics dashboard for Ramadan module
- Award ranking/leaderboard display
- Attendance tracking for Ramadan activities
- Parent notifications/communication integration
- Mobile-friendly interface for field evaluation
- Integration between academic and Ramadan modules
- Report card templates with alternate themes
