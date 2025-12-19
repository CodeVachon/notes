"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { IconTag } from "@tabler/icons-react";
import { CommandPaletteProvider } from "@/components/command-palette/command-palette-provider";
import { CommandPalette } from "@/components/command-palette/command-palette";
import { CommandPaletteTrigger } from "@/components/command-palette/command-palette-trigger";
import { SidebarCalendar } from "@/components/notebook/sidebar-calendar";
import { UserMenu } from "@/components/user-menu";
import { Separator } from "@/components/ui/separator";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";

interface NotebookClientWrapperProps {
    user: {
        name: string;
        email: string;
        image?: string | null;
    };
    datesWithContent: string[];
    children: React.ReactNode;
}

export function NotebookClientWrapper({
    user,
    datesWithContent,
    children
}: NotebookClientWrapperProps) {
    const pathname = usePathname();
    const isTagsPage = pathname?.startsWith("/tags");

    return (
        <CommandPaletteProvider>
            <div className="flex h-screen">
                <aside className="bg-background flex w-64 flex-col border-r">
                    <div className="flex h-14 items-center border-b px-4">
                        <h1 className="text-lg font-semibold">Notes</h1>
                    </div>
                    <nav className="flex-1 overflow-y-auto p-4">
                        <SidebarCalendar datesWithContent={datesWithContent} />

                        {/* Tags Link */}
                        <div className="mt-4 border-t pt-4">
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
                        </div>
                    </nav>
                    <div className="space-y-1 p-2">
                        <CommandPaletteTrigger />
                        <Separator />
                        <UserMenu user={user} />
                    </div>
                </aside>
                <main className="flex-1 overflow-hidden">{children}</main>
            </div>
            <CommandPalette />
        </CommandPaletteProvider>
    );
}
