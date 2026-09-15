"use client";

import React from "react";

interface KidsCertificateCardProps {
  studentName: string;
  locationAndDate: string;
}

export const KidsCertificateCard: React.FC<KidsCertificateCardProps> = ({
  studentName,
  locationAndDate,
}) => {
  return (
    <div className="relative w-[297mm] h-[210mm] bg-white overflow-hidden box-border mx-auto print:m-0 print:w-full print:h-screen">
      {/* Background Template */}
      <img
        src="/assets/cert-template-kids.png"
        alt="Kids Certificate Template"
        className="absolute inset-0 w-full h-full object-cover z-0"
      />

      {/* --- 1. Student Name (Positioned over the dashed yellow line) --- */}
      <div className="absolute top-[43.5%] left-1/2 -translate-x-1/2 -translate-y-1/2 w-[60%] text-center z-10">
        <h2
          className="text-2xl sm:text-3xl font-bold text-[#005C3C] tracking-wide italic"
          style={{ fontFamily: "'Dancing Script', 'Georgia', cursive, serif" }}
        >
          {studentName}
        </h2>
      </div>

      {/* --- 2. Footer Section (Adjusted margins to clear illustrations) --- */}
      <div className="absolute bottom-[5%] left-0 right-0 z-10 flex justify-between items-end px-28">
        {/* Bottom Left: Ort und Datum (Moved right to clear the book illustration) */}
        <div className="text-center w-48 ml-32">
          <p className="text-xs font-semibold text-gray-800 border-b border-dashed border-gray-600 pb-0.5 min-h-[18px]">
            {locationAndDate}
          </p>
          <p className="text-[11px] font-bold text-gray-700 mt-1">
            Ort und Datum
          </p>
        </div>

        {/* Bottom Right: Headmaster Signature */}
        <div className="text-center w-48 mr-32">
          <div className="h-10 flex items-end justify-center mb-0.5">
            <img
              src="/assets/signature-schulleiter.png"
              alt="Unterschrift des Schulleiters"
              className="max-h-12 object-contain"
            />
          </div>
          <div className="w-full border-b border-dashed border-gray-600 mb-0.5" />
          <p className="text-[11px] font-bold text-gray-700">
            Unterschrift des Schulleiters
          </p>
        </div>
      </div>
    </div>
  );
};

export default KidsCertificateCard;