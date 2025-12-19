import { cookies, headers } from "next/headers";
import { redirect } from "next/navigation";

import { auth } from "@/lib/auth";

export default async function AuthLayout({ children }: { children: React.ReactNode }) {
    let session;
    try {
        session = await auth.api.getSession({
            headers: await headers()
        });
    } catch {
        // Session token invalid/expired - clear the stale cookie and allow access to auth pages
        const cookieStore = await cookies();
        cookieStore.delete("better-auth.session_token");
        session = null;
    }

    if (session) {
        redirect("/");
    }

    return (
        <div className="flex min-h-svh items-center justify-center p-4">
            <div className="w-full max-w-sm">{children}</div>
        </div>
    );
}
