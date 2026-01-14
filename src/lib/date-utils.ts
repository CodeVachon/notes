import { format, parse, isValid, startOfDay, addDays, subDays } from "date-fns";
import type { TimeFormat } from "@/db/schema";

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
 * Check if a time string is valid HH:mm format (24-hour)
 */
export function isValidTimeString(time: string): boolean {
    return /^([01]\d|2[0-3]):[0-5]\d$/.test(time);
}

/**
 * Format time for display based on user preference
 * @param time - Time string in HH:mm format
 * @param timeFormat - "12h" for 12-hour (2:30 PM) or "24h" for 24-hour (14:30)
 */
export function formatTimeForDisplay(
    time: string | null,
    timeFormat: TimeFormat = "12h"
): string | null {
    if (!time) return null;
    const [hours, minutes] = time.split(":").map(Number);
    const date = new Date();
    date.setHours(hours, minutes);
    return timeFormat === "24h" ? format(date, "HH:mm") : format(date, "h:mm a");
}
