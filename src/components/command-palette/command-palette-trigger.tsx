"use client";

import { useSyncExternalStore } from "react";
import { IconCommand } from "@tabler/icons-react";
import { useCommandPalette } from "./command-palette-provider";

function getIsMac() {
    if (typeof navigator === "undefined") return false;
    return navigator.platform.toUpperCase().includes("MAC");
}

function subscribe() {
    return () => {};
}

export function CommandPaletteTrigger() {
    const { openPalette } = useCommandPalette();
    const isMac = useSyncExternalStore(subscribe, getIsMac, () => false);

    return (
        <button
            onClick={openPalette}
            className="hover:bg-accent flex w-full items-center gap-2 rounded-lg px-3 py-2 text-sm transition-colors"
        >
            <IconCommand className="text-muted-foreground size-4" />
            <span className="text-muted-foreground flex-1 text-left text-xs">Command Palette</span>
            <kbd className="bg-muted text-muted-foreground rounded px-1.5 py-0.5 text-xs">
                {isMac ? "\u2318K" : "Ctrl+K"}
            </kbd>
        </button>
    );
}
