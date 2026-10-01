/**
 * Calculates the English Hijri year corresponding to a given Gregorian competition year.
 */
export const getHijriYear = (gregorianYear: number): string => {
    try {
        // March 15th (Month index 2) serves as a middle-ground estimate for Ramadan
        const sampleDate = new Date(gregorianYear, 2, 15);

        const formatter = new Intl.DateTimeFormat("en-US-u-ca-islamic-umalqura", {
            year: "numeric",
        });

        const parts = formatter.formatToParts(sampleDate);
        const hijriYearPart = parts.find((p) => p.type === "year");

        return hijriYearPart ? hijriYearPart.value.replace(/\D/g, "") : "";
    } catch {
        // Fallback for environments lacking islamic-umalqura support
        try {
            const sampleDate = new Date(gregorianYear, 2, 15);
            const formatter = new Intl.DateTimeFormat("en-US-u-ca-islamic", {
                year: "numeric",
            });
            const parts = formatter.formatToParts(sampleDate);
            const hijriYearPart = parts.find((p) => p.type === "year");
            return hijriYearPart ? hijriYearPart.value.replace(/\D/g, "") : "";
        } catch {
            return "";
        }
    }
};

/**
 * Formats a clean dual-calendar string (e.g., "2026 CE • 1447 AH").
 */
export const formatRamadanYearLabel = (gregorianYear: number): string => {
    const hijri = getHijriYear(gregorianYear);
    return hijri ? `${gregorianYear} CE • ${hijri} AH` : `${gregorianYear} CE`;
};