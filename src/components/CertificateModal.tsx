"use client";

import React, { useState, useEffect } from "react";
import { createPortal } from "react-dom";
import { AppConfig, ExamSession } from "@/lib/types";
import { Award, X, Printer, Loader2 } from "lucide-react";
import KidsCertificateCard from "./KidsCertificateCard";

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
    const [certType, setCertType] = useState<"kids">("kids");
    const [selectedLevel, setSelectedLevel] = useState<string>("ALL");
    const [locationAndDate, setLocationAndDate] = useState("Berlin, den ");
    const [customNamesInput, setCustomNamesInput] = useState("");
    const [useCustomNames, setUseCustomNames] = useState(false);

    const [isProcessing, setIsProcessing] = useState(false);
    const [printableNames, setPrintableNames] = useState<string[]>([]);
    const [mounted, setMounted] = useState(false);

    useEffect(() => {
        setMounted(true);
    }, []);

    if (!isOpen) return null;

    // Gather names from session students based on level selection
    const sessionStudents = (session.students || []).filter((std) => {
        if (selectedLevel !== "ALL" && std.level !== selectedLevel) return false;
        return true;
    });

    const getTargetNames = (): string[] => {
        if (useCustomNames) {
            return customNamesInput
                .split("\n")
                .map((n) => n.trim())
                .filter((n) => n.length > 0);
        }
        return sessionStudents.map((std) => `${std.firstName} ${std.familyName}`);
    };

    const activeNames = getTargetNames();

    const handleGenerateAndPrint = () => {
        if (activeNames.length === 0) return;

        setIsProcessing(true);
        setPrintableNames(activeNames);

        const originalTitle = document.title;
        document.title = `Kids_Certificates_${activeNames.length}_Students`;

        requestAnimationFrame(() => {
            requestAnimationFrame(() => {
                setTimeout(() => {
                    window.print();
                    document.title = originalTitle;
                    setIsProcessing(false);
                    // Removed onClose(); so modal remains open after closing print dialog
                }, 400);
            });
        });
    };

    return (
        <>
            {/* --- UI Config Modal (Screen Only) --- */}
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
                        {/* Certificate Type Selection */}
                        <div>
                            <label className="block text-xs font-semibold text-gray-700 mb-1">
                                Certificate Type
                            </label>
                            <select
                                value={certType}
                                onChange={(e) => setCertType(e.target.value as "kids")}
                                className="w-full border rounded p-2 text-sm bg-white"
                            >
                                <option value="kids">Kids Certificate (Kinder Zertifikat)</option>
                            </select>
                        </div>

                        {/* Ort und Datum Input */}
                        <div>
                            <label className="block text-xs font-semibold text-gray-700 mb-1">
                                Ort und Datum (Place & Date)
                            </label>
                            <input
                                type="text"
                                value={locationAndDate}
                                onChange={(e) => setLocationAndDate(e.target.value)}
                                placeholder="e.g. Berlin, den 15.09.2026"
                                className="w-full border rounded p-2 text-sm bg-white"
                            />
                        </div>

                        {/* Source Selection Toggle */}
                        <div className="flex items-center gap-4 pt-1">
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

                        {/* Option A: Filter Session Students */}
                        {!useCustomNames ? (
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
                        ) : (
                            /* Option B: Custom Textarea */
                            <div>
                                <label className="block text-xs font-semibold text-gray-700 mb-1">
                                    Enter Student Names (one name per line)
                                </label>
                                <textarea
                                    rows={4}
                                    value={customNamesInput}
                                    onChange={(e) => setCustomNamesInput(e.target.value)}
                                    placeholder="Amina Yilmaz&#10;Youssef Ali&#10;Lina Meyer"
                                    className="w-full border rounded p-2 text-sm font-mono bg-white"
                                />
                            </div>
                        )}

                        {/* Target Count Box */}
                        <div className="text-sm text-gray-700 font-medium flex justify-between items-center bg-amber-50 p-2.5 rounded border border-amber-200">
                            <span>Certificates to generate:</span>
                            <span className="font-bold text-amber-700">{activeNames.length}</span>
                        </div>

                        {/* Modal Buttons */}
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
                                disabled={activeNames.length === 0 || isProcessing}
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

            {/* --- Printable Portal Container (Landscape Print) --- */}
            {mounted &&
                printableNames.length > 0 &&
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
                        {printableNames.map((name, idx) => (
                            <div
                                key={idx}
                                className="break-after-page page-break-after-always"
                            >
                                <KidsCertificateCard
                                    studentName={name}
                                    locationAndDate={locationAndDate}
                                />
                            </div>
                        ))}
                    </div>,
                    document.body
                )}
        </>
    );
}