import { format, parse, isValid, startOfDay, addDays, subDays } from "date-fns";

/**
 * Format a date to YYYY-MM-DD for database storage and URL params
 */
export function formatDateForStorage(date: Date): string {
    return format(date, "yyyy-MM-dd");
}

/**
 * Parse a YYYY-MM-DD string back to a Date
 */
export function parseDateString(dateString: string): Date | null {
    const parsed = parse(dateString, "yyyy-MM-dd", new Date());
    return isValid(parsed) ? startOfDay(parsed) : null;
}

/**
 * Format a date for display (e.g., "Wednesday, December 18, 2025")
 */
export function formatDateForDisplay(date: Date): string {
    return format(date, "EEEE, MMMM d, yyyy");
}

/**
 * Format a date for short display (e.g., "Dec 18, 2025")
 */
export function formatDateShort(date: Date): string {
    return format(date, "MMM d, yyyy");
}

/**
 * Get today's date string in YYYY-MM-DD format
 */
export function getTodayString(): string {
    return formatDateForStorage(new Date());
}

/**
 * Get yesterday's date string in YYYY-MM-DD format
 */
export function getYesterdayString(): string {
    return formatDateForStorage(subDays(new Date(), 1));
}

/**
 * Get tomorrow's date string in YYYY-MM-DD format
 */
export function getTomorrowString(): string {
    return formatDateForStorage(addDays(new Date(), 1));
}

/**
 * Check if a date string is valid YYYY-MM-DD format
 */
export function isValidDateString(dateString: string): boolean {
    const parsed = parseDateString(dateString);
    return parsed !== null;
}

/**
 * Format time for display (e.g., "2:30 PM")
 */
export function formatTimeForDisplay(time: string | null): string | null {
    if (!time) return null;
    const [hours, minutes] = time.split(":").map(Number);
    const date = new Date();
    date.setHours(hours, minutes);
    return format(date, "h:mm a");
}
