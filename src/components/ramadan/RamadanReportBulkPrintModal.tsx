"use client";

import React, { useState, useEffect } from "react";
import { createPortal } from "react-dom";
import { Printer, X, Loader2, Calendar, MapPin } from "lucide-react";
import RamadanReportCard, { RamadanPerformanceData } from "./RamadanReportCard";

interface RamadanReportBulkPrintModalProps {
    isOpen: boolean;
    onClose: () => void;
    studentsData: RamadanPerformanceData[];
}

export default function RamadanReportBulkPrintModal({
    isOpen,
    onClose,
    studentsData,
}: RamadanReportBulkPrintModalProps) {
    const [issueDate, setIssueDate] = useState<string>(
        new Date().toLocaleDateString("de-DE", {
            day: "2-digit",
            month: "2-digit",
            year: "numeric",
        })
    );
    const [issuePlace, setIssuePlace] = useState<string>("Berlin");
    const [address, setAddress] = useState<string>("Brunnenstraße 122, 13355 Berlin");

    // Print state controls
    const [isProcessing, setIsProcessing] = useState(false);
    const [progress, setProgress] = useState(0);
    const [statusMessage, setStatusMessage] = useState("");
    const [printableStudents, setPrintableStudents] = useState<RamadanPerformanceData[]>([]);
    const [mounted, setMounted] = useState(false);

    useEffect(() => {
        setMounted(true);
    }, []);

    useEffect(() => {
        if (isOpen) {
            setIsProcessing(false);
            setProgress(0);
            setPrintableStudents([]);
        }
    }, [isOpen]);

    if (!isOpen) return null;

    const handleGenerateAndPrint = () => {
        if (studentsData.length === 0) return;

        setIsProcessing(true);
        setProgress(20);
        setStatusMessage(`Vorbereitung von ${studentsData.length} Berichten...`);

        setPrintableStudents(studentsData);

        const originalTitle = document.title;
        document.title = `Ramadan_Report_Cards_${issueDate.replace(/\./g, "-")}`;

        requestAnimationFrame(() => {
            setProgress(60);
            setStatusMessage("Drucklayout wird formatiert...");

            requestAnimationFrame(() => {
                setTimeout(() => {
                    setProgress(100);
                    setStatusMessage("Druckfenster wird geöffnet...");
                    window.print();

                    document.title = originalTitle;
                    setIsProcessing(false);
                }, 400);
            });
        });
    };

    return (
        <>
            {/* UI Control Modal */}
            <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 p-4 print:hidden">
                <div className="w-full max-w-md rounded-xl bg-white p-6 shadow-2xl border border-gray-200">
                    <div className="flex items-center justify-between border-b pb-3 mb-4">
                        <div className="flex items-center gap-2 text-gray-900 font-bold text-lg">
                            <Printer className="h-5 w-5 text-emerald-600" />
                            <span>Ramadan Berichte Drucken</span>
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
                            <p className="text-xs text-gray-600">
                                Geben Sie Ort und Datum an, die auf dem Bericht erscheinen sollen:
                            </p>

                            {/* Printable Meta Inputs */}
                            <div className="space-y-3 bg-gray-50 p-3 rounded-lg border border-gray-200">
                                <div>
                                    <label className="block text-xs font-semibold text-gray-700 mb-1 flex items-center gap-1">
                                        <MapPin className="w-3.5 h-3.5 text-gray-500" /> Ort
                                    </label>
                                    <input
                                        type="text"
                                        value={issuePlace}
                                        onChange={(e) => setIssuePlace(e.target.value)}
                                        className="w-full border rounded p-2 text-sm bg-white"
                                        placeholder="Berlin"
                                    />
                                </div>

                                <div>
                                    <label className="block text-xs font-semibold text-gray-700 mb-1 flex items-center gap-1">
                                        <Calendar className="w-3.5 h-3.5 text-gray-500" /> Ausstellungsdatum
                                    </label>
                                    <input
                                        type="text"
                                        value={issueDate}
                                        onChange={(e) => setIssueDate(e.target.value)}
                                        className="w-full border rounded p-2 text-sm bg-white"
                                        placeholder="DD.MM.YYYY"
                                    />
                                </div>

                                <div>
                                    <label className="block text-xs font-medium text-gray-700 mb-1">Adresse</label>
                                    <input
                                        type="text"
                                        value={address}
                                        onChange={(e) => setAddress(e.target.value)}
                                        placeholder="Brunnenstraße 122, 13355 Berlin"
                                        className="w-full text-xs p-2 border border-gray-300 rounded-md focus:outline-none focus:ring-1 focus:ring-emerald-600"
                                    />
                                </div>
                            </div>

                            <div className="text-sm font-medium flex justify-between items-center bg-emerald-50/60 p-2.5 rounded-lg border border-emerald-100">
                                <span className="text-gray-700">Bereitstehende Berichte:</span>
                                <span className="font-bold text-emerald-800">{studentsData.length}</span>
                            </div>

                            <div className="flex justify-end gap-3 pt-2">
                                <button
                                    type="button"
                                    onClick={onClose}
                                    className="rounded-md border px-4 py-2 text-sm font-medium text-gray-700 hover:bg-gray-50"
                                >
                                    Abbrechen
                                </button>
                                <button
                                    type="button"
                                    disabled={studentsData.length === 0}
                                    onClick={handleGenerateAndPrint}
                                    className="flex items-center gap-2 rounded-md bg-emerald-700 px-4 py-2 text-sm font-medium text-white hover:bg-emerald-800 disabled:opacity-50 transition-colors"
                                >
                                    <Printer size={16} /> Berichte Drucken
                                </button>
                            </div>
                        </div>
                    ) : (
                        <div className="py-6 space-y-4">
                            <div className="flex items-center gap-3 text-emerald-700">
                                <Loader2 className="h-5 w-5 animate-spin shrink-0" />
                                <span className="text-sm font-semibold text-gray-800">{statusMessage}</span>
                            </div>

                            <div className="w-full bg-gray-200 rounded-full h-2.5 overflow-hidden">
                                <div
                                    className="bg-emerald-600 h-full transition-all duration-300 ease-out"
                                    style={{ width: `${progress}%` }}
                                />
                            </div>
                        </div>
                    )}
                </div>
            </div>

            {/* Portal Target for Bulk Print Rendering */}
            {mounted &&
                printableStudents.length > 0 &&
                createPortal(
                    <div className="hidden print:block print:absolute print:left-0 print:top-0 print:w-full print:bg-white print:z-[99999]">
                        <style>{`
              @media print {
                @page {
                  size: A4 portrait;
                  margin: 0;
                }
                body {
                  margin: 0;
                  padding: 0;
                }
              }
            `}</style>
                        {printableStudents.map((studentData) => (
                            <div
                                key={studentData.studentId}
                                style={{ pageBreakAfter: "always", breakAfter: "page" }}
                            >
                                <RamadanReportCard
                                    data={studentData}
                                    issueDate={issueDate}
                                    issuePlace={issuePlace}
                                    address={address}
                                />
                            </div>
                        ))}
                    </div>,
                    document.body
                )}
        </>
    );
}