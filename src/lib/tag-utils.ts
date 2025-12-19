// Extract tags from content - returns lowercase tag names
export function extractTags(content: string): string[] {
    const regex = /\[\[([a-zA-Z0-9]+)\]\]/g;
    const tags = new Set<string>();
    let match;
    while ((match = regex.exec(content)) !== null) {
        tags.add(match[1].toLowerCase());
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
