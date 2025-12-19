"use client";

import { useState, useMemo } from "react";
import Link from "next/link";
import { IconSearch, IconTag } from "@tabler/icons-react";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";

interface TagWithCount {
    id: string;
    name: string;
    createdAt: Date;
    mentionCount: number;
}

interface TagsListClientProps {
    tags: TagWithCount[];
}

export function TagsListClient({ tags }: TagsListClientProps) {
    const [search, setSearch] = useState("");

    // Filter tags based on search (fuzzy matching)
    const filteredTags = useMemo(() => {
        if (!search) return tags;
        const lower = search.toLowerCase();
        return tags.filter((tag) => tag.name.toLowerCase().includes(lower));
    }, [tags, search]);

    // Group tags by first letter for alphabetical sections
    const grouped = useMemo(() => {
        const groups: Record<string, typeof filteredTags> = {};
        filteredTags.forEach((tag) => {
            const letter = tag.name[0].toUpperCase();
            if (!groups[letter]) groups[letter] = [];
            groups[letter].push(tag);
        });
        // Sort entries alphabetically
        return Object.entries(groups).sort(([a], [b]) => a.localeCompare(b));
    }, [filteredTags]);

    return (
        <div className="space-y-6">
            {/* Search Input */}
            <div className="relative">
                <IconSearch className="text-muted-foreground absolute top-1/2 left-2.5 size-3.5 -translate-y-1/2" />
                <Input
                    placeholder="Search tags..."
                    value={search}
                    onChange={(e) => setSearch(e.target.value)}
                    className="pl-8"
                />
            </div>

            {/* Tags List */}
            {grouped.length === 0 ? (
                <div className="flex flex-col items-center justify-center gap-2 py-12 text-center">
                    <IconTag className="text-muted-foreground size-8" />
                    <p className="text-muted-foreground text-sm">
                        {tags.length === 0
                            ? "No tags yet. Tags will appear here when you use [[tagname]] in your notes."
                            : "No tags match your search."}
                    </p>
                </div>
            ) : (
                <div className="space-y-6">
                    {grouped.map(([letter, letterTags]) => (
                        <div key={letter}>
                            <h2 className="text-muted-foreground mb-3 text-sm font-medium">
                                {letter}
                            </h2>
                            <div className="flex flex-wrap gap-2">
                                {letterTags.map((tag) => (
                                    <Link key={tag.id} href={`/tags/${tag.name}`}>
                                        <Badge
                                            variant="outline"
                                            className="hover:bg-accent cursor-pointer gap-1.5"
                                        >
                                            <span>[[{tag.name}]]</span>
                                            <span className="text-muted-foreground">
                                                {tag.mentionCount}
                                            </span>
                                        </Badge>
                                    </Link>
                                ))}
                            </div>
                        </div>
                    ))}
                </div>
            )}
        </div>
    );
}
