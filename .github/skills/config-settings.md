# Config Settings Knowledge

## Configuration Model

The app uses a typed configuration object defined in `src/lib/types.ts`.

```ts
interface AppConfig {
  academyName: string;
  levels: LevelConfig[];
  coCurricular?: {
    activities?: CoCurricularConfig[];
  };
}
```

## Level Structure

Each level contains:

- `id` — unique identifier
- `name` — display label
- `baseMaxScore` — optional base/ceiling value
- `subjects` — main subject array
- `optionalSubjects` — optional list of extra subjects
- `subLevels` — grouping options such as sections/classes

## Subject Structure

Each subject can include:

- `id`
- `name`
- `maxPoints`
- `subCategories` (optional)
- `isOptional` (optional)
- `includeInTotal` (optional)
- `evaluationType` (`points` or `grade`)
- `gradeOptions` (optional)
- `hasCustomSyllabus` (optional)

## Co-Curricular Structure

Co-curricular activities are defined as:

- `id`
- `name`
- `maxPoints`
- `includeInTotal` (optional)

## Runtime Storage

App config is read from:

- `data/config.json`

and is retrieved via:

- `src/lib/config.ts`

This file provides:

- `getAppConfig()`
- `saveAppConfig()`

## Admin Settings Flow

The admin side is designed to configure the structure that drives reports. This includes:

- academy branding
- subject definitions
- optional subjects and co-curricular items
- level and sub-level relationships
- academic term naming / session metadata

## Draft and Session Data

Exam session data includes:

- term
- date
- students array

Each student includes:

- `firstName`
- `familyName`
- `level`
- `subLevel`
- `scores`
- `coCurricularScores`
- `totalScore`
- `maxPossibleScore`
- `syllabi`

## Important Notes

- The configuration is the source of truth for report structure and scoring metadata.
- Score calculations depend on `subject.maxPoints`, `subCategory.maxPoints`, and the presence of `isOptional` / `includeInTotal` flags.
- Custom syllabus values are attached at the student level and rendered in the report header when present.
- The current setup is JSON-driven and straightforward to extend.

## Files to Check When Editing Configuration

- `data/config.json`
- `src/lib/types.ts`
- `src/lib/config.ts`
- `src/app/admin/page.tsx`
- `src/app/page.tsx`
