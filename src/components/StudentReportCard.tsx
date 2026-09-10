"use client";

import React from "react";
import { AppConfig, ExamSession, StudentScore } from "@/lib/types";
import { calculateStudentTotal } from "@/lib/utils";
import { Printer, X } from "lucide-react";
import { CornerOrnament } from "@/components/CornerOrnament";

interface Props {
    student: StudentScore;
    session: ExamSession;
    config: AppConfig;
    onClose: () => void;
}

const translateSubject = (name: string): string => {
    const translations: Record<string, string> = {
        "Class Performance": "Unterrichtsbeteiligung",
        "Co-Curricular Activities": "Außerunterrichtliche Aktivitäten",
    };
    return translations[name] || name;
};

export default function StudentReportCard({ student, session, config, onClose }: Props) {
    const levelConfig = config.levels.find((l) => l.id === student.level);
    const subLevelConfig = levelConfig?.subLevels?.find((sl) => sl.id === student.subLevel);

    // Compute live totals (fixes >100% bugs for optional subjects)
    const { totalScore, maxPossibleScore } = calculateStudentTotal(student, levelConfig, config);

    student.totalScore = totalScore;
    student.maxPossibleScore = maxPossibleScore;

    const handlePrint = () => {
        window.print();
    };

    const coCurricularActivities = config.coCurricular?.activities ?? [];
    const optionalSubjects = levelConfig?.optionalSubjects ?? [];

    // Active optional subjects that have a recorded score
    const activeOptionalSubjects = optionalSubjects.filter(
        (opt) => student.scores[opt.id] !== undefined && student.scores[opt.id] !== null
    );

    return (
        <div className="fixed inset-0 bg-black/70 flex flex-col items-center justify-start z-50 overflow-y-auto p-4 sm:p-6 report-modal-overlay">
            {/* Top Controls Bar */}
            <div className="print:hidden bg-white rounded-lg shadow-md p-4 mb-4 max-w-4xl w-full flex justify-between items-center">
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

            {/* A4 Report Sheet Container */}
            <div className="print:m-0 print:p-8 print:shadow-none bg-white w-[210mm] min-h-[297mm] p-10 rounded-sm shadow-xl relative text-gray-900 border-4 border-[#005C3C] flex flex-col font-serif box-border justify-between select-none overflow-hidden">

                {/* Top-Left */}
                <CornerOrnament className="absolute -top-1 -left-1 w-24 h-24 pointer-events-none z-0" />

                {/* Top-Right */}
                <CornerOrnament className="absolute -top-1 -right-1 w-24 h-24 pointer-events-none rotate-90 z-0" />

                {/* Bottom-Left */}
                <CornerOrnament className="absolute -bottom-1 -left-1 w-24 h-24 pointer-events-none -rotate-90 z-0" />

                {/* Bottom-Right */}
                <CornerOrnament className="absolute -bottom-1 -right-1 w-24 h-24 pointer-events-none rotate-180 z-0" />

                {/* Main Content Area */}
                <div className="relative z-10 px-2 flex-1 flex flex-col justify-between pb-2">
                    <div>
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
                                    {levelConfig?.subjects.map((sub) => {
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
                                                        {sub.subCategories.map((subCat, cIdx) => {
                                                            const scoreVal = student.scores[subCat.id];
                                                            return (
                                                                <tr key={subCat.id} className={cIdx % 2 === 0 ? "bg-white" : "bg-gray-50/60"}>
                                                                    <td className="border border-[#005C3C] px-3 py-1 font-sans pl-5 text-[11px]">
                                                                        {subCat.name} ({subCat.maxPoints}P)
                                                                    </td>
                                                                    <td className="border border-[#005C3C] px-2 py-1 text-center font-bold w-20 text-xs">
                                                                        {scoreVal !== undefined ? scoreVal : "-"}
                                                                    </td>
                                                                </tr>
                                                            );
                                                        })}
                                                    </>
                                                ) : (
                                                    <tr className="bg-white">
                                                        <td className="border border-[#005C3C] px-2.5 py-1 font-sans font-medium text-[11px]">
                                                            <div>
                                                                {translateSubject(sub.name)}
                                                                {!isGrade && sub.maxPoints ? ` (${sub.maxPoints}P)` : ""}
                                                            </div>
                                                            {/* Render Custom Syllabus under subject name */}
                                                            {sub.hasCustomSyllabus && student.syllabi?.[sub.id] && (
                                                                <div className="text-[11px] text-emerald-800 italic font-serif leading-tight mt-0.5">
                                                                    Lehrplan: {student.syllabi[sub.id]}
                                                                </div>
                                                            )}
                                                        </td>
                                                        <td className="border border-[#005C3C] px-2 py-1 text-center font-bold w-20 text-xs">
                                                            {student.scores[sub.id] !== undefined && student.scores[sub.id] !== ""
                                                                ? student.scores[sub.id]
                                                                : "-"}
                                                        </td>
                                                    </tr>
                                                )}
                                            </React.Fragment>
                                        );
                                    })}

                                    {/* Optional Subjects Block */}
                                    {activeOptionalSubjects.length > 0 && (
                                        <>
                                            <tr className="bg-[#005C3C]/10 text-[#005C3C]">
                                                <td colSpan={2} className="border border-[#005C3C] px-2.5 py-1 font-sans font-bold tracking-wider text-[10px]">
                                                    Wahlfächer (Optional Subjects)
                                                </td>
                                            </tr>
                                            {activeOptionalSubjects.map((opt, oIdx) => {
                                                const isGrade = opt.evaluationType === "grade";
                                                return (
                                                    <tr key={opt.id} className={oIdx % 2 === 0 ? "bg-white" : "bg-gray-50/60"}>
                                                        <td className="border border-[#005C3C] px-3 py-1 font-sans pl-5 text-[11px]">
                                                            <div>
                                                                {opt.name}
                                                                {!isGrade && opt.maxPoints ? ` (${opt.maxPoints}P)` : ""}
                                                            </div>
                                                            {opt.hasCustomSyllabus && student.syllabi?.[opt.id] && (
                                                                <div className="text-[11px] text-emerald-800 italic font-serif leading-tight mt-0.5">
                                                                    Lehrplan: {student.syllabi[opt.id]}
                                                                </div>
                                                            )}
                                                        </td>
                                                        <td className="border border-[#005C3C] px-2 py-1 text-center font-bold w-20 text-xs">
                                                            {student.scores[opt.id] !== undefined && student.scores[opt.id] !== ""
                                                                ? student.scores[opt.id]
                                                                : "-"}
                                                        </td>
                                                    </tr>
                                                );
                                            })}
                                        </>
                                    )}

                                    {/* Co-Curricular Block */}
                                    {coCurricularActivities.length > 0 && (
                                        <>
                                            <tr className="bg-[#005C3C]/10 text-[#005C3C]">
                                                <td colSpan={2} className="border border-[#005C3C] px-2.5 py-1 font-sans font-bold tracking-wider text-[10px]">
                                                    Außerunterrichtliche Aktivitäten (Co-Curricular)
                                                </td>
                                            </tr>
                                            {coCurricularActivities.map((act, aIdx) => (
                                                <tr key={act.id} className={aIdx % 2 === 0 ? "bg-white" : "bg-gray-50/60"}>
                                                    <td className="border border-[#005C3C] px-3 py-1 font-sans pl-5 text-[11px]">
                                                        {act.name} ({act.maxPoints}P)
                                                    </td>
                                                    <td className="border border-[#005C3C] px-2 py-1 text-center font-bold w-20 text-xs">
                                                        {student.scores[act.id] !== undefined ? student.scores[act.id] : "n.z."}
                                                    </td>
                                                </tr>
                                            ))}
                                        </>
                                    )}

                                    {/* Total Score Row */}
                                    <tr className="bg-[#E4E4E4] font-bold text-xs">
                                        <td className="border border-[#005C3C] px-2.5 py-1.5 font-sans">
                                            Gesamtpunkte
                                        </td>
                                        <td className="border border-[#005C3C] px-2 py-1.5 text-center text-[#005C3C] text-xs">
                                            {totalScore} / {maxPossibleScore}
                                        </td>
                                    </tr>
                                </tbody>
                            </table>
                        </div>

                        {/* Blessing Note */}
                        <div className="text-center my-4 px-6">
                            <p className="text-sm italic text-gray-700 leading-relaxed font-serif">
                                Möge Allah dir den Koran leicht machen und dir Baraka geben, was du gelernt hast,
                                und dir zu einem der Menschen des Korans und der Sunna machen. Ameen
                            </p>
                        </div>
                    </div>

                    {/* Signatures Section */}
                    <div className="mt-4 mb-1 pt-2 grid grid-cols-2 gap-6 text-center text-xs print:mt-4">
                        {/* Teacher Signature */}
                        <div className="flex flex-col items-center justify-end h-20">
                            <div className="h-12 flex items-end justify-center mb-1">
                                <img
                                    src="/assets/signature-template-1.png"
                                    alt="Teacher Signature"
                                    className="max-h-12 object-contain"
                                />
                            </div>
                            <div className="w-48 mx-auto border-b border-dashed border-gray-400 mb-2"></div>
                            <span className="font-bold text-gray-900 text-xs">Unterschrift des Lehrers</span>
                        </div>

                        {/* Headmaster Signature */}
                        <div className="flex flex-col items-center justify-end h-20">
                            <div className="h-12 flex items-end justify-center mb-1">
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
                </div>

            </div>
        </div>
    );
}