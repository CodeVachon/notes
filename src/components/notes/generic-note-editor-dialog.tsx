"use client";

import { useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import { IconPlus } from "@tabler/icons-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
    AlertDialog,
    AlertDialogTrigger,
    AlertDialogContent,
    AlertDialogHeader,
    AlertDialogTitle,
    AlertDialogFooter,
    AlertDialogCancel
} from "@/components/ui/alert-dialog";
import { RichTextEditor } from "@/components/notebook/rich-text-editor";
import { ProjectSelector } from "@/components/notebook/project-selector";
import { createGenericNote, updateGenericNote } from "@/app/notebook/notes/actions";
import type { Note, Project } from "@/db/schema";

interface GenericNoteEditorDialogProps {
    folderId: string | null;
    basePath?: string;
    note?: Note;
    projects?: Project[];
    initialProjectIds?: string[];
    open?: boolean;
    onOpenChange?: (open: boolean) => void;
    trigger?: React.ReactElement;
}

function GenericNoteEditorForm({
    folderId,
    basePath = "",
    note,
    projects = [],
    initialProjectIds = [],
    onOpenChange
}: {
    folderId: string | null;
    basePath?: string;
    note?: Note;
    projects?: Project[];
    initialProjectIds?: string[];
    onOpenChange?: (open: boolean) => void;
}) {
    const router = useRouter();
    const [isPending, startTransition] = useTransition();
    const [title, setTitle] = useState(note?.title ?? "");
    const [content, setContent] = useState(note?.content ?? "");
    const [projectIds, setProjectIds] = useState<string[]>(initialProjectIds);

    const isEditing = !!note;

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        if (!title.trim()) return;

        startTransition(async () => {
            if (isEditing) {
                await updateGenericNote(note.id, {
                    title: title.trim(),
                    content,
                    projectIds
                });
                onOpenChange?.(false);
            } else {
                const createdNote = await createGenericNote({
                    folderId,
                    title: title.trim(),
                    content,
                    projectIds
                });
                onOpenChange?.(false);
                // Redirect to the newly created note
                const notePath = basePath
                    ? `/notebook/notes/${basePath}/${createdNote.slug}`
                    : `/notebook/notes/${createdNote.slug}`;
                router.push(notePath);
            }
        });
    };

    return (
        <form onSubmit={handleSubmit} className="grid gap-4">
            <div className="grid gap-2">
                <Label htmlFor="note-title">Title</Label>
                <Input
                    id="note-title"
                    value={title}
                    onChange={(e) => setTitle(e.target.value)}
                    placeholder="Note title"
                    required
                />
            </div>

            <div className="grid gap-2">
                <Label>Content</Label>
                <RichTextEditor
                    content={content}
                    onChange={setContent}
                    placeholder="Write your note..."
                />
            </div>

            {projects.length > 0 && (
                <div className="grid gap-2">
                    <Label>Projects (optional)</Label>
                    <ProjectSelector
                        projects={projects}
                        selectedProjectIds={projectIds}
                        onProjectsChange={setProjectIds}
                        disabled={isPending}
                    />
                </div>
            )}

            <AlertDialogFooter>
                <AlertDialogCancel>Cancel</AlertDialogCancel>
                <Button type="submit" disabled={isPending || !title.trim()}>
                    {isPending ? "Saving..." : isEditing ? "Save Changes" : "Create Note"}
                </Button>
            </AlertDialogFooter>
        </form>
    );
}

export function GenericNoteEditorDialog({
    folderId,
    basePath = "",
    note,
    projects = [],
    initialProjectIds = [],
    open,
    onOpenChange,
    trigger
}: GenericNoteEditorDialogProps) {
    const isEditing = !!note;

    const defaultTrigger = (
        <Button variant="outline" size="sm">
            <IconPlus className="size-3.5" />
            New Note
        </Button>
    );

    return (
        <AlertDialog open={open} onOpenChange={onOpenChange}>
            {trigger ? (
                <AlertDialogTrigger render={trigger} nativeButton={false} />
            ) : (
                <AlertDialogTrigger render={defaultTrigger} />
            )}
            <AlertDialogContent className="max-h-[90vh] max-w-2xl overflow-y-auto lg:max-w-4xl">
                <AlertDialogHeader>
                    <AlertDialogTitle>{isEditing ? "Edit Note" : "Create Note"}</AlertDialogTitle>
                </AlertDialogHeader>

                <GenericNoteEditorForm
                    key={note?.id ?? "new"}
                    folderId={folderId}
                    basePath={basePath}
                    note={note}
                    projects={projects}
                    initialProjectIds={initialProjectIds}
                    onOpenChange={onOpenChange}
                />
            </AlertDialogContent>
        </AlertDialog>
    );
}
