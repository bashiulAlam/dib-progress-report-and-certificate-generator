"use client";

import React, { useState, useEffect } from "react";
import { createPortal } from "react-dom";
import { AppConfig, ExamSession, StudentScore } from "@/lib/types";
import { calculateStudentTotal } from "@/lib/utils";
import { Award, X, Printer, Loader2 } from "lucide-react";
import KidsCertificateCard from "./KidsCertificateCard";
import SpecialAchievementCard, { SpecialCertType } from "./SpecialAchievementCard";

interface CertificateModalProps {
    isOpen: boolean;
    onClose: () => void;
    session: ExamSession;
    config: AppConfig;
}

export default function CertificateModal({
    isOpen,
    onClose,
    session,
    config,
}: CertificateModalProps) {
    const [certCategory, setCertCategory] = useState<"kids" | "extraordinary" | "class_performance">("kids");
    const [selectedLevel, setSelectedLevel] = useState<string>("ALL");
    const [locationAndDate, setLocationAndDate] = useState("Berlin, den 30.08.2026");

    // Filtering Controls
    const [extraordinaryThreshold, setExtraordinaryThreshold] = useState<number>(100);
    const [classPerformanceTarget, setClassPerformanceTarget] = useState<number>(100);

    // Manual Name Mode (For Kids Certs)
    const [useCustomNames, setUseCustomNames] = useState(false);
    const [customNamesInput, setCustomNamesInput] = useState("");

    const [isProcessing, setIsProcessing] = useState(false);
    const [printableItems, setPrintableItems] = useState<Array<{ name: string; classNameStr: string }>>([]);
    const [mounted, setMounted] = useState(false);

    useEffect(() => {
        setMounted(true);
    }, []);

    if (!isOpen) return null;

    // Filter students based on category selections
    const getFilteredTargetStudents = () => {
        const rawStudents = session.students || [];

        return rawStudents.filter((std) => {
            // Level Filter
            if (selectedLevel !== "ALL" && std.level !== selectedLevel) return false;

            const levelConfig = config.levels.find((l) => l.id === std.level);

            // Category 1: Extraordinary Result
            if (certCategory === "extraordinary") {
                const studentPercent =
                    std.academicPercent ??
                    (std.maxPossibleScore
                        ? Math.round((std.totalScore / std.maxPossibleScore) * 100)
                        : 0);

                return studentPercent >= extraordinaryThreshold;
            }

            // Category 2: Class Performance Result
            if (certCategory === "class_performance") {
                const classPerfPercent =
                    std.classPerformancePercent ??
                    Number(std.scores?.["class_performance"] ?? std.scores?.["classPerformance"] ?? 0);

                return classPerfPercent >= classPerformanceTarget;
            }

            return true;
        });
    };

    const getTargetItems = (): Array<{ name: string; classNameStr: string }> => {
        if (certCategory === "kids" && useCustomNames) {
            return customNamesInput
                .split("\n")
                .map((n) => n.trim())
                .filter((n) => n.length > 0)
                .map((name) => ({ name, classNameStr: "" }));
        }

        const filtered = getFilteredTargetStudents();
        return filtered.map((std) => {
            const levelConfig = config.levels.find((l) => l.id === std.level);
            const subLevelConfig = levelConfig?.subLevels?.find((sl) => sl.id === std.subLevel);
            const classNameStr = levelConfig
                ? `${levelConfig.name}${subLevelConfig ? ` (${subLevelConfig.name})` : ""}`
                : std.level;

            return {
                name: `${std.firstName} ${std.familyName}`,
                classNameStr,
            };
        });
    };

    const activeItems = getTargetItems();

    const handleGenerateAndPrint = () => {
        if (activeItems.length === 0) return;

        setIsProcessing(true);
        setPrintableItems(activeItems);

        const originalTitle = document.title;
        document.title = `Certificates_${certCategory}_${activeItems.length}_Students`;

        requestAnimationFrame(() => {
            requestAnimationFrame(() => {
                setTimeout(() => {
                    window.print();
                    document.title = originalTitle;
                    setIsProcessing(false);
                }, 400);
            });
        });
    };

    return (
        <>
            {/* --- UI Configuration Modal --- */}
            <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4 print:hidden">
                <div className="w-full max-w-lg rounded-lg bg-white p-6 shadow-xl border border-gray-200">
                    <div className="flex items-center justify-between border-b pb-3 mb-4">
                        <div className="flex items-center gap-2 text-gray-900 font-bold text-lg">
                            <Award className="h-5 w-5 text-amber-600" />
                            <span>Generate Certificates</span>
                        </div>
                        <button
                            onClick={onClose}
                            disabled={isProcessing}
                            className="text-gray-400 hover:text-gray-600 disabled:opacity-50"
                        >
                            <X className="h-5 w-5" />
                        </button>
                    </div>

                    <div className="space-y-4">
                        {/* Certificate Type Picker */}
                        <div>
                            <label className="block text-xs font-semibold text-gray-700 mb-1">
                                Certificate Category
                            </label>
                            <select
                                value={certCategory}
                                onChange={(e) => setCertCategory(e.target.value as any)}
                                className="w-full border rounded p-2 text-sm bg-white"
                            >
                                <option value="kids">Kinder Zertifikat (Kids Certificate)</option>
                                <option value="extraordinary">Extraordinary Result (Hervorragende Prüfungsergebnisse)</option>
                                <option value="class_performance">Class Performance (Vorbildliche Leistungen)</option>
                            </select>
                        </div>

                        {/* Common: Ort und Datum */}
                        <div>
                            <label className="block text-xs font-semibold text-gray-700 mb-1">
                                Ort und Datum (Place & Date)
                            </label>
                            <input
                                type="text"
                                value={locationAndDate}
                                onChange={(e) => setLocationAndDate(e.target.value)}
                                placeholder="e.g. Berlin, den 30.08.2026"
                                className="w-full border rounded p-2 text-sm bg-white"
                            />
                        </div>

                        {/* Class Level Selector */}
                        <div>
                            <label className="block text-xs font-semibold text-gray-700 mb-1">
                                Filter Class Level
                            </label>
                            <select
                                value={selectedLevel}
                                onChange={(e) => setSelectedLevel(e.target.value)}
                                className="w-full border rounded p-2 text-sm bg-white"
                            >
                                <option value="ALL">All Levels ({session.students?.length || 0} students)</option>
                                {config.levels.map((lvl) => (
                                    <option key={lvl.id} value={lvl.id}>
                                        {lvl.name}
                                    </option>
                                ))}
                            </select>
                        </div>

                        {/* Dynamic Controls based on Category */}
                        {certCategory === "extraordinary" && (
                            <div className="bg-emerald-50 p-3 rounded border border-emerald-200 space-y-2">
                                <label className="block text-xs font-semibold text-emerald-900">
                                    Minimum Score Percentage Threshold (%)
                                </label>
                                <div className="flex items-center gap-3">
                                    <input
                                        type="number"
                                        min="1"
                                        max="100"
                                        value={extraordinaryThreshold}
                                        onChange={(e) => setExtraordinaryThreshold(Number(e.target.value))}
                                        className="w-24 border rounded p-1.5 text-sm bg-white font-bold"
                                    />
                                    <span className="text-xs text-emerald-800">
                                        Includes students achieving <strong>≥ {extraordinaryThreshold}%</strong> total overall score.
                                    </span>
                                </div>
                            </div>
                        )}

                        {certCategory === "class_performance" && (
                            <div className="bg-blue-50 p-3 rounded border border-blue-200 space-y-2">
                                <label className="block text-xs font-semibold text-blue-900">
                                    Class Performance Obtained Score Target
                                </label>
                                <div className="flex items-center gap-3">
                                    <input
                                        type="number"
                                        min="0"
                                        max="100"
                                        value={classPerformanceTarget}
                                        onChange={(e) => setClassPerformanceTarget(Number(e.target.value))}
                                        className="w-24 border rounded p-1.5 text-sm bg-white font-bold"
                                    />
                                    <span className="text-xs text-blue-800">
                                        Includes students with Class Performance score <strong>≥ {classPerformanceTarget}</strong> points.
                                    </span>
                                </div>
                            </div>
                        )}

                        {/* Custom Name List option for Kids Certificate */}
                        {certCategory === "kids" && (
                            <div className="space-y-2">
                                <div className="flex items-center gap-4">
                                    <label className="flex items-center gap-2 text-xs font-medium text-gray-700 cursor-pointer">
                                        <input
                                            type="radio"
                                            name="source"
                                            checked={!useCustomNames}
                                            onChange={() => setUseCustomNames(false)}
                                        />
                                        From Current Session
                                    </label>
                                    <label className="flex items-center gap-2 text-xs font-medium text-gray-700 cursor-pointer">
                                        <input
                                            type="radio"
                                            name="source"
                                            checked={useCustomNames}
                                            onChange={() => setUseCustomNames(true)}
                                        />
                                        Custom Name List
                                    </label>
                                </div>

                                {useCustomNames && (
                                    <textarea
                                        rows={3}
                                        value={customNamesInput}
                                        onChange={(e) => setCustomNamesInput(e.target.value)}
                                        placeholder="Enter student names (one per line)..."
                                        className="w-full border rounded p-2 text-sm font-mono bg-white"
                                    />
                                )}
                            </div>
                        )}

                        {/* Target Count Box */}
                        <div className="text-sm text-gray-700 font-medium flex justify-between items-center bg-amber-50 p-2.5 rounded border border-amber-200">
                            <span>Matching Certificates:</span>
                            <span className="font-bold text-amber-700">{activeItems.length}</span>
                        </div>

                        {/* Action Buttons */}
                        <div className="flex justify-end gap-3 pt-2">
                            <button
                                type="button"
                                onClick={onClose}
                                disabled={isProcessing}
                                className="rounded-md border px-4 py-2 text-sm font-medium text-gray-700 hover:bg-gray-50 disabled:opacity-50"
                            >
                                Cancel
                            </button>
                            <button
                                type="button"
                                disabled={activeItems.length === 0 || isProcessing}
                                onClick={handleGenerateAndPrint}
                                className="flex items-center gap-2 rounded-md bg-amber-600 px-4 py-2 text-sm font-medium text-white hover:bg-amber-700 disabled:opacity-50"
                            >
                                {isProcessing ? (
                                    <>
                                        <Loader2 className="h-4 w-4 animate-spin" /> Preparing...
                                    </>
                                ) : (
                                    <>
                                        <Printer size={16} /> Generate & Print Bulk
                                    </>
                                )}
                            </button>
                        </div>
                    </div>
                </div>
            </div>

            {/* --- Printable Portal Container --- */}
            {mounted &&
                printableItems.length > 0 &&
                createPortal(
                    <div className="hidden print:block print:absolute print:left-0 print:top-0 print:w-full print:bg-white print:z-[99999]">
                        <style>{`
              @media print {
                @page {
                  size: A4 landscape;
                  margin: 0;
                }
              }
            `}</style>
                        {printableItems.map((item, idx) => (
                            <div key={idx} className="break-after-page page-break-after-always">
                                {certCategory === "kids" ? (
                                    <KidsCertificateCard
                                        studentName={item.name}
                                        locationAndDate={locationAndDate}
                                    />
                                ) : (
                                    <SpecialAchievementCard
                                        studentName={item.name}
                                        classNameStr={item.classNameStr}
                                        termPeriod={session.term}
                                        locationAndDate={locationAndDate}
                                        certType={certCategory as SpecialCertType}
                                    />
                                )}
                            </div>
                        ))}
                    </div>,
                    document.body
                )}
        </>
    );
}