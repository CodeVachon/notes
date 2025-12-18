"use client";

import * as React from "react";
import { createContext, useContext, useState, useEffect, useCallback } from "react";

interface CommandPaletteContextType {
    isOpen: boolean;
    openPalette: () => void;
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

    const openPalette = useCallback(() => setIsOpen(true), []);
    const closePalette = useCallback(() => setIsOpen(false), []);
    const togglePalette = useCallback(() => setIsOpen((prev) => !prev), []);

    useEffect(() => {
        const down = (e: KeyboardEvent) => {
            if (e.key === "k" && (e.metaKey || e.ctrlKey)) {
                e.preventDefault();
                togglePalette();
            }
        };

        document.addEventListener("keydown", down);
        return () => document.removeEventListener("keydown", down);
    }, [togglePalette]);

    return (
        <CommandPaletteContext.Provider
            value={{
                isOpen,
                openPalette,
                closePalette,
                togglePalette
            }}
        >
            {children}
        </CommandPaletteContext.Provider>
    );
}
