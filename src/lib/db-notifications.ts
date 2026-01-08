import postgres from "postgres";

const connectionString = process.env.DATABASE_URL!;

export type ChangeEvent = {
    operation: "INSERT" | "UPDATE" | "DELETE";
    table: string;
    id: string;
    date: string | null;
};

type ChangeListener = (event: ChangeEvent) => void;

class DatabaseNotifier {
    private listeners = new Map<string, Set<ChangeListener>>();
    private listeningChannels = new Set<string>();
    private notificationClient: ReturnType<typeof postgres> | null = null;

    private getClient() {
        if (!this.notificationClient) {
            // Create a dedicated connection for LISTEN (separate from query pool)
            this.notificationClient = postgres(connectionString, {
                max: 1,
                idle_timeout: 0, // Keep alive
                connect_timeout: 10
            });
        }
        return this.notificationClient;
    }

    async startListening(userId: string) {
        const channel = `data_change_${userId}`;

        if (this.listeningChannels.has(channel)) {
            return;
        }

        const client = this.getClient();

        try {
            await client.listen(channel, (payload) => {
                try {
                    const event = JSON.parse(payload) as ChangeEvent;
                    const listeners = this.listeners.get(userId);
                    if (listeners) {
                        listeners.forEach((listener) => {
                            try {
                                listener(event);
                            } catch (err) {
                                console.error("[DB Notification] Listener error:", err);
                            }
                        });
                    }
                } catch (err) {
                    console.error("[DB Notification] Parse error:", err);
                }
            });

            this.listeningChannels.add(channel);

            if (process.env.NODE_ENV === "development") {
                console.log(`[DB Notification] Listening on channel: ${channel}`);
            }
        } catch (err) {
            console.error("[DB Notification] Failed to start listening:", err);
            throw err;
        }
    }

    subscribe(userId: string, listener: ChangeListener): () => void {
        if (!this.listeners.has(userId)) {
            this.listeners.set(userId, new Set());
        }

        this.listeners.get(userId)!.add(listener);

        // Start listening if not already
        this.startListening(userId).catch((err) => {
            console.error("[DB Notification] Failed to subscribe:", err);
        });

        // Return unsubscribe function
        return () => {
            const listeners = this.listeners.get(userId);
            if (listeners) {
                listeners.delete(listener);
                if (listeners.size === 0) {
                    this.listeners.delete(userId);
                    // Note: We keep listening on the channel even with no subscribers
                    // to avoid reconnection overhead. The channel will be cleaned up
                    // when the server restarts.
                }
            }
        };
    }

    getSubscriberCount(userId: string): number {
        return this.listeners.get(userId)?.size ?? 0;
    }
}

// Singleton instance
export const dbNotifier = new DatabaseNotifier();
