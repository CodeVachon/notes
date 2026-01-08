"use client";

import { useState, useTransition } from "react";
import Link from "next/link";
import { useSortable } from "@dnd-kit/sortable";
import { CSS } from "@dnd-kit/utilities";
import {
    IconFolder,
    IconDotsVertical,
    IconTrash,
    IconPencil,
    IconGripVertical,
    IconFolderSymlink
} from "@tabler/icons-react";
import { Button } from "@/components/ui/button";
import { Card, CardHeader, CardTitle, CardDescription, CardAction } from "@/components/ui/card";
import {
    DropdownMenu,
    DropdownMenuTrigger,
    DropdownMenuContent,
    DropdownMenuItem
} from "@/components/ui/dropdown-menu";
import { MoveItemDialog } from "./move-item-dialog";
import { deleteFolder } from "@/app/notebook/notes/actions";
import { cn } from "@/lib/utils";
import type { NoteFolder } from "@/db/schema";

interface SortableFolderCardProps {
    folder: NoteFolder;
    basePath: string;
    onEdit: (folder: NoteFolder) => void;
    itemCount?: number;
    disabled?: boolean;
}

export function SortableFolderCard({
    folder,
    basePath,
    onEdit,
    itemCount = 0,
    disabled = false
}: SortableFolderCardProps) {
    const [isPending, startTransition] = useTransition();
    const [moveDialogOpen, setMoveDialogOpen] = useState(false);

    const { attributes, listeners, setNodeRef, transform, transition, isDragging } = useSortable({
        id: folder.id,
        disabled
    });

    const style = {
        transform: CSS.Transform.toString(transform),
        transition
    };

    const handleDelete = () => {
        startTransition(async () => {
            try {
                await deleteFolder(folder.id);
            } catch (error) {
                console.error("Failed to delete folder:", error);
                alert(error instanceof Error ? error.message : "Failed to delete folder");
            }
        });
    };

    const folderPath = basePath ? `${basePath}/${folder.slug}` : folder.slug;

    return (
        <div ref={setNodeRef} style={style} {...attributes}>
            <Card
                size="sm"
                className={cn(
                    "group hover:ring-primary/20 transition-all hover:ring-2",
                    isPending && "pointer-events-none opacity-50",
                    isDragging && "opacity-50 ring-2 ring-primary"
                )}
            >
                <Link href={`/notebook/notes/${folderPath}`} className="block">
                    <CardHeader>
                        <div className="flex items-center gap-2">
                            <button
                                {...listeners}
                                className="text-muted-foreground hover:text-foreground -ml-1 cursor-grab touch-none opacity-0 transition-opacity group-hover:opacity-100 active:cursor-grabbing"
                                onClick={(e) => e.preventDefault()}
                            >
                                <IconGripVertical className="size-4" />
                            </button>
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
                                            onClick={(e) => {
                                                e.preventDefault();
                                                e.stopPropagation();
                                            }}
                                        />
                                    }
                                >
                                    <IconDotsVertical className="size-3.5" />
                                </DropdownMenuTrigger>
                                <DropdownMenuContent align="end" onClick={(e) => e.stopPropagation()}>
                                    <DropdownMenuItem
                                        onClick={(e) => {
                                            e.preventDefault();
                                            e.stopPropagation();
                                            onEdit(folder);
                                        }}
                                    >
                                        <IconPencil className="size-3.5" />
                                        Rename
                                    </DropdownMenuItem>
                                    <DropdownMenuItem
                                        onClick={(e) => {
                                            e.preventDefault();
                                            e.stopPropagation();
                                            setMoveDialogOpen(true);
                                        }}
                                    >
                                        <IconFolderSymlink className="size-3.5" />
                                        Move to...
                                    </DropdownMenuItem>
                                    <DropdownMenuItem
                                        onClick={(e) => {
                                            e.preventDefault();
                                            e.stopPropagation();
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

            <MoveItemDialog
                open={moveDialogOpen}
                onOpenChange={setMoveDialogOpen}
                itemId={folder.id}
                itemType="folder"
                itemName={folder.name}
                currentFolderId={folder.parentId}
            />
        </div>
    );
}
