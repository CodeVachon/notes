"use client";

import * as React from "react";
import { useState, useTransition, useCallback, useRef, useEffect } from "react";
import { useRouter, usePathname } from "next/navigation";
import {
    IconCalendarEvent,
    IconCalendarPlus,
    IconCalendarMinus,
    IconCalendarSearch,
    IconCheckbox,
    IconNote,
    IconArrowLeft,
    IconSearch,
    IconKeyboard,
    IconSettings
} from "@tabler/icons-react";

import {
    Command,
    CommandDialog,
    CommandEmpty,
    CommandGroup,
    CommandInput,
    CommandItem,
    CommandList,
    CommandSeparator
} from "@/components/ui/command";
import { Input } from "@/components/ui/input";
import { useCommandPalette } from "./command-palette-provider";
import { useSettingsDrawer } from "@/components/settings/settings-drawer-provider";
import { useMounted } from "@/lib/use-mounted";
import { getTodayString, getYesterdayString, getTomorrowString } from "@/lib/date-utils";
import { parseDateInput } from "@/lib/date-parser";
import { createTodo, createNote } from "@/app/notebook/actions";
import { search, type SearchResult } from "@/app/search/actions";
import { SearchResults } from "@/components/search";
import { useDebounce } from "@/lib/use-debounce";

type PaletteMode = "commands" | "date-input" | "todo-input" | "note-input" | "search" | "shortcuts";

interface CommandPaletteContentProps {
    currentDate: string;
    initialMode: PaletteMode;
    onClose: () => void;
    onOpenSettings: () => void;
}

