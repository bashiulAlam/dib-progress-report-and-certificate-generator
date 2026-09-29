"use client";

import React, { useState, useEffect, useMemo } from "react";
import {
    Upload,
    Download,
    FolderOpen,
    Settings,
    Search,
    Sparkles,
    Edit2,
    Check,
    X,
} from "lucide-react";
import {
    DEFAULT_RAMADAN_AGE_GROUPS,
    RamadanAgeGroup,
} from "../../data/ramadanRequirements";
import RamadanAdminModal from "./RamadanAdminModal";

export interface RamadanStudent {
    id: string;
    name: string;
    age: number | null;
    gender: "Male" | "Female" | string;
    ageGroup: "< 7" | "7 - 8" | "9 - 10" | "11 - 13" | "> 13" | "Unassigned";
}

// Helper to map numeric age strictly to group label
export const determineAgeGroup = (
    age: number | null | undefined
): RamadanStudent["ageGroup"] => {
    if (age === null || age === undefined || isNaN(age)) return "Unassigned";
    if (age < 7) return "< 7";
    if (age <= 8) return "7 - 8";
    if (age <= 10) return "9 - 10";
    if (age <= 13) return "11 - 13";
    return "> 13";
};

// Uniformly normalize label variations across inputs, filters, and state
export const normalizeAgeGroup = (label: string | undefined | null): string => {
    if (!label) return "unassigned";
    const cleaned = label.trim().toLowerCase().replace(/^group\s*/, "");

    if (cleaned.includes(">") || cleaned.includes("+") || cleaned === "13 - 15" || cleaned === "13-15") {
        return "> 13";
    }

    return cleaned;
};

