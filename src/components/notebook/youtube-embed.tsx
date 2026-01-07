"use client";

import { cn } from "@/lib/utils";
import { getYouTubeEmbedUrl } from "@/lib/youtube-utils";

interface YouTubeEmbedProps {
    videoId: string;
    className?: string;
}

export function YouTubeEmbed({ videoId, className }: YouTubeEmbedProps) {
    return (
        <div className={cn("my-4 aspect-video w-full max-w-2xl", className)}>
            <iframe
                src={getYouTubeEmbedUrl(videoId)}
                allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share"
                allowFullScreen
                className="h-full w-full rounded-lg"
                title="YouTube video player"
            />
        </div>
    );
}
