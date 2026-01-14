"use client";

import { useRouter } from "next/navigation";
import { IconCheckbox, IconNote, IconHash } from "@tabler/icons-react";
import { Badge } from "@/components/ui/badge";
import type { SearchResult } from "@/app/search/actions";

interface SearchResultItemProps {
    result: SearchResult;
    onSelect: () => void;
    isSelected?: boolean;
}

function SearchResultItem({ result, onSelect, isSelected }: SearchResultItemProps) {
    const Icon = result.type === "todo" ? IconCheckbox : IconNote;

    return (
        <button
            onClick={onSelect}
            data-selected={isSelected}
            className="hover:bg-muted data-[selected=true]:bg-muted flex w-full items-start gap-3 rounded-md p-2 text-left outline-none"
        >
            <Icon className="text-muted-foreground mt-0.5 size-4 shrink-0" />
            <div className="min-w-0 flex-1">
                <div className="flex items-center gap-2">
                    <span className="truncate text-sm font-medium">{result.title}</span>
                    {result.date && (
                        <span className="text-muted-foreground shrink-0 text-xs">
                            {result.date}
                        </span>
                    )}
                </div>
                {result.preview && (
                    <p className="text-muted-foreground mt-0.5 line-clamp-1 text-xs">
                        {result.preview}
                    </p>
                )}
                {result.matchedTags && result.matchedTags.length > 0 && (
                    <div className="mt-1 flex flex-wrap gap-1">
                        {result.matchedTags.slice(0, 3).map((tag) => (
                            <Badge key={tag} variant="secondary" className="h-4 text-[0.5rem]">
                                <IconHash className="size-2" />
                                {tag}
                            </Badge>
                        ))}
                    </div>
                )}
            </div>
        </button>
    );
}

interface SearchResultsProps {
    results: SearchResult[];
    isLoading: boolean;
    query: string;
    selectedIndex?: number;
    onResultSelect?: () => void;
}

export function SearchResults({
    results,
    isLoading,
    query,
    selectedIndex = -1,
    onResultSelect
}: SearchResultsProps) {
    const router = useRouter();

    const handleSelect = (result: SearchResult) => {
        if (result.date) {
            router.push(`/notebook/${result.date}?highlight=${result.type}-${result.id}`);
        }
        onResultSelect?.();
    };

    if (isLoading) {
        return <div className="text-muted-foreground p-4 text-center text-sm">Searching...</div>;
    }

    if (query.length >= 2 && results.length === 0) {
        return (
            <div className="text-muted-foreground p-4 text-center text-sm">No results found</div>
        );
    }

    if (results.length === 0) {
        return null;
    }

    return (
        <div className="max-h-80 space-y-1 overflow-y-auto p-1">
            {results.map((result, index) => (
                <SearchResultItem
                    key={`${result.type}-${result.id}`}
                    result={result}
                    onSelect={() => handleSelect(result)}
                    isSelected={index === selectedIndex}
                />
            ))}
        </div>
    );
}

export { SearchResultItem };
