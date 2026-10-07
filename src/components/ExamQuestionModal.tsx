"use client";

import { useState, useEffect } from "react";
import { AppConfig, ExamQuestionSheet, QuestionItem, QuestionEvaluationType } from "@/lib/types";
import { X, Printer, Plus, Trash2, HelpCircle, ImagePlus, Upload } from "lucide-react";

interface ExamQuestionModalProps {
    config: AppConfig;
    onClose: () => void;
    onGeneratePrint: (sheet: ExamQuestionSheet) => void;
}

export default function ExamQuestionModal({
    config,
    onClose,
    onGeneratePrint,
}: ExamQuestionModalProps) {
    // Find Noorani level or fallback to the first level matching Noorani
    const nooraniLevel =
        config.levels.find((l) => l.name.toLowerCase().includes("noorani")) ||
        config.levels[0];

    const [term, setTerm] = useState("Semester Final Exam");
    const [selectedSubLevelId, setSelectedSubLevelId] = useState<string>(
        nooraniLevel?.subLevels?.[0]?.id || ""
    );

    // Question Sheet structure: Subject -> Questions
    const [questionsMap, setQuestionsMap] = useState<{
        [subjectId: string]: QuestionItem[];
    }>({});

    // Filter only examineable core subjects (excluding optional, grade-based, class performance, co-curricular)
    const nooraniSubjects =
        nooraniLevel?.subjects.filter((sub) => {
            const isOptional = sub.isOptional;
            const isGradeType = sub.evaluationType === "grade";

            const subName = sub.name.toLowerCase();
            const isClassPerformance = subName.includes("class performance");
            const isCoCurricular = subName.includes("co-curricular") || subName.includes("cocurricular");

            return !isOptional && !isGradeType && !isClassPerformance && !isCoCurricular;
        }) || [];

    useEffect(() => {
        if (nooraniLevel?.subLevels && nooraniLevel.subLevels.length > 0) {
            setSelectedSubLevelId(nooraniLevel.subLevels[0].id);
        }
    }, [nooraniLevel]);

    const handleAddQuestion = (subjectId: string) => {
        const existing = questionsMap[subjectId] || [];
        const newQuestion: QuestionItem = {
            id: `q_${Date.now()}_${Math.random().toString(36).substring(2, 5)}`,
            questionText: "",
            maxPoints: 25,
            questionEvaluationType: "simple",
        };
        setQuestionsMap({
            ...questionsMap,
            [subjectId]: [...existing, newQuestion],
        });
    };

    const handleQuestionChange = (
        subjectId: string,
        qIndex: number,
        field: keyof QuestionItem,
        value: any
    ) => {
        const existing = [...(questionsMap[subjectId] || [])];
        if (!existing[qIndex]) return;

        existing[qIndex] = {
            ...existing[qIndex],
            [field]: value,
        };

        setQuestionsMap({
            ...questionsMap,
            [subjectId]: existing,
        });
    };

    const handleImageUpload = (
        subjectId: string,
        qIndex: number,
        file: File | null
    ) => {
        if (!file) return;
        const reader = new FileReader();
        reader.onload = (e) => {
            handleQuestionChange(subjectId, qIndex, "imageUrl", e.target?.result as string);
        };
        reader.readAsDataURL(file);
    };

    const handleRemoveQuestion = (subjectId: string, qIndex: number) => {
        const existing = [...(questionsMap[subjectId] || [])];
        existing.splice(qIndex, 1);
        setQuestionsMap({
            ...questionsMap,
            [subjectId]: existing,
        });
    };

    const handleGenerate = () => {
        const subjectGroups = nooraniSubjects
            .map((sub) => {
                const questions = questionsMap[sub.id] || [];
                const totalMaxPoints = questions.reduce(
                    (sum, q) => sum + (Number(q.maxPoints) || 0),
                    0
                );

                return {
                    subjectId: sub.id,
                    subjectName: sub.name,
                    totalMaxPoints,
                    questions,
                };
            })
            .filter((group) => group.questions.length > 0);

        if (subjectGroups.length === 0) {
            alert("Please add at least one question to generate the exam sheet.");
            return;
        }

        const printSheet: ExamQuestionSheet = {
            term,
            levelId: nooraniLevel?.id || "",
            subLevelId: selectedSubLevelId,
            subjectGroups,
        };

        onGeneratePrint(printSheet);
    };

    return (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center p-4 z-50 overflow-y-auto">
            <div className="bg-white rounded-lg p-6 max-w-4xl w-full my-8 shadow-xl">
                {/* Modal Header */}
                <div className="flex justify-between items-center border-b pb-3 mb-4">
                    <h2 className="text-xl font-bold text-gray-800 flex items-center gap-2">
                        <HelpCircle className="text-emerald-600" />
                        Create Exam Question Sheet (Noorani Level)
                    </h2>
                    <button
                        onClick={onClose}
                        className="text-gray-400 hover:text-gray-600 rounded-lg p-1"
                    >
                        <X size={20} />
                    </button>
                </div>

                {/* Configuration Inputs */}
                <div className="grid grid-cols-2 gap-4 bg-gray-50 p-4 rounded-md border mb-6">
                    <div>
                        <label className="text-xs font-semibold text-gray-700 block mb-1">
                            Semester / Term Title
                        </label>
                        <input
                            type="text"
                            value={term}
                            onChange={(e) => setTerm(e.target.value)}
                            className="w-full border p-2 rounded text-sm bg-white"
                            placeholder="e.g. Semester 9 - 1. Prüfung 2026"
                        />
                    </div>

                    {nooraniLevel?.subLevels && nooraniLevel.subLevels.length > 0 && (
                        <div>
                            <label className="text-xs font-semibold text-gray-700 block mb-1">
                                Select Sub-Level / Class
                            </label>
                            <select
                                value={selectedSubLevelId}
                                onChange={(e) => setSelectedSubLevelId(e.target.value)}
                                className="w-full border p-2 rounded text-sm bg-white cursor-pointer"
                            >
                                {nooraniLevel.subLevels.map((subLvl) => (
                                    <option key={subLvl.id} value={subLvl.id}>
                                        {subLvl.name}
                                    </option>
                                ))}
                            </select>
                        </div>
                    )}
                </div>

                {/* Question Inputs by Subject */}
                <div className="space-y-6 max-h-[50vh] overflow-y-auto pr-2">
                    {nooraniSubjects.length === 0 ? (
                        <p className="text-center text-gray-500 py-6">
                            No subjects found for Noorani Level.
                        </p>
                    ) : (
                        nooraniSubjects.map((subject) => {
                            const questions = questionsMap[subject.id] || [];

                            return (
                                <div
                                    key={subject.id}
                                    className="border rounded-lg p-4 bg-white shadow-2xs space-y-3"
                                >
                                    <div className="flex justify-between items-center border-b pb-2">
                                        <h3 className="font-bold text-gray-800 text-md">
                                            {subject.name}
                                        </h3>
                                        <button
                                            type="button"
                                            onClick={() => handleAddQuestion(subject.id)}
                                            className="flex items-center gap-1 text-xs font-semibold bg-emerald-50 text-emerald-700 border border-emerald-200 px-2.5 py-1 rounded hover:bg-emerald-100 transition cursor-pointer"
                                        >
                                            <Plus size={14} /> Add Question
                                        </button>
                                    </div>

                                    {questions.length === 0 ? (
                                        <p className="text-xs text-gray-400 italic py-1">
                                            No questions added for this subject yet.
                                        </p>
                                    ) : (
                                        <div className="space-y-4">
                                            {questions.map((q, qIdx) => (
                                                <div
                                                    key={q.id}
                                                    className="bg-gray-50 p-3 rounded-md border space-y-3"
                                                >
                                                    <div className="flex items-center gap-3">
                                                        <span className="text-xs font-bold text-gray-500 w-6">
                                                            Q{qIdx + 1}.
                                                        </span>
                                                        <input
                                                            type="text"
                                                            placeholder="Enter question prompt..."
                                                            value={q.questionText}
                                                            onChange={(e) =>
                                                                handleQuestionChange(
                                                                    subject.id,
                                                                    qIdx,
                                                                    "questionText",
                                                                    e.target.value
                                                                )
                                                            }
                                                            className="flex-1 border p-1.5 rounded text-sm bg-white"
                                                        />
                                                        <div className="flex items-center gap-1">
                                                            <span className="text-xs text-gray-500">
                                                                Max Points:
                                                            </span>
                                                            <input
                                                                type="number"
                                                                min="1"
                                                                value={q.maxPoints}
                                                                onChange={(e) =>
                                                                    handleQuestionChange(
                                                                        subject.id,
                                                                        qIdx,
                                                                        "maxPoints",
                                                                        Number(e.target.value)
                                                                    )
                                                                }
                                                                className="w-16 border p-1.5 rounded text-sm bg-white text-center"
                                                            />
                                                        </div>
                                                        <button
                                                            type="button"
                                                            onClick={() =>
                                                                handleRemoveQuestion(subject.id, qIdx)
                                                            }
                                                            className="text-red-500 hover:text-red-700 p-1 rounded cursor-pointer"
                                                            title="Remove Question"
                                                        >
                                                            <Trash2 size={16} />
                                                        </button>
                                                    </div>

                                                    {/* Evaluation Type & Image Options */}
                                                    <div className="flex items-center justify-between gap-4 pt-1 border-t border-gray-200">
                                                        {/* Evaluation Criteria Selector */}
                                                        <div className="flex items-center gap-2">
                                                            <span className="text-xs font-medium text-gray-600">
                                                                Evaluation Criteria:
                                                            </span>
                                                            <select
                                                                value={q.questionEvaluationType}
                                                                onChange={(e) =>
                                                                    handleQuestionChange(
                                                                        subject.id,
                                                                        qIdx,
                                                                        "questionEvaluationType",
                                                                        e.target.value as QuestionEvaluationType
                                                                    )
                                                                }
                                                                className="border rounded text-xs p-1 bg-white"
                                                            >
                                                                <option value="simple">
                                                                    Simple (Marks & Comments)
                                                                </option>
                                                                <option value="matrix">
                                                                    Matrix (Tajweed / Recitation)
                                                                </option>
                                                            </select>
                                                        </div>

                                                        {/* Image Attachment Input */}
                                                        <div className="flex items-center gap-2">
                                                            {q.imageUrl ? (
                                                                <div className="flex items-center gap-2">
                                                                    <img
                                                                        src={q.imageUrl}
                                                                        alt="Preview"
                                                                        className="h-8 w-8 object-cover rounded border"
                                                                    />
                                                                    <button
                                                                        type="button"
                                                                        onClick={() =>
                                                                            handleQuestionChange(
                                                                                subject.id,
                                                                                qIdx,
                                                                                "imageUrl",
                                                                                undefined
                                                                            )
                                                                        }
                                                                        className="text-xs text-red-600 hover:underline"
                                                                    >
                                                                        Remove Image
                                                                    </button>
                                                                </div>
                                                            ) : (
                                                                <label className="flex items-center gap-1 text-xs text-blue-600 hover:text-blue-800 cursor-pointer">
                                                                    <Upload size={14} /> Attach Image
                                                                    <input
                                                                        type="file"
                                                                        accept="image/*"
                                                                        className="hidden"
                                                                        onChange={(e) =>
                                                                            handleImageUpload(
                                                                                subject.id,
                                                                                qIdx,
                                                                                e.target.files?.[0] || null
                                                                            )
                                                                        }
                                                                    />
                                                                </label>
                                                            )}
                                                        </div>
                                                    </div>
                                                </div>
                                            ))}
                                        </div>
                                    )}
                                </div>
                            );
                        })
                    )}
                </div>

                {/* Modal Actions */}
                <div className="flex justify-end gap-3 border-t pt-4 mt-6">
                    <button
                        type="button"
                        onClick={onClose}
                        className="px-4 py-2 border rounded-md text-sm font-medium text-gray-700 hover:bg-gray-50 cursor-pointer"
                    >
                        Cancel
                    </button>
                    <button
                        type="button"
                        onClick={handleGenerate}
                        className="flex items-center gap-2 bg-emerald-600 hover:bg-emerald-700 text-white font-medium px-5 py-2 rounded-md text-sm shadow-xs cursor-pointer"
                    >
                        <Printer size={16} /> Generate & Print
                    </button>
                </div>
            </div>
        </div>
    );
}