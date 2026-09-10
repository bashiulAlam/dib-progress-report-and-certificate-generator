import { AppConfig, LevelConfig, StudentScore } from "@/lib/types";

export function calculateStudentTotal(
  student: StudentScore,
  levelConfig?: LevelConfig,
  globalConfig?: AppConfig
) {
  let totalScore = 0;
  let maxPossibleScore = levelConfig?.baseMaxScore || 0;

  if (!levelConfig) return { totalScore, maxPossibleScore };

  // Helper to safely check if a score is entered and valid
  const hasValidScore = (scoreVal: unknown): boolean => {
    return (
      scoreVal !== undefined &&
      scoreVal !== null &&
      scoreVal !== "" &&
      !isNaN(Number(scoreVal))
    );
  };

  // 1. Process Standard / Mandatory & Optional Subjects in `subjects` array
  levelConfig.subjects?.forEach((sub) => {
    const hasScore =
      sub.subCategories && sub.subCategories.length > 0
        ? sub.subCategories.some((sc) => hasValidScore(student.scores?.[sc.id]))
        : hasValidScore(student.scores?.[sub.id]);

    const isOptional = sub.isOptional ?? false;
    const shouldInclude = isOptional
      ? sub.includeInTotal && hasScore
      : sub.includeInTotal ?? true;

    if (shouldInclude) {
      if (!levelConfig.baseMaxScore) {
        maxPossibleScore += sub.maxPoints || 0;
      }

      if (sub.subCategories && sub.subCategories.length > 0) {
        sub.subCategories.forEach((sc) => {
          totalScore += Number(student.scores?.[sc.id]) || 0;
        });
      } else {
        totalScore += Number(student.scores?.[sub.id]) || 0;
      }
    }
  });

  // 2. Process Separate Optional Subjects Array (if present)
  levelConfig.optionalSubjects?.forEach((optSub) => {
    const rawVal = student.scores?.[optSub.id];
    const hasScore = hasValidScore(rawVal);

    if (optSub.includeInTotal && hasScore) {
      totalScore += Number(rawVal);
      if (!levelConfig.baseMaxScore) {
        maxPossibleScore += optSub.maxPoints || 0;
      }
    }
  });

  // 3. Process Co-Curricular Scores & Max Points
  // Check student.coCurricularScores object
  if (student.coCurricularScores) {
    Object.values(student.coCurricularScores).forEach((scoreVal) => {
      totalScore += Number(scoreVal) || 0;
    });
  }

  // Iterate over global co-curricular activities to handle main `scores` map and adjust maxPossibleScore
  const coActivities = globalConfig?.coCurricular?.activities || [];
  coActivities.forEach((act) => {
    const rawVal = student.scores?.[act.id];

    // If score is stored directly inside `student.scores` instead of `coCurricularScores`
    if (!student.coCurricularScores?.[act.id] && hasValidScore(rawVal)) {
      totalScore += Number(rawVal) || 0;
    }

    // ALWAYS add activity max points to maxPossibleScore (if not using baseMaxScore)
    if (!levelConfig.baseMaxScore) {
      maxPossibleScore += act.maxPoints || 0;
    }
  });

  return { totalScore, maxPossibleScore };
}