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
    IconArrowLeft
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
import { useMounted } from "@/lib/use-mounted";
import { getTodayString, getYesterdayString, getTomorrowString } from "@/lib/date-utils";
import { parseDateInput } from "@/lib/date-parser";
import { createTodo, createNote } from "@/app/notebook/actions";

type PaletteMode = "commands" | "date-input" | "todo-input" | "note-input";

interface CommandPaletteContentProps {
    currentDate: string;
    onClose: () => void;
}

function CommandPaletteContent({ currentDate, onClose }: CommandPaletteContentProps) {
    const router = useRouter();
    const [isPending, startTransition] = useTransition();
    const inputRef = useRef<HTMLInputElement>(null);
    const shouldRefocusRef = useRef(false);

    const [mode, setMode] = useState<PaletteMode>("commands");
    const [inputValue, setInputValue] = useState("");
    const [error, setError] = useState<string | null>(null);

    // Handle refocus after successful multi-submit when transition completes
    useEffect(() => {
        if (!isPending && shouldRefocusRef.current) {
            shouldRefocusRef.current = false;
            inputRef.current?.focus();
        }
    }, [isPending]);

    const goBack = useCallback(() => {
        setMode("commands");
        setInputValue("");
        setError(null);
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
            </CommandList>
        </Command>
    );
}

export function CommandPalette() {
    const pathname = usePathname();
    const { isOpen, closePalette } = useCommandPalette();
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
            {isOpen && <CommandPaletteContent currentDate={currentDate} onClose={closePalette} />}
        </CommandDialog>
    );
}
