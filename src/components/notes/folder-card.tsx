"use client";

import { useTransition } from "react";
import Link from "next/link";
import { IconFolder, IconDotsVertical, IconTrash, IconPencil } from "@tabler/icons-react";
import { Button } from "@/components/ui/button";
import { Card, CardHeader, CardTitle, CardDescription, CardAction } from "@/components/ui/card";
import {
    DropdownMenu,
    DropdownMenuTrigger,
    DropdownMenuContent,
    DropdownMenuItem
} from "@/components/ui/dropdown-menu";
import { deleteFolder } from "@/app/notebook/notes/actions";
import { cn } from "@/lib/utils";
import type { NoteFolder } from "@/db/schema";

interface FolderCardProps {
    folder: NoteFolder;
    basePath: string;
    onEdit: (folder: NoteFolder) => void;
    itemCount?: number;
}

export function FolderCard({ folder, basePath, onEdit, itemCount = 0 }: FolderCardProps) {
    const [isPending, startTransition] = useTransition();

    const handleDelete = () => {
        startTransition(async () => {
            try {
                await deleteFolder(folder.id);
            } catch (error) {
                // Show error in console for now - could add toast later
                console.error("Failed to delete folder:", error);
                alert(error instanceof Error ? error.message : "Failed to delete folder");
            }
        });
    };

    const folderPath = basePath ? `${basePath}/${folder.slug}` : folder.slug;

    return (
        <Card
            size="sm"
            className={cn(
                "group hover:ring-primary/20 transition-all hover:ring-2",
                isPending && "pointer-events-none opacity-50"
            )}
        >
            <Link href={`/notebook/notes/${folderPath}`} className="block">
                <CardHeader>
                    <div className="flex items-center gap-2">
                        <IconFolder className="text-muted-foreground size-4" />
                        <CardTitle className="line-clamp-1">{folder.name}</CardTitle>
                    </div>
                    <CardAction>
                        <DropdownMenu>
                            <DropdownMenuTrigger
                                render={
                                    <Button
                                        variant="ghost"
                                        size="icon-xs"
                                        className="opacity-0 transition-opacity group-hover:opacity-100"
                                        onClick={(e) => e.preventDefault()}
                                    />
                                }
                            >
                                <IconDotsVertical className="size-3.5" />
                            </DropdownMenuTrigger>
                            <DropdownMenuContent align="end">
                                <DropdownMenuItem
                                    onClick={(e) => {
                                        e.preventDefault();
                                        onEdit(folder);
                                    }}
                                >
                                    <IconPencil className="size-3.5" />
                                    Rename
                                </DropdownMenuItem>
                                <DropdownMenuItem
                                    onClick={(e) => {
                                        e.preventDefault();
                                        handleDelete();
                                    }}
                                    variant="destructive"
                                >
                                    <IconTrash className="size-3.5" />
                                    Delete
                                </DropdownMenuItem>
                            </DropdownMenuContent>
                        </DropdownMenu>
                    </CardAction>
                    <CardDescription>
                        {itemCount} {itemCount === 1 ? "item" : "items"}
                    </CardDescription>
                </CardHeader>
            </Link>
        </Card>
    );
}
