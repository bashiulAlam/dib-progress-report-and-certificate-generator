"use client";

import React, { useState, useEffect } from "react";
import { createPortal } from "react-dom";
import { AppConfig, ExamSession, StudentScore } from "@/lib/types";
import { calculateStudentTotal } from "@/lib/utils";
import { Printer, X } from "lucide-react";
import { CornerOrnament } from "@/components/CornerOrnament";

interface Props {
    student: StudentScore;
    session: ExamSession;
    config: AppConfig;
    onClose: () => void;
    bulkPrint?: boolean;
}

const translateSubject = (name: string): string => {
    const translations: Record<string, string> = {
        "Class Performance": "Unterrichtsbeteiligung",
        "Co-Curricular Activities": "Außerunterrichtliche Aktivitäten",
    };
    return translations[name] || name;
};

const ReportCardContent = ({ student, session, config, levelConfig, subLevelConfig, totalScore, maxPossibleScore, coCurricularActivities, activeOptionalSubjects }: any) => (
    <>
        {/* Header */}
        <div className="text-center space-y-0.5 mt-1">
            <div className="flex justify-center mb-0.5">
                <img
                    src="/assets/dib-logo.png"
                    alt="Academy Logo"
                    className="h-12 w-auto object-contain"
                />
            </div>
            <h1 className="text-xl font-bold tracking-wider text-[#005C3C] font-sans">
                {config.academyName}
            </h1>
            <h2 className="text-lg font-semibold text-[#E1A929] italic">
                Fortschrittsbericht
            </h2>
            <p className="text-sm font-sans font-semibold text-gray-600">
                {session.term}
            </p>
        </div>

        {/* Student Info */}
        <div className="text-center my-5 space-y-1.5">
            <p className="text-sm italic text-gray-600">
                Dieser Fortschrittsbericht wird feierlich überreicht an
            </p>
            <h3 className="text-xl font-bold text-gray-900 italic underline decoration-[#E1A929] decoration-2 underline-offset-8">
                {student.firstName} {student.familyName}
            </h3>
            <p className="text-sm font-sans text-gray-800 font-medium pt-1">
                Abteilung: <span className="font-bold">{levelConfig?.name || student.level}</span>
                {subLevelConfig && <span> ({subLevelConfig.name})</span>}
            </p>
            {levelConfig?.subjects.some((sub: any) => sub.hasCustomSyllabus && student.syllabi?.[sub.id]) && (
                <div className="pt-0.5">
                    {levelConfig.subjects.map((sub: any) => {
                        if (sub.hasCustomSyllabus && student.syllabi?.[sub.id]) {
                            return (
                                <p key={sub.id} className="text-sm font-sans text-gray-800 italic font-bold">
                                    Lehrplan: {student.syllabi[sub.id]}
                                </p>
                            );
                        }
                    })}
                </div>
            )}
            <p className="text-sm text-gray-500 italic whitespace-nowrap">
                In Anerkennung deiner kontinuierlichen Bemühungen und deines Lernfortschritts.
            </p>
        </div>

        {/* Marks Table */}
        <div className="my-2">
            <table className="w-full border-collapse border border-[#005C3C] text-xs">
                <thead>
                    <tr className="bg-[#F0F8FF] text-[#005C3C]">
                        <th colSpan={2} className="border border-[#005C3C] p-1.5 text-center font-bold text-xs tracking-wider">
                            Fortschrittsübersicht (Gesamt: {maxPossibleScore} Punkte)
                        </th>
                    </tr>
                </thead>
                <tbody>
                    {/* Standard Subjects */}
                    {levelConfig?.subjects.map((sub: any) => {
                        const isGrade = sub.evaluationType === "grade";

                        return (
                            <React.Fragment key={sub.id}>
                                {sub.subCategories && !isGrade ? (
                                    <>
                                        <tr className="bg-[#005C3C]/10 text-[#005C3C]">
                                            <td colSpan={2} className="border border-[#005C3C] px-2.5 py-1 font-sans font-bold tracking-wider text-[10px]">
                                                {translateSubject(sub.name)}
                                            </td>
                                        </tr>
                                        {sub.subCategories.map((subCat: any) => {
                                            const val = student.scores[subCat.id];
                                            const display = val === undefined || val === null ? "n.z." : val;
                                            return (
                                                <tr key={subCat.id} className="hover:bg-gray-50">
                                                    <td className="border border-[#005C3C] px-2.5 py-1 text-[11px] text-gray-800">
                                                        {subCat.name}
                                                    </td>
                                                    <td className="border border-[#005C3C] px-2.5 py-1 text-[11px] text-gray-900 font-bold text-right">
                                                        {display}
                                                    </td>
                                                </tr>
                                            );
                                        })}
                                    </>
                                ) : (
                                    <tr key={sub.id} className={`${isGrade ? "bg-amber-50" : "hover:bg-gray-50"}`}>
                                        <td className="border border-[#005C3C] px-2.5 py-1 text-[11px] text-gray-800">
                                            {translateSubject(sub.name)}
                                        </td>
                                        <td className="border border-[#005C3C] px-2.5 py-1 text-[11px] text-gray-900 font-bold text-right">
                                            {student.scores[sub.id] ?? "n.z."}
                                        </td>
                                    </tr>
                                )}
                            </React.Fragment>
                        );
                    })}

                    {/* Optional Subjects */}
                    {activeOptionalSubjects.length > 0 && (
                        <>
                            <tr className="bg-blue-50 text-blue-900">
                                <td colSpan={2} className="border border-[#005C3C] px-2.5 py-1 font-sans font-bold tracking-wider text-[10px]">
                                    Wahlpflichtfächer
                                </td>
                            </tr>
                            {activeOptionalSubjects.map((opt: any) => {
                                const val = student.scores[opt.id];
                                const display = val === undefined || val === null ? "n.z." : val;
                                return (
                                    <tr key={opt.id}>
                                        <td className="border border-[#005C3C] px-2.5 py-1 text-[11px] text-gray-800">
                                            {opt.name}
                                        </td>
                                        <td className="border border-[#005C3C] px-2.5 py-1 text-[11px] text-gray-900 font-bold text-right">
                                            {display}
                                        </td>
                                    </tr>
                                );
                            })}
                        </>
                    )}

                    {/* Co-Curricular Activities */}
                    {coCurricularActivities.length > 0 && (
                        <>
                            <tr className="bg-blue-50 text-blue-900">
                                <td colSpan={2} className="border border-[#005C3C] px-2.5 py-1 font-sans font-bold tracking-wider text-[10px]">
                                    {translateSubject("Co-Curricular Activities")}
                                </td>
                            </tr>
                            {coCurricularActivities.map((act: any) => {
                                const val = student.scores[act.id];
                                const display = val === undefined || val === null ? "n.z." : val;
                                return (
                                    <tr key={act.id}>
                                        <td className="border border-[#005C3C] px-2.5 py-1 text-[11px] text-gray-800">
                                            {act.name}
                                        </td>
                                        <td className="border border-[#005C3C] px-2.5 py-1 text-[11px] text-gray-900 font-bold text-right">
                                            {display}
                                        </td>
                                    </tr>
                                );
                            })}
                        </>
                    )}

                    {/* Total Row */}
                    <tr className="bg-[#005C3C]/20">
                        <td className="border border-[#005C3C] px-2.5 py-1.5 text-[12px] font-bold text-[#005C3C]">
                            Gesamtpunktzahl
                        </td>
                        <td className="border border-[#005C3C] px-2.5 py-1.5 text-[12px] font-bold text-[#005C3C] text-right">
                            {totalScore} / {maxPossibleScore}
                        </td>
                    </tr>
                </tbody>
            </table>
        </div>

        {/* Signatures Section */}
        <div className="mt-8 flex justify-around text-center">
            <div>
                <div className="h-16 flex items-end justify-center mb-1">
                    <img
                        src="/assets/signature-template-1.png"
                        alt="Teacher Signature"
                        className="max-h-18 object-contain"
                    />
                </div>
                <div className="w-48 mx-auto border-b border-dashed border-gray-400 mb-2"></div>
                <span className="font-bold text-gray-900 text-xs">Unterschrift des Lehrers</span>
            </div>
            <div>
                <div className="h-16 flex items-end justify-center mb-1">
                    <img
                        src="/assets/signature-schulleiter.png"
                        alt="Headmaster Signature"
                        className="max-h-18 object-contain"
                    />
                </div>
                <div className="w-48 mx-auto border-b border-dashed border-gray-400 mb-2"></div>
                <span className="font-bold text-gray-900 text-xs">Unterschrift des Schulleiters</span>
            </div>
        </div>
    </>
);

