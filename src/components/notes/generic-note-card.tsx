"use client";

import { useTransition } from "react";
import Link from "next/link";
import { IconFileText, IconDotsVertical, IconTrash, IconPencil } from "@tabler/icons-react";
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
import { deleteGenericNote } from "@/app/notebook/notes/actions";
import { TitleWithTags } from "@/components/notebook/title-with-tags";
import { ProjectBadge } from "@/components/notebook/project-badge";
import { cn } from "@/lib/utils";
import type { Note, Project } from "@/db/schema";

interface GenericNoteCardProps {
    note: Note;
    basePath: string;
    projects?: Pick<Project, "id" | "name" | "color" | "emoji">[];
}

export function GenericNoteCard({ note, basePath, projects = [] }: GenericNoteCardProps) {
    const [isPending, startTransition] = useTransition();

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
    const contentPreview = note.content
        ? note.content.replace(/<[^>]*>/g, "").slice(0, 150)
        : "";

    return (
        <Card
            size="sm"
            className={cn(
                "group hover:ring-primary/20 transition-all hover:ring-2",
                isPending && "pointer-events-none opacity-50"
            )}
        >
            <Link href={`/notebook/notes/${notePath}`} className="block">
                <CardHeader>
                    <div className="flex items-center gap-2">
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
                                    }}
                                >
                                    <IconPencil className="size-3.5" />
                                    Edit
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
    );
}