export default function ProductiveRamadanView() {
    const [competitionYear, setCompetitionYear] = useState<number>(new Date().getFullYear());
    const [students, setStudents] = useState<RamadanStudent[]>([]);
    const [ageGroups, setAgeGroups] = useState<RamadanAgeGroup[]>(DEFAULT_RAMADAN_AGE_GROUPS);
    const [isAdminOpen, setIsAdminOpen] = useState<boolean>(false);
    const [searchTerm, setSearchTerm] = useState<string>("");
    const [selectedGroupFilter, setSelectedGroupFilter] = useState<string>("ALL");

    // Editing State
    const [editingStudentId, setEditingStudentId] = useState<string | null>(null);
    const [editingAgeInput, setEditingAgeInput] = useState<string>("");

    const [isLoadModalOpen, setIsLoadModalOpen] = useState(false);
    const [availableFiles, setAvailableFiles] = useState<{ fileName: string; updatedAt: string }[]>([]);
    const [isLoadingFiles, setIsLoadingFiles] = useState(false);

    // Load state from local storage on mount
    useEffect(() => {
        const savedData = localStorage.getItem("productive_ramadan_data");
        if (savedData) {
            try {
                const parsed = JSON.parse(savedData);
                if (parsed.students) {
                    const cleanedStudents = parsed.students.map((s: any) => ({
                        ...s,
                        age: typeof s.age === "number" && !isNaN(s.age) ? s.age : null,
                        ageGroup: determineAgeGroup(s.age),
                    }));
                    setStudents(cleanedStudents);
                }
                if (parsed.year) setCompetitionYear(parsed.year);
                if (parsed.ageGroups) setAgeGroups(parsed.ageGroups);
            } catch (e) {
                console.error("Error loading stored state", e);
            }
        }
    }, []);

    // Save state helper
    const saveStateToStorage = (
        updatedStudents = students,
        updatedYear = competitionYear,
        updatedGroups = ageGroups
    ) => {
        const payload = {
            year: updatedYear,
            students: updatedStudents,
            ageGroups: updatedGroups,
            updatedAt: new Date().toISOString(),
        };
        localStorage.setItem("productive_ramadan_data", JSON.stringify(payload));
    };

    // Importer for CSV / TXT / Sheet data
    const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0];
        if (!file) return;

        const reader = new FileReader();
        reader.onload = (evt) => {
            const text = evt.target?.result as string;
            if (!text) return;

            const lines = text.split(/\r\n|\n/);
            const parsed: RamadanStudent[] = [];

            lines.forEach((line, idx) => {
                const trimmed = line.trim();
                if (!trimmed) return;

                const delimiter = trimmed.includes(";") ? ";" : ",";
                const cols = trimmed.split(delimiter).map((c) => c.replace(/^["']|["']$/g, "").trim());

                // Skip Header row
                if (
                    idx === 0 &&
                    (cols[0].toLowerCase().includes("name") ||
                        (cols[1] && cols[1].toLowerCase().includes("age")) ||
                        (cols[2] && cols[2].toLowerCase().includes("gender")))
                ) {
                    return;
                }

                if (cols.length >= 1) {
                    const name = cols[0];
                    const rawAgeCol = cols[1] ? cols[1].trim() : "";

                    // Strictly parse age if digits exist; otherwise set to null (blank)
                    const hasDigits = /\d/.test(rawAgeCol);
                    const age = hasDigits ? parseInt(rawAgeCol.replace(/\D/g, ""), 10) : null;

                    const gender = cols[2] ? cols[2].trim() : "Unspecified";
                    const calculatedGroup = determineAgeGroup(age);

                    parsed.push({
                        id: `std-${Date.now()}-${idx}`,
                        name,
                        age,
                        gender,
                        ageGroup: calculatedGroup,
                    });
                }
            });

            setStudents(parsed);
            saveStateToStorage(parsed);
        };

        reader.readAsText(file);
    };

    // Save current workspace directly to the server local filesystem
    const handleExportJSON = async () => {
        if (students.length === 0) return;

        try {
            const payload = {
                year: competitionYear,
                ageGroups,
                students,
                updatedAt: new Date().toISOString(),
            };

            const response = await fetch("/api/save-ramadan-data", {
                method: "POST",
                headers: {
                    "Content-Type": "application/json",
                },
                body: JSON.stringify({
                    year: competitionYear,
                    data: payload,
                }),
            });

            const result = await response.json();

            if (response.ok && result.success) {
                alert(`File saved on server successfully!`);
            } else {
                alert(`Failed to save file on server: ${result.error}`);
            }
        } catch (error) {
            console.error("Error saving JSON to server:", error);
            alert("An error occurred while attempting to save to the server.");
        }
    };

    // Load current workspace state directly from the server local filesystem
    const handleLoadServerState = async () => {
        try {
            const response = await fetch(`/api/load-ramadan-data?year=${competitionYear}`);

            // Prevent SyntaxError if server returns an HTML page (404/500 fallback)
            const contentType = response.headers.get("content-type");
            if (!contentType || !contentType.includes("application/json")) {
                const text = await response.text();
                console.error("Non-JSON Server Response:", text);
                alert(`Server returned non-JSON response (Status ${response.status}). Please verify API route setup.`);
                return;
            }

            const result = await response.json();

            if (response.ok && result.success && result.data) {
                const parsed = result.data;

                if (parsed.students) {
                    const cleanedStudents = parsed.students.map((s: any) => ({
                        ...s,
                        age: typeof s.age === "number" && !isNaN(s.age) ? s.age : null,
                        ageGroup: determineAgeGroup(s.age),
                    }));
                    setStudents(cleanedStudents);
                }
                if (parsed.year) setCompetitionYear(parsed.year);
                if (parsed.ageGroups) setAgeGroups(parsed.ageGroups);

                saveStateToStorage(parsed.students, parsed.year, parsed.ageGroups);
                alert(`Loaded Ramadan data for ${competitionYear} from server!`);
            } else {
                alert(result.error || `Failed to load server state for ${competitionYear}.`);
            }
        } catch (error) {
            console.error("Error loading JSON from server:", error);
            alert("An error occurred while attempting to fetch data from the server.");
        }
    };

    // Fetch list of saved files from server
    const handleOpenLoadModal = async () => {
        setIsLoadingFiles(true);
        setIsLoadModalOpen(true);
        try {
            const response = await fetch("/api/list-ramadan-data");
            const result = await response.json();
            if (response.ok && result.success) {
                setAvailableFiles(result.files || []);
            } else {
                alert(result.error || "Failed to fetch file list.");
            }
        } catch (error) {
            console.error("Error fetching file list:", error);
        } finally {
            setIsLoadingFiles(false);
        }
    };

    // Load specific file selected by user
    const handleLoadSelectedFile = async (fileName: string) => {
        try {
            const response = await fetch(`/api/load-ramadan-data?file=${encodeURIComponent(fileName)}`);

            const contentType = response.headers.get("content-type");
            if (!contentType || !contentType.includes("application/json")) {
                alert("Received invalid server response.");
                return;
            }

            const result = await response.json();

            if (response.ok && result.success && result.data) {
                const parsed = result.data;

                if (parsed.students) {
                    const cleanedStudents = parsed.students.map((s: any) => ({
                        ...s,
                        age: typeof s.age === "number" && !isNaN(s.age) ? s.age : null,
                        ageGroup: determineAgeGroup(s.age),
                    }));
                    setStudents(cleanedStudents);
                }
                if (parsed.year) setCompetitionYear(parsed.year);
                if (parsed.ageGroups) setAgeGroups(parsed.ageGroups);

                saveStateToStorage(parsed.students, parsed.year, parsed.ageGroups);
                setIsLoadModalOpen(false);
                alert(`Successfully loaded ${fileName}!`);
            } else {
                alert(result.error || "Failed to load file.");
            }
        } catch (error) {
            console.error("Error loading selected file:", error);
        }
    };

    // Save edited age for student
    const handleSaveStudentAge = (studentId: string) => {
        const parsedAge = parseInt(editingAgeInput, 10);
        const newAge = !isNaN(parsedAge) ? parsedAge : null;
        const newGroup = determineAgeGroup(newAge);

        const updated = students.map((std) => {
            if (std.id === studentId) {
                return {
                    ...std,
                    age: newAge,
                    ageGroup: newGroup,
                };
            }
            return std;
        });

        setStudents(updated);
        saveStateToStorage(updated);
        setEditingStudentId(null);
        setEditingAgeInput("");
    };

    // Start age inline editing
    const handleStartEdit = (student: RamadanStudent) => {
        setEditingStudentId(student.id);
        setEditingAgeInput(student.age !== null ? student.age.toString() : "");
    };

    // Cancel age inline editing
    const handleCancelEdit = () => {
        setEditingStudentId(null);
        setEditingAgeInput("");
    };

    // Memoized filter for student list
    const filteredStudents = useMemo(() => {
        return students.filter((student) => {
            const matchesSearch =
                !searchTerm.trim() ||
                student.name.toLowerCase().includes(searchTerm.toLowerCase().trim());

            const matchesGroup =
                selectedGroupFilter === "ALL" ||
                normalizeAgeGroup(student.ageGroup) === normalizeAgeGroup(selectedGroupFilter);

            return matchesSearch && matchesGroup;
        });
    }, [students, searchTerm, selectedGroupFilter]);

    // Lookup criteria for a student using normalized label comparison
    const getTargetCriteriaForStudent = (student: RamadanStudent) => {
        if (student.ageGroup === "Unassigned") return [];

        const normalizedStudentGroup = normalizeAgeGroup(student.ageGroup);
        const matchedGroup = ageGroups.find((g) => {
            return normalizeAgeGroup(g.label) === normalizedStudentGroup;
        });

        return matchedGroup ? matchedGroup.requirements : [];
    };

    return (
        <div className="space-y-6">
            {/* TOP CONTROL PANEL */}
            <div className="bg-slate-900 text-white rounded-xl p-5 shadow-lg border border-amber-500/20">
                <div className="flex flex-col lg:flex-row items-center justify-between gap-4">

                    {/* Title & Year Indicator */}
                    <div className="flex items-center gap-3">
                        <div className="p-2.5 bg-amber-500/10 rounded-lg border border-amber-500/30">
                            <Sparkles className="w-6 h-6 text-amber-400" />
                        </div>
                        <div>
                            <h2 className="text-lg font-bold text-amber-100 flex items-center gap-2">
                                Der produktive Ramadan der Kinder
                            </h2>
                            <div className="flex items-center gap-2 mt-1">
                                <span className="text-xs text-gray-400">Competition Year:</span>
                                {/* Dynamic Hijri & Gregorian Year Options */}
                                {(() => {
                                    const currentGregorianYear = new Date().getFullYear();
                                    const years = [currentGregorianYear, currentGregorianYear + 1];

                                    // Helper to extract Hijri year for a given Gregorian year (using Ramadan month ~ mid-year)
                                    const getHijriYear = (gregorianYear: number): string => {
                                        try {
                                            // Using April 1st of the target year as a proxy date for Ramadan calculation
                                            const sampleDate = new Date(gregorianYear, 3, 1);
                                            const formatter = new Intl.DateTimeFormat("en-US-u-ca-islamic-uma", {
                                                year: "numeric",
                                            });
                                            const parts = formatter.formatToParts(sampleDate);
                                            const hijriYearPart = parts.find((p) => p.type === "year");
                                            return hijriYearPart ? hijriYearPart.value : "";
                                        } catch {
                                            return "";
                                        }
                                    };

                                    return (
                                        <select
                                            value={competitionYear}
                                            onChange={(e) => {
                                                const y = parseInt(e.target.value, 10);
                                                setCompetitionYear(y);
                                                saveStateToStorage(students, y);
                                            }}
                                            className="bg-slate-800 text-amber-300 font-bold text-xs px-2 py-0.5 rounded border border-amber-500/30 focus:outline-none cursor-pointer"
                                        >
                                            {years.map((y) => {
                                                const hijriYear = getHijriYear(y);
                                                return (
                                                    <option key={y} value={y}>
                                                        {y} CE {hijriYear ? `(${hijriYear} AH)` : ""}
                                                    </option>
                                                );
                                            })}
                                        </select>
                                    );
                                })()}
                            </div>
                        </div>
                    </div>

                    {/* Action Toolbar */}
                    <div className="flex flex-wrap items-center gap-2.5">
                        {/* CSV/XLSX Importer */}
                        <label className="cursor-pointer bg-emerald-700 hover:bg-emerald-600 text-white text-xs px-3.5 py-2 rounded-lg font-medium flex items-center gap-1.5 transition-colors shadow-xs">
                            <Upload className="w-4 h-4" /> Import CSV/XLSX
                            <input type="file" accept=".csv,.txt" onChange={handleFileUpload} className="hidden" />
                        </label>

                        {/* Load State Button */}
                        <button
                            onClick={handleOpenLoadModal}
                            className="bg-slate-800 hover:bg-slate-700 text-gray-200 text-xs px-3.5 py-2 rounded-lg font-medium border border-gray-700 flex items-center gap-1.5 transition-colors cursor-pointer"
                        >
                            <FolderOpen className="w-4 h-4 text-amber-400" /> Load State
                        </button>

                        {/* File Selection Modal */}
                        {isLoadModalOpen && (
                            <div className="fixed inset-0 bg-black/50 backdrop-blur-xs flex items-center justify-center z-50 p-4">
                                <div className="bg-white rounded-xl shadow-xl border border-gray-200 max-w-md w-full p-5 space-y-4">
                                    <div className="flex items-center justify-between border-b pb-3">
                                        <h3 className="font-bold text-gray-900 text-sm flex items-center gap-2">
                                            <FolderOpen className="w-4 h-4 text-amber-500" /> Select Saved Server File
                                        </h3>
                                        <button
                                            onClick={() => setIsLoadModalOpen(false)}
                                            className="text-gray-400 hover:text-gray-600 text-xs font-bold"
                                        >
                                            ✕
                                        </button>
                                    </div>

                                    {isLoadingFiles ? (
                                        <div className="py-8 text-center text-xs text-gray-500">Loading available files...</div>
                                    ) : availableFiles.length === 0 ? (
                                        <div className="py-8 text-center text-xs text-gray-400">No saved JSON files found on server.</div>
                                    ) : (
                                        <div className="max-h-60 overflow-y-auto space-y-2">
                                            {availableFiles.map((file) => (
                                                <button
                                                    key={file.fileName}
                                                    onClick={() => handleLoadSelectedFile(file.fileName)}
                                                    className="w-full text-left p-3 rounded-lg border border-gray-200 hover:border-amber-500 hover:bg-amber-50/50 transition-all flex flex-col gap-1 cursor-pointer group"
                                                >
                                                    <span className="text-xs font-bold text-gray-800 group-hover:text-amber-900">
                                                        {file.fileName}
                                                    </span>
                                                    <span className="text-[10px] text-gray-400">
                                                        Modified: {new Date(file.updatedAt).toLocaleString()}
                                                    </span>
                                                </button>
                                            ))}
                                        </div>
                                    )}
                                </div>
                            </div>
                        )}

                        {/* Save JSON */}
                        <button
                            onClick={handleExportJSON}
                            disabled={students.length === 0}
                            className="bg-slate-800 hover:bg-slate-700 disabled:opacity-40 text-gray-200 text-xs px-3.5 py-2 rounded-lg font-medium border border-gray-700 flex items-center gap-1.5 transition-colors cursor-pointer"
                        >
                            <Download className="w-4 h-4 text-emerald-400" /> Save JSON
                        </button>

                        {/* Admin Panel Button */}
                        <button
                            onClick={() => setIsAdminOpen(true)}
                            className="bg-amber-600 hover:bg-amber-500 text-white text-xs px-3.5 py-2 rounded-lg font-bold flex items-center gap-1.5 transition-colors shadow-xs cursor-pointer"
                        >
                            <Settings className="w-4 h-4" /> Admin Criteria
                        </button>
                    </div>
                </div>
            </div>

            {/* FILTER & STATS BAR */}
            <div className="flex flex-col sm:flex-row items-center justify-between gap-4 bg-white p-4 rounded-xl border border-gray-200 shadow-2xs">
                <div className="flex items-center gap-3 w-full sm:w-auto">
                    <div className="relative flex-1 sm:w-64">
                        <Search className="w-4 h-4 absolute left-3 top-2.5 text-gray-400" />
                        <input
                            type="text"
                            placeholder="Search student name..."
                            value={searchTerm}
                            onChange={(e) => setSearchTerm(e.target.value)}
                            className="w-full text-xs pl-9 pr-3 py-2 border rounded-lg focus:outline-none focus:ring-1 focus:ring-emerald-600"
                        />
                    </div>

                    <select
                        value={selectedGroupFilter}
                        onChange={(e) => setSelectedGroupFilter(e.target.value)}
                        className="text-xs border p-2 rounded-lg bg-gray-50 font-medium focus:outline-none cursor-pointer"
                    >
                        <option value="ALL">All Age Groups</option>
                        {ageGroups.map((group) => (
                            <option key={group.id} value={group.label}>
                                Group {group.label}
                            </option>
                        ))}
                        <option value="Unassigned">Unassigned (Missing Age)</option>
                    </select>
                </div>

                <div className="flex items-center gap-4 text-xs text-gray-600">
                    <span className="font-semibold text-emerald-900 bg-emerald-50 px-3 py-1 rounded-full border border-emerald-200">
                        Total Students: {students.length}
                    </span>
                    <span className="font-semibold text-amber-900 bg-amber-50 px-3 py-1 rounded-full border border-amber-200">
                        Filtered: {filteredStudents.length}
                    </span>
                </div>
            </div>

            {/* STUDENT ROSTER TABLE */}
            <div className="bg-white rounded-xl border border-gray-200 overflow-hidden shadow-2xs">
                <table className="w-full text-left border-collapse text-xs">
                    <thead>
                        <tr className="bg-gray-100 text-gray-700 font-bold border-b border-gray-200">
                            <th className="p-3.5">#</th>
                            <th className="p-3.5">Student Name</th>
                            <th className="p-3.5">Age</th>
                            <th className="p-3.5">Gender</th>
                            <th className="p-3.5">Assigned Age Group</th>
                            <th className="p-3.5">Target Criteria Rules</th>
                            <th className="p-3.5 text-right">Actions</th>
                        </tr>
                    </thead>
                    <tbody className="divide-y divide-gray-100">
                        {filteredStudents.length === 0 ? (
                            <tr>
                                <td colSpan={7} className="text-center py-12 text-gray-400">
                                    No student records loaded yet. Import a CSV/XLSX file to get started.
                                </td>
                            </tr>
                        ) : (
                            filteredStudents.map((std, idx) => {
                                const reqs = getTargetCriteriaForStudent(std);
                                const isEditing = editingStudentId === std.id;

                                return (
                                    <tr key={std.id} className="hover:bg-gray-50 transition-colors">
                                        <td className="p-3.5 text-gray-400 font-medium">{idx + 1}</td>
                                        <td className="p-3.5 font-bold text-gray-900">{std.name}</td>

                                        {/* Age Column (Blank when null) */}
                                        <td className="p-3.5 text-gray-700 font-medium">
                                            {isEditing ? (
                                                <div className="flex items-center gap-1">
                                                    <input
                                                        type="number"
                                                        min={1}
                                                        max={25}
                                                        value={editingAgeInput}
                                                        onChange={(e) => setEditingAgeInput(e.target.value)}
                                                        placeholder="Age"
                                                        className="w-16 px-2 py-1 text-xs border border-amber-400 rounded focus:outline-none focus:ring-1 focus:ring-emerald-600 bg-amber-50"
                                                        autoFocus
                                                    />
                                                </div>
                                            ) : (
                                                <span>{std.age !== null ? `${std.age} yrs` : ""}</span>
                                            )}
                                        </td>

                                        <td className="p-3.5 text-gray-600">{std.gender}</td>

                                        {/* Age Group Badge */}
                                        <td className="p-3.5">
                                            {std.ageGroup === "Unassigned" ? (
                                                <span className="px-2.5 py-1 rounded-md text-[11px] font-bold bg-rose-100 text-rose-800 border border-rose-300">
                                                    Unassigned
                                                </span>
                                            ) : (
                                                <span className="px-2.5 py-1 rounded-md text-[11px] font-bold bg-amber-100 text-amber-900 border border-amber-300">
                                                    {std.ageGroup}
                                                </span>
                                            )}
                                        </td>

                                        {/* Criteria Rules Summary */}
                                        <td className="p-3.5 text-gray-600 max-w-xs truncate" title={reqs.join(", ")}>
                                            {reqs.length > 0 ? `${reqs.length} criteria defined` : "None"}
                                        </td>

                                        {/* Actions */}
                                        <td className="p-3.5 text-right">
                                            {isEditing ? (
                                                <div className="flex items-center justify-end gap-1">
                                                    <button
                                                        onClick={() => handleSaveStudentAge(std.id)}
                                                        className="p-1 text-emerald-600 hover:bg-emerald-50 rounded cursor-pointer"
                                                        title="Save"
                                                    >
                                                        <Check className="w-4 h-4" />
                                                    </button>
                                                    <button
                                                        onClick={handleCancelEdit}
                                                        className="p-1 text-gray-400 hover:bg-gray-100 rounded cursor-pointer"
                                                        title="Cancel"
                                                    >
                                                        <X className="w-4 h-4" />
                                                    </button>
                                                </div>
                                            ) : (
                                                <button
                                                    onClick={() => handleStartEdit(std)}
                                                    className="inline-flex items-center gap-1 text-xs text-slate-600 hover:text-slate-900 bg-gray-100 hover:bg-gray-200 px-2 py-1 rounded transition-colors cursor-pointer"
                                                >
                                                    <Edit2 className="w-3 h-3" /> Edit Age
                                                </button>
                                            )}
                                        </td>
                                    </tr>
                                );
                            })
                        )}
                    </tbody>
                </table>
            </div>

            {/* ADMIN MODAL */}
            <RamadanAdminModal
                isOpen={isAdminOpen}
                onClose={() => setIsAdminOpen(false)}
                ageGroups={ageGroups}
                onSaveGroups={(updated) => {
                    setAgeGroups(updated);
                    saveStateToStorage(students, competitionYear, updated);
                }}
            />
        </div>
    );
}