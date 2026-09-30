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
    Award,
    Star,
    Plus,
    Trash2,
    FileText,
    Printer,
} from "lucide-react";
import {
    DEFAULT_RAMADAN_AGE_GROUPS,
    DEFAULT_VERDICT_OPTIONS,
    RamadanAgeGroup,
    VerdictOption,
} from "../../data/ramadanRequirements";
import RamadanReportBulkPrintModal from "./RamadanReportBulkPrintModal";
import { RamadanPerformanceData } from "./RamadanReportCard";

export interface StudentPerformance {
    targetCriteria: Record<string, "fully" | "partially" | "not_achieved">;
    additionalCriteria: {
        quranLesen: boolean;
        alleTageFasten: boolean;
        tahajjud: boolean;
        taraweeh: boolean;
        uebernachtungMoschee: boolean;
    };
    customCriteria: string; // User input for additional tasks / notes
    verdict: string | null;
    bonusPoints: boolean;
}

export interface RamadanStudent {
    id: string;
    name: string;
    age: number | null;
    gender: "Male" | "Female" | string;
    ageGroup: string;
    performance?: StudentPerformance;
}

export const determineAgeGroup = (
    age: number | null | undefined,
    groups: RamadanAgeGroup[] = DEFAULT_RAMADAN_AGE_GROUPS
): string => {
    if (age === null || age === undefined || isNaN(age)) return "Unassigned";

    const matched = groups.find((g) => age >= g.ageMin && age <= g.ageMax);
    return matched ? matched.label : "Unassigned";
};