export default function StudentReportCard({ student, session, config, onClose, bulkPrint = false }: Props) {
    const [mounted, setMounted] = useState(false);

    useEffect(() => {
        setMounted(true);
    }, []);

    const levelConfig = config.levels.find((l) => l.id === student.level);
    const subLevelConfig = levelConfig?.subLevels?.find((sl) => sl.id === student.subLevel);

    const { totalScore, maxPossibleScore } = calculateStudentTotal(student, levelConfig, config);

    student.totalScore = totalScore;
    student.maxPossibleScore = maxPossibleScore;

    const handlePrint = () => {
        const originalTitle = document.title;
        const cleanName = `${student.firstName}_${student.familyName}`.replace(/\s+/g, "_");
        document.title = `${cleanName}_Report_Card`;

        window.print();

        document.title = originalTitle;
    };

    const coCurricularActivities = config.coCurricular?.activities ?? [];
    const optionalSubjects = levelConfig?.optionalSubjects ?? [];

    const activeOptionalSubjects = optionalSubjects.filter(
        (opt) => student.scores[opt.id] !== undefined && student.scores[opt.id] !== null
    );

    const contentProps = {
        student,
        session,
        config,
        levelConfig,
        subLevelConfig,
        totalScore,
        maxPossibleScore,
        coCurricularActivities,
        activeOptionalSubjects,
    };

    // Single Print Mode: Render UI in normal screen tree, and Portal printable sheet directly to body
    if (!bulkPrint) {
        return (
            <>
                {/* --- Screen-only Preview Modal --- */}
                <div className="fixed inset-0 bg-black/70 flex flex-col items-center justify-start z-50 overflow-y-auto p-4 sm:p-6 print:hidden">
                    <div className="bg-white rounded-lg shadow-md p-4 mb-4 max-w-4xl w-full flex justify-between items-center">
                        <div>
                            <h2 className="font-bold text-gray-800">Print Preview</h2>
                            <p className="text-xs text-gray-500">
                                Click "Print / Save PDF" to generate the A4 report card.
                            </p>
                        </div>
                        <div className="flex gap-3">
                            <button
                                onClick={handlePrint}
                                className="flex items-center gap-2 bg-emerald-700 hover:bg-emerald-800 text-white font-medium px-4 py-2 rounded text-sm transition-colors"
                            >
                                <Printer size={16} /> Print / Save PDF
                            </button>
                            <button
                                onClick={onClose}
                                className="flex items-center gap-1 border border-gray-300 hover:bg-gray-100 px-3 py-2 rounded text-sm text-gray-700"
                            >
                                <X size={16} /> Close
                            </button>
                        </div>
                    </div>

                    {/* On-screen Preview Card */}
                    <div className="bg-white w-[210mm] min-h-[297mm] p-10 rounded-sm shadow-xl relative text-gray-900 border-4 border-[#005C3C] flex flex-col font-serif box-border justify-between select-none overflow-hidden">
                        <CornerOrnament className="absolute -top-1 -left-1 w-24 h-24 pointer-events-none z-0" />
                        <CornerOrnament className="absolute -top-1 -right-1 w-24 h-24 pointer-events-none rotate-90 z-0" />
                        <CornerOrnament className="absolute -bottom-1 -left-1 w-24 h-24 pointer-events-none -rotate-90 z-0" />
                        <CornerOrnament className="absolute -bottom-1 -right-1 w-24 h-24 pointer-events-none rotate-180 z-0" />

                        <div className="relative z-10 px-2 flex-1 flex flex-col justify-between pb-2">
                            <ReportCardContent {...contentProps} />
                        </div>
                    </div>
                </div>

                {/* --- Portal Printable Target to document.body (Print Only) --- */}
                {mounted &&
                    createPortal(
                        <div className="hidden print:block print:absolute print:left-0 print:top-0 print:w-full print:bg-white print:z-[99999]">
                            <div className="bg-white w-[210mm] min-h-[297mm] p-10 relative text-gray-900 border-4 border-[#005C3C] flex flex-col font-serif box-border justify-between select-none overflow-hidden mx-auto">
                                <CornerOrnament className="absolute -top-1 -left-1 w-24 h-24 pointer-events-none z-0" />
                                <CornerOrnament className="absolute -top-1 -right-1 w-24 h-24 pointer-events-none rotate-90 z-0" />
                                <CornerOrnament className="absolute -bottom-1 -left-1 w-24 h-24 pointer-events-none -rotate-90 z-0" />
                                <CornerOrnament className="absolute -bottom-1 -right-1 w-24 h-24 pointer-events-none rotate-180 z-0" />

                                <div className="relative z-10 px-2 flex-1 flex flex-col justify-between pb-2">
                                    <ReportCardContent {...contentProps} />
                                </div>
                            </div>
                        </div>,
                        document.body
                    )}
            </>
        );
    }

    // Bulk Print Mode: Direct print sheet (handled by BulkPrintModal portal)
    return (
        <div className="bg-white w-[210mm] min-h-[297mm] p-10 relative text-gray-900 border-4 border-[#005C3C] flex flex-col font-serif box-border justify-between select-none overflow-hidden">
            <CornerOrnament className="absolute -top-1 -left-1 w-24 h-24 pointer-events-none z-0" />
            <CornerOrnament className="absolute -top-1 -right-1 w-24 h-24 pointer-events-none rotate-90 z-0" />
            <CornerOrnament className="absolute -bottom-1 -left-1 w-24 h-24 pointer-events-none -rotate-90 z-0" />
            <CornerOrnament className="absolute -bottom-1 -right-1 w-24 h-24 pointer-events-none rotate-180 z-0" />

            <div className="relative z-10 px-2 flex-1 flex flex-col justify-between pb-2">
                <ReportCardContent {...contentProps} />
            </div>
        </div>
    );
}