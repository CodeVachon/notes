import { parse, isValid, format } from "date-fns";

/**
 * List of date formats to try when parsing user input.
 * Ordered from most specific to least specific.
 */
const DATE_FORMATS = [
    "yyyy-MM-dd", // 2025-12-25
    "yyyy/MM/dd", // 2025/12/25
    "MM-dd-yyyy", // 12-25-2025
    "MM/dd/yyyy", // 12/25/2025
    "MMM d, yyyy", // Dec 25, 2025
    "MMMM d, yyyy", // December 25, 2025
    "MMM d yyyy", // Dec 25 2025
    "MMMM d yyyy", // December 25 2025
    "d MMM yyyy", // 25 Dec 2025
    "d MMMM yyyy", // 25 December 2025
    "MMM d", // Dec 25 (assumes current year)
    "MMMM d", // December 25 (assumes current year)
    "d MMM", // 25 Dec (assumes current year)
    "d MMMM" // 25 December (assumes current year)
];

/**
 * Parse a user-entered date string into YYYY-MM-DD format.
 * Supports various formats like "Dec 25", "2025-12-25", "December 25, 2025", etc.
 *
 * @param input - The user's date input string
 * @returns The date in YYYY-MM-DD format, or null if parsing fails
 */
export function parseDateInput(input: string): string | null {
    const trimmed = input.trim();
    if (!trimmed) return null;

    const referenceDate = new Date();

    for (const formatStr of DATE_FORMATS) {
        const parsed = parse(trimmed, formatStr, referenceDate);
        if (isValid(parsed)) {
            return format(parsed, "yyyy-MM-dd");
        }
    }

    return null;
}

/**
 * Check if a string can be parsed as a valid date.
 *
 * @param input - The user's date input string
 * @returns true if the string can be parsed as a date
 */
export function isValidDateInput(input: string): boolean {
    return parseDateInput(input) !== null;
}
