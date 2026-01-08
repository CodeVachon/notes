import { headers } from "next/headers";
import { auth } from "@/lib/auth";
import { dbNotifier, type ChangeEvent } from "@/lib/db-notifications";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

export async function GET() {
    // Authenticate user
    let session;
    try {
        session = await auth.api.getSession({ headers: await headers() });
    } catch {
        return new Response("Unauthorized", { status: 401 });
    }

    if (!session) {
        return new Response("Unauthorized", { status: 401 });
    }

    const userId = session.user.id;
    const encoder = new TextEncoder();

    const stream = new ReadableStream({
        start(controller) {
            // Send initial connection message
            const connectMsg = JSON.stringify({ type: "connected" });
            controller.enqueue(encoder.encode(`data: ${connectMsg}\n\n`));

            // Keep-alive ping every 30 seconds
            const keepAlive = setInterval(() => {
                try {
                    controller.enqueue(encoder.encode(": ping\n\n"));
                } catch {
                    // Stream closed, cleanup will happen in cancel
                }
            }, 30000);

            // Subscribe to database notifications
            const unsubscribe = dbNotifier.subscribe(userId, (event: ChangeEvent) => {
                const message = {
                    type: "change",
                    operation: event.operation,
                    table: event.table,
                    id: event.id,
                    date: event.date
                };
                try {
                    controller.enqueue(encoder.encode(`data: ${JSON.stringify(message)}\n\n`));
                } catch {
                    // Stream closed
                }
            });

            // Store cleanup functions for cancel
            (controller as unknown as { cleanup: () => void }).cleanup = () => {
                clearInterval(keepAlive);
                unsubscribe();
            };
        },
        cancel(controller) {
            // Cleanup when client disconnects
            const cleanup = (controller as unknown as { cleanup?: () => void }).cleanup;
            if (cleanup) {
                cleanup();
            }
        }
    });

    return new Response(stream, {
        headers: {
            "Content-Type": "text/event-stream",
            "Cache-Control": "no-cache, no-transform",
            Connection: "keep-alive",
            "X-Accel-Buffering": "no" // Disable nginx buffering
        }
    });
}
