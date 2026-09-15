import { AppConfig, LevelConfig, StudentScore } from "./types";

export function calculateStudentTotal(
  student: StudentScore,
  levelConfig?: LevelConfig | null,
  config?: AppConfig | null
) {
  if (!student || !student.scores) {
    return {
      totalScore: 0,
      maxPossibleScore: 0,
      academicPercent: 0,
      classPerformancePercent: 0,
    };
  }

  // 1. Identify Co-Curricular IDs dynamically
  const coCurricularIds = new Set(
    config?.coCurricular?.activities?.map((act) => act.id) || []
  );

  // 2. Map dynamic Subject & Sub-Category structures from levelConfig
  const academicSubcatMaxMap = new Map<string, number>();
  const classPerfSubcatMaxMap = new Map<string, number>();
  const excludedSubjectIds = new Set<string>();

  if (levelConfig?.subjects) {
    levelConfig.subjects.forEach((subj) => {
      // Check if subject is marked to be excluded from totals
      if (
        subj.includeInTotal === false ||
        (subj as any).excludeFromTotal === true
      ) {
        excludedSubjectIds.add(subj.id);
        if (subj.subCategories) {
          subj.subCategories.forEach((sub) => excludedSubjectIds.add(sub.id));
        }
        return;
      }

      const isClassPerformance =
        subj.name?.trim().toLowerCase() === "class performance" ||
        subj.id === "class_performance" ||
        subj.id === "classPerformance";

      // If subject has sub-categories (e.g., Noorani 4 x 25 = 100 or Class Perf 4 x 25 = 100)
      if (subj.subCategories && subj.subCategories.length > 0) {
        subj.subCategories.forEach((subCat) => {
          const maxPts = subCat.maxPoints || 25;
          if (isClassPerformance) {
            classPerfSubcatMaxMap.set(subCat.id, maxPts);
          } else {
            academicSubcatMaxMap.set(subCat.id, maxPts);
          }
        });
      } else {
        // Direct subjects without sub-categories
        const maxPts = (subj as any).maxPoints ?? (subj as any).maxScore ?? 100;
        if (isClassPerformance) {
          classPerfSubcatMaxMap.set(subj.id, maxPts);
        } else {
          academicSubcatMaxMap.set(subj.id, maxPts);
        }
      }
    });
  }

  // 3. Accumulate scores based on mapped structure
  let totalScore = 0;
  let maxPossibleScore = 0;

  let academicTotal = 0;
  let academicMax = 0;

  let classPerfTotal = 0;
  let classPerfMax = 0;

  Object.entries(student.scores).forEach(([key, val]) => {
    // Skip optional/excluded subjects (e.g., Seerah)
    if (excludedSubjectIds.has(key)) return;

    const scoreNum =
      typeof val === "object" && val !== null
        ? Number((val as any).score ?? 0)
        : Number(val ?? 0);

    if (isNaN(scoreNum)) return; // Skip non-numeric grades ("Sehr Gut")

    // A. Class Performance Sub-categories / Subject
    if (classPerfSubcatMaxMap.has(key)) {
      const maxPts = classPerfSubcatMaxMap.get(key) || 25;
      classPerfTotal += scoreNum;
      classPerfMax += maxPts;

      totalScore += scoreNum;
      maxPossibleScore += maxPts;
    }
    // B. Academic Subjects & Sub-categories
    else if (academicSubcatMaxMap.has(key)) {
      const maxPts = academicSubcatMaxMap.get(key) || 100;
      academicTotal += scoreNum;
      academicMax += maxPts;

      totalScore += scoreNum;
      maxPossibleScore += maxPts;
    }
    // C. Co-Curricular Activities
    else if (coCurricularIds.has(key) || key.startsWith("co_")) {
      totalScore += scoreNum;
      maxPossibleScore += 25; // Standard co-curricular activity max
    }
  });

  const academicPercent =
    academicMax > 0 ? Math.round((academicTotal / academicMax) * 100) : 0;
  const classPerformancePercent =
    classPerfMax > 0 ? Math.round((classPerfTotal / classPerfMax) * 100) : 0;

  return {
    totalScore,
    maxPossibleScore,
    academicPercent,
    classPerformancePercent,
  };
}