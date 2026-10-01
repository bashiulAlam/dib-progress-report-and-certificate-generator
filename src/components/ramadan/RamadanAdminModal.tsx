"use client";

import React from "react";
import type { RamadanAgeGroup } from "../../data/ramadanRequirements";

interface RamadanAdminModalProps {
  isOpen: boolean;
  onClose: () => void;
  ageGroups: RamadanAgeGroup[];
  onSaveGroups: (updatedGroups: RamadanAgeGroup[]) => void;
}

/**
 * Deprecated: the active Ramadan admin flow now lives in ProductiveRamadanView.
 * This file is kept as a no-op stub to avoid duplicate, stale modal implementations.
 */
export default function RamadanAdminModal({ isOpen }: RamadanAdminModalProps) {
  if (!isOpen) return null;
  return null;
}