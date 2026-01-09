"use client";

import { useState, useTransition } from "react";
import Link from "next/link";
import { useSortable } from "@dnd-kit/sortable";
import { CSS } from "@dnd-kit/utilities";
import {
    IconFileText,
    IconDotsVertical,
    IconTrash,
    IconPencil,
    IconGripVertical,
    IconFolderSymlink
} from "@tabler/icons-react";
import { Button } from "@/components/ui/button";
import {
    Card,
    CardHeader,
    CardTitle,
    CardDescription,
    CardAction,
    CardContent
} from "@/components/ui/card";
import {
    DropdownMenu,
    DropdownMenuTrigger,
    DropdownMenuContent,
    DropdownMenuItem
} from "@/components/ui/dropdown-menu";
import { MoveItemDialog } from "./move-item-dialog";
import { deleteGenericNote } from "@/app/notebook/notes/actions";
import { TitleWithTags } from "@/components/notebook/title-with-tags";
import { ProjectBadge } from "@/components/notebook/project-badge";
import { cn } from "@/lib/utils";
import type { Note, Project } from "@/db/schema";

interface SortableNoteCardProps {
    note: Note;
    basePath: string;
    projects?: Pick<Project, "id" | "name" | "color" | "emoji">[];
    disabled?: boolean;
}

export function SortableNoteCard({
    note,
    basePath,
    projects = [],
    disabled = false
}: SortableNoteCardProps) {
    const [isPending, startTransition] = useTransition();
    const [moveDialogOpen, setMoveDialogOpen] = useState(false);

    const { attributes, listeners, setNodeRef, transform, transition, isDragging } = useSortable({
        id: note.id,
        disabled
    });

    const style = {
        transform: CSS.Transform.toString(transform),
        transition
    };

    const handleDelete = () => {
        startTransition(async () => {
            await deleteGenericNote(note.id);
        });
    };

    const formattedDate = new Date(note.updatedAt).toLocaleDateString("en-US", {
        month: "short",
        day: "numeric",
        year: "numeric"
    });

    const notePath = basePath ? `${basePath}/${note.slug}` : note.slug;

    // Strip HTML and truncate for preview
    const contentPreview = note.content ? note.content.replace(/<[^>]*>/g, "").slice(0, 150) : "";

    return (
        <div ref={setNodeRef} style={style} {...attributes}>
            <Card
                size="sm"
                className={cn(
                    "group hover:ring-primary/20 transition-all hover:ring-2",
                    isPending && "pointer-events-none opacity-50",
                    isDragging && "ring-primary opacity-50 ring-2"
                )}
            >
                <Link href={`/notebook/notes/${notePath}`} className="block">
                    <CardHeader>
                        <div className="flex items-center gap-2">
                            <button
                                {...listeners}
                                className="text-muted-foreground hover:text-foreground -ml-1 cursor-grab touch-none opacity-0 transition-opacity group-hover:opacity-100 active:cursor-grabbing"
                                onClick={(e) => e.preventDefault()}
                            >
                                <IconGripVertical className="size-4" />
                            </button>
                            <IconFileText className="text-muted-foreground size-4" />
                            <CardTitle className="line-clamp-1">
                                <TitleWithTags title={note.title} />
                            </CardTitle>
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
                                <DropdownMenuContent
                                    align="end"
                                    onClick={(e) => e.stopPropagation()}
                                >
                                    <DropdownMenuItem
                                        onClick={(e) => {
                                            e.preventDefault();
                                            e.stopPropagation();
                                        }}
                                    >
                                        <IconPencil className="size-3.5" />
                                        Edit
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
                        <CardDescription>Updated {formattedDate}</CardDescription>
                    </CardHeader>
                    {(contentPreview || projects.length > 0) && (
                        <CardContent>
                            {contentPreview && (
                                <p className="text-muted-foreground line-clamp-2 text-xs">
                                    {contentPreview}
                                    {note.content && note.content.length > 150 && "..."}
                                </p>
                            )}
                            {projects.length > 0 && (
                                <div
                                    className="mt-2 flex flex-wrap gap-1"
                                    onClick={(e) => e.preventDefault()}
                                >
                                    {projects.map((project) => (
                                        <ProjectBadge key={project.id} project={project} asLink />
                                    ))}
                                </div>
                            )}
                        </CardContent>
                    )}
                </Link>
            </Card>

            <MoveItemDialog
                open={moveDialogOpen}
                onOpenChange={setMoveDialogOpen}
                itemId={note.id}
                itemType="note"
                itemName={note.title}
                currentFolderId={note.folderId}
            />
        </div>
    );
}
