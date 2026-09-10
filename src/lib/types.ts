export type EvaluationType = "points" | "grade";

// 1. Base Sub-Structures
export interface SubCategory {
  id: string;
  name: string;
  maxPoints: number;
}

export interface ActivityConfig {
  id: string;
  name: string;
  maxPoints: number;
}

// 2. Subject Configuration
export interface SubjectConfig {
  id: string;
  name: string;
  maxPoints: number;
  subCategories?: SubCategory[];
  isOptional?: boolean;
  includeInTotal?: boolean;
  evaluationType?: EvaluationType;
  gradeOptions?: string[];         // e.g., ["A+", "A", "B", "C", "D", "F"] or ["Sehr Gut", "Gut", "Befriedigend"]
  hasCustomSyllabus?: boolean;
}

// 3. Level Configuration (Defined BEFORE AppConfig)
export interface SubLevelConfig {
  id: string;
  name: string;
}

export interface LevelConfig {
  id: string;
  name: string;
  baseMaxScore?: number;
  subjects: SubjectConfig[];
  optionalSubjects?: SubjectConfig[];
  subLevels?: { id: string; name: string }[];
}

// 4. Co-Curricular Configuration
export interface CoCurricularConfig {
  id: string;
  name: string;
  maxPoints: number;
  includeInTotal?: boolean;
}

// 5. Main Root Application Configuration
export interface AppConfig {
  academyName: string;
  levels: LevelConfig[];
  coCurricular?: {
    activities?: CoCurricularConfig[];
  };
}

// 6. Student Session & Score Types
export interface StudentScore {
  id?: string;
  studentId?: string;
  firstName: string;
  familyName: string;
  level: string;
  subLevel?: string;
  scores: Record<string, number | string>;
  coCurricularScores?: Record<string, number>;
  totalScore: number;
  maxPossibleScore: number;
  syllabi?: Record<string, string>;
}

export interface ExamSession {
  term: string;
  date: string;
  students: StudentScore[];
}