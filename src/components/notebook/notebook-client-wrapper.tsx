"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { IconTag, IconFolder, IconFileText } from "@tabler/icons-react";
import { CommandPaletteProvider } from "@/components/command-palette/command-palette-provider";
import { CommandPalette } from "@/components/command-palette/command-palette";
import { CommandPaletteTrigger } from "@/components/command-palette/command-palette-trigger";
import { SettingsDrawerProvider } from "@/components/settings/settings-drawer-provider";
import { SidebarCalendar } from "@/components/notebook/sidebar-calendar";
import { UserMenu } from "@/components/user-menu";
import { Separator } from "@/components/ui/separator";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import type { Project, ProjectColor } from "@/db/schema";

// Color dot for project indicators
function ColorDot({ color }: { color: ProjectColor }) {
    const colorClasses: Record<ProjectColor, string> = {
        red: "bg-red-500",
        orange: "bg-orange-500",
        yellow: "bg-yellow-500",
        green: "bg-green-500",
        blue: "bg-blue-500",
        purple: "bg-purple-500",
        pink: "bg-pink-500",
        gray: "bg-gray-500"
    };

    return <span className={cn("size-2 shrink-0 rounded-full", colorClasses[color])} />;
}

interface NotebookClientWrapperProps {
    user: {
        name: string;
        email: string;
        image?: string | null;
    };
    datesWithContent: string[];
    sidebarProjects?: Project[];
    children: React.ReactNode;
}

export function NotebookClientWrapper({
    user,
    datesWithContent,
    sidebarProjects = [],
    children
}: NotebookClientWrapperProps) {
    const pathname = usePathname();
    const isTagsPage = pathname?.startsWith("/tags");
    const isProjectsPage = pathname?.startsWith("/projects");
    const isNotesPage = pathname?.startsWith("/notebook/notes");

    return (
        <CommandPaletteProvider>
            <SettingsDrawerProvider>
                <div className="flex h-screen">
                    <aside className="bg-background flex w-64 flex-col border-r">
                        <div className="flex h-14 items-center border-b px-4">
                            <h1 className="text-lg font-semibold">Notes</h1>
                        </div>
                        <nav className="flex-1 overflow-y-auto p-4">
                            <SidebarCalendar datesWithContent={datesWithContent} />

                            {/* Tags & Projects Links */}
                            <div className="mt-4 space-y-1 border-t pt-4">
                                <Link href="/tags">
                                    <Button
                                        variant="ghost"
                                        className={cn(
                                            "w-full justify-start gap-2",
                                            isTagsPage && "bg-accent"
                                        )}
                                    >
                                        <IconTag className="size-4" />
                                        Tags
                                    </Button>
                                </Link>
                                <Link href="/projects">
                                    <Button
                                        variant="ghost"
                                        className={cn(
                                            "w-full justify-start gap-2",
                                            isProjectsPage && "bg-accent"
                                        )}
                                    >
                                        <IconFolder className="size-4" />
                                        Projects
                                    </Button>
                                </Link>

                                {/* Pinned Projects */}
                                {sidebarProjects.length > 0 && (
                                    <div className="mt-2 space-y-0.5 pl-4">
                                        {sidebarProjects.map((project) => (
                                            <Link key={project.id} href={`/projects/${project.id}`}>
                                                <Button
                                                    variant="ghost"
                                                    size="sm"
                                                    className={cn(
                                                        "w-full justify-start gap-2 text-xs",
                                                        pathname === `/projects/${project.id}` &&
                                                            "bg-accent"
                                                    )}
                                                >
                                                    <ColorDot
                                                        color={project.color as ProjectColor}
                                                    />
                                                    {project.emoji && <span>{project.emoji}</span>}
                                                    <span className="truncate">{project.name}</span>
                                                </Button>
                                            </Link>
                                        ))}
                                    </div>
                                )}

                                <Link href="/notebook/notes">
                                    <Button
                                        variant="ghost"
                                        className={cn(
                                            "w-full justify-start gap-2",
                                            isNotesPage && "bg-accent"
                                        )}
                                    >
                                        <IconFileText className="size-4" />
                                        Notes
                                    </Button>
                                </Link>
                            </div>
                        </nav>
                        <div className="space-y-1 p-2">
                            <CommandPaletteTrigger />
                            <Separator />
                            <div className="min-h-12">
                                <UserMenu user={user} />
                            </div>
                        </div>
                    </aside>
                    <main className="flex-1 overflow-hidden">{children}</main>
                </div>
                <CommandPalette />
            </SettingsDrawerProvider>
        </CommandPaletteProvider>
    );
}
