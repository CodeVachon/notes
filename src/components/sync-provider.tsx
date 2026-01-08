"use client";

import { useSync } from "@/hooks/use-sync";

export function SyncProvider({ children }: { children: React.ReactNode }) {
    useSync();
    return <>{children}</>;
}
