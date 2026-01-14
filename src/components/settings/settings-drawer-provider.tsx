"use client";

import * as React from "react";
import { createContext, useContext, useState, useCallback, useEffect } from "react";
import { SettingsDrawer } from "./settings-drawer";

interface SettingsDrawerContextType {
    isOpen: boolean;
    openSettings: () => void;
    closeSettings: () => void;
}

const SettingsDrawerContext = createContext<SettingsDrawerContextType | null>(null);

export function useSettingsDrawer() {
    const context = useContext(SettingsDrawerContext);
    if (!context) {
        throw new Error("useSettingsDrawer must be used within a SettingsDrawerProvider");
    }
    return context;
}

interface SettingsDrawerProviderProps {
    children: React.ReactNode;
}

export function SettingsDrawerProvider({ children }: SettingsDrawerProviderProps) {
    const [isOpen, setIsOpen] = useState(false);

    const openSettings = useCallback(() => {
        setIsOpen(true);
    }, []);

    const closeSettings = useCallback(() => {
        setIsOpen(false);
    }, []);

    // Keyboard shortcut: , (comma) - Open settings (only when not typing)
    useEffect(() => {
        const down = (e: KeyboardEvent) => {
            const target = e.target as HTMLElement;
            const isTyping =
                target.tagName === "INPUT" ||
                target.tagName === "TEXTAREA" ||
                target.isContentEditable;

            if (isTyping) return;

            if (e.key === ",") {
                e.preventDefault();
                openSettings();
            }
        };

        document.addEventListener("keydown", down);
        return () => document.removeEventListener("keydown", down);
    }, [openSettings]);

    return (
        <SettingsDrawerContext.Provider
            value={{
                isOpen,
                openSettings,
                closeSettings
            }}
        >
            {children}
            <SettingsDrawer open={isOpen} onOpenChange={setIsOpen} />
        </SettingsDrawerContext.Provider>
    );
}
