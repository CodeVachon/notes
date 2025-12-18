"use client";

import { useState, useTransition } from "react";
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
import { RichTextEditor } from "./rich-text-editor";
import { createNote, updateNote } from "@/app/notebook/actions";
import type { Note } from "@/db/schema";

interface NoteEditorDialogProps {
    date: string;
    note?: Note;
    open?: boolean;
    onOpenChange?: (open: boolean) => void;
    trigger?: React.ReactElement;
}

// Separate form component that gets remounted when note changes via key
function NoteEditorForm({
    date,
    note,
    onOpenChange
}: {
    date: string;
    note?: Note;
    onOpenChange?: (open: boolean) => void;
}) {
    const [isPending, startTransition] = useTransition();
    const [title, setTitle] = useState(note?.title ?? "");
    const [content, setContent] = useState(note?.content ?? "");

    const isEditing = !!note;

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        if (!title.trim()) return;

        startTransition(async () => {
            if (isEditing) {
                await updateNote(note.id, {
                    title: title.trim(),
                    content
                });
            } else {
                await createNote({
                    date,
                    title: title.trim(),
                    content
                });
            }
            onOpenChange?.(false);
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

            <AlertDialogFooter>
                <AlertDialogCancel>Cancel</AlertDialogCancel>
                <Button type="submit" disabled={isPending || !title.trim()}>
                    {isPending ? "Saving..." : isEditing ? "Save Changes" : "Add Note"}
                </Button>
            </AlertDialogFooter>
        </form>
    );
}

export function NoteEditorDialog({
    date,
    note,
    open,
    onOpenChange,
    trigger
}: NoteEditorDialogProps) {
    const isEditing = !!note;

    const defaultTrigger = (
        <Button variant="outline" size="sm">
            <IconPlus className="size-3.5" />
            Add Note
        </Button>
    );

    return (
        <AlertDialog open={open} onOpenChange={onOpenChange}>
            {trigger ? (
                <AlertDialogTrigger render={trigger} nativeButton={false} />
            ) : (
                <AlertDialogTrigger render={defaultTrigger} />
            )}
            <AlertDialogContent className="max-h-[90vh] max-w-2xl overflow-y-auto">
                <AlertDialogHeader>
                    <AlertDialogTitle>{isEditing ? "Edit Note" : "Add Note"}</AlertDialogTitle>
                </AlertDialogHeader>

                {/* Key forces remount when note changes, resetting form state */}
                <NoteEditorForm
                    key={note?.id ?? "new"}
                    date={date}
                    note={note}
                    onOpenChange={onOpenChange}
                />
            </AlertDialogContent>
        </AlertDialog>
    );
}
