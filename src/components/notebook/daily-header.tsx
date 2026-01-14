"use client";

import { useState, useEffect, useRef } from "react";
import { useRouter } from "next/navigation";
import { addDays, subDays } from "date-fns";
import { IconChevronLeft, IconChevronRight, IconSearch, IconX } from "@tabler/icons-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
    formatDateForDisplay,
    formatDateForStorage,
    parseDateString,
    getTodayString,
    getYesterdayString,
    getTomorrowString
} from "@/lib/date-utils";
import { search, type SearchResult } from "@/app/search/actions";
import { SearchResults } from "@/components/search";
import { useDebounce } from "@/lib/use-debounce";

interface DailyHeaderProps {
    date: string;
}

function getDateLabel(date: string): string | null {
    if (date === getTodayString()) return "Today";
    if (date === getYesterdayString()) return "Yesterday";
    if (date === getTomorrowString()) return "Tomorrow";
    return null;
}

export function DailyHeader({ date }: DailyHeaderProps) {
    const router = useRouter();
    const inputRef = useRef<HTMLInputElement>(null);

    const currentDate = parseDateString(date) ?? new Date();
    const displayDate = formatDateForDisplay(currentDate);
    const dateLabel = getDateLabel(date);

    // Search state
    const [isSearchOpen, setIsSearchOpen] = useState(false);
    const [query, setQuery] = useState("");
    const [searchResults, setSearchResults] = useState<SearchResult[]>([]);
    const [isSearching, setIsSearching] = useState(false);
    const [selectedIndex, setSelectedIndex] = useState(-1);
    const debouncedQuery = useDebounce(query, 300);

    // Handle search when query changes
    useEffect(() => {
        if (!isSearchOpen) return;

        if (!debouncedQuery.trim() || debouncedQuery.length < 2) {
            setSearchResults([]);
            setIsSearching(false);
            setSelectedIndex(-1);
            return;
        }

        setIsSearching(true);
        search(debouncedQuery)
            .then((results) => {
                setSearchResults(results);
                setSelectedIndex(results.length > 0 ? 0 : -1);
            })
            .catch(() => {
                setSearchResults([]);
            })
            .finally(() => {
                setIsSearching(false);
            });
    }, [debouncedQuery, isSearchOpen]);

    // Focus input when search opens
    useEffect(() => {
        if (isSearchOpen) {
            inputRef.current?.focus();
        }
    }, [isSearchOpen]);

    const handlePrevDay = () => {
        const prevDate = subDays(currentDate, 1);
        router.push(`/notebook/${formatDateForStorage(prevDate)}`);
    };

    const handleNextDay = () => {
        const nextDate = addDays(currentDate, 1);
        router.push(`/notebook/${formatDateForStorage(nextDate)}`);
    };

    const closeSearch = () => {
        setIsSearchOpen(false);
        setQuery("");
        setSearchResults([]);
        setSelectedIndex(-1);
    };

    const handleSearchKeyDown = (e: React.KeyboardEvent) => {
        if (e.key === "Escape") {
            e.preventDefault();
            closeSearch();
        } else if (e.key === "ArrowDown") {
            e.preventDefault();
            setSelectedIndex((prev) => (prev < searchResults.length - 1 ? prev + 1 : prev));
        } else if (e.key === "ArrowUp") {
            e.preventDefault();
            setSelectedIndex((prev) => (prev > 0 ? prev - 1 : prev));
        } else if (e.key === "Enter" && selectedIndex >= 0 && searchResults[selectedIndex]) {
            e.preventDefault();
            const result = searchResults[selectedIndex];
            if (result.date) {
                router.push(`/notebook/${result.date}?highlight=${result.type}-${result.id}`);
            }
            closeSearch();
        }
    };

    // Render search mode
    if (isSearchOpen) {
        return (
            <div className="relative w-full">
                <div className="relative">
                    <IconSearch className="text-muted-foreground absolute top-1/2 left-2.5 size-4 -translate-y-1/2" />
                    <Input
                        ref={inputRef}
                        value={query}
                        onChange={(e) => setQuery(e.target.value)}
                        onKeyDown={handleSearchKeyDown}
                        placeholder="Search notes and todos..."
                        className="pr-9 pl-9"
                    />
                    <Button
                        variant="ghost"
                        size="icon"
                        className="absolute top-1/2 right-0 size-8 -translate-y-1/2"
                        onClick={closeSearch}
                    >
                        <IconX className="size-4" />
                    </Button>
                </div>
                {(searchResults.length > 0 ||
                    isSearching ||
                    (query.length >= 2 && searchResults.length === 0)) && (
                    <div className="bg-popover border-border absolute top-full left-0 z-50 mt-2 w-full rounded-lg border shadow-lg">
                        <SearchResults
                            results={searchResults}
                            isLoading={isSearching}
                            query={query}
                            selectedIndex={selectedIndex}
                            onResultSelect={closeSearch}
                        />
                    </div>
                )}
                {query.length > 0 && query.length < 2 && (
                    <p className="text-muted-foreground absolute top-full left-0 mt-2 text-xs">
                        Type at least 2 characters to search
                    </p>
                )}
            </div>
        );
    }

    return (
        <div className="flex w-full items-center justify-between">
            <Button variant="ghost" size="icon" onClick={handlePrevDay}>
                <IconChevronLeft className="size-4" />
            </Button>

            <div className="flex items-center gap-2">
                <h1 className="text-lg font-semibold">{displayDate}</h1>
                <Button
                    variant="ghost"
                    size="icon"
                    onClick={() => setIsSearchOpen(true)}
                    className="size-8"
                >
                    <IconSearch className="size-4" />
                </Button>
            </div>

            <Button variant="ghost" size="icon" onClick={handleNextDay}>
                <IconChevronRight className="size-4" />
            </Button>

            {dateLabel && (
                <span className="bg-primary text-primary-foreground absolute bottom-0 left-1/2 -translate-x-1/2 translate-y-1/2 rounded-full px-2 py-0.5 text-xs font-medium">
                    {dateLabel}
                </span>
            )}
        </div>
    );
}
