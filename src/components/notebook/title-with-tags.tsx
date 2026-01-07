import Link from "next/link";
import { cn } from "@/lib/utils";

// Matches both regular tags [[tagname]] and date tags [[2026-01-07]]
const TAG_REGEX = /\[\[([a-zA-Z0-9-]+)\]\]/g;
const DATE_REGEX = /^\d{4}-\d{2}-\d{2}$/;

interface TitleWithTagsProps {
    title: string;
    className?: string;
}

export function TitleWithTags({ title, className }: TitleWithTagsProps) {
    // Parse the title and split into text and tag parts
    const parts: Array<{ type: "text"; content: string } | { type: "tag"; name: string }> = [];
    let lastIndex = 0;
    let match;

    // Reset regex state
    TAG_REGEX.lastIndex = 0;

    while ((match = TAG_REGEX.exec(title)) !== null) {
        // Add text before this tag
        if (match.index > lastIndex) {
            parts.push({ type: "text", content: title.slice(lastIndex, match.index) });
        }

        // Add the tag
        parts.push({ type: "tag", name: match[1] });
        lastIndex = match.index + match[0].length;
    }

    // Add remaining text
    if (lastIndex < title.length) {
        parts.push({ type: "text", content: title.slice(lastIndex) });
    }

    // If no tags found, just return the title as-is
    if (parts.length === 0) {
        return <span className={className}>{title}</span>;
    }

    return (
        <span className={className}>
            {parts.map((part, index) => {
                if (part.type === "text") {
                    return <span key={index}>{part.content}</span>;
                }

                // Determine if this is a date tag or regular tag
                const isDate = DATE_REGEX.test(part.name);
                const href = isDate ? `/notebook/${part.name}` : `/tags/${part.name.toLowerCase()}`;

                return (
                    <Link
                        key={index}
                        href={href}
                        className={cn("text-primary font-medium hover:underline")}
                        onClick={(e) => e.stopPropagation()}
                    >
                        [[{part.name}]]
                    </Link>
                );
            })}
        </span>
    );
}
