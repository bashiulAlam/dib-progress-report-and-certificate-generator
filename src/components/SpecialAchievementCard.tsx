"use client";

import React from "react";

export type SpecialCertType = "extraordinary" | "class_performance";

interface SpecialAchievementCardProps {
    studentName: string;
    classNameStr: string;
    termPeriod: string;
    locationAndDate: string;
    certType: SpecialCertType;
}

export const SpecialAchievementCard: React.FC<SpecialAchievementCardProps> = ({
    studentName,
    classNameStr,
    termPeriod,
    locationAndDate,
    certType,
}) => {
    return (
        <div className="relative w-[297mm] h-[210mm] bg-white overflow-hidden box-border mx-auto print:m-0 print:w-full print:h-screen font-serif text-gray-900">
            {/* Background Template */}
            <img
                src="/assets/cert-template-special-achievement.png"
                alt="Certificate Background"
                className="absolute inset-0 w-full h-full object-cover z-0"
            />

            {/* WATERMARK LOGO */}
            <div
                className="absolute inset-0 flex items-center justify-center pointer-events-none z-0"
                aria-hidden="true"
            >
                <img
                    src="/assets/dib-logo.png"
                    alt=""
                    className="w-[450px] max-w-[50%] h-auto object-contain opacity-[0.04] select-none"
                />
            </div>

            {/* Overlay Content Box */}
            <div className="relative z-10 w-full h-full flex flex-col justify-between p-10 text-center">
                {/* Top Header Spacing (Clears Academy Logo & Name in Background) */}
                <div className="pt-48 space-y-1">
                    <h1 className="text-6xl font-extrabold tracking-wider text-[#A67C1E]">
                        ZERTIFIKAT
                    </h1>

                    <div className="flex items-center justify-center gap-3 pt-1">
                        {/* Left Ornament */}
                        <svg className="w-5 h-5 text-[#A67C1E] fill-current" viewBox="0 0 24 24">
                            <path d="M12,2 L14,7 L19,4 L16,9 L21,12 L16,15 L19,20 L14,17 L12,22 L10,17 L5,20 L8,15 L3,12 L8,9 L5,4 L10,7 Z" />
                        </svg>

                        <h2 className="text-2xl font-bold text-[#144428]">
                            {certType === "extraordinary"
                                ? "für hervorragende Prüfungsergebnisse"
                                : "für vorbildliche Leistungen"}
                        </h2>

                        {/* Right Ornament */}
                        <svg className="w-5 h-5 text-[#A67C1E] fill-current rotate-180" viewBox="0 0 24 24">
                            <path d="M12,2 L14,7 L19,4 L16,9 L21,12 L16,15 L19,20 L14,17 L12,22 L10,17 L5,20 L8,15 L3,12 L8,9 L5,4 L10,7 Z" />
                        </svg>
                    </div>

                    <p className="pt-4 text-lg italic pt-1 text-gray-700">Hiermit wird bestätigt, dass</p>

                </div>

                {/* Student Name & Class */}
                <div className="my-auto space-y-2">
                    <div className="w-full max-w-xl mx-auto border-b-2 border-dashed border-[#A67C1E] pb-1 px-4 flex justify-center items-center overflow-hidden">
                        <h3
                            className="text-3xl sm:text-4xl font-bold italic text-[#144428] whitespace-nowrap truncate tracking-tight"
                            style={{ fontFamily: "'Dancing Script', 'Georgia', cursive, serif" }}
                            title={studentName}
                        >
                            {studentName}
                        </h3>
                    </div>

                    <p className="text-base font-bold text-gray-900 pt-1">
                        Klasse: {classNameStr}
                    </p>

                    <p className="text-sm text-gray-600">im Zeitraum</p>

                    <p className="text-base font-bold text-gray-900">
                        {termPeriod}
                    </p>

                    {/* Achievement Description Statement (From TeX source) */}
                    <div className="max-w-2xl mx-auto pt-2">
                        {certType === "extraordinary" ? (
                            <p className="text-sm font-bold leading-relaxed text-gray-800">
                                in Anerkennung der hervorragenden Prüfungsergebnisse
                                <br />
                                mit diesem Zertifikat ausgezeichnet wird.
                            </p>
                        ) : (
                            <p className="text-sm font-bold leading-relaxed text-gray-800">
                                durch kontinuierliches Engagement, zuverlässige Mitarbeit
                                <br />
                                und vorbildliches Verhalten überzeugt hat.
                            </p>
                        )}
                    </div>
                </div>

                {/* Blessing & Footer Block */}
                <div className="pt-2 space-y-6 pb-4">
                    {/* Encouragement Blessing */}
                    <p className="text-xs italic text-gray-700 max-w-2xl mx-auto leading-relaxed">
                        Möge Allah (SWT) Ihnen weiterhin Erfolg schenken, Ihren Weg mit Wissen, Standhaftigkeit
                        <br />
                        und guten Taten erleuchten und Sie auf Ihrem weiteren Lebensweg segnen.
                    </p>

                    {/* Symmetrical Footer: Ort & Datum / Signature */}
                    {/* Symmetrical Footer: Ort & Datum / Signature */}
                    <div className="flex justify-between items-end max-w-xl mx-auto w-full px-4 pt-2">
                        {/* Left Footer: Ort und Datum */}
                        <div className="text-center w-48">
                            <p className="text-xs font-semibold text-gray-800 border-b border-gray-600 pb-0.5 min-h-[18px]">
                                {locationAndDate}
                            </p>
                            <p className="text-[11px] font-bold text-gray-700 mt-1">
                                Ort und Datum
                            </p>
                        </div>

                        {/* Right Footer: Headmaster Signature */}
                        <div className="text-center w-48">
                            <div className="h-10 flex items-end justify-center mb-0.5">
                                <img
                                    src="/assets/signature-schulleiter.png"
                                    alt="Unterschrift des Schulleiters"
                                    className="max-h-12 object-contain"
                                />
                            </div>
                            <div className="w-full border-b border-gray-600 mb-0.5" />
                            <p className="text-[11px] font-bold text-gray-700">
                                Unterschrift des Schulleiters
                            </p>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default SpecialAchievementCard;