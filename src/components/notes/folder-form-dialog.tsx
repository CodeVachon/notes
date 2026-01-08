"use client";

import { useState, useTransition } from "react";
import { IconFolderPlus } from "@tabler/icons-react";
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
import { createFolder, updateFolder } from "@/app/notebook/notes/actions";
import type { NoteFolder } from "@/db/schema";

interface FolderFormDialogProps {
    parentId?: string | null;
    folder?: NoteFolder;
    open?: boolean;
    onOpenChange?: (open: boolean) => void;
    trigger?: React.ReactElement;
}

function FolderForm({
    parentId,
    folder,
    onOpenChange
}: {
    parentId?: string | null;
    folder?: NoteFolder;
    onOpenChange?: (open: boolean) => void;
}) {
    const [isPending, startTransition] = useTransition();
    const [name, setName] = useState(folder?.name ?? "");
    const [error, setError] = useState<string | null>(null);

    const isEditing = !!folder;

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        if (!name.trim()) return;

        setError(null);

        startTransition(async () => {
            try {
                if (isEditing) {
                    await updateFolder(folder.id, { name: name.trim() });
                } else {
                    await createFolder({
                        name: name.trim(),
                        parentId: parentId ?? null
                    });
                }
                onOpenChange?.(false);
            } catch (err) {
                setError(err instanceof Error ? err.message : "An error occurred");
            }
        });
    };

    return (
        <form onSubmit={handleSubmit} className="grid gap-4">
            <div className="grid gap-2">
                <Label htmlFor="folder-name">Folder Name</Label>
                <Input
                    id="folder-name"
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    placeholder="My Folder"
                    required
                    autoFocus
                />
                {error && <p className="text-destructive text-sm">{error}</p>}
            </div>

            <AlertDialogFooter>
                <AlertDialogCancel>Cancel</AlertDialogCancel>
                <Button type="submit" disabled={isPending || !name.trim()}>
                    {isPending ? "Saving..." : isEditing ? "Rename" : "Create Folder"}
                </Button>
            </AlertDialogFooter>
        </form>
    );
}

export function FolderFormDialog({
    parentId,
    folder,
    open: controlledOpen,
    onOpenChange: controlledOnOpenChange,
    trigger
}: FolderFormDialogProps) {
    const [internalOpen, setInternalOpen] = useState(false);
    const isEditing = !!folder;

    // Use controlled state if provided, otherwise use internal state
    const isControlled = controlledOpen !== undefined;
    const open = isControlled ? controlledOpen : internalOpen;
    const onOpenChange = isControlled ? controlledOnOpenChange : setInternalOpen;

    const defaultTrigger = (
        <Button variant="outline" size="sm">
            <IconFolderPlus className="size-3.5" />
            New Folder
        </Button>
    );

    return (
        <AlertDialog open={open} onOpenChange={onOpenChange}>
            {trigger ? (
                <AlertDialogTrigger render={trigger} nativeButton={false} />
            ) : (
                <AlertDialogTrigger render={defaultTrigger} />
            )}
            <AlertDialogContent className="max-w-md">
                <AlertDialogHeader>
                    <AlertDialogTitle>
                        {isEditing ? "Rename Folder" : "Create Folder"}
                    </AlertDialogTitle>
                </AlertDialogHeader>

                <FolderForm
                    key={folder?.id ?? "new"}
                    parentId={parentId}
                    folder={folder}
                    onOpenChange={onOpenChange}
                />
            </AlertDialogContent>
        </AlertDialog>
    );
}
