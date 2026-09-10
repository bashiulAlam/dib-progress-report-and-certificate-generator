"use client";

import { useEffect, useState } from "react";
import { AppConfig, LevelConfig, SubjectConfig } from "@/lib/types";
import { Save, ArrowLeft, Plus, Trash2, ChevronDown, ChevronRight, Award, Layers } from "lucide-react";

export const dynamic = "force-dynamic";

export default function AdminPage() {
    const [config, setConfig] = useState<AppConfig | null>(null);
    const [loading, setLoading] = useState(true);
    const [expandedLevels, setExpandedLevels] = useState<Record<string, boolean>>({});

    useEffect(() => {
        fetch("/api/config")
            .then((res) => (res.ok ? res.json() : null))
            .then((data) => {
                if (data) {
                    setConfig(data);
                    if (data.levels?.[0]) {
                        setExpandedLevels({ [data.levels[0].id]: true });
                    }
                }
                setLoading(false);
            })
            .catch((err) => {
                console.error("Failed loading configuration:", err);
                setLoading(false);
            });
    }, []);

    const handleSaveConfig = async () => {
        if (!config) return;
        try {
            const res = await fetch("/api/config", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify(config),
            });
            if (res.ok) {
                alert("Configuration saved successfully!");
            } else {
                alert("Failed to save configuration.");
            }
        } catch (err) {
            console.error("Error saving admin config:", err);
            alert("An error occurred while saving.");
        }
    };

    const toggleLevelExpand = (id: string) => {
        setExpandedLevels((prev) => ({ ...prev, [id]: !prev[id] }));
    };

    // Create a new Level pre-populated with 10 default sub-levels and Noorani standard subjects
    const handleAddLevel = () => {
        if (!config) return;
        const newId = `lvl_${Date.now()}`;
        const timestamp = Date.now();

        const defaultSubLevels = Array.from({ length: 10 }, (_, i) => ({
            id: `nl_${i + 1}_${timestamp}`,
            name: `Level ${i + 1}`,
        }));

        const newLevel: LevelConfig = {
            id: newId,
            name: "Noorani",
            subLevels: defaultSubLevels,
            subjects: [
                {
                    id: `sub_cp_${timestamp}`,
                    name: "Class Performance",
                    maxPoints: 100,
                    evaluationType: "points",
                    isOptional: false,
                    includeInTotal: true,
                    subCategories: [
                        { id: `subcat_punkt_${timestamp}`, name: "Pünktlichkeit", maxPoints: 25 },
                        { id: `subcat_hw_${timestamp}`, name: "Hausaufgaben", maxPoints: 25 },
                        { id: `subcat_mitarb_${timestamp}`, name: "Mitarbeit", maxPoints: 25 },
                        { id: `subcat_adhab_${timestamp}`, name: "Adhab", maxPoints: 25 },
                    ],
                },
                {
                    id: `sub_ai_${timestamp}`,
                    name: "Allgemein Islam",
                    maxPoints: 100,
                    evaluationType: "points",
                    isOptional: false,
                    includeInTotal: true,
                    subCategories: [
                        { id: `subcat_ai_f1_${timestamp}`, name: "Frage 1", maxPoints: 25 },
                        { id: `subcat_ai_f2_${timestamp}`, name: "Frage 2", maxPoints: 25 },
                        { id: `subcat_ai_f3_${timestamp}`, name: "Frage 3", maxPoints: 25 },
                        { id: `subcat_ai_f4_${timestamp}`, name: "Frage 4", maxPoints: 25 },
                    ],
                },
                {
                    id: `sub_qn_${timestamp}`,
                    name: "Qaida Nooraniyah",
                    maxPoints: 100,
                    evaluationType: "points",
                    isOptional: false,
                    includeInTotal: true,
                    subCategories: [
                        { id: `subcat_qn_f1_${timestamp}`, name: "Frage 1", maxPoints: 25 },
                        { id: `subcat_qn_f2_${timestamp}`, name: "Frage 2", maxPoints: 25 },
                        { id: `subcat_qn_f3_${timestamp}`, name: "Frage 3", maxPoints: 25 },
                        { id: `subcat_qn_f4_${timestamp}`, name: "Frage 4", maxPoints: 25 },
                    ],
                },
            ],
        };

        setConfig({ ...config, levels: [...config.levels, newLevel] });
        setExpandedLevels((prev) => ({ ...prev, [newId]: true }));
    };

    const handleRemoveLevel = (index: number) => {
        if (!config) return;
        const updated = config.levels.filter((_, i) => i !== index);
        setConfig({ ...config, levels: updated });
    };

    /* Sub-Level Management */
    const handleAddSubLevel = (levelIndex: number) => {
        if (!config) return;
        const updatedLevels = [...config.levels];
        const level = updatedLevels[levelIndex];
        if (!level.subLevels) {
            level.subLevels = [];
        }
        const count = level.subLevels.length + 1;
        level.subLevels.push({
            id: `nl_${count}_${Date.now()}`,
            name: `Level ${count}`,
        });
        setConfig({ ...config, levels: updatedLevels });
    };

    const handleRemoveSubLevel = (levelIndex: number, subLvlIndex: number) => {
        if (!config) return;
        const updatedLevels = [...config.levels];
        const level = updatedLevels[levelIndex];
        if (level.subLevels) {
            level.subLevels = level.subLevels.filter((_, i) => i !== subLvlIndex);
        }
        setConfig({ ...config, levels: updatedLevels });
    };

    /* Subject & Sub-Category Actions */
    const handleAddSubject = (levelIndex: number) => {
        if (!config) return;
        const updatedLevels = [...config.levels];
        const newSubject: SubjectConfig = {
            id: `sub_${Date.now()}`,
            name: "New Subject",
            maxPoints: 100,
            evaluationType: "points",
            gradeOptions: ["Sehr Gut", "Gut", "Befriedigend", "Ausreichend", "Mangelhaft"],
            hasCustomSyllabus: false,
            isOptional: false,
            includeInTotal: true,
        };
        updatedLevels[levelIndex].subjects.push(newSubject);
        setConfig({ ...config, levels: updatedLevels });
    };

    const handleRemoveSubject = (levelIndex: number, subjectIndex: number) => {
        if (!config) return;
        const updatedLevels = [...config.levels];
        updatedLevels[levelIndex].subjects = updatedLevels[levelIndex].subjects.filter(
            (_, i) => i !== subjectIndex
        );
        setConfig({ ...config, levels: updatedLevels });
    };

    const handleAddSubCategory = (levelIndex: number, subjectIndex: number) => {
        if (!config) return;
        const updatedLevels = [...config.levels];
        const subject = updatedLevels[levelIndex].subjects[subjectIndex];
        if (!subject.subCategories) {
            subject.subCategories = [];
        }
        subject.subCategories.push({
            id: `subcat_${Date.now()}`,
            name: "New Sub-Category",
            maxPoints: 25,
        });
        setConfig({ ...config, levels: updatedLevels });
    };

    const handleRemoveSubCategory = (
        levelIndex: number,
        subjectIndex: number,
        subCatIndex: number
    ) => {
        if (!config) return;
        const updatedLevels = [...config.levels];
        const subject = updatedLevels[levelIndex].subjects[subjectIndex];
        if (subject.subCategories) {
            subject.subCategories = subject.subCategories.filter((_, i) => i !== subCatIndex);
        }
        setConfig({ ...config, levels: updatedLevels });
    };

    /* Co-Curricular Activity Actions */
    const handleAddCoCurricular = () => {
        if (!config) return;
        const updatedCo = { ...config.coCurricular };
        if (!updatedCo.activities) updatedCo.activities = [];

        updatedCo.activities.push({
            id: `co_${Date.now()}`,
            name: "New Co-Curricular Activity",
            maxPoints: 100,
        });
        setConfig({ ...config, coCurricular: updatedCo });
    };

    const handleRemoveCoCurricular = (index: number) => {
        if (!config || !config.coCurricular?.activities) return;
        const updatedActivities = config.coCurricular.activities.filter((_, i) => i !== index);
        setConfig({
            ...config,
            coCurricular: { ...config.coCurricular, activities: updatedActivities },
        });
    };

    if (loading) return <div className="p-8 font-medium">Loading Admin Settings...</div>;
    if (!config) return <div className="p-8 text-red-600">Error loading configuration data.</div>;

    return (
        <div className="min-h-screen bg-gray-50 p-8">
            <div className="max-w-5xl mx-auto space-y-6">
                {/* Navigation & Header */}
                <div className="flex justify-between items-center bg-white p-6 rounded-lg border shadow-sm">
                    <div>
                        <h1 className="text-2xl font-bold text-gray-900">Admin Configuration</h1>
                        <p className="text-sm text-gray-500">Manage levels, sub-levels, subjects, and settings</p>
                    </div>
                    <div className="flex gap-3">
                        <button
                            onClick={() => window.location.assign("/")}
                            className="flex items-center gap-2 border px-4 py-2 rounded text-sm hover:bg-gray-50"
                        >
                            <ArrowLeft size={16} /> Back to App
                        </button>
                        <button
                            onClick={handleSaveConfig}
                            className="flex items-center gap-2 bg-emerald-700 text-white px-4 py-2 rounded text-sm hover:bg-emerald-800"
                        >
                            <Save size={16} /> Save Changes
                        </button>
                    </div>
                </div>

                {/* Global Settings */}
                <div className="bg-white p-6 rounded-lg border shadow-sm space-y-4">
                    <h2 className="text-lg font-bold border-b pb-2 text-gray-900">Academy Settings</h2>
                    <div>
                        <label className="text-xs font-semibold block text-gray-700 mb-1">
                            Academy / Organization Name
                        </label>
                        <input
                            type="text"
                            value={config.academyName}
                            onChange={(e) => setConfig({ ...config, academyName: e.target.value })}
                            className="border p-2 rounded text-sm w-full focus:outline-blue-500"
                        />
                    </div>
                </div>

                {/* Co-Curricular Activities Section */}
                <div className="bg-white p-6 rounded-lg border shadow-sm space-y-4">
                    <div className="flex justify-between items-center border-b pb-2">
                        <div className="flex items-center gap-2">
                            <Award size={20} className="text-blue-600" />
                            <h2 className="text-lg font-bold text-gray-900">Co-Curricular Activities</h2>
                        </div>
                        <button
                            onClick={handleAddCoCurricular}
                            className="flex items-center gap-1 bg-blue-600 text-white px-3 py-1.5 rounded text-xs hover:bg-blue-700 font-medium"
                        >
                            <Plus size={14} /> Add Activity
                        </button>
                    </div>

                    <div className="space-y-3">
                        {!config.coCurricular?.activities || config.coCurricular.activities.length === 0 ? (
                            <p className="text-xs text-gray-500 italic">No co-curricular activities configured.</p>
                        ) : (
                            config.coCurricular.activities.map((act, actIdx) => (
                                <div key={act.id} className="bg-blue-50/30 p-4 rounded-lg border shadow-xs space-y-3">
                                    <div className="flex items-center justify-between gap-4">
                                        <input
                                            type="text"
                                            value={act.name}
                                            onChange={(e) => {
                                                const activities = [...(config.coCurricular?.activities ?? [])];
                                                if (activities[actIdx]) {
                                                    activities[actIdx] = { ...activities[actIdx], name: e.target.value };
                                                    setConfig({
                                                        ...config,
                                                        coCurricular: { ...config.coCurricular, activities },
                                                    });
                                                }
                                            }}
                                            className="border p-1.5 rounded text-sm font-medium flex-1 bg-white"
                                            placeholder="Activity Name (e.g., Sports, Arts)"
                                        />

                                        <div className="flex items-center gap-2">
                                            <label className="text-xs text-gray-600 font-medium">Max Pts:</label>
                                            <input
                                                type="number"
                                                value={act.maxPoints}
                                                onChange={(e) => {
                                                    const activities = [...(config.coCurricular?.activities ?? [])];
                                                    if (activities[actIdx]) {
                                                        activities[actIdx] = { ...activities[actIdx], maxPoints: Number(e.target.value) };
                                                        setConfig({
                                                            ...config,
                                                            coCurricular: { ...config.coCurricular, activities },
                                                        });
                                                    }
                                                }}
                                                className="border p-1.5 rounded text-sm w-20 bg-white"
                                            />
                                        </div>

                                        <button
                                            onClick={() => handleRemoveCoCurricular(actIdx)}
                                            className="p-1.5 text-red-500 hover:bg-red-50 rounded"
                                            title="Remove Activity"
                                        >
                                            <Trash2 size={16} />
                                        </button>
                                    </div>
                                </div>
                            ))
                        )}
                    </div>
                </div>

                {/* Levels & Sub-Levels Setup */}
                <div className="bg-white p-6 rounded-lg border shadow-sm space-y-6">
                    <div className="flex justify-between items-center border-b pb-2">
                        <h2 className="text-lg font-bold text-gray-900">Configured Levels</h2>
                        <button
                            onClick={handleAddLevel}
                            className="flex items-center gap-1 bg-blue-600 text-white px-3 py-1.5 rounded text-xs hover:bg-blue-700 font-medium"
                        >
                            <Plus size={14} /> Add Level
                        </button>
                    </div>

                    <div className="space-y-4">
                        {config.levels.map((level, lvlIdx) => {
                            const isExpanded = !!expandedLevels[level.id];
                            return (
                                <div key={level.id} className="border rounded-lg bg-gray-50/50 overflow-hidden">
                                    <div className="p-4 bg-white flex items-center justify-between gap-4 border-b">
                                        <button
                                            onClick={() => toggleLevelExpand(level.id)}
                                            className="flex items-center gap-2 text-left font-semibold flex-1 text-gray-800 hover:text-blue-600"
                                        >
                                            {isExpanded ? <ChevronDown size={18} /> : <ChevronRight size={18} />}
                                            <input
                                                type="text"
                                                value={level.name}
                                                onClick={(e) => e.stopPropagation()}
                                                onChange={(e) => {
                                                    const updated = [...config.levels];
                                                    updated[lvlIdx].name = e.target.value;
                                                    setConfig({ ...config, levels: updated });
                                                }}
                                                className="border p-1.5 rounded text-sm font-semibold flex-1 max-w-xs bg-white"
                                                placeholder="Level Name"
                                            />
                                        </button>
                                        <div className="flex items-center gap-3">
                                            <span className="text-xs text-gray-500 font-medium">
                                                {level.subLevels?.length || 0} Sub-Levels | {level.subjects.length} Subjects
                                            </span>
                                            <button
                                                onClick={() => handleRemoveLevel(lvlIdx)}
                                                className="p-1.5 text-red-600 hover:bg-red-50 border rounded"
                                                title="Delete Level"
                                            >
                                                <Trash2 size={16} />
                                            </button>
                                        </div>
                                    </div>

                                    {isExpanded && (
                                        <div className="p-4 space-y-6">
                                            {/* Sub-Levels Section */}
                                            <div className="bg-slate-50 p-4 rounded-lg border space-y-3">
                                                <div className="flex justify-between items-center border-b pb-2">
                                                    <div className="flex items-center gap-2">
                                                        <Layers size={16} className="text-slate-600" />
                                                        <h4 className="text-xs font-bold uppercase tracking-wider text-slate-700">
                                                            Sub-Levels (Numeric Stages)
                                                        </h4>
                                                    </div>
                                                    <button
                                                        onClick={() => handleAddSubLevel(lvlIdx)}
                                                        className="flex items-center gap-1 text-xs text-blue-600 hover:text-blue-800 font-semibold"
                                                    >
                                                        <Plus size={12} /> Add Sub-Level
                                                    </button>
                                                </div>

                                                {!level.subLevels || level.subLevels.length === 0 ? (
                                                    <p className="text-xs text-gray-500 italic">No sub-levels configured for this level.</p>
                                                ) : (
                                                    <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-2">
                                                        {level.subLevels.map((subLvl, subLvlIdx) => (
                                                            <div
                                                                key={subLvl.id}
                                                                className="flex items-center gap-1.5 bg-white p-2 rounded border text-xs"
                                                            >
                                                                <input
                                                                    type="text"
                                                                    value={subLvl.name}
                                                                    onChange={(e) => {
                                                                        const updated = [...config.levels];
                                                                        if (updated[lvlIdx].subLevels) {
                                                                            updated[lvlIdx].subLevels![subLvlIdx].name = e.target.value;
                                                                        }
                                                                        setConfig({ ...config, levels: updated });
                                                                    }}
                                                                    className="border p-1 rounded text-xs flex-1 bg-white font-medium text-gray-800"
                                                                />
                                                                <button
                                                                    onClick={() => handleRemoveSubLevel(lvlIdx, subLvlIdx)}
                                                                    className="text-red-500 hover:text-red-700 p-1"
                                                                    title="Remove Sub-Level"
                                                                >
                                                                    <Trash2 size={13} />
                                                                </button>
                                                            </div>
                                                        ))}
                                                    </div>
                                                )}
                                            </div>

                                            {/* Shared Subjects & Criteria */}
                                            <div className="space-y-4">
                                                <div className="flex justify-between items-center border-b pb-1">
                                                    <h4 className="text-xs font-bold uppercase tracking-wider text-gray-600">
                                                        Shared Subjects & Criteria
                                                    </h4>
                                                    <button
                                                        onClick={() => handleAddSubject(lvlIdx)}
                                                        className="flex items-center gap-1 text-xs text-blue-600 hover:text-blue-800 font-semibold"
                                                    >
                                                        <Plus size={14} /> Add Subject
                                                    </button>
                                                </div>

                                                <div className="space-y-3">
                                                    {level.subjects.map((sub, subIdx) => {
                                                        const isGrade = sub.evaluationType === "grade";

                                                        return (
                                                            <div key={sub.id} className="bg-white p-4 rounded-lg border shadow-xs space-y-3">
                                                                <div className="flex items-center justify-between gap-4">
                                                                    <input
                                                                        type="text"
                                                                        value={sub.name}
                                                                        onChange={(e) => {
                                                                            const updated = [...config.levels];
                                                                            updated[lvlIdx].subjects[subIdx].name = e.target.value;
                                                                            setConfig({ ...config, levels: updated });
                                                                        }}
                                                                        className="border p-1.5 rounded text-sm font-medium flex-1"
                                                                        placeholder="Subject Name (e.g. Hifz)"
                                                                    />

                                                                    {/* Evaluation Type Selector */}
                                                                    <div className="flex items-center gap-2">
                                                                        <label className="text-xs text-gray-600 font-medium">Type:</label>
                                                                        <select
                                                                            value={sub.evaluationType || "points"}
                                                                            onChange={(e) => {
                                                                                const updated = [...config.levels];
                                                                                updated[lvlIdx].subjects[subIdx].evaluationType = e.target.value as "points" | "grade";
                                                                                setConfig({ ...config, levels: updated });
                                                                            }}
                                                                            className="border p-1.5 rounded text-xs bg-white"
                                                                        >
                                                                            <option value="points">Points</option>
                                                                            <option value="grade">Grade (Dropdown)</option>
                                                                        </select>
                                                                    </div>

                                                                    {/* Max Points (Only for Points type) */}
                                                                    {!isGrade && (
                                                                        <div className="flex items-center gap-2">
                                                                            <label className="text-xs text-gray-600 font-medium">Max Pts:</label>
                                                                            <input
                                                                                type="number"
                                                                                value={sub.maxPoints || 100}
                                                                                onChange={(e) => {
                                                                                    const updated = [...config.levels];
                                                                                    updated[lvlIdx].subjects[subIdx].maxPoints = Number(e.target.value);
                                                                                    setConfig({ ...config, levels: updated });
                                                                                }}
                                                                                className="border p-1.5 rounded text-sm w-20"
                                                                            />
                                                                        </div>
                                                                    )}

                                                                    <button
                                                                        onClick={() => handleRemoveSubject(lvlIdx, subIdx)}
                                                                        className="p-1.5 text-red-500 hover:bg-red-50 rounded"
                                                                        title="Remove Subject"
                                                                    >
                                                                        <Trash2 size={16} />
                                                                    </button>
                                                                </div>

                                                                {/* Grade Options Input (When Type = Grade) */}
                                                                {isGrade && (
                                                                    <div className="bg-amber-50/50 p-2.5 rounded border border-amber-200 flex items-center gap-3">
                                                                        <label className="text-xs font-semibold text-amber-800 whitespace-nowrap">
                                                                            Grade Options (comma-separated):
                                                                        </label>
                                                                        <input
                                                                            type="text"
                                                                            value={sub.gradeOptions ? sub.gradeOptions.join(", ") : ""}
                                                                            onChange={(e) => {
                                                                                const updated = [...config.levels];
                                                                                updated[lvlIdx].subjects[subIdx].gradeOptions = e.target.value
                                                                                    .split(",")
                                                                                    .map((g) => g.trim())
                                                                                    .filter(Boolean);
                                                                                setConfig({ ...config, levels: updated });
                                                                            }}
                                                                            className="border p-1 rounded text-xs flex-1 bg-white"
                                                                            placeholder="e.g. Sehr Gut, Gut, Befriedigend, Ausreichend"
                                                                        />
                                                                    </div>
                                                                )}

                                                                {/* Configuration Checkboxes */}
                                                                <div className="flex items-center gap-6 text-xs text-gray-700 pt-1 border-t">
                                                                    {/* Syllabus Toggle */}
                                                                    <label className="flex items-center gap-1.5 cursor-pointer select-none font-medium text-emerald-700">
                                                                        <input
                                                                            type="checkbox"
                                                                            checked={sub.hasCustomSyllabus || false}
                                                                            onChange={(e) => {
                                                                                const updated = [...config.levels];
                                                                                updated[lvlIdx].subjects[subIdx].hasCustomSyllabus = e.target.checked;
                                                                                setConfig({ ...config, levels: updated });
                                                                            }}
                                                                            className="rounded border-gray-300 text-emerald-600 focus:ring-emerald-500"
                                                                        />
                                                                        Enable Custom Syllabus (Lehrplan)
                                                                    </label>

                                                                    {!isGrade && (
                                                                        <label className="flex items-center gap-1.5 cursor-pointer select-none">
                                                                            <input
                                                                                type="checkbox"
                                                                                checked={sub.includeInTotal}
                                                                                onChange={(e) => {
                                                                                    const updated = [...config.levels];
                                                                                    updated[lvlIdx].subjects[subIdx].includeInTotal = e.target.checked;
                                                                                    setConfig({ ...config, levels: updated });
                                                                                }}
                                                                                className="rounded border-gray-300 text-blue-600 focus:ring-blue-500"
                                                                            />
                                                                            Include in Total Score
                                                                        </label>
                                                                    )}

                                                                    <label className="flex items-center gap-1.5 cursor-pointer select-none">
                                                                        <input
                                                                            type="checkbox"
                                                                            checked={sub.isOptional}
                                                                            onChange={(e) => {
                                                                                const updated = [...config.levels];
                                                                                updated[lvlIdx].subjects[subIdx].isOptional = e.target.checked;
                                                                                setConfig({ ...config, levels: updated });
                                                                            }}
                                                                            className="rounded border-gray-300 text-blue-600 focus:ring-blue-500"
                                                                        />
                                                                        Optional Subject
                                                                    </label>

                                                                    {!isGrade && (
                                                                        <button
                                                                            onClick={() => handleAddSubCategory(lvlIdx, subIdx)}
                                                                            className="ml-auto text-xs text-blue-600 hover:underline flex items-center gap-1 font-medium"
                                                                        >
                                                                            <Plus size={12} /> Add Sub-Category
                                                                        </button>
                                                                    )}
                                                                </div>

                                                                {/* Sub-Categories */}
                                                                {!isGrade && sub.subCategories && sub.subCategories.length > 0 && (
                                                                    <div className="bg-gray-50 p-3 rounded border space-y-2 ml-4">
                                                                        <span className="text-[11px] font-bold text-gray-500 uppercase tracking-wider block">
                                                                            Sub-Categories / Criteria
                                                                        </span>
                                                                        {sub.subCategories.map((subCat, catIdx) => (
                                                                            <div key={subCat.id} className="flex items-center gap-3">
                                                                                <input
                                                                                    type="text"
                                                                                    value={subCat.name}
                                                                                    onChange={(e) => {
                                                                                        const updated = [...config.levels];
                                                                                        if (updated[lvlIdx].subjects[subIdx].subCategories) {
                                                                                            updated[lvlIdx].subjects[subIdx].subCategories![catIdx].name = e.target.value;
                                                                                        }
                                                                                        setConfig({ ...config, levels: updated });
                                                                                    }}
                                                                                    className="border p-1 rounded text-xs flex-1 bg-white"
                                                                                    placeholder="Sub-Category Name"
                                                                                />
                                                                                <input
                                                                                    type="number"
                                                                                    value={subCat.maxPoints}
                                                                                    onChange={(e) => {
                                                                                        const updated = [...config.levels];
                                                                                        if (updated[lvlIdx].subjects[subIdx].subCategories) {
                                                                                            updated[lvlIdx].subjects[subIdx].subCategories![catIdx].maxPoints = Number(e.target.value);
                                                                                        }
                                                                                        setConfig({ ...config, levels: updated });
                                                                                    }}
                                                                                    className="border p-1 rounded text-xs w-16 bg-white"
                                                                                    placeholder="Max"
                                                                                />
                                                                                <button
                                                                                    onClick={() => handleRemoveSubCategory(lvlIdx, subIdx, catIdx)}
                                                                                    className="text-red-500 hover:text-red-700 p-1"
                                                                                >
                                                                                    <Trash2 size={14} />
                                                                                </button>
                                                                            </div>
                                                                        ))}
                                                                    </div>
                                                                )}
                                                            </div>
                                                        );
                                                    })}
                                                </div>
                                            </div>
                                        </div>
                                    )}
                                </div>
                            );
                        })}
                    </div>
                </div>
            </div>
        </div>
    );
}