export default function ProductiveRamadanView() {
    const [competitionYear, setCompetitionYear] = useState<number>(new Date().getFullYear());
    const [students, setStudents] = useState<RamadanStudent[]>([]);
    const [ageGroups, setAgeGroups] = useState<RamadanAgeGroup[]>(DEFAULT_RAMADAN_AGE_GROUPS);
    const [verdictOptions, setVerdictOptions] = useState<VerdictOption[]>(DEFAULT_VERDICT_OPTIONS);
    const [bonusPrizeMoney, setBonusPrizeMoney] = useState<number>(5);

    const [isAdminOpen, setIsAdminOpen] = useState<boolean>(false);
    const [isPrintModalOpen, setIsPrintModalOpen] = useState<boolean>(false);
    const [searchTerm, setSearchTerm] = useState<string>("");
    const [selectedGroupFilter, setSelectedGroupFilter] = useState<string>("ALL");

    // Inline Age Editing State
    const [editingStudentId, setEditingStudentId] = useState<string | null>(null);
    const [editingAgeInput, setEditingAgeInput] = useState<string>("");

    // Load State File Selection Modal
    const [isLoadModalOpen, setIsLoadModalOpen] = useState<boolean>(false);
    const [availableFiles, setAvailableFiles] = useState<{ fileName: string; updatedAt: string }[]>([]);
    const [isLoadingFiles, setIsLoadingFiles] = useState<boolean>(false);

    // Performance Modal
    const [selectedStudentForPerformance, setSelectedStudentForPerformance] = useState<RamadanStudent | null>(null);
    const [performanceDraft, setPerformanceDraft] = useState<StudentPerformance>({
        targetCriteria: {},
        additionalCriteria: {
            quranLesen: false,
            alleTageFasten: false,
            tahajjud: false,
            taraweeh: false,
            uebernachtungMoschee: false,
        },
        customCriteria: "",
        verdict: null,
        bonusPoints: false,
    });

    // Load local storage data on mount
    useEffect(() => {
        const savedData = localStorage.getItem("productive_ramadan_data");
        if (savedData) {
            try {
                const parsed = JSON.parse(savedData);
                const loadedGroups = parsed.ageGroups || DEFAULT_RAMADAN_AGE_GROUPS;

                if (parsed.students) {
                    const cleanedStudents = parsed.students.map((s: any) => ({
                        ...s,
                        age: typeof s.age === "number" && !isNaN(s.age) ? s.age : null,
                        ageGroup: determineAgeGroup(s.age, loadedGroups),
                    }));
                    setStudents(cleanedStudents);
                }
                if (parsed.year) setCompetitionYear(parsed.year);
                setAgeGroups(loadedGroups);
                if (parsed.verdictOptions) setVerdictOptions(parsed.verdictOptions);
                if (typeof parsed.bonusPrizeMoney === "number") setBonusPrizeMoney(parsed.bonusPrizeMoney);
            } catch (e) {
                console.error("Error loading local storage state", e);
            }
        }
    }, []);

    // Save state helper
    const saveStateToStorage = (
        updatedStudents = students,
        updatedYear = competitionYear,
        updatedGroups = ageGroups,
        updatedVerdicts = verdictOptions,
        updatedBonus = bonusPrizeMoney
    ) => {
        const payload = {
            year: updatedYear,
            students: updatedStudents,
            ageGroups: updatedGroups,
            verdictOptions: updatedVerdicts,
            bonusPrizeMoney: updatedBonus,
            updatedAt: new Date().toISOString(),
        };
        localStorage.setItem("productive_ramadan_data", JSON.stringify(payload));
    };

    // Save JSON payload including updated verdicts & criteria to server
    const handleExportJSON = async () => {
        if (students.length === 0) return;

        try {
            const payload = {
                year: competitionYear,
                ageGroups,
                verdictOptions,
                bonusPrizeMoney,
                students,
                updatedAt: new Date().toISOString(),
            };

            const response = await fetch("/api/save-ramadan-data", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ year: competitionYear, data: payload }),
            });

            const result = await response.json();

            if (response.ok && result.success) {
                alert(`Configuration & student records saved on server!`);
            } else {
                alert(`Failed to save state on server: ${result.error}`);
            }
        } catch (error) {
            console.error("Error saving state to server:", error);
            alert("An error occurred while saving state to the server.");
        }
    };

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

    // Load selected JSON file containing student performance & custom verdicts
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
                const loadedGroups = parsed.ageGroups || ageGroups;

                if (parsed.students) {
                    const cleanedStudents = parsed.students.map((s: any) => ({
                        ...s,
                        age: typeof s.age === "number" && !isNaN(s.age) ? s.age : null,
                        ageGroup: determineAgeGroup(s.age, loadedGroups),
                    }));
                    setStudents(cleanedStudents);
                }

                const loadedYear = parsed.year || competitionYear;
                const loadedVerdicts = parsed.verdictOptions || verdictOptions;
                const loadedBonus = typeof parsed.bonusPrizeMoney === "number" ? parsed.bonusPrizeMoney : bonusPrizeMoney;

                setCompetitionYear(loadedYear);
                setAgeGroups(loadedGroups);
                setVerdictOptions(loadedVerdicts);
                setBonusPrizeMoney(loadedBonus);

                saveStateToStorage(parsed.students, loadedYear, loadedGroups, loadedVerdicts, loadedBonus);
                setIsLoadModalOpen(false);
                alert(`Successfully loaded ${fileName}!`);
            } else {
                alert(result.error || "Failed to load file.");
            }
        } catch (error) {
            console.error("Error loading selected file:", error);
        }
    };

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
                    const hasDigits = /\d/.test(rawAgeCol);
                    const age = hasDigits ? parseInt(rawAgeCol.replace(/\D/g, ""), 10) : null;
                    const gender = cols[2] ? cols[2].trim() : "Unspecified";
                    const calculatedGroup = determineAgeGroup(age, ageGroups);

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

    const handleSaveStudentAge = (studentId: string) => {
        const parsedAge = parseInt(editingAgeInput, 10);
        const newAge = !isNaN(parsedAge) ? parsedAge : null;
        const newGroup = determineAgeGroup(newAge, ageGroups);

        const updated = students.map((std) => (std.id === studentId ? { ...std, age: newAge, ageGroup: newGroup } : std));
        setStudents(updated);
        saveStateToStorage(updated);
        setEditingStudentId(null);
        setEditingAgeInput("");
    };

    const getTargetCriteriaForStudent = (student: RamadanStudent) => {
        if (student.ageGroup === "Unassigned") return [];
        const matchedGroup = ageGroups.find((g) => g.label === student.ageGroup);
        return matchedGroup ? matchedGroup.requirements : [];
    };

    const handleOpenPerformanceModal = (student: RamadanStudent) => {
        setSelectedStudentForPerformance(student);
        const existing = student.performance;

        const rules = getTargetCriteriaForStudent(student);
        const initialTargetRatings: Record<string, "fully" | "partially" | "not_achieved"> = {};
        rules.forEach((rule) => {
            initialTargetRatings[rule] = existing?.targetCriteria?.[rule] || "fully";
        });

        setPerformanceDraft({
            targetCriteria: initialTargetRatings,
            additionalCriteria: existing?.additionalCriteria || {
                quranLesen: false,
                alleTageFasten: false,
                tahajjud: false,
                taraweeh: false,
                uebernachtungMoschee: false,
            },
            customCriteria: existing?.customCriteria || "",
            verdict: existing?.verdict || null,
            bonusPoints: existing?.bonusPoints || false,
        });
    };

    const handleSavePerformance = () => {
        if (!selectedStudentForPerformance) return;

        const updated = students.map((std) =>
            std.id === selectedStudentForPerformance.id ? { ...std, performance: performanceDraft } : std
        );

        setStudents(updated);
        saveStateToStorage(updated);
        setSelectedStudentForPerformance(null);
    };

    const calculatePrizeMoney = (performance?: StudentPerformance) => {
        if (!performance || !performance.verdict) return 0;
        const matchedVerdict = verdictOptions.find((v) => v.name === performance.verdict);
        const basePrize = matchedVerdict ? matchedVerdict.prizeMoney : 0;
        const bonus = performance.bonusPoints ? bonusPrizeMoney : 0;
        return basePrize + bonus;
    };

    const filteredStudents = useMemo(() => {
        return students.filter((student) => {
            const matchesSearch =
                !searchTerm.trim() || student.name.toLowerCase().includes(searchTerm.toLowerCase().trim());
            const matchesGroup =
                selectedGroupFilter === "ALL" || student.ageGroup === selectedGroupFilter;

            return matchesSearch && matchesGroup;
        });
    }, [students, searchTerm, selectedGroupFilter]);

    // Format students with valid performances for PDF Report Cards
    const participantsWithPerformance = useMemo<RamadanPerformanceData[]>(() => {
        return students
            .filter((std) => std.performance && std.performance.verdict)
            .map((std) => {
                const perf = std.performance!;

                // 1. Target criteria ratings
                const targetRules = Object.entries(perf.targetCriteria || {}).map(([rule, rating]) => {
                    const statusLabel =
                        rating === "fully"
                            ? "Vollständig erreicht"
                            : rating === "partially"
                                ? "Teilweise erreicht"
                                : "Nicht erreicht";
                    return { criterion: rule, result: statusLabel };
                });

                // 2. Default checkbox activities
                const extraActivitiesList: string[] = [];
                if (perf.additionalCriteria?.quranLesen) extraActivitiesList.push("Vollständiges Qur'an lesen");
                if (perf.additionalCriteria?.alleTageFasten) extraActivitiesList.push("Alle Tage Fasten");
                if (perf.additionalCriteria?.tahajjud) extraActivitiesList.push("Tahajjud Gebete");
                if (perf.additionalCriteria?.taraweeh) extraActivitiesList.push("Taraweeh Gebete");
                if (perf.additionalCriteria?.uebernachtungMoschee) extraActivitiesList.push("Übernachtung in der Moschee");

                // 3. Process custom multiline entries (Convert newlines -> Array items)
                const customTasksList = (perf.customCriteria || "")
                    .split("\n")
                    .map((line) => line.trim())
                    .filter((line) => line.length > 0);

                // 4. Combine both lists cleanly with comma separators (NO brackets)
                const allTasksCombined = [...extraActivitiesList, ...customTasksList];
                const formattedAdditionalTasks = allTasksCombined.length > 0 ? allTasksCombined.join(", ") : undefined;

                const prize = calculatePrizeMoney(perf);

                return {
                    studentId: std.id,
                    studentName: std.name,
                    ageGroup: std.ageGroup !== "Unassigned" ? `Gruppe ${std.ageGroup}` : "Altersgruppe k.A.",
                    verdict: perf.verdict!,
                    criteriaResults: targetRules,
                    additionalTasks: formattedAdditionalTasks, // Clean, comma-separated string
                    bonusAmount: perf.bonusPoints ? `+${bonusPrizeMoney} € (Sonderbonus)` : undefined,
                    prizeMoney: `${prize},00 €`,
                };
            });
    }, [students, verdictOptions, bonusPrizeMoney]);

    return (
        <div className="space-y-6">
            {/* TOP BAR CONTROL PANEL */}
            <div className="bg-slate-900 text-white rounded-xl p-5 shadow-lg border border-amber-500/20">
                <div className="flex flex-col lg:flex-row items-center justify-between gap-4">
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
                                {(() => {
                                    const currentGregorianYear = new Date().getFullYear();
                                    const years = [currentGregorianYear, currentGregorianYear + 1];

                                    const getHijriYear = (gregorianYear: number): string => {
                                        try {
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

                    <div className="flex flex-wrap items-center gap-2.5">
                        <button
                            onClick={() => setIsPrintModalOpen(true)}
                            disabled={participantsWithPerformance.length === 0}
                            className="bg-amber-500 hover:bg-amber-400 disabled:opacity-40 text-slate-950 font-extrabold text-xs px-3.5 py-2 rounded-lg flex items-center gap-1.5 transition-colors shadow-xs cursor-pointer"
                        >
                            <Printer className="w-4 h-4" /> Berichte drucken ({participantsWithPerformance.length})
                        </button>

                        <label className="cursor-pointer bg-emerald-700 hover:bg-emerald-600 text-white text-xs px-3.5 py-2 rounded-lg font-medium flex items-center gap-1.5 transition-colors shadow-xs">
                            <Upload className="w-4 h-4" /> Import CSV/XLSX
                            <input type="file" accept=".csv,.txt" onChange={handleFileUpload} className="hidden" />
                        </label>

                        <button
                            onClick={handleOpenLoadModal}
                            className="bg-slate-800 hover:bg-slate-700 text-gray-200 text-xs px-3.5 py-2 rounded-lg font-medium border border-gray-700 flex items-center gap-1.5 transition-colors cursor-pointer"
                        >
                            <FolderOpen className="w-4 h-4 text-amber-400" /> Load State
                        </button>

                        <button
                            onClick={handleExportJSON}
                            disabled={students.length === 0}
                            className="bg-slate-800 hover:bg-slate-700 disabled:opacity-40 text-gray-200 text-xs px-3.5 py-2 rounded-lg font-medium border border-gray-700 flex items-center gap-1.5 transition-colors cursor-pointer"
                        >
                            <Download className="w-4 h-4 text-emerald-400" /> Save JSON
                        </button>

                        <button
                            onClick={() => setIsAdminOpen(true)}
                            className="bg-slate-800 hover:bg-slate-700 text-white text-xs px-3.5 py-2 rounded-lg font-bold border border-gray-700 flex items-center gap-1.5 transition-colors shadow-xs cursor-pointer"
                        >
                            <Settings className="w-4 h-4 text-amber-400" /> Admin Panel
                        </button>
                    </div>
                </div>
            </div>

            {/* FILTER BAR */}
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
                                Group {group.code} ({group.label})
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
                            <th className="p-3.5">Assigned Group</th>
                            <th className="p-3.5">Verdict & Prize</th>
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
                                const isEditing = editingStudentId === std.id;
                                const isAgeMissing = std.age === null;
                                const prizeAmount = calculatePrizeMoney(std.performance);

                                return (
                                    <tr key={std.id} className="hover:bg-gray-50 transition-colors">
                                        <td className="p-3.5 text-gray-400 font-medium">{idx + 1}</td>
                                        <td className="p-3.5 font-bold text-gray-900">{std.name}</td>

                                        <td className="p-3.5 text-gray-700 font-medium">
                                            {isEditing ? (
                                                <input
                                                    type="number"
                                                    min={1}
                                                    max={25}
                                                    value={editingAgeInput}
                                                    onChange={(e) => setEditingAgeInput(e.target.value)}
                                                    className="w-16 px-2 py-1 text-xs border border-amber-400 rounded focus:outline-none bg-amber-50"
                                                    autoFocus
                                                />
                                            ) : (
                                                <span>{std.age !== null ? `${std.age} yrs` : ""}</span>
                                            )}
                                        </td>

                                        <td className="p-3.5 text-gray-600">{std.gender}</td>

                                        <td className="p-3.5">
                                            {std.ageGroup === "Unassigned" ? (
                                                <span className="px-2.5 py-1 rounded-md text-[11px] font-bold bg-rose-100 text-rose-800 border border-rose-300">
                                                    Unassigned
                                                </span>
                                            ) : (
                                                <span className="px-2.5 py-1 rounded-md text-[11px] font-bold bg-amber-100 text-amber-900 border border-amber-300">
                                                    Group {std.ageGroup}
                                                </span>
                                            )}
                                        </td>

                                        <td className="p-3.5 font-bold">
                                            {std.performance?.verdict ? (
                                                <div className="flex items-center gap-1.5">
                                                    <span className="inline-flex items-center gap-1 text-emerald-800 bg-emerald-100 border border-emerald-300 px-2 py-0.5 rounded-full text-[10px]">
                                                        <Award className="w-3 h-3 text-emerald-600" />
                                                        {std.performance.verdict}
                                                        {std.performance.bonusPoints && (
                                                            <Star className="w-3 h-3 text-amber-500 fill-amber-400" />
                                                        )}
                                                    </span>
                                                    <span className="text-xs text-amber-700 font-extrabold bg-amber-50 px-2 py-0.5 rounded border border-amber-200">
                                                        €{prizeAmount}
                                                    </span>
                                                </div>
                                            ) : (
                                                <span className="text-gray-400 text-[11px]">Not Evaluated</span>
                                            )}
                                        </td>

                                        <td className="p-3.5 text-right">
                                            <div className="flex items-center justify-end gap-2">
                                                <button
                                                    onClick={() => handleOpenPerformanceModal(std)}
                                                    disabled={isAgeMissing}
                                                    className={`inline-flex items-center gap-1 text-xs px-2.5 py-1 rounded transition-colors ${isAgeMissing
                                                        ? "bg-gray-100 text-gray-300 border border-gray-200 cursor-not-allowed opacity-60"
                                                        : "bg-amber-50 hover:bg-amber-100 text-amber-900 border border-amber-300 font-bold cursor-pointer"
                                                        }`}
                                                >
                                                    <Award className="w-3.5 h-3.5 text-amber-600" /> Performance
                                                </button>

                                                {isEditing ? (
                                                    <div className="flex items-center gap-1">
                                                        <button
                                                            onClick={() => handleSaveStudentAge(std.id)}
                                                            className="p-1 text-emerald-600 hover:bg-emerald-50 rounded cursor-pointer"
                                                        >
                                                            <Check className="w-4 h-4" />
                                                        </button>
                                                        <button
                                                            onClick={() => setEditingStudentId(null)}
                                                            className="p-1 text-gray-400 hover:bg-gray-100 rounded cursor-pointer"
                                                        >
                                                            <X className="w-4 h-4" />
                                                        </button>
                                                    </div>
                                                ) : (
                                                    <button
                                                        onClick={() => {
                                                            setEditingStudentId(std.id);
                                                            setEditingAgeInput(std.age !== null ? std.age.toString() : "");
                                                        }}
                                                        className="inline-flex items-center gap-1 text-xs text-slate-600 hover:text-slate-900 bg-gray-100 hover:bg-gray-200 px-2 py-1 rounded transition-colors cursor-pointer"
                                                    >
                                                        <Edit2 className="w-3 h-3" /> Edit Age
                                                    </button>
                                                )}
                                            </div>
                                        </td>
                                    </tr>
                                );
                            })
                        )}
                    </tbody>
                </table>
            </div>

            {/* PERFORMANCE EVALUATION MODAL */}
            {selectedStudentForPerformance && (
                <div className="fixed inset-0 bg-black/60 backdrop-blur-xs flex items-center justify-center z-50 p-4">
                    <div className="bg-white rounded-xl shadow-2xl border border-gray-200 max-w-2xl w-full p-6 space-y-5 max-h-[90vh] overflow-y-auto">
                        <div className="flex items-center justify-between border-b pb-3">
                            <div>
                                <h3 className="font-bold text-gray-900 text-base flex items-center gap-2">
                                    <Award className="w-5 h-5 text-amber-500" /> Performance Entry: {selectedStudentForPerformance.name}
                                </h3>
                                <p className="text-xs text-gray-500 mt-0.5">
                                    Age: <strong>{selectedStudentForPerformance.age} yrs</strong> | Group: <strong>{selectedStudentForPerformance.ageGroup}</strong>
                                </p>
                            </div>
                            <button onClick={() => setSelectedStudentForPerformance(null)} className="text-gray-400 hover:text-gray-600 text-xs font-bold cursor-pointer">
                                ✕
                            </button>
                        </div>

                        {/* TARGET CRITERIA RATINGS */}
                        <div className="space-y-3">
                            <h4 className="text-xs font-bold text-slate-900 uppercase tracking-wider">Target Criteria Rules</h4>
                            {getTargetCriteriaForStudent(selectedStudentForPerformance).map((rule) => (
                                <div key={rule} className="p-3 rounded-lg border border-gray-100 bg-gray-50/50 flex flex-col sm:flex-row sm:items-center justify-between gap-2">
                                    <span className="text-xs font-medium text-gray-800">{rule}</span>
                                    <div className="flex items-center gap-3 text-xs">
                                        {(["fully", "partially", "not_achieved"] as const).map((status) => (
                                            <label key={status} className="flex items-center gap-1 cursor-pointer">
                                                <input
                                                    type="radio"
                                                    name={`rule-${rule}`}
                                                    checked={performanceDraft.targetCriteria[rule] === status}
                                                    onChange={() =>
                                                        setPerformanceDraft((prev) => ({
                                                            ...prev,
                                                            targetCriteria: { ...prev.targetCriteria, [rule]: status },
                                                        }))
                                                    }
                                                    className="text-emerald-600"
                                                />
                                                <span className="capitalize text-[11px] text-gray-600">{status.replace("_", " ")}</span>
                                            </label>
                                        ))}
                                    </div>
                                </div>
                            ))}
                        </div>

                        {/* ADDITIONAL CHECKBOX ACTIVITIES */}
                        <div className="space-y-3 pt-2 border-t">
                            <h4 className="text-xs font-bold text-slate-900 uppercase tracking-wider">Mosque / Ramadan Activities</h4>
                            <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 text-xs">
                                {[
                                    { key: "quranLesen", label: "Vollständige Quran Lesen" },
                                    { key: "alleTageFasten", label: "Alle Tage Fasten" },
                                    { key: "tahajjud", label: "Tahajjud" },
                                    { key: "taraweeh", label: "Taraweeh" },
                                    { key: "uebernachtungMoschee", label: "Übernachtung in der Moschee" },
                                ].map((item) => (
                                    <label key={item.key} className="flex items-center gap-2 p-2 rounded border border-gray-200 hover:bg-gray-50 cursor-pointer">
                                        <input
                                            type="checkbox"
                                            checked={(performanceDraft.additionalCriteria as any)[item.key]}
                                            onChange={(e) =>
                                                setPerformanceDraft((prev) => ({
                                                    ...prev,
                                                    additionalCriteria: { ...prev.additionalCriteria, [item.key]: e.target.checked },
                                                }))
                                            }
                                            className="rounded text-emerald-600"
                                        />
                                        <span className="text-gray-700 font-medium">{item.label}</span>
                                    </label>
                                ))}
                            </div>
                        </div>

                        {/* USER INPUT FOR CUSTOM TASKS & NOTES */}
                        <div className="space-y-2 pt-2 border-t">
                            <label className="text-xs font-bold text-slate-900 uppercase tracking-wider flex items-center justify-between">
                                <span className="flex items-center gap-1.5">
                                    <FileText className="w-3.5 h-3.5 text-amber-600" /> Additional Tasks / Notes Input
                                </span>
                                <span className="text-[10px] font-normal text-gray-500">
                                    (One task per line - converted to comma separated on report)
                                </span>
                            </label>
                            <textarea
                                value={performanceDraft.customCriteria}
                                onChange={(e) =>
                                    setPerformanceDraft((prev) => ({
                                        ...prev,
                                        customCriteria: e.target.value,
                                    }))
                                }
                                placeholder={`did one thing\ndid 2 things\ndid lots of good deeds`}
                                rows={3}
                                className="w-full text-xs p-3 border border-gray-300 rounded-lg focus:ring-1 focus:ring-emerald-600 focus:outline-none"
                            />
                        </div>

                        {/* DYNAMIC VERDICTS */}
                        <div className="space-y-3 pt-2 border-t bg-amber-50/50 p-3.5 rounded-xl border border-amber-200">
                            <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
                                <div>
                                    <h4 className="text-xs font-bold text-amber-900 uppercase tracking-wider">Final Verdict</h4>
                                    <div className="flex items-center gap-4 mt-2 flex-wrap">
                                        {verdictOptions.map((v) => (
                                            <label key={v.id} className="flex items-center gap-1.5 cursor-pointer font-bold text-xs text-gray-800">
                                                <input
                                                    type="radio"
                                                    name="verdict"
                                                    checked={performanceDraft.verdict === v.name}
                                                    onChange={() => setPerformanceDraft((prev) => ({ ...prev, verdict: v.name }))}
                                                    className="text-amber-600"
                                                />
                                                {v.name} (€{v.prizeMoney})
                                            </label>
                                        ))}
                                    </div>
                                </div>

                                <label className="flex items-center gap-2 cursor-pointer bg-white px-3 py-2 rounded-lg border border-amber-300 shadow-2xs">
                                    <input
                                        type="checkbox"
                                        checked={performanceDraft.bonusPoints}
                                        onChange={(e) => setPerformanceDraft((prev) => ({ ...prev, bonusPoints: e.target.checked }))}
                                        className="rounded text-amber-600"
                                    />
                                    <Star className="w-4 h-4 text-amber-500 fill-amber-400" />
                                    <span className="text-xs font-bold text-amber-900">Bonus (+€{bonusPrizeMoney})</span>
                                </label>
                            </div>
                        </div>

                        <div className="flex items-center justify-end gap-2 pt-2 border-t">
                            <button onClick={() => setSelectedStudentForPerformance(null)} className="px-4 py-2 text-xs text-gray-600 hover:bg-gray-100 rounded-lg cursor-pointer">
                                Cancel
                            </button>
                            <button onClick={handleSavePerformance} className="px-4 py-2 text-xs font-bold text-white bg-emerald-700 hover:bg-emerald-600 rounded-lg shadow-xs cursor-pointer">
                                Save Performance
                            </button>
                        </div>
                    </div>
                </div>
            )}

            {/* SERVER FILE SELECTION MODAL */}
            {isLoadModalOpen && (
                <div className="fixed inset-0 bg-black/50 backdrop-blur-xs flex items-center justify-center z-50 p-4">
                    <div className="bg-white rounded-xl shadow-xl border border-gray-200 max-w-md w-full p-5 space-y-4">
                        <div className="flex items-center justify-between border-b pb-3">
                            <h3 className="font-bold text-gray-900 text-sm flex items-center gap-2">
                                <FolderOpen className="w-4 h-4 text-amber-500" /> Select Saved Server File
                            </h3>
                            <button
                                onClick={() => setIsLoadModalOpen(false)}
                                className="text-gray-400 hover:text-gray-600 text-xs font-bold cursor-pointer"
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

            {/* RAMADAN REPORT BULK PRINT MODAL */}
            {isPrintModalOpen && (
                <RamadanReportBulkPrintModal
                    isOpen={isPrintModalOpen}
                    onClose={() => setIsPrintModalOpen(false)}
                    studentsData={participantsWithPerformance}
                />
            )}

            {/* ADMIN PANEL MODAL */}
            {isAdminOpen && (
                <RamadanAdminModal
                    isOpen={isAdminOpen}
                    onClose={() => setIsAdminOpen(false)}
                    ageGroups={ageGroups}
                    verdictOptions={verdictOptions}
                    bonusPrizeMoney={bonusPrizeMoney}
                    onSave={(updatedGroups, updatedVerdicts, updatedBonus) => {
                        setAgeGroups(updatedGroups);
                        setVerdictOptions(updatedVerdicts);
                        setBonusPrizeMoney(updatedBonus);
                        saveStateToStorage(students, competitionYear, updatedGroups, updatedVerdicts, updatedBonus);
                        setIsAdminOpen(false);
                    }}
                />
            )}
        </div>
    );
}

// ADMIN PANEL MODAL
function RamadanAdminModal({
    isOpen,
    onClose,
    ageGroups,
    verdictOptions,
    bonusPrizeMoney,
    onSave,
}: {
    isOpen: boolean;
    onClose: () => void;
    ageGroups: RamadanAgeGroup[];
    verdictOptions: VerdictOption[];
    bonusPrizeMoney: number;
    onSave: (groups: RamadanAgeGroup[], verdicts: VerdictOption[], bonus: number) => void;
}) {
    const [activeTab, setActiveTab] = useState<"criteria" | "verdicts">("verdicts");

    const [verdictsState, setVerdictsState] = useState<VerdictOption[]>(verdictOptions);
    const [bonusState, setBonusState] = useState<number>(bonusPrizeMoney);
    const [rawRequirements, setRawRequirements] = useState<Record<string, string>>({});

    useEffect(() => {
        setVerdictsState(verdictOptions);
        setBonusState(bonusPrizeMoney);

        const map: Record<string, string> = {};
        ageGroups.forEach((g) => {
            map[g.id] = g.requirements.join("\n");
        });
        setRawRequirements(map);
    }, [isOpen, ageGroups, verdictOptions, bonusPrizeMoney]);

    const [newVerdictName, setNewVerdictName] = useState("");
    const [newVerdictPrize, setNewVerdictPrize] = useState(10);

    if (!isOpen) return null;

    const handleAddVerdict = () => {
        if (!newVerdictName.trim()) return;
        const newVerdict: VerdictOption = {
            id: `verdict-${Date.now()}`,
            name: newVerdictName.trim(),
            prizeMoney: Math.max(0, newVerdictPrize),
        };
        setVerdictsState((prev) => [...prev, newVerdict]);
        setNewVerdictName("");
        setNewVerdictPrize(10);
    };

    const handleUpdateVerdict = (id: string, field: "name" | "prizeMoney", value: any) => {
        setVerdictsState((prev) =>
            prev.map((v) =>
                v.id === id
                    ? { ...v, [field]: field === "prizeMoney" ? parseInt(value, 10) || 0 : value }
                    : v
            )
        );
    };

    const handleDeleteVerdict = (id: string) => {
        setVerdictsState((prev) => prev.filter((v) => v.id !== id));
    };

    const handleSaveAll = () => {
        const updatedAgeGroups = ageGroups.map((group) => {
            const rawText = rawRequirements[group.id] || "";
            const cleanReqs = rawText
                .split("\n")
                .map((line) => line.trim())
                .filter((line) => line.length > 0);

            return {
                ...group,
                requirements: cleanReqs,
            };
        });

        onSave(updatedAgeGroups, verdictsState, bonusState);
    };

    return (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-xs flex items-center justify-center z-50 p-4">
            <div className="bg-white rounded-xl shadow-2xl border border-gray-200 max-w-2xl w-full p-6 space-y-5 max-h-[90vh] overflow-y-auto">
                <div className="flex items-center justify-between border-b pb-3">
                    <h3 className="font-bold text-gray-900 text-base flex items-center gap-2">
                        <Settings className="w-5 h-5 text-amber-500" /> Ramadan Competition Settings
                    </h3>
                    <button onClick={onClose} className="text-gray-400 hover:text-gray-600 text-xs font-bold cursor-pointer">
                        ✕
                    </button>
                </div>

                <div className="flex items-center gap-2 border-b">
                    <button
                        onClick={() => setActiveTab("verdicts")}
                        className={`pb-2 text-xs font-bold border-b-2 transition-colors cursor-pointer ${activeTab === "verdicts"
                            ? "border-amber-500 text-amber-900"
                            : "border-transparent text-gray-400 hover:text-gray-600"
                            }`}
                    >
                        Verdicts & Prize Money
                    </button>
                    <button
                        onClick={() => setActiveTab("criteria")}
                        className={`pb-2 text-xs font-bold border-b-2 transition-colors cursor-pointer ${activeTab === "criteria"
                            ? "border-amber-500 text-amber-900"
                            : "border-transparent text-gray-400 hover:text-gray-600"
                            }`}
                    >
                        Age Group Target Criteria
                    </button>
                </div>

                {activeTab === "verdicts" && (
                    <div className="space-y-5">
                        <div className="p-4 bg-amber-50/50 border border-amber-200 rounded-xl flex items-center justify-between gap-4">
                            <div>
                                <label className="text-xs font-bold text-amber-900 flex items-center gap-1.5">
                                    <Star className="w-4 h-4 text-amber-500 fill-amber-400" /> Bonus Prize Money (€)
                                </label>
                                <p className="text-[11px] text-gray-500">
                                    Additional prize awarded when the Bonus checkbox is marked.
                                </p>
                            </div>
                            <input
                                type="number"
                                min={0}
                                value={bonusState}
                                onChange={(e) => setBonusState(parseInt(e.target.value, 10) || 0)}
                                className="w-24 px-3 py-1.5 border rounded-lg text-xs font-bold bg-white text-amber-900 border-amber-300 focus:outline-none"
                            />
                        </div>

                        <div className="space-y-3">
                            <h4 className="text-xs font-bold text-slate-900 uppercase tracking-wider">
                                Result Categories (Verdict Levels)
                            </h4>
                            <div className="space-y-2">
                                {verdictsState.map((v) => (
                                    <div
                                        key={v.id}
                                        className="p-3 bg-gray-50 border border-gray-200 rounded-lg flex items-center justify-between gap-3"
                                    >
                                        <div className="flex-1">
                                            <input
                                                type="text"
                                                value={v.name}
                                                onChange={(e) => handleUpdateVerdict(v.id, "name", e.target.value)}
                                                className="w-full text-xs font-bold text-gray-800 bg-white border border-gray-300 px-2.5 py-1 rounded focus:outline-none"
                                            />
                                        </div>
                                        <div className="flex items-center gap-1">
                                            <span className="text-xs font-bold text-gray-500">€</span>
                                            <input
                                                type="number"
                                                min={0}
                                                value={v.prizeMoney}
                                                onChange={(e) => handleUpdateVerdict(v.id, "prizeMoney", e.target.value)}
                                                className="w-20 text-xs font-bold text-emerald-800 bg-white border border-gray-300 px-2 py-1 rounded focus:outline-none"
                                            />
                                        </div>
                                        <button
                                            onClick={() => handleDeleteVerdict(v.id)}
                                            className="text-gray-400 hover:text-rose-600 p-1 rounded cursor-pointer"
                                        >
                                            <Trash2 className="w-4 h-4" />
                                        </button>
                                    </div>
                                ))}
                            </div>

                            <div className="pt-2 flex items-center gap-2">
                                <input
                                    type="text"
                                    placeholder="New Verdict Name (e.g., Honor Roll)"
                                    value={newVerdictName}
                                    onChange={(e) => setNewVerdictName(e.target.value)}
                                    className="flex-1 text-xs px-3 py-1.5 border border-gray-300 rounded-lg focus:outline-none"
                                />
                                <div className="flex items-center gap-1">
                                    <span className="text-xs font-bold text-gray-500">€</span>
                                    <input
                                        type="number"
                                        min={0}
                                        value={newVerdictPrize}
                                        onChange={(e) => setNewVerdictPrize(parseInt(e.target.value, 10) || 0)}
                                        className="w-20 text-xs px-2 py-1.5 border border-gray-300 rounded-lg focus:outline-none"
                                    />
                                </div>
                                <button
                                    onClick={handleAddVerdict}
                                    className="bg-emerald-700 hover:bg-emerald-600 text-white text-xs px-3 py-1.5 rounded-lg font-bold flex items-center gap-1 transition-colors cursor-pointer"
                                >
                                    <Plus className="w-4 h-4" /> Add
                                </button>
                            </div>
                        </div>
                    </div>
                )}

                {activeTab === "criteria" && (
                    <div className="space-y-4 max-h-96 overflow-y-auto">
                        <div className="p-3 bg-amber-50 border border-amber-200 rounded-lg text-xs text-amber-900">
                            <p className="font-bold mb-0.5">💡 How to enter criteria:</p>
                            <p>
                                Enter each rule or target criterion on a <strong>new line</strong> (press Enter).
                                Blank lines will automatically be cleaned up when saving configuration.
                            </p>
                        </div>

                        {ageGroups.map((group) => (
                            <div key={group.id} className="p-3 bg-gray-50 rounded-lg border border-gray-200 space-y-2">
                                <div className="flex items-center justify-between">
                                    <span className="text-xs font-bold text-gray-800">Group {group.code} ({group.label})</span>
                                    <span className="text-[10px] text-gray-500 font-medium">Ages: {group.ageMin} - {group.ageMax}</span>
                                </div>
                                <textarea
                                    value={rawRequirements[group.id] ?? ""}
                                    onChange={(e) => {
                                        const val = e.target.value;
                                        setRawRequirements((prev) => ({ ...prev, [group.id]: val }));
                                    }}
                                    placeholder={"Read 5 pages of Quran daily\nFast at least 15 days"}
                                    rows={4}
                                    className="w-full text-xs p-2.5 border border-gray-300 rounded bg-white focus:ring-1 focus:ring-emerald-600 focus:outline-none"
                                />
                            </div>
                        ))}
                    </div>
                )}

                <div className="flex items-center justify-end gap-2 pt-3 border-t">
                    <button onClick={onClose} className="px-4 py-2 text-xs font-medium text-gray-600 hover:bg-gray-100 rounded-lg cursor-pointer">
                        Cancel
                    </button>
                    <button
                        onClick={handleSaveAll}
                        className="px-4 py-2 text-xs font-bold text-white bg-emerald-700 hover:bg-emerald-600 rounded-lg shadow-xs cursor-pointer"
                    >
                        Save Configuration
                    </button>
                </div>
            </div>
        </div>
    );
}