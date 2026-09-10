import { AppConfig, StudentScore } from "./types";

export function calculateStudentTotals(
  student: StudentScore,
  config: AppConfig
): StudentScore {
  let totalScore = 0;
  let maxPossibleScore = 0;

  const levelConfig = config.levels.find((l) => l.id === student.level);
  if (!levelConfig) return { ...student, totalScore: 0, maxPossibleScore: 0 };

  // Calculate subject totals
  for (const subject of levelConfig.subjects) {
    if (subject.subCategories) {
      for (const subCat of subject.subCategories) {
        const val = student.scores[subCat.id];
        if (typeof val === "number") {
          totalScore += val;
        }
        maxPossibleScore += subCat.maxPoints;
      }
    } else {
      const val = student.scores[subject.id];
      if (typeof val === "number") {
        totalScore += val;
      }
      if (!subject.isOptional) {
        maxPossibleScore += subject.maxPoints;
      }
    }
  }

  // Calculate co-curricular totals
  if (config.coCurricular?.activities) {
    for (const act of config.coCurricular.activities) {
      const val = student.scores[act.id];
      if (typeof val === "number") {
        totalScore += val;
      }
      maxPossibleScore += act.maxPoints;
    }
  }

  return {
    ...student,
    totalScore,
    maxPossibleScore,
  };
}