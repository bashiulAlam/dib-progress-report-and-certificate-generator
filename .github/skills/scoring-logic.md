# Scoring Logic Knowledge

## Overview

The score logic lives mainly in `src/lib/score-calculator.ts`, with the data model in `src/lib/types.ts`.

This project calculates a student total by aggregating all numeric values present in the student score map and comparing them against max possible values defined in the config.

## Core Calculation Behavior

The calculator:

1. finds the student's level config
2. loops through all level subjects
3. includes sub-category scores if subject has `subCategories`
4. includes direct subject values when the subject has no sub-categories
5. adds co-curricular scores from the app config
6. returns the aggregate total and max score

## Calculation Rules

### Direct Subject Scores

If a subject is not split into sub-categories:

- `student.scores[subject.id]` is read
- if it is a number, it is added to `totalScore`
- `subject.maxPoints` is added to `maxPossibleScore` unless the subject is optional

### Sub-Categorized Subjects

If a subject has `subCategories`:

- each sub-category contributes its `maxPoints` to the total possible score
- each numeric value in `student.scores[subCategory.id]` is added to current score

### Optional Subjects

Optional subjects are treated specially:

- they often still contribute to the report display
- they may be excluded from total score depending on config rules and usage
- the current implementation mainly relies on `subject.isOptional` and whether the data is present

### Co-Curricular Activities

Co-curricular scores are counted using the config activity definitions:

- each activity can add one numeric value
- `activity.maxPoints` contributes to `maxPossibleScore`
- values are included in the main score total when numeric

### Grade-Based Evaluation

The current type system supports grade-based fields using `evaluationType: "grade"`.

These are stored as strings instead of numbers, but the current scoring flow primarily handles numeric domains. This is a useful area to review if future grading logic expands.

## Important Implementation Notes

- `calculateStudentTotal` is the main function used by the report UI
- totals are recalculated when the user edits a student row
- `totalScore` and `maxPossibleScore` are stored back on the student object for display and export

## Example

If a subject has:

- `maxPoints = 40`
- and the student has `scores[subject.id] = 32`

then:

- totalScore += 32
- maxPossibleScore += 40

If a sub-category subject has:

- two sub-categories with max points 15 and 15
- student values of 10 and 12

then:

- totalScore += 22
- maxPossibleScore += 30

## Risks / Watchouts

- grade values should not be counted in numeric totals unless converted
- optional subjects should be handled consistently across totals and displays
- if a config field is missing, the score flow may silently produce zero values or incomplete totals
- always validate that each score key matches a subject/category ID in the active level config

## Relevant Files

- `src/lib/score-calculator.ts`
- `src/lib/types.ts`
- `src/app/page.tsx`
- `src/components/StudentReportCard.tsx`
