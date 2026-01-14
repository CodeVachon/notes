"use client";

import { useState, useCallback } from "react";

/**
 * Custom hook for managing dialog/modal open state
 * Provides a consistent pattern for controlled dialogs
 */
export function useDialog(defaultOpen = false) {
    const [open, setOpen] = useState(defaultOpen);

    const close = useCallback(() => setOpen(false), []);
    const toggle = useCallback(() => setOpen((v) => !v), []);

    return {
        open,
        setOpen,
        onOpenChange: setOpen,
        close,
        toggle
    };
}