function CommandPaletteContent({
    currentDate,
    initialMode,
    onClose,
    onOpenSettings
}: CommandPaletteContentProps) {
    const router = useRouter();
    const [isPending, startTransition] = useTransition();
    const inputRef = useRef<HTMLInputElement>(null);
    const shouldRefocusRef = useRef(false);

    const [mode, setMode] = useState<PaletteMode>(initialMode);
    const [inputValue, setInputValue] = useState("");
    const [error, setError] = useState<string | null>(null);

    // Search state
    const [searchResults, setSearchResults] = useState<SearchResult[]>([]);
    const [isSearching, setIsSearching] = useState(false);
    const [selectedIndex, setSelectedIndex] = useState(-1);
    const debouncedQuery = useDebounce(inputValue, 300);

    // Handle refocus after successful multi-submit when transition completes
    useEffect(() => {
        if (!isPending && shouldRefocusRef.current) {
            shouldRefocusRef.current = false;
            inputRef.current?.focus();
        }
    }, [isPending]);

    // Handle search when in search mode
    useEffect(() => {
        if (mode !== "search") return;

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
    }, [debouncedQuery, mode]);

    const goBack = useCallback(() => {
        setMode("commands");
        setInputValue("");
        setError(null);
        setSearchResults([]);
        setSelectedIndex(-1);
    }, []);

    // Handle navigation commands
    const handleGotoToday = useCallback(() => {
        router.push(`/notebook/${getTodayString()}`);
        onClose();
    }, [router, onClose]);

    const handleGotoTomorrow = useCallback(() => {
        router.push(`/notebook/${getTomorrowString()}`);
        onClose();
    }, [router, onClose]);

    const handleGotoYesterday = useCallback(() => {
        router.push(`/notebook/${getYesterdayString()}`);
        onClose();
    }, [router, onClose]);

    const handleOpenSettings = useCallback(() => {
        onClose();
        onOpenSettings();
    }, [onClose, onOpenSettings]);

    // Handle date input submission
    const handleDateSubmit = useCallback(
        (e: React.FormEvent) => {
            e.preventDefault();
            const parsedDate = parseDateInput(inputValue);
            if (parsedDate) {
                router.push(`/notebook/${parsedDate}`);
                onClose();
            } else {
                setError("Invalid date format. Try: Dec 25, 2025-12-25, or 12/25/2025");
            }
        },
        [inputValue, router, onClose]
    );

    // Handle todo creation - keepOpen allows adding multiple todos
    const handleTodoSubmit = useCallback(
        (keepOpen = false) => {
            const title = inputValue.trim();
            if (!title) {
                setError("Please enter a todo title");
                return;
            }

            startTransition(async () => {
                try {
                    await createTodo({ date: currentDate, title });
                    if (keepOpen) {
                        setInputValue("");
                        shouldRefocusRef.current = true;
                    } else {
                        onClose();
                    }
                } catch {
                    setError("Failed to create todo");
                }
            });
        },
        [inputValue, currentDate, onClose]
    );

    // Handle note creation - keepOpen allows adding multiple notes
    const handleNoteSubmit = useCallback(
        (keepOpen = false) => {
            const title = inputValue.trim();
            if (!title) {
                setError("Please enter a note title");
                return;
            }

            startTransition(async () => {
                try {
                    await createNote({ date: currentDate, title, content: "" });
                    if (keepOpen) {
                        setInputValue("");
                        shouldRefocusRef.current = true;
                    } else {
                        onClose();
                    }
                } catch {
                    setError("Failed to create note");
                }
            });
        },
        [inputValue, currentDate, onClose]
    );

    // Handle search result navigation
    const handleSearchKeyDown = (e: React.KeyboardEvent) => {
        if (e.key === "Escape") {
            e.preventDefault();
            goBack();
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
            onClose();
        }
    };

    // Render search mode
    if (mode === "search") {
        return (
            <Command className="rounded-xl">
                <div className="flex items-center gap-2 border-b p-3">
                    <button
                        onClick={goBack}
                        className="text-muted-foreground hover:text-foreground rounded p-1 transition-colors"
                    >
                        <IconArrowLeft className="size-4" />
                    </button>
                    <span className="text-sm font-medium">Search</span>
                </div>
                <div className="p-3 pb-0">
                    <Input
                        ref={inputRef}
                        value={inputValue}
                        onChange={(e) => setInputValue(e.target.value)}
                        onKeyDown={handleSearchKeyDown}
                        placeholder="Search notes and todos..."
                        autoFocus
                    />
                </div>
                <SearchResults
                    results={searchResults}
                    isLoading={isSearching}
                    query={inputValue}
                    selectedIndex={selectedIndex}
                    onResultSelect={onClose}
                />
                {inputValue.length < 2 && inputValue.length > 0 && (
                    <p className="text-muted-foreground px-3 pb-3 text-xs">
                        Type at least 2 characters to search
                    </p>
                )}
            </Command>
        );
    }

    // Render shortcuts mode
    if (mode === "shortcuts") {
        const isMac = typeof navigator !== "undefined" && navigator.platform.includes("Mac");
        const modKey = isMac ? "⌘" : "Ctrl";

        const shortcuts = [
            { keys: `${modKey}+K`, description: "Open command palette" },
            { keys: "T", description: "Quick add new todo" },
            { keys: "N", description: "Quick add new note" },
            { keys: ",", description: "Open settings" },
            { keys: `${modKey}+/`, description: "Show keyboard shortcuts" }
        ];

        return (
            <Command className="rounded-xl">
                <div className="flex items-center gap-2 border-b p-3">
                    <button
                        onClick={goBack}
                        className="text-muted-foreground hover:text-foreground rounded p-1 transition-colors"
                    >
                        <IconArrowLeft className="size-4" />
                    </button>
                    <span className="text-sm font-medium">Keyboard Shortcuts</span>
                </div>
                <div className="p-3">
                    <div className="space-y-2">
                        {shortcuts.map(({ keys, description }) => (
                            <div key={keys} className="flex items-center justify-between py-1">
                                <span className="text-muted-foreground text-sm">{description}</span>
                                <kbd className="bg-muted rounded px-2 py-1 font-mono text-xs">
                                    {keys}
                                </kbd>
                            </div>
                        ))}
                    </div>
                    <p className="text-muted-foreground mt-4 text-xs">
                        Press Escape or click the back arrow to return
                    </p>
                </div>
            </Command>
        );
    }

    // Render secondary input mode
    if (mode !== "commands") {
        const config = {
            "date-input": {
                title: "Jump to Date",
                placeholder: "Enter date (e.g., Dec 25, 2025-12-25)",
                onSubmit: () => handleDateSubmit({ preventDefault: () => {} } as React.FormEvent),
                supportsMultiple: false
            },
            "todo-input": {
                title: "Add Todo",
                placeholder: "Enter todo title...",
                onSubmit: handleTodoSubmit,
                supportsMultiple: true
            },
            "note-input": {
                title: "Add Note",
                placeholder: "Enter note title...",
                onSubmit: handleNoteSubmit,
                supportsMultiple: true
            }
        }[mode];

        const { title, placeholder, onSubmit } = config;
        const allowsMultiple = mode === "todo-input" || mode === "note-input";
        const helpText = allowsMultiple
            ? "Enter to confirm, Shift+Enter to add another, Esc to go back"
            : "Enter to confirm, Esc to go back";

        // Handle keyboard events - Enter submits, Shift+Enter submits and continues, Escape goes back
        const handleKeyDown = (e: React.KeyboardEvent) => {
            if (e.key === "Enter") {
                e.preventDefault();
                const keepOpen = e.shiftKey && allowsMultiple;
                onSubmit(keepOpen);
            } else if (e.key === "Escape") {
                e.preventDefault();
                goBack();
            }
        };

        return (
            <Command className="rounded-xl">
                <div className="flex items-center gap-2 border-b p-3">
                    <button
                        onClick={goBack}
                        className="text-muted-foreground hover:text-foreground rounded p-1 transition-colors"
                    >
                        <IconArrowLeft className="size-4" />
                    </button>
                    <span className="text-sm font-medium">{title}</span>
                </div>
                <div className="p-3">
                    <Input
                        ref={inputRef}
                        value={inputValue}
                        onChange={(e) => {
                            setInputValue(e.target.value);
                            setError(null);
                        }}
                        onKeyDown={handleKeyDown}
                        placeholder={placeholder}
                        autoFocus
                        disabled={isPending}
                    />
                    {error && <p className="text-destructive mt-2 text-xs">{error}</p>}
                    <p className="text-muted-foreground mt-2 text-xs">{helpText}</p>
                </div>
            </Command>
        );
    }

    // Render commands mode - Create group first to prioritize actions over navigation
    return (
        <Command className="rounded-xl">
            <CommandInput placeholder="Type a command or search..." />
            <CommandList>
                <CommandEmpty>No results found.</CommandEmpty>
                <CommandGroup heading="Search">
                    <CommandItem value="search find notes todos" onSelect={() => setMode("search")}>
                        <IconSearch className="text-muted-foreground" />
                        <span>Search...</span>
                    </CommandItem>
                </CommandGroup>
                <CommandSeparator />
                <CommandGroup heading="Create">
                    <CommandItem value="add todo task" onSelect={() => setMode("todo-input")}>
                        <IconCheckbox className="text-muted-foreground" />
                        <span>Add Todo...</span>
                    </CommandItem>
                    <CommandItem value="add note write" onSelect={() => setMode("note-input")}>
                        <IconNote className="text-muted-foreground" />
                        <span>Add Note...</span>
                    </CommandItem>
                </CommandGroup>
                <CommandSeparator />
                <CommandGroup heading="Navigation">
                    <CommandItem value="go today current" onSelect={handleGotoToday}>
                        <IconCalendarEvent className="text-muted-foreground" />
                        <span>Go to Today</span>
                    </CommandItem>
                    <CommandItem value="go tomorrow next" onSelect={handleGotoTomorrow}>
                        <IconCalendarPlus className="text-muted-foreground" />
                        <span>Go to Tomorrow</span>
                    </CommandItem>
                    <CommandItem value="go yesterday previous" onSelect={handleGotoYesterday}>
                        <IconCalendarMinus className="text-muted-foreground" />
                        <span>Go to Yesterday</span>
                    </CommandItem>
                    <CommandItem
                        value="jump date specific calendar"
                        onSelect={() => setMode("date-input")}
                    >
                        <IconCalendarSearch className="text-muted-foreground" />
                        <span>Jump to Date...</span>
                    </CommandItem>
                </CommandGroup>
                <CommandSeparator />
                <CommandGroup heading="Settings">
                    <CommandItem value="settings preferences config" onSelect={handleOpenSettings}>
                        <IconSettings className="text-muted-foreground" />
                        <span>Settings</span>
                    </CommandItem>
                </CommandGroup>
                <CommandSeparator />
                <CommandGroup heading="Help">
                    <CommandItem
                        value="keyboard shortcuts hotkeys help"
                        onSelect={() => setMode("shortcuts")}
                    >
                        <IconKeyboard className="text-muted-foreground" />
                        <span>Keyboard Shortcuts</span>
                    </CommandItem>
                </CommandGroup>
            </CommandList>
        </Command>
    );
}

export function CommandPalette() {
    const pathname = usePathname();
    const { isOpen, initialMode, closePalette } = useCommandPalette();
    const { openSettings } = useSettingsDrawer();
    const mounted = useMounted();

    // Extract current date from URL
    const currentDate = pathname.match(/\/notebook\/(\d{4}-\d{2}-\d{2})/)?.[1] ?? getTodayString();

    const handleOpenChange = useCallback(
        (open: boolean) => {
            if (!open) {
                closePalette();
            }
        },
        [closePalette]
    );

    // Don't render on server to avoid hydration mismatch with Base UI IDs
    if (!mounted) {
        return null;
    }

    // Only render content when open - this ensures fresh state on each open
    return (
        <CommandDialog open={isOpen} onOpenChange={handleOpenChange}>
            {isOpen && (
                <CommandPaletteContent
                    currentDate={currentDate}
                    initialMode={initialMode}
                    onClose={closePalette}
                    onOpenSettings={openSettings}
                />
            )}
        </CommandDialog>
    );
}
