import { clsx, type ClassValue } from "clsx";
import { twMerge } from "tailwind-merge";

export function cn(...inputs: ClassValue[]) {
    return twMerge(clsx(inputs));
}

/**
 * Strip all HTML tags from a string
 */
export function stripHtml(html: string | null | undefined): string {
    if (!html) return "";
    return html.replace(/<[^>]*>/g, "");
}

/**
 * Check if an HTML string is empty (contains no text after stripping tags)
 */
export function isEmptyHtml(html: string | null | undefined): boolean {
    if (!html) return true;
    return stripHtml(html).trim().length === 0;
}
