// Date format regex for detecting date tags
const DATE_REGEX = /^\d{4}-\d{2}-\d{2}$/;

// Check if a tag value is a date (YYYY-MM-DD format)
export function isDateTag(value: string): boolean {
    return DATE_REGEX.test(value);
}

// Extract tags from content - returns lowercase tag names
// Filters out date tags (YYYY-MM-DD) as they should not be stored in the tags table
export function extractTags(content: string): string[] {
    const regex = /\[\[([a-zA-Z0-9-]+)\]\]/g;
    const tags = new Set<string>();
    let match;
    while ((match = regex.exec(content)) !== null) {
        const value = match[1];
        // Only add non-date tags to the set
        if (!isDateTag(value)) {
            tags.add(value.toLowerCase());
        }
    }
    return Array.from(tags);
}

// Helper to truncate HTML content for preview
export function truncateContent(html: string, maxLength: number = 200): string {
    // Strip HTML tags for a rough preview
    const text = html
        .replace(/<[^>]*>/g, " ")
        .replace(/\s+/g, " ")
        .trim();
    if (text.length <= maxLength) return text;
    return text.slice(0, maxLength) + "...";
}
