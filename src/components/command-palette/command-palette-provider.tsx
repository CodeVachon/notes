"use client";

import * as React from "react";
import { createContext, useContext, useState, useEffect, useCallback } from "react";

export type PaletteInitialMode = "commands" | "todo-input" | "note-input" | "search" | "shortcuts";

interface CommandPaletteContextType {
    isOpen: boolean;
    initialMode: PaletteInitialMode;
    openPalette: (mode?: PaletteInitialMode) => void;
    closePalette: () => void;
    togglePalette: () => void;
}

const CommandPaletteContext = createContext<CommandPaletteContextType | null>(null);

export function useCommandPalette() {
    const context = useContext(CommandPaletteContext);
    if (!context) {
        throw new Error("useCommandPalette must be used within a CommandPaletteProvider");
    }
    return context;
}

interface CommandPaletteProviderProps {
    children: React.ReactNode;
}

export function CommandPaletteProvider({ children }: CommandPaletteProviderProps) {
    const [isOpen, setIsOpen] = useState(false);
    const [initialMode, setInitialMode] = useState<PaletteInitialMode>("commands");

    const openPalette = useCallback((mode: PaletteInitialMode = "commands") => {
        setInitialMode(mode);
        setIsOpen(true);
    }, []);

    const closePalette = useCallback(() => {
        setIsOpen(false);
        setInitialMode("commands");
    }, []);

    const togglePalette = useCallback(() => {
        setIsOpen((prev) => {
            if (!prev) {
                setInitialMode("commands");
            }
            return !prev;
        });
    }, []);

    useEffect(() => {
        const down = (e: KeyboardEvent) => {
            // Don't trigger shortcuts when typing in inputs
            const target = e.target as HTMLElement;
            const isTyping =
                target.tagName === "INPUT" ||
                target.tagName === "TEXTAREA" ||
                target.isContentEditable;

            // Cmd/Ctrl+K - Toggle command palette (works even when typing)
            if (e.key === "k" && (e.metaKey || e.ctrlKey)) {
                e.preventDefault();
                togglePalette();
                return;
            }

            // Don't trigger other shortcuts when typing in inputs
            if (isTyping) return;

            // T - New todo (only when not typing)
            if (e.key === "t" || e.key === "T") {
                e.preventDefault();
                openPalette("todo-input");
                return;
            }

            // N - New note (only when not typing)
            if (e.key === "n" || e.key === "N") {
                e.preventDefault();
                openPalette("note-input");
                return;
            }

            // Cmd/Ctrl+/ - Show keyboard shortcuts
            if (e.key === "/" && (e.metaKey || e.ctrlKey)) {
                e.preventDefault();
                openPalette("shortcuts");
                return;
            }
        };

        document.addEventListener("keydown", down);
        return () => document.removeEventListener("keydown", down);
    }, [togglePalette, openPalette]);

    return (
        <CommandPaletteContext.Provider
            value={{
                isOpen,
                initialMode,
                openPalette,
                closePalette,
                togglePalette
            }}
        >
            {children}
        </CommandPaletteContext.Provider>
    );
}
