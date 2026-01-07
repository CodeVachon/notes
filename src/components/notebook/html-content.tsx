"use client";

import { useMemo, useState } from "react";
import { common, createLowlight } from "lowlight";
import { toHtml } from "hast-util-to-html";
import { IconCopy, IconCheck } from "@tabler/icons-react";
import { Button } from "@/components/ui/button";
import { YouTubeEmbed } from "./youtube-embed";
import { extractYouTubeId } from "@/lib/youtube-utils";
import { cn } from "@/lib/utils";

const lowlight = createLowlight(common);

// Tag detection regex (supports alphanumeric and hyphens for date tags)
const TAG_REGEX = /\[\[([a-zA-Z0-9-]+)\]\]/g;
// Date format regex for detecting date tags
const DATE_REGEX = /^\d{4}-\d{2}-\d{2}$/;
// YouTube link detection in anchor tags
const YOUTUBE_LINK_REGEX =
    /<a[^>]+href="([^"]*(?:youtube\.com\/watch|youtu\.be|youtube\.com\/shorts)[^"]*)"[^>]*>.*?<\/a>/g;

// Convert tags to anchor elements in HTML string (avoids hydration issues with React Link)
// Date tags link to /notebook/{date}, regular tags link to /tags/{tagname}
function renderTagsAsHtml(html: string): string {
    return html.replace(TAG_REGEX, (_, tagName: string) => {
        const isDate = DATE_REGEX.test(tagName);
        const href = isDate ? `/notebook/${tagName}` : `/tags/${tagName.toLowerCase()}`;
        return `<a href="${href}" class="text-primary font-medium hover:underline" data-tag="${tagName}">[[${tagName}]]</a>`;
    });
}

interface CodeBlockProps {
    code: string;
    language?: string;
}

function CodeBlock({ code, language }: CodeBlockProps) {
    const [copied, setCopied] = useState(false);

    const highlightedHtml = useMemo(() => {
        try {
            const highlighted = language
                ? lowlight.highlight(language, code)
                : lowlight.highlightAuto(code);
            return toHtml(highlighted);
        } catch {
            return code.replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;");
        }
    }, [code, language]);

    const handleCopy = async (e: React.MouseEvent) => {
        e.stopPropagation();
        await navigator.clipboard.writeText(code);
        setCopied(true);
        setTimeout(() => setCopied(false), 2000);
    };

    return (
        <div className="group/code relative">
            <Button
                variant="ghost"
                size="icon-xs"
                className="absolute top-2 right-2 opacity-0 transition-opacity group-hover/code:opacity-100"
                onClick={handleCopy}
                title="Copy to clipboard"
            >
                {copied ? (
                    <IconCheck className="size-3.5 text-green-500" />
                ) : (
                    <IconCopy className="size-3.5" />
                )}
            </Button>
            <pre>
                <code
                    className={language ? `language-${language}` : undefined}
                    dangerouslySetInnerHTML={{ __html: highlightedHtml }}
                />
            </pre>
        </div>
    );
}

type ContentPart =
    | { type: "html"; content: string }
    | { type: "code"; code: string; language?: string }
    | { type: "youtube"; videoId: string };

// Process HTML content to extract YouTube links as separate parts
function extractYouTubeParts(htmlContent: string): ContentPart[] {
    const result: ContentPart[] = [];
    let lastIndex = 0;

    // Reset regex state
    YOUTUBE_LINK_REGEX.lastIndex = 0;

    let match;
    while ((match = YOUTUBE_LINK_REGEX.exec(htmlContent)) !== null) {
        const url = match[1];
        const videoId = extractYouTubeId(url);

        if (videoId) {
            // Add HTML before this YouTube link
            if (match.index > lastIndex) {
                result.push({ type: "html", content: htmlContent.slice(lastIndex, match.index) });
            }

            result.push({ type: "youtube", videoId });
            lastIndex = match.index + match[0].length;
        }
    }

    // Add remaining HTML
    if (lastIndex < htmlContent.length) {
        result.push({ type: "html", content: htmlContent.slice(lastIndex) });
    }

    return result.length > 0 ? result : [{ type: "html", content: htmlContent }];
}

interface HtmlContentProps {
    content: string;
    className?: string;
}

export function HtmlContent({ content, className }: HtmlContentProps) {
    const parts = useMemo(() => {
        if (!content || content === "<p></p>") return null;

        const codeBlockRegex =
            /<pre><code(?:\s+class="language-(\w+)")?>([\s\S]*?)<\/code><\/pre>/g;
        const intermediateResult: Array<
            { type: "html"; content: string } | { type: "code"; code: string; language?: string }
        > = [];

        let lastIndex = 0;
        let match;

        while ((match = codeBlockRegex.exec(content)) !== null) {
            // Add HTML before this code block
            if (match.index > lastIndex) {
                intermediateResult.push({
                    type: "html",
                    content: content.slice(lastIndex, match.index)
                });
            }

            // Decode HTML entities in code
            const decodedCode = match[2]
                .replace(/&lt;/g, "<")
                .replace(/&gt;/g, ">")
                .replace(/&amp;/g, "&")
                .replace(/&quot;/g, '"')
                .replace(/&#39;/g, "'");

            intermediateResult.push({ type: "code", code: decodedCode, language: match[1] });
            lastIndex = match.index + match[0].length;
        }

        // Add remaining HTML
        if (lastIndex < content.length) {
            intermediateResult.push({ type: "html", content: content.slice(lastIndex) });
        }

        // Process HTML parts to extract YouTube embeds
        const result: ContentPart[] = [];
        for (const part of intermediateResult) {
            if (part.type === "html") {
                result.push(...extractYouTubeParts(part.content));
            } else {
                result.push(part);
            }
        }

        return result;
    }, [content]);

    if (!parts || parts.length === 0) return null;

    return (
        <div className={cn("prose prose-sm dark:prose-invert max-w-none", className)}>
            {parts.map((part, index) => {
                if (part.type === "html") {
                    return (
                        <span
                            key={index}
                            dangerouslySetInnerHTML={{ __html: renderTagsAsHtml(part.content) }}
                        />
                    );
                }
                if (part.type === "youtube") {
                    return <YouTubeEmbed key={index} videoId={part.videoId} />;
                }
                return <CodeBlock key={index} code={part.code} language={part.language} />;
            })}
        </div>
    );
}
