import { auth } from "@/lib/auth";
import { headers } from "next/headers";
import { redirect } from "next/navigation";

export default async function AuthLayout({ children }: { children: React.ReactNode }) {
    const session = await auth.api.getSession({
        headers: await headers()
    });

    if (session) {
        redirect("/");
    }

    return (
        <div className="flex min-h-svh items-center justify-center p-4">
            <div className="w-full max-w-sm">{children}</div>
        </div>
    );
}
