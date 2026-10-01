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

### 2. Ramadan Competition Configuration

**Age Groups:**
Defined in `src/data/ramadanRequirements.ts` as `RamadanAgeGroup[]`:
```ts
interface RamadanAgeGroup {
  id: string;
  code: "A" | "B" | "C" | "D" | "E";
  label: string;           // e.g., "7 - 8"
  ageMin: number;
  ageMax: number;
  requirements: string[];  // target criteria for this age group
}
```

Default groups:
- A: < 7 years
- B: 7-8 years
- C: 9-10 years
- D: 11-13 years
- E: > 13 years

**Verdict Options:**
Define competition result categories and prize amounts:
```ts
interface VerdictOption {
  id: string;
  name: string;      // e.g., "Entry", "Basic", "Advanced"
  prizeMoney: number; // € amount
}
```

Default verdicts:
- Entry: 15 €
- Basic: 25 €
- Advanced: 35 €

**Additional Criteria (Dynamic):**
User-configurable activities and requirements:
```ts
interface AdditionalCriterionOption {
  id: string;
  label: string; // e.g., "Vollständiges Qur'an lesen"
}
```

Stored in localStorage under key `ramadan_additional_criteria`. Can be:
- Added manually via settings panel
- Reset to defaults
- Persists across browser sessions

Default criteria:
- Vollständiges Qur'an lesen (Full Qur'an reading)
- Alle Tage Fasten (Fasting all days)
- Tahajjud Gebete (Tahajjud prayers)
- Taraweeh Gebete (Taraweeh prayers)
- Übernachtung in der Moschee (Overnight mosque stay)
- Sadakah (Charity)

**Bonus Prize Money:**
Separate configurable amount awarded when "Bonus" checkbox is marked on student performance:
- Configured in settings modal (default 5 €)
- Applied at evaluation time
- Shown separately in report

**Configuration UI:**
Settings modal (⚙️ button) with three tabs:
1. **Verdicts & Prize Money**
   - View/edit verdict names and prize amounts
   - Configure bonus prize amount
   - Add new verdict categories

2. **Age Group Target Criteria**
   - Edit requirements for each age group
   - Multi-line textarea per group
   - One requirement per line
   - Blank lines automatically cleaned

3. **Additional Criteria**
   - View current criteria list
   - Add new criteria
   - Delete specific criteria
   - Reset all to defaults

**Data Persistence:**
- All settings changes saved to browser localStorage immediately
- Settings exported/imported with session JSON file
- Each competition year can have different verdict options
- Age groups stored per session

**Configuration Update Flow:**
1. Admin opens settings modal
2. Modifies age groups, verdicts, or criteria
3. Saves configuration
4. Changes persist to localStorage
5. All open forms update immediately
6. Changes included in exported JSON exports

**Important Notes:**
- Ramadan config completely separate from academic progress report config
- Settings are "live" — changes affect forms immediately without page reload
- Each competition year maintains its own configuration
- Additional criteria support German language labels (default) and can be customized
- Age group requirements are the source of truth for target criteria in performance evaluation
