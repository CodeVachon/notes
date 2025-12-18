import { headers } from "next/headers";
import { redirect } from "next/navigation";

import { auth } from "@/lib/auth";
import { UserMenu } from "@/components/user-menu";
import { SidebarCalendar } from "@/components/notebook/sidebar-calendar";
import { Separator } from "@/components/ui/separator";
import { getDatesWithContent } from "./actions";

export default async function NotebookLayout({ children }: { children: React.ReactNode }) {
    const session = await auth.api.getSession({
        headers: await headers()
    });

    if (!session) {
        redirect("/sign-in");
    }

    const datesWithContent = await getDatesWithContent();

    return (
        <div className="flex h-screen">
            <aside className="bg-background flex w-64 flex-col border-r">
                <div className="flex h-14 items-center border-b px-4">
                    <h1 className="text-lg font-semibold">Notes</h1>
                </div>
                <nav className="flex-1 overflow-y-auto p-4">
                    <SidebarCalendar datesWithContent={datesWithContent} />
                </nav>
                <Separator />
                <div className="p-2">
                    <UserMenu user={session.user} />
                </div>
            </aside>
            <main className="flex-1 overflow-hidden">{children}</main>
        </div>
    );
}
