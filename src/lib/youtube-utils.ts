// YouTube URL patterns to detect various YouTube URL formats
const YOUTUBE_PATTERNS = [
    /(?:https?:\/\/)?(?:www\.)?youtube\.com\/watch\?v=([a-zA-Z0-9_-]{11})/,
    /(?:https?:\/\/)?(?:youtu\.be)\/([a-zA-Z0-9_-]{11})/,
    /(?:https?:\/\/)?(?:www\.)?youtube\.com\/embed\/([a-zA-Z0-9_-]{11})/,
    /(?:https?:\/\/)?(?:www\.)?youtube\.com\/v\/([a-zA-Z0-9_-]{11})/,
    /(?:https?:\/\/)?(?:www\.)?youtube\.com\/shorts\/([a-zA-Z0-9_-]{11})/
];

/**
 * Extract YouTube video ID from a URL
 * Returns null if the URL is not a valid YouTube URL
 */
export function extractYouTubeId(url: string): string | null {
    for (const pattern of YOUTUBE_PATTERNS) {
        const match = url.match(pattern);
        if (match) return match[1];
    }
    return null;
}

/**
 * Check if a URL is a YouTube URL
 */
export function isYouTubeUrl(url: string): boolean {
    return extractYouTubeId(url) !== null;
}

/**
 * Get the embed URL for a YouTube video
 */
export function getYouTubeEmbedUrl(videoId: string): string {
    return `https://www.youtube.com/embed/${videoId}`;
}

/**
 * Get the thumbnail URL for a YouTube video
 */
export function getYouTubeThumbnailUrl(
    videoId: string,
    quality: "default" | "medium" | "high" | "maxres" = "medium"
): string {
    const qualityMap = {
        default: "default",
        medium: "mqdefault",
        high: "hqdefault",
        maxres: "maxresdefault"
    };
    return `https://img.youtube.com/vi/${videoId}/${qualityMap[quality]}.jpg`;
}
