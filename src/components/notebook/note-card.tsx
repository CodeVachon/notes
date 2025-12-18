"use client";

import { useTransition } from "react";
import { IconDotsVertical, IconTrash, IconPencil } from "@tabler/icons-react";
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
import { deleteNote } from "@/app/notebook/actions";
import { cn } from "@/lib/utils";
import type { Note } from "@/db/schema";

interface NoteCardProps {
    note: Note;
    onEdit: (note: Note) => void;
}

export function NoteCard({ note, onEdit }: NoteCardProps) {
    const [isPending, startTransition] = useTransition();

    const handleDelete = () => {
        startTransition(async () => {
            await deleteNote(note.id);
        });
    };

    // Strip HTML tags for preview
    const textContent = note.content.replace(/<[^>]*>/g, "").trim();
    const preview = textContent.slice(0, 150) + (textContent.length > 150 ? "..." : "");

    const formattedDate = new Date(note.updatedAt).toLocaleTimeString("en-US", {
        hour: "numeric",
        minute: "2-digit"
    });

    return (
        <Card
            size="sm"
            className={cn(
                "group hover:ring-primary/20 cursor-pointer transition-all hover:ring-2",
                isPending && "pointer-events-none opacity-50"
            )}
            onClick={() => onEdit(note)}
        >
            <CardHeader>
                <CardTitle className="line-clamp-1">{note.title}</CardTitle>
                <CardAction>
                    <DropdownMenu>
                        <DropdownMenuTrigger
                            render={
                                <Button
                                    variant="ghost"
                                    size="icon-xs"
                                    className="opacity-0 transition-opacity group-hover:opacity-100"
                                    onClick={(e) => e.stopPropagation()}
                                />
                            }
                        >
                            <IconDotsVertical className="size-3.5" />
                        </DropdownMenuTrigger>
                        <DropdownMenuContent align="end">
                            <DropdownMenuItem
                                onClick={(e) => {
                                    e.stopPropagation();
                                    onEdit(note);
                                }}
                            >
                                <IconPencil className="size-3.5" />
                                Edit
                            </DropdownMenuItem>
                            <DropdownMenuItem
                                onClick={(e) => {
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
            {preview && (
                <CardContent>
                    <p className="text-muted-foreground line-clamp-3 text-xs">{preview}</p>
                </CardContent>
            )}
        </Card>
    );
}
