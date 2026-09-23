"use client";

import React, { useState, useEffect } from "react";
import { createPortal } from "react-dom";
import { Contact, Upload, X, Printer } from "lucide-react";

interface ParsedStudent {
  firstName: string;
  lastName: string;
}

interface IdCardModalProps {
  isOpen: boolean;
  onClose: () => void;
  defaultAcademyName?: string;
}

export default function IdCardModal({
  isOpen,
  onClose,
  defaultAcademyName = "DIB Academy",
}: IdCardModalProps) {
  const currentYear = new Date().getFullYear();
  const defaultYearRange = `${currentYear}`;

  const [academicYear, setAcademicYear] = useState<string>(defaultYearRange);
  const [academyName, setAcademyName] = useState<string>(defaultAcademyName);
  const [address, setAddress] = useState<string>("Brunnenstraße 122, 13355 Berlin");
  const [students, setStudents] = useState<ParsedStudent[]>([]);
  const [fileName, setFileName] = useState<string>("");
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  if (!isOpen) return null;

  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setFileName(file.name);
    const reader = new FileReader();

    reader.onload = (event) => {
      const text = event.target?.result as string;
      if (!text) return;

      const lines = text.split(/\r\n|\n/);
      const parsed: ParsedStudent[] = [];

      lines.forEach((line, index) => {
        const trimmed = line.trim();
        if (!trimmed) return;

        const delimiter = trimmed.includes(";") ? ";" : ",";
        const cols = trimmed.split(delimiter).map((c) => c.replace(/^["']|["']$/g, "").trim());

        if (cols.length < 2) return;

        const val1 = cols[0];
        const val2 = cols[1];

        if (
          index === 0 &&
          (val1.toLowerCase().includes("nachname") ||
            val1.toLowerCase().includes("last") ||
            val1.toLowerCase().includes("name") ||
            val2.toLowerCase().includes("vorname") ||
            val2.toLowerCase().includes("first"))
        ) {
          return;
        }

        parsed.push({
          lastName: val1,
          firstName: val2,
        });
      });

      setStudents(parsed);
    };

    reader.readAsText(file);
  };

  const pageSize = 9;
  const pages: ParsedStudent[][] = [];
  for (let i = 0; i < students.length; i += pageSize) {
    pages.push(students.slice(i, i + pageSize));
  }

  const handlePrint = () => {
    window.print();
  };

  const CornerOrnaments = () => (
    <>
      <span className="absolute top-1.5 left-1.5 text-[9px] text-[#8C6212] select-none leading-none z-10">✦</span>
      <span className="absolute top-1.5 right-1.5 text-[9px] text-[#8C6212] select-none leading-none z-10">✦</span>
      <span className="absolute bottom-1.5 left-1.5 text-[9px] text-[#8C6212] select-none leading-none z-10">✦</span>
      <span className="absolute bottom-1.5 right-1.5 text-[9px] text-[#8C6212] select-none leading-none z-10">✦</span>
    </>
  );

  return (
    <>
      {/* UI Controls Modal (Screen Only) */}
      <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 p-4 print:hidden">
        <div className="bg-white rounded-xl shadow-2xl w-full max-w-4xl max-h-[90vh] flex flex-col overflow-hidden">
          {/* Header */}
          <div className="flex items-center justify-between px-6 py-4 border-b bg-gray-900 text-white">
            <div className="flex items-center gap-2.5">
              <Contact className="h-5 w-5 text-amber-400" />
              <h2 className="text-lg font-bold">ID Card Generator</h2>
            </div>
            <button
              onClick={onClose}
              className="text-gray-400 hover:text-white p-1 rounded-md transition-colors"
            >
              <X className="h-5 w-5" />
            </button>
          </div>

          {/* Controls */}
          <div className="p-6 overflow-y-auto space-y-6 flex-1">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4 bg-gray-50 p-4 rounded-lg border border-gray-200">
              <div>
                <label className="block text-xs font-semibold text-gray-700 mb-1">
                  Academy Name (Shortened)
                </label>
                <input
                  type="text"
                  value={academyName}
                  onChange={(e) => setAcademyName(e.target.value)}
                  className="w-full border p-2 rounded text-sm bg-white"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-gray-700 mb-1">
                  Schuljahr / Academic Year
                </label>
                <input
                  type="text"
                  value={academicYear}
                  onChange={(e) => setAcademicYear(e.target.value)}
                  className="w-full border p-2 rounded text-sm bg-white"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-gray-700 mb-1">
                  Academy Address
                </label>
                <input
                  type="text"
                  value={address}
                  onChange={(e) => setAddress(e.target.value)}
                  className="w-full border p-2 rounded text-sm bg-white"
                />
              </div>
            </div>

            <div className="border-2 border-dashed border-gray-300 hover:border-blue-500 rounded-lg p-6 text-center bg-gray-50 transition-colors">
              <input
                type="file"
                accept=".csv,.txt"
                onChange={handleFileUpload}
                className="hidden"
                id="id-card-csv-upload"
              />
              <label
                htmlFor="id-card-csv-upload"
                className="cursor-pointer flex flex-col items-center gap-2"
              >
                <Upload className="h-8 w-8 text-blue-600" />
                <span className="text-sm font-medium text-gray-800">
                  {fileName ? `Loaded: ${fileName}` : "Upload CSV File (Last Name, First Name)"}
                </span>
              </label>
            </div>

            {/* Live Card Preview */}
            {students.length > 0 && (
              <div className="space-y-4">
                <p className="text-xs font-medium text-gray-500">Sample Live Preview (Front & Back):</p>
                <div className="flex flex-wrap gap-6 justify-center bg-gray-100 p-6 rounded-lg border">
                  
                  {/* FRONT PREVIEW */}
                  <div className="w-[54mm] h-[85mm] bg-white border-4 border-[#8C6212] rounded-xs p-2 flex flex-col justify-between items-center text-center shadow-md relative overflow-hidden font-serif">
                    <div className="absolute inset-1 border border-dashed border-[#8C6212]/70 pointer-events-none" />
                    <CornerOrnaments />

                    {/* Front Watermark */}
                    <div className="absolute inset-0 flex items-center justify-center pointer-events-none z-0">
                      <img src="/assets/dib-logo.png" alt="" className="w-28 h-auto object-contain opacity-[0.05]" />
                    </div>

                    <div className="pt-2 z-10">
                      <img src="/assets/dib-logo.png" alt="" className="h-8 w-auto mx-auto mb-1 object-contain" />
                      <h3 className="text-[10px] font-bold text-gray-900 tracking-wide uppercase">{academyName}</h3>
                      <p className="text-[8px] text-[#8C6212] font-bold">Schuljahr {academicYear}</p>
                    </div>

                    <div className="my-auto px-1 w-full z-10">
                      <div className="border-b-2 border-dashed border-[#8C6212] pb-1.5">
                        <p className="text-base font-semibold text-[#144428] leading-tight italic font-serif">
                          {students[0].firstName} {students[0].lastName}
                        </p>
                      </div>
                      <p className="text-[8px] font-bold text-gray-600 uppercase tracking-widest mt-1">Schülerausweis</p>
                    </div>

                    <div className="pb-1 text-[7.5px] text-gray-500 font-medium z-10">DIB Academy Berlin</div>
                  </div>

                  {/* BACK PREVIEW */}
                  <div className="w-[54mm] h-[85mm] bg-white border-4 border-[#8C6212] rounded-xs p-2.5 flex flex-col justify-between items-center text-center shadow-md relative overflow-hidden font-serif">
                    <div className="absolute inset-1 border border-dashed border-[#8C6212]/70 pointer-events-none" />
                    <CornerOrnaments />

                    {/* Back Watermark */}
                    <div className="absolute inset-0 flex items-center justify-center pointer-events-none z-0">
                      <img src="/assets/dib-logo.png" alt="" className="w-28 h-auto object-contain opacity-[0.05]" />
                    </div>

                    <div className="pt-1.5 z-10">
                      <p className="text-[9.5px] font-bold text-[#8C6212] uppercase tracking-wider">Finderlohn / Return Info</p>
                      <div className="w-8 h-0.5 bg-[#8C6212] mx-auto mt-0.5" />
                    </div>

                    <div className="space-y-1.5 text-[8.5px] text-gray-800 leading-tight z-10 my-auto">
                      <p>
                        Falls gefunden, bitte zurückgeben an:
                        <br />
                        <strong className="text-gray-900 font-bold">{academyName}</strong>
                      </p>
                      <p className="font-medium text-gray-700">{address}</p>
                      <p className="text-[7.5px] text-gray-500 italic pt-1">
                        Dieser Ausweis ist für das Schuljahr {academicYear} gültig.
                      </p>
                    </div>

                    {/* Headmaster Signature Footer */}
                    <div className="w-full z-10 pb-0.5">
                      <div className="h-10 flex items-end justify-center mb-0.5">
                        <img src="/assets/signature-schulleiter.png" alt="" className="max-h-10 object-contain" />
                      </div>
                      <div className="w-32 mx-auto border-b border-gray-600 mb-0.5" />
                      <p className="text-[7px] font-bold text-gray-600">Unterschrift des Schulleiters</p>
                    </div>
                  </div>

                </div>
              </div>
            )}
          </div>

          {/* Footer Buttons */}
          <div className="flex items-center justify-between px-6 py-4 border-t bg-gray-50">
            <button onClick={onClose} className="px-4 py-2 border rounded-md text-sm font-medium text-gray-700 hover:bg-gray-100">
              Close
            </button>
            <button
              onClick={handlePrint}
              disabled={students.length === 0}
              className="flex items-center gap-2 bg-blue-600 hover:bg-blue-700 disabled:opacity-50 text-white px-5 py-2 rounded-md text-sm font-medium transition-colors shadow-xs cursor-pointer"
            >
              <Printer className="h-4 w-4" />
              <span>Print ID Cards ({students.length})</span>
            </button>
          </div>
        </div>
      </div>

      {/* --- PRINTABLE PORTAL TARGET (Portaled to document.body, like BulkPrintModal & CertificateModal) --- */}
      {mounted &&
        pages.length > 0 &&
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
            {pages.map((pageStudents, pageIdx) => {
              return (
                <React.Fragment key={`page-pair-${pageIdx}`}>
                  {/* PAGE A: FRONTS */}
                  <div
                    className="w-[210mm] h-[296mm] p-[10mm] mx-auto bg-white box-border flex flex-wrap content-start gap-[4mm] overflow-hidden"
                    style={{ pageBreakAfter: "always", breakAfter: "page" }}
                  >
                    {pageStudents.map((std, idx) => (
                      <div
                        key={`front-${idx}`}
                        className="w-[54mm] h-[85mm] border-4 border-[#8C6212] rounded-xs p-2 flex flex-col justify-between items-center text-center relative box-border overflow-hidden font-serif"
                      >
                        <div className="absolute inset-1 border border-dashed border-[#8C6212]/70 pointer-events-none" />
                        <CornerOrnaments />

                        {/* Front Watermark */}
                        <div className="absolute inset-0 flex items-center justify-center pointer-events-none z-0">
                          <img src="/assets/dib-logo.png" alt="" className="w-28 h-auto object-contain opacity-[0.05]" />
                        </div>

                        <div className="pt-2 z-10">
                          <img src="/assets/dib-logo.png" alt="" className="h-9 w-auto mx-auto mb-1 object-contain" />
                          <h3 className="text-[10px] font-bold text-gray-900 tracking-wider uppercase">{academyName}</h3>
                          <p className="text-[8.5px] text-[#8C6212] font-bold">Schuljahr {academicYear}</p>
                        </div>

                        <div className="my-auto px-1 w-full z-10">
                          <div className="border-b-2 border-dashed border-[#8C6212] pb-1.5">
                            <p className="text-base font-semibold text-[#144428] leading-tight italic font-serif">
                              {std.firstName} {std.lastName}
                            </p>
                          </div>
                          <p className="text-[8px] font-bold text-gray-600 uppercase tracking-widest mt-1.5">
                            Schülerausweis
                          </p>
                        </div>

                        <div className="pb-1 text-[7.5px] font-semibold text-gray-500 z-10">DIB Academy Berlin</div>
                      </div>
                    ))}
                  </div>

                  {/* PAGE B: BACKS (Horizontally Mirrored Grid) */}
                  <div
                    className="w-[210mm] h-[296mm] p-[10mm] mx-auto bg-white box-border flex flex-wrap content-start gap-[4mm] overflow-hidden"
                    style={{
                      pageBreakAfter: pageIdx === pages.length - 1 ? "avoid" : "always",
                      breakAfter: pageIdx === pages.length - 1 ? "avoid" : "page",
                    }}
                  >
                    {Array.from({ length: Math.ceil(pageStudents.length / 3) }).map((_, rowIndex) => {
                      const rowItems = pageStudents.slice(rowIndex * 3, rowIndex * 3 + 3);
                      const mirroredRowItems = [...rowItems].reverse();

                      return mirroredRowItems.map((std, idx) => (
                        <div
                          key={`back-${rowIndex}-${idx}`}
                          className="w-[54mm] h-[85mm] border-4 border-[#8C6212] rounded-xs p-2.5 flex flex-col justify-between items-center text-center relative box-border overflow-hidden font-serif"
                        >
                          <div className="absolute inset-1 border border-dashed border-[#8C6212]/70 pointer-events-none" />
                          <CornerOrnaments />

                          {/* Back Watermark */}
                          <div className="absolute inset-0 flex items-center justify-center pointer-events-none z-0">
                            <img src="/assets/dib-logo.png" alt="" className="w-28 h-auto object-contain opacity-[0.05]" />
                          </div>

                          <div className="pt-1.5 z-10">
                            <p className="text-[9.5px] font-bold text-[#8C6212] uppercase tracking-wider">Finderlohn / Return Info</p>
                            <div className="w-8 h-0.5 bg-[#8C6212] mx-auto mt-0.5" />
                          </div>

                          <div className="space-y-1.5 text-[8.5px] text-gray-800 leading-tight z-10 my-auto">
                            <p>
                              Falls gefunden, bitte zurückgeben an:
                              <br />
                              <strong className="text-gray-900 font-bold">{academyName}</strong>
                            </p>
                            <p className="font-medium text-gray-700">{address}</p>
                            <p className="text-[7.5px] text-gray-600 italic pt-1">
                              Dieser Ausweis ist für das Schuljahr {academicYear} gültig.
                            </p>
                          </div>

                          {/* Enlarged Headmaster Signature Block */}
                          <div className="w-full z-10 pb-0.5">
                            <div className="h-10 flex items-end justify-center mb-0.5">
                              <img src="/assets/signature-schulleiter.png" alt="" className="max-h-10 object-contain" />
                            </div>
                            <div className="w-32 mx-auto border-b border-gray-600 mb-0.5" />
                            <p className="text-[7px] font-bold text-gray-600">Unterschrift des Schulleiters</p>
                          </div>
                        </div>
                      ));
                    })}
                  </div>
                </React.Fragment>
              );
            })}
          </div>,
          document.body
        )}
    </>
  );
}