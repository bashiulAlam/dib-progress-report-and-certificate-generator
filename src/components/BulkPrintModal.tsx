"use client";

import React, { useState, useEffect } from "react";
import { createPortal } from "react-dom";
import { AppConfig, ExamSession, StudentScore } from "@/lib/types";
import { Printer, X, Loader2 } from "lucide-react";
import StudentReportCard from "@/components/StudentReportCard";

interface BulkPrintModalProps {
  isOpen: boolean;
  onClose: () => void;
  session: ExamSession;
  config: AppConfig;
  defaultLevelId: string;
  defaultSubLevelId: string;
}

export default function BulkPrintModal({
  isOpen,
  onClose,
  session,
  config,
  defaultLevelId,
  defaultSubLevelId,
}: BulkPrintModalProps) {
  const [selectedLevel, setSelectedLevel] = useState(defaultLevelId);
  const [selectedSubLevel, setSelectedSubLevel] = useState(defaultSubLevelId);

  // Progress & Print States
  const [isProcessing, setIsProcessing] = useState(false);
  const [progress, setProgress] = useState(0);
  const [statusMessage, setStatusMessage] = useState("");
  const [printableStudents, setPrintableStudents] = useState<StudentScore[]>([]);
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  // Sync modal filters with main screen defaults when opened
  useEffect(() => {
    if (isOpen) {
      setSelectedLevel(defaultLevelId);
      setSelectedSubLevel(defaultSubLevelId);
      setIsProcessing(false);
      setProgress(0);
      setPrintableStudents([]);
    }
  }, [isOpen, defaultLevelId, defaultSubLevelId]);

  if (!isOpen) return null;

  const activeLevelConfig = config.levels.find((l) => l.id === selectedLevel);

  // Filter students based on modal selections
  const matchingStudents = (session.students || []).filter((std) => {
    if (selectedLevel !== "ALL" && std.level !== selectedLevel) return false;
    if (selectedSubLevel !== "ALL" && std.subLevel !== selectedSubLevel) return false;
    return true;
  });

  const handleLevelChange = (levelId: string) => {
    setSelectedLevel(levelId);
    setSelectedSubLevel("ALL");
  };

  const handleGenerateAndPrint = () => {
    if (matchingStudents.length === 0) return;

    setIsProcessing(true);
    setProgress(20);
    setStatusMessage(`Preparing ${matchingStudents.length} report cards...`);

    // Stage 1: Pass matching students to component state
    setPrintableStudents(matchingStudents);

    // Stage 2: Set window document title for clean PDF filenames
    const cleanTerm = (session.term || "Report").replace(/[/\\?%*:|"<>]/g, "-");
    const levelName = activeLevelConfig ? activeLevelConfig.name.replace(/\s+/g, "_") : "All_Levels";
    const originalTitle = document.title;
    document.title = `${cleanTerm}_${levelName}_Report_Cards`;

    // Stage 3: Double frame delay to guarantee full React Portal render before opening print dialog
    requestAnimationFrame(() => {
      setProgress(60);
      setStatusMessage("Formatting multi-page print layout...");

      requestAnimationFrame(() => {
        setTimeout(() => {
          setProgress(100);
          setStatusMessage("Opening print window...");
          window.print();

          // Restore original title and reset processing state.
          // Do not auto-dismiss the modal here: it should remain open until the user explicitly closes it.
          document.title = originalTitle;
          setIsProcessing(false);
        }, 400);
      });
    });
  };

  return (
    <>
      {/* --- UI Filter & Progress Modal (Screen Only) --- */}
      <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4 print:hidden">
        <div className="w-full max-w-md rounded-lg bg-white p-6 shadow-xl border border-gray-200">
          <div className="flex items-center justify-between border-b pb-3 mb-4">
            <div className="flex items-center gap-2 text-gray-900 font-bold text-lg">
              <Printer className="h-5 w-5 text-blue-600" />
              <span>Bulk Print Report Cards</span>
            </div>
            <button
              onClick={onClose}
              disabled={isProcessing}
              className="text-gray-400 hover:text-gray-600 disabled:opacity-50"
            >
              <X className="h-5 w-5" />
            </button>
          </div>

          {!isProcessing ? (
            <div className="space-y-4">
              <p className="text-sm text-gray-600">
                Select the group of students you want to generate print-ready progress reports for:
              </p>

              {/* Filter Selection */}
              <div className="space-y-3 bg-gray-50 p-3 rounded-md border">
                <div>
                  <label className="block text-xs font-semibold text-gray-700 mb-1">Level</label>
                  <select
                    value={selectedLevel}
                    onChange={(e) => handleLevelChange(e.target.value)}
                    className="w-full border rounded p-2 text-sm bg-white"
                  >
                    <option value="ALL">All Levels</option>
                    {config.levels.map((lvl) => (
                      <option key={lvl.id} value={lvl.id}>
                        {lvl.name}
                      </option>
                    ))}
                  </select>
                </div>

                {activeLevelConfig?.subLevels && activeLevelConfig.subLevels.length > 0 && (
                  <div>
                    <label className="block text-xs font-semibold text-gray-700 mb-1">Sub-Level</label>
                    <select
                      value={selectedSubLevel}
                      onChange={(e) => setSelectedSubLevel(e.target.value)}
                      className="w-full border rounded p-2 text-sm bg-white"
                    >
                      <option value="ALL">All Sub-Levels</option>
                      {activeLevelConfig.subLevels.map((sub) => (
                        <option key={sub.id} value={sub.id}>
                          {sub.name}
                        </option>
                      ))}
                    </select>
                  </div>
                )}
              </div>

              {/* Student Summary count */}
              <div className="text-sm text-gray-700 font-medium flex justify-between items-center bg-blue-50/50 p-2.5 rounded border border-blue-100">
                <span>Matching Students:</span>
                <span className="font-bold text-blue-700">{matchingStudents.length}</span>
              </div>

              {/* Actions */}
              <div className="flex justify-end gap-3 pt-2">
                <button
                  type="button"
                  onClick={onClose}
                  className="rounded-md border px-4 py-2 text-sm font-medium text-gray-700 hover:bg-gray-50"
                >
                  Cancel
                </button>
                <button
                  type="button"
                  disabled={matchingStudents.length === 0}
                  onClick={handleGenerateAndPrint}
                  className="flex items-center gap-2 rounded-md bg-blue-600 px-4 py-2 text-sm font-medium text-white hover:bg-blue-700 disabled:opacity-50"
                >
                  <Printer size={16} /> Generate & Print
                </button>
              </div>
            </div>
          ) : (
            /* Progress State */
            <div className="py-6 space-y-4">
              <div className="flex items-center gap-3 text-blue-600">
                <Loader2 className="h-5 w-5 animate-spin shrink-0" />
                <span className="text-sm font-semibold text-gray-800">{statusMessage}</span>
              </div>

              <div className="w-full bg-gray-200 rounded-full h-3 overflow-hidden">
                <div
                  className="bg-blue-600 h-full transition-all duration-300 ease-out"
                  style={{ width: `${progress}%` }}
                />
              </div>

              <p className="text-xs text-center text-gray-500">
                Please wait while we assemble your document...
              </p>
            </div>
          )}
        </div>
      </div>

      {/* --- Printable Container (Portaled to document.body) --- */}
      {mounted &&
        printableStudents.length > 0 &&
        createPortal(
          <div className="hidden print:block print:absolute print:left-0 print:top-0 print:w-full print:bg-white print:z-[99999]">
            {printableStudents.map((student) => (
              <div
                key={student.studentId}
                className="break-after-page page-break-after-always"
              >
                <StudentReportCard
                  student={student}
                  session={session}
                  config={config}
                  onClose={() => {}}
                  bulkPrint={true}
                />
              </div>
            ))}
          </div>,
          document.body
        )}
    </>
  );
}