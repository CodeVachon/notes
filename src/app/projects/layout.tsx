import { cookies, headers } from "next/headers";
import { redirect } from "next/navigation";

import { auth } from "@/lib/auth";
import { NotebookClientWrapper } from "@/components/notebook/notebook-client-wrapper";
import { SettingsProvider } from "@/lib/settings-context";
import { SyncProvider } from "@/components/sync-provider";
import { getDatesWithContent } from "@/app/notebook/actions";
import { getSidebarProjects } from "@/app/projects/actions";
import { getUserSettings } from "@/app/settings/actions";

export default async function ProjectsLayout({ children }: { children: React.ReactNode }) {
    let session;
    try {
        session = await auth.api.getSession({
            headers: await headers()
        });
    } catch {
        // Session token exists but record is missing/expired - clear stale cookie and redirect
        const cookieStore = await cookies();
        cookieStore.delete("better-auth.session_token");
        redirect("/sign-in");
    }

    if (!session) {
        redirect("/sign-in");
    }

    const [datesWithContent, sidebarProjects, settings] = await Promise.all([
        getDatesWithContent(),
        getSidebarProjects(),
        getUserSettings()
    ]);

    return (
        <SettingsProvider settings={settings}>
            <SyncProvider>
                <NotebookClientWrapper
                    user={session.user}
                    datesWithContent={datesWithContent}
                    sidebarProjects={sidebarProjects}
                >
                    {children}
                </NotebookClientWrapper>
            </SyncProvider>
        </SettingsProvider>
    );
}
