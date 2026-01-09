"use client";

import { createContext, useContext, useEffect } from "react";
import type { UserSettings } from "@/db/schema";

interface SettingsContextType {
    settings: UserSettings;
}

const SettingsContext = createContext<SettingsContextType | null>(null);

export function useSettings() {
    const context = useContext(SettingsContext);
    if (!context) {
        throw new Error("useSettings must be used within a SettingsProvider");
    }
    return context;
}

interface SettingsProviderProps {
    settings: UserSettings;
    children: React.ReactNode;
}

// Helper function to derive semantic colors from primary
function applyDerivedColors(primary: { l: string; c: string; h: string }) {
    const root = document.documentElement;
    const l = parseFloat(primary.l);
    const c = parseFloat(primary.c);
    const h = parseFloat(primary.h);

    // Primary foreground - high contrast against primary
    const fgL = l > 0.6 ? 0.2 : 0.95;
    root.style.setProperty("--primary-foreground", `oklch(${fgL} ${c * 0.3} ${h})`);

    // Sidebar primary (slightly different lightness)
    root.style.setProperty("--sidebar-primary", `oklch(${Math.min(l + 0.09, 0.95)} ${c} ${h})`);
    root.style.setProperty("--sidebar-primary-foreground", `oklch(${fgL} ${c * 0.3} ${h})`);

    // Chart colors - variations of the primary
    root.style.setProperty(
        "--chart-1",
        `oklch(${Math.min(l + 0.16, 0.95)} ${Math.max(c - 0.01, 0)} ${h - 8})`
    );
    root.style.setProperty("--chart-2", `oklch(${Math.min(l + 0.09, 0.95)} ${c} ${h - 3})`);
    root.style.setProperty("--chart-3", `oklch(${l} ${c} ${h})`);
    root.style.setProperty(
        "--chart-4",
        `oklch(${Math.max(l - 0.1, 0.1)} ${Math.max(c - 0.02, 0)} ${h + 7})`
    );
    root.style.setProperty(
        "--chart-5",
        `oklch(${Math.max(l - 0.19, 0.1)} ${Math.max(c - 0.04, 0)} ${h + 8})`
    );
}

export function SettingsProvider({ settings, children }: SettingsProviderProps) {
    // Apply custom primary color on mount and when settings change
    useEffect(() => {
        if (settings.primaryColorL && settings.primaryColorC && settings.primaryColorH) {
            const oklchValue = `oklch(${settings.primaryColorL} ${settings.primaryColorC} ${settings.primaryColorH})`;
            document.documentElement.style.setProperty("--primary", oklchValue);
            applyDerivedColors({
                l: settings.primaryColorL,
                c: settings.primaryColorC,
                h: settings.primaryColorH
            });
        } else {
            // Reset to default (remove inline styles, let CSS take over)
            document.documentElement.style.removeProperty("--primary");
            [
                "--primary-foreground",
                "--sidebar-primary",
                "--sidebar-primary-foreground",
                "--chart-1",
                "--chart-2",
                "--chart-3",
                "--chart-4",
                "--chart-5"
            ].forEach((prop) => {
                document.documentElement.style.removeProperty(prop);
            });
        }
    }, [settings.primaryColorL, settings.primaryColorC, settings.primaryColorH]);

    return <SettingsContext.Provider value={{ settings }}>{children}</SettingsContext.Provider>;
}
