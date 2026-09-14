# Features Knowledge

## Core Features

### Student Progress Reporting

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
