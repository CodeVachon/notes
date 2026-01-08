"use client";

import { useEffect, useRef, useCallback, useState } from "react";
import { useRouter } from "next/navigation";

type SyncEvent = {
    type: "connected" | "change";
    operation?: "INSERT" | "UPDATE" | "DELETE";
    table?: string;
    id?: string;
    date?: string | null;
};

type SyncStatus = "connecting" | "connected" | "disconnected" | "reconnecting";

export function useSync() {
    const router = useRouter();
    const eventSourceRef = useRef<EventSource | null>(null);
    const reconnectTimeoutRef = useRef<ReturnType<typeof setTimeout> | null>(null);
    const [status, setStatus] = useState<SyncStatus>("connecting");

    const connect = useCallback(() => {
        // Clean up existing connection
        if (eventSourceRef.current) {
            eventSourceRef.current.close();
        }

        setStatus("connecting");
        const eventSource = new EventSource("/api/sync");
        eventSourceRef.current = eventSource;

        eventSource.onopen = () => {
            setStatus("connected");
        };

        eventSource.onmessage = (event) => {
            try {
                const data = JSON.parse(event.data) as SyncEvent;

                if (data.type === "connected") {
                    setStatus("connected");
                    return;
                }

                if (data.type === "change") {
                    // Trigger Next.js router refresh to revalidate server components
                    router.refresh();
                }
            } catch (err) {
                console.error("[Sync] Failed to parse event:", err);
            }
        };

        eventSource.onerror = () => {
            setStatus("disconnected");
            eventSource.close();

            // Reconnect after 5 seconds
            setStatus("reconnecting");
            reconnectTimeoutRef.current = setTimeout(() => {
                connect();
            }, 5000);
        };
    }, [router]);

    useEffect(() => {
        connect();

        // Cleanup on unmount
        return () => {
            if (eventSourceRef.current) {
                eventSourceRef.current.close();
            }
            if (reconnectTimeoutRef.current) {
                clearTimeout(reconnectTimeoutRef.current);
            }
        };
    }, [connect]);

    return { status };
}
