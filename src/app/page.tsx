"use client";

import { useEffect, useState } from "react";
import { AppConfig, ExamSession, StudentScore } from "@/lib/types";
import { Eye, Save, FolderOpen, UserPlus, Settings, Trash2, Edit3, Check, FileText, X, Plus, AlertTriangle } from "lucide-react";
import StudentReportCard from "@/components/StudentReportCard";
import { calculateStudentTotal } from "@/lib/utils";

const DRAFT_STORAGE_KEY = "progress_report_unsaved_session";
const ACTIVE_FILE_KEY = "progress_report_active_file";

export default function HomeSPA() {
  const [config, setConfig] = useState<AppConfig | null>(null);
  const [savedFiles, setSavedFiles] = useState<string[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedPrintStudent, setSelectedPrintStudent] = useState<StudentScore | null>(null);

  const [activeFileName, setActiveFileName] = useState<string>(() => {
    if (typeof window !== "undefined") {
      return localStorage.getItem(ACTIVE_FILE_KEY) || "";
    }
    return "";
  });

  const [session, setSession] = useState<ExamSession>(() => {
    if (typeof window !== "undefined") {
      const saved = localStorage.getItem(DRAFT_STORAGE_KEY);
      if (saved) {
        try {
          const parsed = JSON.parse(saved);
          return {
            term: parsed?.term || "",
            date: parsed?.date || new Date().toISOString().split("T")[0],
            students: Array.isArray(parsed?.students) ? parsed.students : [],
          };
        } catch (e) {
          console.error("Failed to parse unsaved draft", e);
        }
      }
    }
    return {
      term: "",
      date: new Date().toISOString().split("T")[0],
      students: [],
    };
  });

  // UI Modals & Form States
  const [showLoadModal, setShowLoadModal] = useState(false);
  const [activeEditIndex, setActiveEditIndex] = useState<number | null>(null);
  const [isNewStudent, setIsNewStudent] = useState(false);
  
  // State for delete confirmation modal
  const [studentToDeleteIndex, setStudentToDeleteIndex] = useState<number | null>(null);

  // Filter states for table list & default creation
  const [selectedLevelId, setSelectedLevelId] = useState<string>("ALL");
  const [selectedSubLevelId, setSelectedSubLevelId] = useState<string>("ALL");
  const [validationError, setValidationError] = useState<string | null>(null);

  useEffect(() => {
    Promise.all([
      fetch("/api/config").then((res) => (res.ok ? res.json() : null)),
      fetch("/api/drafts").then((res) => (res.ok ? res.json() : [])),
    ])
      .then(([configData, draftsData]) => {
        if (configData) {
          setConfig(configData);
        }
        if (Array.isArray(draftsData)) {
          setSavedFiles(draftsData);
        }
        setLoading(false);
      })
      .catch((err) => {
        console.error("Failed loading initial app data:", err);
        setLoading(false);
      });
  }, []);

  // Sync state to local storage
  useEffect(() => {
    if (!loading && typeof window !== "undefined") {
      localStorage.setItem(DRAFT_STORAGE_KEY, JSON.stringify(session));
      if (activeFileName) {
        localStorage.setItem(ACTIVE_FILE_KEY, activeFileName);
      } else {
        localStorage.removeItem(ACTIVE_FILE_KEY);
      }
    }
  }, [session, activeFileName, loading]);

  const handleLevelFilterChange = (levelId: string) => {
    setSelectedLevelId(levelId);
    setSelectedSubLevelId("ALL");
  };

  const getFileNameFromTerm = (termName: string) => {
    const cleanTerm = termName.trim().replace(/[/\\?%*:|"<>]/g, "-");
    if (!cleanTerm) return "";
    return cleanTerm.endsWith(".json") ? cleanTerm : `${cleanTerm}.json`;
  };

  const handleManualSave = async () => {
    const targetFileName = getFileNameFromTerm(session.term);
    if (!targetFileName) {
      alert("Please enter a Session Term name (e.g., Term 1 - 2026) before saving.");
      return;
    }
    await saveSessionToFile(session, targetFileName);
  };

  const saveSessionToFile = async (dataToSave: ExamSession, targetFileName: string) => {
    if (!targetFileName) return;

    try {
      const res = await fetch("/api/drafts", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          filename: targetFileName,
          data: dataToSave,
        }),
      });

      if (res.ok) {
        const result = await res.json();
        const savedName = result.filename || targetFileName;
        setActiveFileName(savedName);

        const updatedDrafts = await fetch("/api/drafts").then((r) => (r.ok ? r.json() : []));
        if (Array.isArray(updatedDrafts)) setSavedFiles(updatedDrafts);
      }
    } catch (error) {
      console.error("Failed to save JSON:", error);
    }
  };

  const handleDeleteFile = async (fileToDelete: string) => {
    if (!confirm(`Are you sure you want to delete "${fileToDelete}" permanently?`)) return;

    try {
      const res = await fetch(`/api/drafts?file=${fileToDelete}`, {
        method: "DELETE",
      });

      if (res.ok) {
        setSavedFiles((prev) => prev.filter((f) => f !== fileToDelete));

        if (activeFileName === fileToDelete) {
          setActiveFileName("");
          localStorage.removeItem(ACTIVE_FILE_KEY);
          setSession({
            term: "",
            date: new Date().toISOString().split("T")[0],
            students: [],
          });
          localStorage.removeItem(DRAFT_STORAGE_KEY);
        }
      } else {
        alert("Failed to delete file.");
      }
    } catch (err) {
      console.error("Failed to delete file:", err);
    }
  };

  const confirmDeleteStudent = async () => {
    if (studentToDeleteIndex === null) return;

    const currentStudents = Array.isArray(session?.students) ? session.students : [];
    const updated = currentStudents.filter((_, i) => i !== studentToDeleteIndex);
    const updatedSession = { ...session, students: updated };
    
    setSession(updatedSession);
    
    const currentFileName = getFileNameFromTerm(session.term);
    if (currentFileName) {
      await saveSessionToFile(updatedSession, currentFileName);
    }

    setStudentToDeleteIndex(null);
  };

  const openNewStudentModal = () => {
    if (!config || config.levels.length === 0) return;

    const initialLevelId = selectedLevelId !== "ALL" ? selectedLevelId : config.levels[0].id;
    const levelConfig = config.levels.find((l) => l.id === initialLevelId);

    let initialSubLevelId: string | undefined = undefined;
    if (levelConfig?.subLevels && levelConfig.subLevels.length > 0) {
      initialSubLevelId = selectedSubLevelId !== "ALL" ? selectedSubLevelId : levelConfig.subLevels[0].id;
    }

    const newStudent: StudentScore = {
      studentId: `std_${Date.now()}`,
      firstName: "",
      familyName: "",
      level: initialLevelId,
      subLevel: initialSubLevelId,
      scores: {},
      syllabi: {},
      totalScore: 0,
      maxPossibleScore: 0,
    };

    const currentStudents = Array.isArray(session?.students) ? session.students : [];
    setSession((prev) => ({ ...prev, students: [...currentStudents, newStudent] }));
    setActiveEditIndex(currentStudents.length);
    setIsNewStudent(true);
    setValidationError(null);
  };

  const handleScoreChange = (fieldId: string, value: string, isGradeType = false) => {
    if (activeEditIndex === null || !config || !session?.students) return;

    const updatedStudents = [...session.students];
    const student = { ...updatedStudents[activeEditIndex] };
    const updatedScores = { ...student.scores };

    const trimmed = value.trim();

    if (trimmed === "") {
      delete updatedScores[fieldId];
    } else if (isGradeType) {
      updatedScores[fieldId] = trimmed;
    } else {
      const num = Number(trimmed);
      if (!isNaN(num)) {
        updatedScores[fieldId] = num;
      } else {
        delete updatedScores[fieldId];
      }
    }

    student.scores = updatedScores;
    const levelConfig = config.levels.find((l) => l.id === student.level);

    const { totalScore, maxPossibleScore } = calculateStudentTotal(student, levelConfig, config);

    student.totalScore = totalScore;
    student.maxPossibleScore = maxPossibleScore;

    updatedStudents[activeEditIndex] = student;
    setSession({ ...session, students: updatedStudents });
  };

  const handleSyllabusChange = (subjectId: string, value: string) => {
    if (activeEditIndex === null || !session?.students) return;

    const updatedStudents = [...session.students];
    const student = { ...updatedStudents[activeEditIndex] };
    const updatedSyllabi = { ...(student.syllabi || {}) };

    if (value.trim() === "") {
      delete updatedSyllabi[subjectId];
    } else {
      updatedSyllabi[subjectId] = value;
    }

    student.syllabi = updatedSyllabi;
    updatedStudents[activeEditIndex] = student;
    setSession({ ...session, students: updatedStudents });
  };

  const validateAndSaveEntry = async (addAnother = false) => {
    if (activeEditIndex === null || !config || !session?.students) return false;
    const student = session.students[activeEditIndex];
    const levelConfig = config.levels.find((l) => l.id === student.level);

    if (!student.firstName.trim() || !student.familyName.trim()) {
      setValidationError("First and family names are required.");
      return false;
    }

    if (levelConfig) {
      for (const sub of levelConfig.subjects) {
        if (sub.subCategories && sub.evaluationType !== "grade") {
          for (const subCat of sub.subCategories) {
            const val = student.scores[subCat.id];
            if (val === undefined) {
              setValidationError(`Field '${subCat.name}' in ${sub.name} cannot be empty.`);
              return false;
            }
            if (typeof val === "number" && (val < 0 || val > subCat.maxPoints)) {
              setValidationError(`'${subCat.name}' in ${sub.name} must be between 0 and ${subCat.maxPoints}.`);
              return false;
            }
          }
        } else {
          const val = student.scores[sub.id];
          if (!sub.isOptional && (val === undefined || val === "")) {
            setValidationError(`Mandatory subject '${sub.name}' cannot be empty.`);
            return false;
          }
          if (sub.evaluationType !== "grade" && typeof val === "number" && (val < 0 || (sub.maxPoints && val > sub.maxPoints))) {
            setValidationError(`'${sub.name}' must be between 0 and ${sub.maxPoints}.`);
            return false;
          }
        }
      }
    }

    if (config.coCurricular?.activities) {
      for (const act of config.coCurricular.activities) {
        const val = student.scores[act.id];
        if (typeof val === "number" && (val < 0 || val > act.maxPoints)) {
          setValidationError(`Co-curricular activity '${act.name}' must be between 0 and ${act.maxPoints}.`);
          return false;
        }
      }
    }

    const updatedSession = { ...session };
    setValidationError(null);

    const fileName = getFileNameFromTerm(updatedSession.term);
    if (fileName) {
      await saveSessionToFile(updatedSession, fileName);
    }

    if (addAnother) {
      const newStudent: StudentScore = {
        studentId: `std_${Date.now()}`,
        firstName: "",
        familyName: "",
        level: student.level,
        subLevel: student.subLevel,
        scores: {},
        syllabi: {},
        totalScore: 0,
        maxPossibleScore: 0,
      };
      setSession((prev) => ({ ...prev, students: [...prev.students, newStudent] }));
      setActiveEditIndex(updatedSession.students.length);
      setIsNewStudent(true);
    } else {
      setIsNewStudent(false);
      setActiveEditIndex(null);
    }

    return true;
  };

  const cancelEdit = () => {
    if (activeEditIndex !== null && isNewStudent && session?.students) {
      setSession((prev) => ({
        ...prev,
        students: prev.students.filter((_, i) => i !== activeEditIndex),
      }));
    }
    setIsNewStudent(false);
    setActiveEditIndex(null);
    setValidationError(null);
  };

  if (loading || !config) return <div className="p-8 font-medium">Loading Application...</div>;

  const currentStudents = Array.isArray(session?.students) ? session.students : [];

  const filteredStudents = currentStudents.filter((std) => {
    if (selectedLevelId !== "ALL" && std.level !== selectedLevelId) return false;
    if (selectedSubLevelId !== "ALL" && std.subLevel !== selectedSubLevelId) return false;
    return true;
  });

  const currentStudent =
    activeEditIndex !== null && activeEditIndex < currentStudents.length
      ? currentStudents[activeEditIndex]
      : null;

  const currentLevelConfig = currentStudent
    ? config.levels.find((l) => l.id === currentStudent.level)
    : null;

  const activeLevelFilterConfig = config.levels.find((l) => l.id === selectedLevelId);

  const activeDisplayFile = getFileNameFromTerm(session.term) || activeFileName || "Unsaved";

  const studentPendingDelete =
    studentToDeleteIndex !== null && studentToDeleteIndex < currentStudents.length
      ? currentStudents[studentToDeleteIndex]
      : null;

  return (
    <div className="min-h-screen bg-gray-50 p-8">
      {/* Header Bar */}
      <div className="max-w-7xl mx-auto flex justify-between items-center mb-8 bg-white p-6 rounded-lg border shadow-xs">
        <div className="flex items-center gap-4">
          <img
            src="/assets/dib-logo.png"
            alt="Academy Logo"
            className="h-12 w-auto object-contain"
          />
          <div>
            <h1 className="text-2xl font-bold text-gray-900">{config.academyName}</h1>
            <p className="text-sm text-gray-500">
              Current File: <span className="font-semibold text-blue-600">{activeDisplayFile}</span>
            </p>
          </div>
        </div>

        <div className="flex gap-3">
          <button
            onClick={() => setShowLoadModal(true)}
            className="flex items-center gap-2 border px-4 py-2 rounded hover:bg-gray-50 text-sm"
          >
            <FolderOpen size={16} /> Open Files
          </button>
          <button
            onClick={handleManualSave}
            className="flex items-center gap-2 bg-emerald-700 text-white px-4 py-2 rounded hover:bg-emerald-800 text-sm"
          >
            <Save size={16} /> Save JSON
          </button>
          <button
            type="button"
            onClick={() => {
              window.location.assign("/admin");
            }}
            className="flex items-center gap-2 border px-4 py-2 rounded hover:bg-gray-50 text-sm"
          >
            <Settings size={16} /> Admin Panel
          </button>
        </div>
      </div>

      <div className="max-w-7xl mx-auto space-y-6">
        {/* Controls / Filter Bar */}
        <div className="bg-white p-4 rounded-lg border shadow-xs flex flex-wrap items-center justify-between gap-4">
          <div className="flex gap-4 flex-1">
            <input
              type="text"
              value={session.term || ""}
              onChange={(e) => setSession({ ...session, term: e.target.value })}
              className="border p-2 rounded text-sm w-72"
              placeholder="Session Term (e.g. Term 1 - 2026)"
            />
            <input
              type="date"
              value={session.date || ""}
              onChange={(e) => setSession({ ...session, date: e.target.value })}
              className="border p-2 rounded text-sm"
            />
          </div>

          <div className="flex items-center gap-2">
            <div className="flex items-center gap-2 bg-gray-50 p-1 border rounded">
              <span className="text-xs text-gray-500 px-2 font-medium">Filter:</span>
              <select
                value={selectedLevelId}
                onChange={(e) => handleLevelFilterChange(e.target.value)}
                className="border-none bg-transparent text-sm font-medium focus:ring-0"
              >
                <option value="ALL">All Levels</option>
                {config.levels.map((lvl) => (
                  <option key={lvl.id} value={lvl.id}>
                    {lvl.name}
                  </option>
                ))}
              </select>

              {activeLevelFilterConfig?.subLevels && activeLevelFilterConfig.subLevels.length > 0 && (
                <select
                  value={selectedSubLevelId}
                  onChange={(e) => setSelectedSubLevelId(e.target.value)}
                  className="border-none bg-transparent text-sm font-medium text-blue-900 focus:ring-0"
                >
                  <option value="ALL">All Sub-Levels</option>
                  {activeLevelFilterConfig.subLevels.map((subLvl) => (
                    <option key={subLvl.id} value={subLvl.id}>
                      {subLvl.name}
                    </option>
                  ))}
                </select>
              )}
            </div>

            <button
              onClick={openNewStudentModal}
              className="flex items-center gap-1 bg-blue-600 text-white px-4 py-2 rounded text-sm hover:bg-blue-700 font-medium"
            >
              <UserPlus size={16} /> Add Student Result
            </button>
          </div>
        </div>

        {/* Compact Table View */}
        <div className="bg-white rounded-lg border shadow-xs overflow-hidden">
          <table className="w-full text-left text-sm">
            <thead className="bg-gray-50 border-b text-gray-600">
              <tr>
                <th className="p-4">Student Name</th>
                <th className="p-4">Level</th>
                <th className="p-4">Sub-Level</th>
                <th className="p-4">Score Total</th>
                <th className="p-4 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y">
              {filteredStudents.length === 0 ? (
                <tr>
                  <td colSpan={5} className="p-8 text-center text-gray-500">
                    {currentStudents.length === 0
                      ? 'No results added yet. Enter a Session Term and click "Add Student Result".'
                      : 'No student results match the selected filter criteria.'}
                  </td>
                </tr>
              ) : (
                filteredStudents.map((std) => {
                  const originalIndex = currentStudents.findIndex((s) => s.studentId === std.studentId);
                  const levelObj = config.levels.find((l) => l.id === std.level);
                  const subLevelObj = levelObj?.subLevels?.find((sl) => sl.id === std.subLevel);

                  return (
                    <tr key={std.studentId} className="hover:bg-gray-50">
                      <td className="p-4 font-medium">
                        {std.firstName} {std.familyName}
                      </td>
                      <td className="p-4">{levelObj?.name || "-"}</td>
                      <td className="p-4">
                        {subLevelObj ? (
                          <span className="bg-blue-100 text-blue-800 font-semibold px-2 py-0.5 rounded text-xs">
                            {subLevelObj.name}
                          </span>
                        ) : (
                          <span className="text-gray-400">-</span>
                        )}
                      </td>
                      <td className="p-4 font-bold text-emerald-700">
                        {std.totalScore} / {std.maxPossibleScore}
                      </td>
                      <td className="p-4 text-right space-x-2">
                        <button
                          onClick={() => setSelectedPrintStudent(std)}
                          className="p-1 border rounded hover:bg-blue-50 text-blue-600"
                          title="Preview & Print Report Card"
                        >
                          <Eye size={16} />
                        </button>

                        <button
                          onClick={() => {
                            setActiveEditIndex(originalIndex);
                            setIsNewStudent(false);
                            setValidationError(null);
                          }}
                          className="p-1 border rounded hover:bg-gray-100 text-gray-600"
                        >
                          <Edit3 size={16} />
                        </button>
                        <button
                          onClick={() => setStudentToDeleteIndex(originalIndex)}
                          className="p-1 border rounded hover:bg-red-50 text-red-600"
                          title="Delete Student Result"
                        >
                          <Trash2 size={16} />
                        </button>
                      </td>
                    </tr>
                  );
                })
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Delete Confirmation Modal */}
      {studentToDeleteIndex !== null && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-lg p-6 max-w-md w-full shadow-xl border border-gray-200">
            <div className="flex items-center gap-3 text-red-600 mb-4">
              <div className="rounded-full bg-red-100 p-2">
                <AlertTriangle className="h-6 w-6" />
              </div>
              <h3 className="text-lg font-bold text-gray-900">Schüler löschen</h3>
            </div>

            <p className="text-sm text-gray-600 leading-relaxed mb-6">
              Bist du sicher, dass du das Ergebnis von{" "}
              <span className="font-semibold text-gray-900">
                {studentPendingDelete ? `${studentPendingDelete.firstName} ${studentPendingDelete.familyName}` : "diesen Schüler"}
              </span>{" "}
              löschen möchtest? Diese Aktion kann nicht rückgängig gemacht werden.
            </p>

            <div className="flex justify-end gap-3">
              <button
                onClick={() => setStudentToDeleteIndex(null)}
                className="px-4 py-2 border rounded-md text-sm font-medium text-gray-700 hover:bg-gray-50"
              >
                Abbrechen
              </button>
              <button
                onClick={confirmDeleteStudent}
                className="px-4 py-2 bg-red-600 text-white rounded-md text-sm font-medium hover:bg-red-700"
              >
                Endgültig löschen
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Student Entry Modal */}
      {currentStudent && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center p-4 z-50 overflow-y-auto">
          <div className="bg-white rounded-lg p-6 max-w-3xl w-full space-y-4 my-8">
            <h3 className="text-lg font-bold border-b pb-2">Student Score Entry</h3>

            {validationError && (
              <div className="p-3 bg-red-50 text-red-700 border border-red-200 rounded text-sm">
                {validationError}
              </div>
            )}

            <div className="grid grid-cols-2 gap-4">
              <input
                type="text"
                placeholder="First Name *"
                value={currentStudent.firstName}
                onChange={(e) => {
                  if (activeEditIndex === null) return;
                  const updated = [...currentStudents];
                  updated[activeEditIndex].firstName = e.target.value;
                  setSession({ ...session, students: updated });
                }}
                className="border p-2 rounded text-sm"
              />
              <input
                type="text"
                placeholder="Family Name *"
                value={currentStudent.familyName}
                onChange={(e) => {
                  if (activeEditIndex === null) return;
                  const updated = [...currentStudents];
                  updated[activeEditIndex].familyName = e.target.value;
                  setSession({ ...session, students: updated });
                }}
                className="border p-2 rounded text-sm"
              />
            </div>

            {/* Level and Sub-Level Selectors */}
            <div className="grid grid-cols-2 gap-4 bg-gray-50 p-3 rounded border">
              <div>
                <label className="text-xs font-semibold block text-gray-700 mb-1">Level</label>
                <select
                  value={currentStudent.level}
                  onChange={(e) => {
                    if (activeEditIndex === null) return;
                    const newLevelId = e.target.value;
                    const updatedLevel = config.levels.find((l) => l.id === newLevelId);
                    const updated = [...currentStudents];
                    const student = { ...updated[activeEditIndex] };
                    student.level = newLevelId;
                    student.subLevel = updatedLevel?.subLevels?.length
                      ? updatedLevel.subLevels[0].id
                      : undefined;

                    const { totalScore, maxPossibleScore } = calculateStudentTotal(student, updatedLevel, config);
                    student.totalScore = totalScore;
                    student.maxPossibleScore = maxPossibleScore;

                    updated[activeEditIndex] = student;
                    setSession({ ...session, students: updated });
                  }}
                  className="w-full border p-1.5 rounded text-sm bg-white"
                >
                  {config.levels.map((lvl) => (
                    <option key={lvl.id} value={lvl.id}>
                      {lvl.name}
                    </option>
                  ))}
                </select>
              </div>

              {currentLevelConfig?.subLevels && currentLevelConfig.subLevels.length > 0 && (
                <div>
                  <label className="text-xs font-semibold block text-gray-700 mb-1">Sub-Level</label>
                  <select
                    value={currentStudent.subLevel || ""}
                    onChange={(e) => {
                      if (activeEditIndex === null) return;
                      const updated = [...currentStudents];
                      updated[activeEditIndex].subLevel = e.target.value;
                      setSession({ ...session, students: updated });
                    }}
                    className="w-full border p-1.5 rounded text-sm bg-white font-medium text-blue-900"
                  >
                    {currentLevelConfig.subLevels.map((subLvl) => (
                      <option key={subLvl.id} value={subLvl.id}>
                        {subLvl.name}
                      </option>
                    ))}
                  </select>
                </div>
              )}
            </div>

            {/* Block by Block Subject Section */}
            {currentLevelConfig && (
              <div className="space-y-4 max-h-96 overflow-y-auto pr-1">
                {currentLevelConfig.subjects.map((sub) => {
                  const isGrade = sub.evaluationType === "grade";

                  return (
                    <div key={sub.id} className="border rounded-lg p-3 bg-gray-50/50 space-y-2">
                      <div className="flex items-center justify-between border-b pb-1">
                        <h4 className="font-semibold text-sm text-gray-800">{sub.name}</h4>
                        {isGrade && (
                          <span className="text-[10px] font-bold text-amber-700 bg-amber-50 border border-amber-200 px-1.5 py-0.5 rounded">
                            Grade Evaluation
                          </span>
                        )}
                      </div>

                      {isGrade ? (
                        <div className="bg-white p-2 rounded border max-w-sm">
                          <label className="text-xs font-medium block text-gray-700 mb-1">
                            Select Grade {!sub.isOptional && "*"}
                          </label>
                          <select
                            value={String(currentStudent.scores[sub.id] ?? "")}
                            onChange={(e) => handleScoreChange(sub.id, e.target.value, true)}
                            className="w-full border p-1 rounded text-sm bg-white font-medium"
                          >
                            <option value="">Select Grade...</option>
                            {sub.gradeOptions?.map((grade) => (
                              <option key={grade} value={grade}>
                                {grade}
                              </option>
                            ))}
                          </select>
                        </div>
                      ) : sub.subCategories ? (
                        <div className="grid grid-cols-2 gap-3">
                          {sub.subCategories.map((subCat) => (
                            <div key={subCat.id} className="bg-white p-2 rounded border">
                              <label className="text-xs font-medium block text-gray-700">
                                {subCat.name} (Max {subCat.maxPoints}) *
                              </label>
                              <input
                                type="number"
                                step="0.01"
                                placeholder="Points or n.z."
                                value={currentStudent.scores[subCat.id] ?? ""}
                                onChange={(e) => handleScoreChange(subCat.id, e.target.value)}
                                className="w-full border p-1 rounded mt-1 text-sm"
                              />
                            </div>
                          ))}
                        </div>
                      ) : (
                        <div className="bg-white p-2 rounded border max-w-sm">
                          <label className="text-xs font-medium block text-gray-700">
                            {sub.name} Score (Max {sub.maxPoints}) {!sub.isOptional && "*"}
                          </label>
                          <input
                            type="number"
                            step="0.01"
                            placeholder="Points or n.z."
                            value={currentStudent.scores[sub.id] ?? ""}
                            onChange={(e) => handleScoreChange(sub.id, e.target.value)}
                            className="w-full border p-1 rounded mt-1 text-sm"
                          />
                        </div>
                      )}

                      {/* Custom Syllabus Text Input Field */}
                      {sub.hasCustomSyllabus && (
                        <div className="pt-2 border-t border-gray-200">
                          <label className="text-[10px] font-bold text-gray-500 uppercase tracking-wider block mb-1">
                            Lehrplan / Custom Syllabus
                          </label>
                          <input
                            type="text"
                            placeholder="e.g. Juz 29 - Surah Al-Mulk, Verses 1-15"
                            value={currentStudent.syllabi?.[sub.id] ?? ""}
                            onChange={(e) => handleSyllabusChange(sub.id, e.target.value)}
                            className="w-full border p-1.5 rounded text-xs bg-white"
                          />
                        </div>
                      )}
                    </div>
                  );
                })}

                {/* Co-Curricular Block */}
                {config.coCurricular?.activities && config.coCurricular.activities.length > 0 && (
                  <div className="border border-blue-200 rounded-lg p-3 bg-blue-50/30 space-y-2">
                    <h4 className="font-semibold text-sm text-blue-900 border-b border-blue-200 pb-1">
                      Co-Curricular Activities
                    </h4>
                    <div className="grid grid-cols-2 gap-3">
                      {config.coCurricular.activities.map((act) => (
                        <div key={act.id} className="bg-white p-2 rounded border border-blue-100">
                          <label className="text-xs font-medium block text-blue-950">
                            {act.name} (Max {act.maxPoints})
                          </label>
                          <input
                            type="number"
                            step="0.01"
                            placeholder="Points or n.z."
                            value={currentStudent.scores[act.id] ?? ""}
                            onChange={(e) => handleScoreChange(act.id, e.target.value)}
                            className="w-full border p-1 rounded mt-1 text-sm"
                          />
                        </div>
                      ))}
                    </div>
                  </div>
                )}
              </div>
            )}

            <div className="flex justify-between items-center border-t pt-4">
              <span className="font-bold text-emerald-700 text-lg">
                Total: {currentStudent.totalScore} / {currentStudent.maxPossibleScore}
              </span>

              <div className="flex gap-2">
                <button
                  onClick={cancelEdit}
                  className="px-4 py-2 border rounded text-sm text-red-600 hover:bg-red-50"
                >
                  Cancel
                </button>
                <button
                  onClick={() => validateAndSaveEntry(true)}
                  className="flex items-center gap-1 bg-blue-600 text-white px-4 py-2 rounded text-sm hover:bg-blue-700"
                >
                  <Plus size={16} /> Save & Add Another
                </button>
                <button
                  onClick={() => validateAndSaveEntry(false)}
                  className="flex items-center gap-1 bg-emerald-700 text-white px-4 py-2 rounded text-sm hover:bg-emerald-800"
                >
                  <Check size={16} /> Save Student Result
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Open/Delete Modal */}
      {showLoadModal && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-lg p-6 max-w-md w-full">
            <div className="flex justify-between items-center mb-4 border-b pb-2">
              <h3 className="text-lg font-bold">Saved Session Files</h3>
              <button
                onClick={() => setShowLoadModal(false)}
                className="p-1 text-gray-400 hover:text-gray-700 rounded-lg"
              >
                <X size={18} />
              </button>
            </div>
            <div className="space-y-2 max-h-60 overflow-y-auto mb-4">
              {savedFiles.length === 0 ? (
                <p className="text-center text-sm text-gray-500 py-4">No saved JSON files found.</p>
              ) : (
                savedFiles.map((file) => (
                  <div
                    key={file}
                    className="flex items-center justify-between border rounded hover:bg-blue-50/50 p-2 text-sm"
                  >
                    <button
                      onClick={async () => {
                        const res = await fetch(`/api/drafts?file=${file}`);
                        if (res.ok) {
                          const loadedData = await res.json();
                          setSession({
                            term: loadedData?.term || file.replace(/\.json$/, ""),
                            date: loadedData?.date || new Date().toISOString().split("T")[0],
                            students: Array.isArray(loadedData?.students) ? loadedData.students : [],
                          });
                          setActiveFileName(file);
                        }
                        setShowLoadModal(false);
                      }}
                      className="flex items-center gap-2 text-left flex-1 font-medium text-gray-800 hover:text-blue-600"
                    >
                      <FileText size={16} className="text-blue-600 shrink-0" /> {file}
                    </button>
                    <button
                      onClick={() => handleDeleteFile(file)}
                      className="text-red-500 hover:text-red-700 p-1 hover:bg-red-50 rounded shrink-0"
                      title="Delete File"
                    >
                      <Trash2 size={16} />
                    </button>
                  </div>
                ))
              )}
            </div>
            <button
              onClick={() => setShowLoadModal(false)}
              className="w-full border p-2 rounded text-sm text-gray-600 hover:bg-gray-50"
            >
              Close
            </button>
          </div>
        </div>
      )}

      {selectedPrintStudent && (
        <StudentReportCard
          student={selectedPrintStudent}
          session={session}
          config={config}
          onClose={() => setSelectedPrintStudent(null)}
        />
      )}
    </div>
  );
}