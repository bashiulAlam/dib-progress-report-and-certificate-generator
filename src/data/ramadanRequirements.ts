export interface RamadanAgeGroup {
    id: string;
    code: "A" | "B" | "C" | "D" | "E";
    label: string; // e.g., "< 7", "7 - 8", "9 - 10", "11 - 13", "13+"
    ageMin: number;
    ageMax: number;
    requirements: string[];
}

export const DEFAULT_RAMADAN_AGE_GROUPS: RamadanAgeGroup[] = [
    {
        id: "group-a",
        code: "A",
        label: "< 7",
        ageMin: 0,
        ageMax: 6,
        requirements: [
            "Basierend auf dem bereitgestellten Ramadan-Aktivitätenbuch",
        ],
    },
    {
        id: "group-b",
        code: "B",
        label: "7 - 8",
        ageMin: 7,
        ageMax: 8,
        requirements: [
            "5 tägliche Gebete",
            "Auswendiglernen: Sura Al-Fatihah, Sura Nas bis Sura Al-Fil (im Amparabuch)",
            "Tägliche Duas: Schlafengehen/Aufwachen, Haus Betreten/Verlassen, Toilette Betreten/Verlassen, Moschee Betreten/Verlassen",
            "Mindestens 3 Tage fasten",
        ],
    },
    {
        id: "group-c",
        code: "C",
        label: "9 - 10",
        ageMin: 9,
        ageMax: 10,
        requirements: [
            "5 tägliche Gebete",
            "Koranrezitation: mindestens 15 Juz",
            "Auswendiglernen: Ayat al-Kursi, Sayyidul Istighfar",
            "Tägliche Duas: Schlafengehen/Aufwachen, Haus Betreten/Verlassen, Toilette Betreten/Verlassen, Moschee Betreten/Verlassen",
            "Mindestens 10 Tage fasten",
        ],
    },
    {
        id: "group-d",
        code: "D",
        label: "11 - 13",
        ageMin: 11,
        ageMax: 13,
        requirements: [
            "5 tägliche Gebete und 8 Rak'a Tarawih-Gebete",
            "Vollständige Rezitation des Korans (30 Juz)",
            "Auswendiglernen: Ayat al-Kursi, Sayyidul Istighfar, die letzten 2 Verse der Sura Al-Baqarah",
            "Tägliche Duas: Schlafengehen/Aufwachen, Haus Betreten/Verlassen, Toilette Betreten/Verlassen, Moschee Betreten/Verlassen",
            "Mindestens 20 Tage fasten",
        ],
    },
    {
        id: "group-e",
        code: "E",
        label: "> 13",
        ageMin: 13,
        ageMax: 15,
        requirements: [
            "5 tägliche Gebete und 8 Rak'a Tarawih-Gebete",
            "Mindestens 2 Rak'a Tahajjud verrichten in einem der letzten 10 Tage des Ramadan",
            "Vollständige Rezitation des Korans (30 Juz)",
            "Auswendiglernen: Ayat al-Kursi, Sayyidul Istighfar, die letzten 2 Verse der Sura Al-Baqarah, die ersten 10 Verse der Sura Al-Mulk",
            "Tägliche Duas: Schlafengehen/Aufwachen, Haus Betreten/Verlassen, Toilette Betreten/Verlassen, Moschee Betreten/Verlassen",
            "Fasten alle Fastentage",
        ],
    },
];

export interface StudentPerformance {
    targetCriteria: Record<string, "fully" | "partially" | "not_achieved">;
    additionalCriteria: {
        quranLesen: boolean;
        alleTageFasten: boolean;
        tahajjud: boolean;
        taraweeh: boolean;
        uebernachtungMoschee: boolean;
    };
    customCriteria: string;
    verdict: "Entry" | "Basic" | "Advanced" | null;
    bonusPoints: boolean;
}

export interface RamadanStudent {
    id: string;
    name: string;
    age: number | null;
    gender: "Male" | "Female" | string;
    ageGroup: "< 7" | "7 - 8" | "9 - 10" | "11 - 13" | "> 13" | "Unassigned";
    performance?: StudentPerformance;
}