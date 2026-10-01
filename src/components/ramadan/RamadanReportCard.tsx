"use client";

import React from "react";

export interface RamadanPerformanceData {
    studentId: string;
    studentName: string;
    ageGroup: string; // e.g. "Altersgruppe 8–10 Jahre"
    verdict: string; // e.g. "Mit ausgezeichnetem Erfolg teilgenommen"
    criteriaResults: Array<{
        criterion: string;
        result: string;
    }>;
    additionalTasks?: string; // Optional task note, defaults to 'n.z.' if empty
    bonusAmount?: string | number; // Only rendered if present and > 0
    prizeMoney?: string; // e.g. "15,00 €" or "Einkaufsgutschein 20 €"
}

interface RamadanReportCardProps {
    data: RamadanPerformanceData;
    issueDate: string;
    issuePlace?: string;
    address?: string;
}

export default function RamadanReportCard({
    data,
    issueDate,
    issuePlace = "Berlin",
    address,
}: RamadanReportCardProps) {
    const hasBonus = Boolean(data.bonusAmount && String(data.bonusAmount).trim() !== "0");

    return (
        <div className="w-[210mm] min-h-[297mm] h-auto p-[15mm] mx-auto bg-white text-gray-900 font-sans box-border relative flex flex-col justify-between print:p-[12mm] print:shadow-none">

            {/* WATERMARK BACKGROUND */}
            <div
                aria-hidden="true"
                className="absolute inset-0 flex items-center justify-center pointer-events-none z-0"
            >
                <img
                    src="/assets/dib-logo.png"
                    alt=""
                    className="w-80 h-auto object-contain opacity-[0.05] grayscale select-none"
                />
            </div>

            {/* Top Header Section */}
            <div>
                <div className="flex items-center justify-between border-b pb-4">
                    {/* Left Side: Report Title / Info */}
                    <div className="flex-1">
                        <div className="font-serif text-[14px] font-bold text-emerald-800 tracking-wide">
                            Darul Ihsan Berlin Academy
                        </div>
                        <div className="text-[10px] text-slate-500 font-medium mt-0.5">
                            {address}
                        </div>
                    </div>

                    {/* Center: Basmalah */}
                    <div className="flex-1 text-center">
                        <div className="font-serif text-lg font-bold text-emerald-800 tracking-wide">
                            بِسْمِ ٱللَّهِ ٱلرَّحْمَٰنِ ٱلرَّحِيمِ
                        </div>
                        <div className="text-[11px] italic text-slate-500 font-medium">
                            Im Namen Allahs, des Allerbarmers, des Barmherzigen
                        </div>
                    </div>

                    {/* Right Side: Logo Centered Above Text, Pushed Far Right */}
                    <div className="flex-1 flex justify-end">
                        <div className="flex flex-col items-center gap-1 text-center">
                            <img
                                src="/assets/dib-logo.png"
                                alt="Darul Ihsan Logo"
                                className="h-10 w-auto object-contain"
                            />
                            <div className="text-[8px] font-semibold text-gray-800 tracking-wide">
                                Darul Ihsan Berlin e.V.
                            </div>
                        </div>
                    </div>
                </div>

                <div className="flex items-start justify-between gap-4 mt-4 mb-8">
                    {/* DIN 5008 Compliant Window Envelope Address Box */}
                    <div className="w-[85mm] min-h-[30mm] p-3 border border-gray-200 rounded-md bg-gray-50/50 print:bg-transparent">
                        <p className="text-xs font-bold text-gray-800 uppercase tracking-wide">
                            {data.studentName}
                        </p>
                        <p className="text-xs text-gray-600 mt-1">
                            <span className="font-semibold">Altersklasse:</span> {data.ageGroup}
                        </p>
                        <div className="mt-2 pt-2 border-t border-gray-200">
                            <span className="text-[10px] uppercase tracking-wider text-gray-500 block font-semibold">
                                Gesamtbeurteilung
                            </span>
                            <span className="text-xs font-bold text-emerald-800">
                                {data.verdict}
                            </span>
                        </div>
                    </div>

                    {/* Title Block */}
                    <div className="text-right space-y-0.5">
                        <h2 className="text-lg font-extrabold italic text-slate-900 tracking-tight leading-snug">
                            Der produktive Ramadan der Kinder
                        </h2>
                        <p className="text-[11px] font-semibold text-amber-800 tracking-wider">
                            Urkunde & Leistungsbeurteilung
                        </p>
                    </div>
                </div>
                
                {/* Criteria Evaluation Table */}
                <div className="mt-3">
                    <h3 className="text-xs font-bold text-gray-700 tracking-wider mb-2">
                        Ergebnisübersicht & Kriterien
                    </h3>
                    <table className="w-full border-collapse text-xs border border-gray-300">
                        <thead>
                            <tr className="bg-gray-100 text-gray-800 text-left border-b border-gray-300">
                                <th className="p-2.5 font-bold border-r border-gray-300">Bewertungskriterium</th>
                                <th className="p-2.5 font-bold w-1/3">Erreichte Leistung</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-gray-200">
                            {data.criteriaResults.map((item, idx) => (
                                <tr key={idx} className={idx % 2 === 0 ? "bg-white" : "bg-gray-50/50"}>
                                    <td className="p-2.5 text-gray-800 font-medium border-r border-gray-200">
                                        {item.criterion}
                                    </td>
                                    <td className="p-2.5 text-gray-900 font-semibold">{item.result}</td>
                                </tr>
                            ))}

                            {/* Additional Tasks Section */}
                            <tr className="bg-white">
                                <td className="p-2.5 text-gray-800 font-medium border-r border-gray-200">
                                    Zusatzaufgaben / Sonderleistungen
                                </td>
                                <td className="p-2.5 text-gray-700">
                                    {data.additionalTasks && data.additionalTasks.trim() !== "" && (
                                        <span className="text-slate-700">{data.additionalTasks}</span>
                                    )}
                                </td>
                            </tr>

                            {/* Conditional Bonus Row */}
                            {hasBonus && (
                                <tr className="bg-amber-50/60">
                                    <td className="p-2.5 text-amber-900 font-bold border-r border-gray-200">
                                        Bonusleistungen
                                    </td>
                                    <td className="p-2.5 text-amber-900 font-extrabold">
                                        {data.bonusAmount}
                                    </td>
                                </tr>
                            )}
                        </tbody>
                    </table>
                </div>

                {/* Prize Money Award Section */}
                <div className="mt-4 p-3 bg-emerald-50 border border-emerald-200 rounded-md flex justify-between items-center">
                    <span className="text-xs font-bold text-emerald-900 uppercase">
                        Anerkennung / Preisgeld:
                    </span>
                    <span className="text-sm font-extrabold text-emerald-900">
                        {data.prizeMoney || "n.z."}
                    </span>
                </div>

                {/* Spiritual Encouragement & Quran/Hadith Quote */}
                <div className="mt-6 p-4 rounded-lg border-l-4 border-amber-600 bg-amber-50/40 text-gray-800 text-xs space-y-2">
                    <p className="italic font-serif text-gray-900">
                        „...So wetteifert nach den guten Dingen.“
                    </p>
                    <p className="text-[10px] text-gray-600 font-semibold">
                        — Sure Al-Baqarah (2:148)
                    </p>
                    <p className="pt-1 text-gray-700 leading-relaxed">
                        Möge Allah (swt) deine Anstrengungen, dein Fasten und dein Streben nach Wissen in diesem gesegneten Monat reichlich belohnen. Behalte diesen Eifer bei und sei weiterhin ein Vorbild für deine Mitmenschen!
                    </p>
                </div>
            </div>

            {/* Footer Section */}
            <div className="pt-6 border-t border-gray-200 mt-8">
                <div className="flex justify-between items-end">
                    {/* Place and Date */}
                    <div className="text-xs text-gray-700">
                        <p className="font-semibold">{issuePlace}, den {issueDate}</p>
                        <p className="text-[10px] text-gray-500 mt-1">Ausstellungsdatum</p>
                    </div>

                    {/* Schulleiter Signature */}
                    <div className="text-center">
                        <div className="h-12 flex items-end justify-center mb-1 relative">
                            <img
                                src="/assets/signature-schulleiter.png"
                                alt="Unterschrift Schulleiter"
                                className="h-14 w-auto object-contain"
                            />
                        </div>
                        <div className="w-40 border-b border-gray-400 mb-1" />
                        <p className="text-[11px] font-bold text-gray-800">Unterschrift des Schulleiters</p>
                        <p className="text-[9px] text-gray-500">Darul Ihsan Berlin Academy</p>
                    </div>
                </div>
            </div>
        </div>
    );
}