"use client";

import React, { useState } from "react";
import { X, Plus, Trash2, Edit2, Save, Check } from "lucide-react";
import { RamadanAgeGroup } from "../../data/ramadanRequirements";

interface RamadanAdminModalProps {
  isOpen: boolean;
  onClose: () => void;
  ageGroups: RamadanAgeGroup[];
  onSaveGroups: (updatedGroups: RamadanAgeGroup[]) => void;
}

export default function RamadanAdminModal({
  isOpen,
  onClose,
  ageGroups,
  onSaveGroups,
}: RamadanAdminModalProps) {
  const [groups, setGroups] = useState<RamadanAgeGroup[]>(ageGroups);
  const [activeGroupId, setActiveGroupId] = useState<string>(ageGroups[0]?.id || "");
  const [newRequirementText, setNewRequirementText] = useState<string>("");

  if (!isOpen) return null;

  const currentGroup = groups.find((g) => g.id === activeGroupId) || groups[0];

  const handleUpdateGroupLabel = (id: string, label: string) => {
    setGroups(groups.map((g) => (g.id === id ? { ...g, label } : g)));
  };

  const handleAddRequirement = () => {
    if (!newRequirementText.trim() || !currentGroup) return;
    const updated = groups.map((g) => {
      if (g.id === currentGroup.id) {
        return { ...g, requirements: [...g.requirements, newRequirementText.trim()] };
      }
      return g;
    });
    setGroups(updated);
    setNewRequirementText("");
  };

  const handleDeleteRequirement = (reqIndex: number) => {
    if (!currentGroup) return;
    const updated = groups.map((g) => {
      if (g.id === currentGroup.id) {
        return {
          ...g,
          requirements: g.requirements.filter((_, idx) => idx !== reqIndex),
        };
      }
      return g;
    });
    setGroups(updated);
  };

  const handleSaveAndClose = () => {
    onSaveGroups(groups);
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 p-4">
      <div className="bg-white rounded-xl shadow-2xl w-full max-w-3xl max-h-[90vh] flex flex-col overflow-hidden">
        {/* Header */}
        <div className="flex items-center justify-between px-6 py-4 bg-emerald-900 text-white border-b border-amber-500/30">
          <h3 className="text-lg font-bold flex items-center gap-2">
            <span>⚙️</span> Ramadan Requirements Admin Panel
          </h3>
          <button onClick={onClose} className="p-1 hover:bg-emerald-800 rounded">
            <X className="w-5 h-5 text-gray-300" />
          </button>
        </div>

        {/* Content */}
        <div className="p-6 overflow-y-auto flex-1 flex flex-col md:flex-row gap-6">
          {/* Left: Age Group Selector */}
          <div className="w-full md:w-1/3 space-y-2 border-r pr-4 border-gray-200">
            <h4 className="text-xs font-bold uppercase tracking-wider text-gray-500 mb-3">
              Age Groups
            </h4>
            {groups.map((group) => (
              <div
                key={group.id}
                onClick={() => setActiveGroupId(group.id)}
                className={`p-3 rounded-lg cursor-pointer border transition-all flex items-center justify-between ${
                  activeGroupId === group.id
                    ? "bg-emerald-50 border-emerald-600 text-emerald-900 font-bold shadow-xs"
                    : "border-gray-200 hover:bg-gray-50 text-gray-700"
                }`}
              >
                <div>
                  <span className="text-xs font-semibold px-2 py-0.5 rounded bg-amber-100 text-amber-800 mr-2">
                    Group {group.code}
                  </span>
                  <span className="text-sm">{group.label}</span>
                </div>
                <span className="text-xs text-gray-400">
                  {group.requirements.length} rules
                </span>
              </div>
            ))}
          </div>

          {/* Right: Requirements Editor */}
          {currentGroup && (
            <div className="w-full md:w-2/3 space-y-4">
              <div className="flex items-center justify-between border-b pb-3">
                <div>
                  <h4 className="text-base font-bold text-gray-900">
                    Group {currentGroup.code} ({currentGroup.label}) Criteria
                  </h4>
                  <p className="text-xs text-gray-500">
                    Target Age Range: {currentGroup.ageMin} - {currentGroup.ageMax} years
                  </p>
                </div>
                <input
                  type="text"
                  value={currentGroup.label}
                  onChange={(e) => handleUpdateGroupLabel(currentGroup.id, e.target.value)}
                  className="border text-xs p-1.5 rounded w-24 text-center font-medium"
                  placeholder="Label"
                />
              </div>

              {/* Requirement Items */}
              <div className="space-y-2 max-h-[300px] overflow-y-auto pr-1">
                {currentGroup.requirements.map((req, idx) => (
                  <div
                    key={idx}
                    className="p-3 bg-gray-50 border rounded-lg flex items-start justify-between gap-3 text-xs text-gray-800"
                  >
                    <span className="leading-relaxed">
                      <strong className="text-emerald-700 mr-1.5">•</strong>
                      {req}
                    </span>
                    <button
                      onClick={() => handleDeleteRequirement(idx)}
                      className="text-red-500 hover:text-red-700 p-1 shrink-0"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>
                ))}
              </div>

              {/* Add New Requirement */}
              <div className="pt-2 flex gap-2">
                <input
                  type="text"
                  value={newRequirementText}
                  onChange={(e) => setNewRequirementText(e.target.value)}
                  placeholder="Add new rule or requirement..."
                  className="flex-1 border text-xs p-2 rounded-md focus:outline-none focus:ring-1 focus:ring-emerald-500"
                />
                <button
                  onClick={handleAddRequirement}
                  className="bg-emerald-700 hover:bg-emerald-800 text-white text-xs px-3 py-2 rounded-md flex items-center gap-1 font-medium"
                >
                  <Plus className="w-4 h-4" /> Add
                </button>
              </div>
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="p-4 bg-gray-50 border-t flex justify-end gap-3">
          <button
            onClick={onClose}
            className="px-4 py-2 border rounded-md text-xs font-medium text-gray-700 hover:bg-gray-100"
          >
            Cancel
          </button>
          <button
            onClick={handleSaveAndClose}
            className="px-4 py-2 bg-emerald-700 hover:bg-emerald-800 text-white rounded-md text-xs font-bold flex items-center gap-1.5 shadow-xs"
          >
            <Save className="w-4 h-4" /> Save Configuration
          </button>
        </div>
      </div>
    </div>
  );
}