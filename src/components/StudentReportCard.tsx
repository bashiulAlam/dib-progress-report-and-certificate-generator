"use client";

import React from "react";
import { AppConfig, ExamSession, StudentScore } from "@/lib/types";
import { calculateStudentTotal } from "@/lib/utils"; // <-- 1. Import helper
import { Printer, X } from "lucide-react";
import { CornerOrnament } from "./CornerOrnament";

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

  // 2. Compute live totals (fixes >100% bugs for optional subjects)
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

      {/* A4 Report Sheet */}
      <div className="print:m-0 print:p-8 print:shadow-none bg-white w-[210mm] min-h-[297mm] p-10 rounded-sm shadow-xl relative text-gray-900 border flex flex-col font-serif box-border justify-between">
        
        <CornerOrnament className="absolute top-5 left-5 w-11 h-11" />
        <CornerOrnament className="absolute top-5 right-5 w-11 h-11 -scale-x-100" />
        <CornerOrnament className="absolute bottom-5 left-5 w-11 h-11 -scale-y-100" />
        <CornerOrnament className="absolute bottom-5 right-5 w-11 h-11 rotate-180" />

        <div className="relative z-10 px-2 flex-1 flex flex-col justify-between">
          <div>
            {/* Header */}
            <div className="text-center space-y-1 mt-1">
              <div className="flex justify-center mb-1">
                <img
                  src="/assets/dib-logo.png"
                  alt="Academy Logo"
                  className="h-16 w-auto object-contain"
                />
              </div>
              <h1 className="text-2xl font-bold tracking-wide text-[#005C3C] uppercase font-sans">
                {config.academyName}
              </h1>
              <h2 className="text-xl font-semibold text-[#E1A929] italic">
                Fortschrittsbericht
              </h2>
              <p className="text-xs font-sans font-medium text-gray-600">
                {session.term || "Semester 2 - 2026"}
              </p>
            </div>

            {/* Student Info */}
            <div className="text-center my-4 space-y-1">
              <p className="text-xs italic text-gray-600">
                Dieser Fortschrittsbericht wird feierlich überreicht an
              </p>
              <h3 className="text-xl font-bold text-gray-900 underline decoration-[#E1A929] decoration-2 underline-offset-4">
                {student.firstName} {student.familyName}
              </h3>
              <p className="text-xs font-sans text-gray-700 font-medium pt-0.5">
                Abteilung: <span className="font-semibold">{levelConfig?.name || student.level}</span>
                {subLevelConfig && <span> ({subLevelConfig.name})</span>}
              </p>
              <p className="text-[11px] text-gray-500 italic">
                In Anerkennung deiner kontinuierlichen Bemühungen und deines Lernfortschritts.
              </p>
            </div>

            {/* Marks Table */}
            <div className="my-3">
              <table className="w-full border-collapse border border-[#005C3C] text-xs">
                <thead>
                  <tr className="bg-[#F0F8FF] text-[#005C3C]">
                    <th colSpan={2} className="border border-[#005C3C] p-2 text-center font-bold text-xs uppercase tracking-wider">
                      {/* 3. Uses corrected maximum possible score */}
                      Fortschrittsübersicht (Gesamt: {maxPossibleScore} Punkte)
                    </th>
                  </tr>
                </thead>
                <tbody>
                  {/* Standard Subjects */}
                  {levelConfig?.subjects.map((sub) => (
                    <React.Fragment key={sub.id}>
                      {sub.subCategories ? (
                        <>
                          <tr className="bg-[#005C3C]/10 text-[#005C3C]">
                            <td colSpan={2} className="border border-[#005C3C] px-3 py-1 font-sans font-bold uppercase tracking-wider text-[11px]">
                              {translateSubject(sub.name)}
                            </td>
                          </tr>
                          {sub.subCategories.map((subCat, cIdx) => {
                            const scoreVal = student.scores[subCat.id];
                            return (
                              <tr key={subCat.id} className={cIdx % 2 === 0 ? "bg-white" : "bg-gray-50/60"}>
                                <td className="border border-[#005C3C] px-4 py-1 font-sans pl-6">
                                  {subCat.name} ({subCat.maxPoints}P)
                                </td>
                                <td className="border border-[#005C3C] px-2 py-1 text-center font-bold w-24">
                                  {scoreVal !== undefined ? scoreVal : "-"}
                                </td>
                              </tr>
                            );
                          })}
                        </>
                      ) : (
                        <tr className="bg-white">
                          <td className="border border-[#005C3C] px-3 py-1 font-sans font-medium">
                            {translateSubject(sub.name)} ({sub.maxPoints}P)
                          </td>
                          <td className="border border-[#005C3C] px-2 py-1 text-center font-bold w-24">
                            {student.scores[sub.id] !== undefined ? student.scores[sub.id] : "-"}
                          </td>
                        </tr>
                      )}
                    </React.Fragment>
                  ))}

                  {/* Optional Subjects Block (Placed at the bottom of standard subjects) */}
                  {activeOptionalSubjects.length > 0 && (
                    <>
                      <tr className="bg-[#005C3C]/10 text-[#005C3C]">
                        <td colSpan={2} className="border border-[#005C3C] px-3 py-1 font-sans font-bold uppercase tracking-wider text-[11px]">
                          Wahlfächer (Optional Subjects)
                        </td>
                      </tr>
                      {activeOptionalSubjects.map((opt, oIdx) => (
                        <tr key={opt.id} className={oIdx % 2 === 0 ? "bg-white" : "bg-gray-50/60"}>
                          <td className="border border-[#005C3C] px-4 py-1 font-sans pl-6">
                            {opt.name} ({opt.maxPoints}P)
                          </td>
                          <td className="border border-[#005C3C] px-2 py-1 text-center font-bold w-24">
                            {student.scores[opt.id] !== undefined ? student.scores[opt.id] : "-"}
                          </td>
                        </tr>
                      ))}
                    </>
                  )}

                  {/* Co-Curricular Block */}
                  {coCurricularActivities.length > 0 && (
                    <>
                      <tr className="bg-[#005C3C]/10 text-[#005C3C]">
                        <td colSpan={2} className="border border-[#005C3C] px-3 py-1 font-sans font-bold uppercase tracking-wider text-[11px]">
                          Außerunterrichtliche Aktivitäten (Co-Curricular)
                        </td>
                      </tr>
                      {coCurricularActivities.map((act, aIdx) => (
                        <tr key={act.id} className={aIdx % 2 === 0 ? "bg-white" : "bg-gray-50/60"}>
                          <td className="border border-[#005C3C] px-4 py-1 font-sans pl-6">
                            {act.name} ({act.maxPoints}P)
                          </td>
                          <td className="border border-[#005C3C] px-2 py-1 text-center font-bold w-24">
                            {student.scores[act.id] !== undefined ? student.scores[act.id] : "-"}
                          </td>
                        </tr>
                      ))}
                    </>
                  )}

                  {/* Total Score Row */}
                  <tr className="bg-[#E4E4E4] font-bold text-xs">
                    <td className="border border-[#005C3C] px-3 py-1.5 font-sans">
                      Gesamtpunkte
                    </td>
                    <td className="border border-[#005C3C] px-2 py-1.5 text-center text-[#005C3C]">
                      {/* 4. Uses calculated live total */}
                      {totalScore}
                    </td>
                  </tr>
                </tbody>
              </table>
            </div>

            {/* Blessing Note */}
            <div className="text-center my-4 px-6">
              <p className="text-xs italic text-gray-700 leading-relaxed">
                Möge Allah dir den Koran leicht machen und dir Baraka geben, was du gelernt hast, 
                und dir zu einem der Menschen des Korans und der Sunna machen. Ameen
              </p>
            </div>
          </div>

          {/* Signatures */}
          <div className="grid grid-cols-2 gap-8 px-6 pt-4 pb-2 text-center font-sans">
            <div className="flex flex-col items-center">
              <div className="h-12 flex items-end justify-center mb-1">
                <img
                  src="/assets/signature-template-1.png"
                  alt="Unterschrift des Lehrers"
                  className="max-h-12 w-auto object-contain"
                />
              </div>
              <div className="w-3/4 border-b border-gray-400 mb-1"></div>
              <p className="text-[11px] font-bold text-gray-700">Unterschrift des Lehrers</p>
            </div>

            <div className="flex flex-col items-center">
              <div className="h-12 flex items-end justify-center mb-1">
                <img
                  src="/assets/signature-template-2.png"
                  alt="Unterschrift des Schulleiters"
                  className="max-h-12 w-auto object-contain"
                />
              </div>
              <div className="w-3/4 border-b border-gray-400 mb-1"></div>
              <p className="text-[11px] font-bold text-gray-700">Unterschrift des Schulleiters</p>
            </div>
          </div>
        </div>

      </div>
    </div>
  );
}