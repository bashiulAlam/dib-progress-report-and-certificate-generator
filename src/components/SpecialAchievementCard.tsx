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

            {/* Overlay Content Box */}
            <div className="relative z-10 w-full h-full flex flex-col justify-between p-10 text-center">
                {/* Top Header Spacing (Clears Academy Logo & Name in Background) */}
                <div className="pt-24 space-y-1">
                    <h1 className="text-4xl font-extrabold tracking-wider text-[#144428]">
                        ZERTIFIKAT
                    </h1>
                    <h2 className="text-xl font-bold text-[#144428]">
                        {certType === "extraordinary"
                            ? "für hervorragende Prüfungsergebnisse"
                            : "für vorbildliche Leistungen"}
                    </h2>
                    <p className="text-sm italic pt-1 text-gray-700">Hiermit wird bestätigt, dass</p>
                </div>

                {/* Student Name & Class */}
                <div className="my-auto space-y-2">
                    <h3
                        className="text-4xl font-bold text-[#144428] px-4"
                        style={{ fontFamily: "'Dancing Script', 'Georgia', cursive, serif" }}
                    >
                        {studentName}
                    </h3>

                    <p className="text-base font-bold text-gray-900 pt-1">
                        Klasse: {classNameStr}
                    </p>

                    <p className="text-xs text-gray-600">im Zeitraum</p>

                    <p className="text-base font-bold text-gray-900">
                        {termPeriod || "Januar 2026 bis Juni 2026"}
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
                <div className="space-y-6 pb-4">
                    {/* Encouragement Blessing */}
                    <p className="text-xs italic text-gray-700 max-w-2xl mx-auto leading-relaxed">
                        Möge Allah (SWT) Ihnen weiterhin Erfolg schenken, Ihren Weg mit Wissen, Standhaftigkeit und guten Taten erleuchten und Sie auf Ihrem weiteren Lebensweg segnen.
                    </p>

                    {/* Symmetrical Footer: Ort & Datum / Signature */}
                    <div className="flex justify-between items-end px-28 pt-2">
                        {/* Left Footer: Ort und Datum */}
                        <div className="text-center w-56">
                            <p className="text-xs font-semibold text-gray-800 border-b border-gray-600 pb-0.5 min-h-[18px]">
                                {locationAndDate}
                            </p>
                            <p className="text-[11px] font-bold text-gray-700 mt-1">
                                Ort und Datum
                            </p>
                        </div>

                        {/* Right Footer: Headmaster Signature */}
                        <div className="text-center w-56">
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