"use client";

import { useState, useOptimistic, useTransition } from "react";
import Link from "next/link";
import {
    DndContext,
    closestCenter,
    KeyboardSensor,
    PointerSensor,
    useSensor,
    useSensors,
    DragEndEvent,
    DragOverEvent,
    DragStartEvent,
    DragOverlay
} from "@dnd-kit/core";
import {
    SortableContext,
    sortableKeyboardCoordinates,
    verticalListSortingStrategy
} from "@dnd-kit/sortable";
import { IconChevronRight, IconHome, IconFolder, IconFileText } from "@tabler/icons-react";
import { SortableFolderCard } from "./sortable-folder-card";
import { SortableNoteCard } from "./sortable-note-card";
import { FolderFormDialog } from "./folder-form-dialog";
import { GenericNoteEditorDialog } from "./generic-note-editor-dialog";
import {
    reorderFolderItems,
    moveFolder,
    moveGenericNote
} from "@/app/notebook/notes/actions";
import type { Note, NoteFolder, Project } from "@/db/schema";

interface FolderBrowserProps {
    folder: NoteFolder | null;
    childFolders: NoteFolder[];
    notes: Note[];
    breadcrumbs: Array<{ id: string; name: string; slug: string }>;
    noteProjects: Record<string, Pick<Project, "id" | "name" | "color" | "emoji">[]>;
    projects: Project[];
    folderCounts: Record<string, number>;
}

type DraggableItem = { id: string; type: "folder" | "note" };

export function FolderBrowser({
    folder,
    childFolders,
    notes,
    breadcrumbs,
    noteProjects,
    projects,
    folderCounts
}: FolderBrowserProps) {
    const [editingFolder, setEditingFolder] = useState<NoteFolder | null>(null);
    const [editFolderOpen, setEditFolderOpen] = useState(false);
    const [activeItem, setActiveItem] = useState<DraggableItem | null>(null);
    const [isPending, startTransition] = useTransition();

    // Create sortable items list (folders first, then notes)
    const sortableItems: DraggableItem[] = [
        ...childFolders.map((f) => ({ id: f.id, type: "folder" as const })),
        ...notes.map((n) => ({ id: n.id, type: "note" as const }))
    ];

    // Optimistic state for items
    const [optimisticFolders, setOptimisticFolders] = useOptimistic(childFolders);
    const [optimisticNotes, setOptimisticNotes] = useOptimistic(notes);

    const sensors = useSensors(
        useSensor(PointerSensor, {
            activationConstraint: {
                distance: 8
            }
        }),
        useSensor(KeyboardSensor, {
            coordinateGetter: sortableKeyboardCoordinates
        })
    );

    const basePath = breadcrumbs.map((b) => b.slug).join("/");
    const isEmpty = optimisticFolders.length === 0 && optimisticNotes.length === 0;

    const handleEditFolder = (folderToEdit: NoteFolder) => {
        setEditingFolder(folderToEdit);
        setEditFolderOpen(true);
    };

    const handleDragStart = (event: DragStartEvent) => {
        const { active } = event;
        const item = sortableItems.find((i) => i.id === active.id);
        if (item) {
            setActiveItem(item);
        }
    };

    const handleDragOver = (event: DragOverEvent) => {
        const { active, over } = event;
        if (!over) return;

        // Check if dropping over a folder (for moving into it)
        const overItem = sortableItems.find((i) => i.id === over.id);
        if (overItem?.type === "folder" && active.id !== over.id) {
            // Visual feedback that we can drop into this folder
            // This would require adding a highlight state to the folder card
        }
    };

    const handleDragEnd = (event: DragEndEvent) => {
        const { active, over } = event;
        setActiveItem(null);

        if (!over || active.id === over.id) return;

        const activeItem = sortableItems.find((i) => i.id === active.id);
        const overItem = sortableItems.find((i) => i.id === over.id);

        if (!activeItem || !overItem) return;

        // Check if dropping onto a folder (move into it)
        if (overItem.type === "folder" && activeItem.id !== overItem.id) {
            const targetFolder = optimisticFolders.find((f) => f.id === overItem.id);
            if (targetFolder) {
                startTransition(async () => {
                    try {
                        if (activeItem.type === "folder") {
                            await moveFolder(activeItem.id, targetFolder.id);
                        } else {
                            await moveGenericNote(activeItem.id, targetFolder.id);
                        }
                    } catch (error) {
                        console.error("Failed to move item:", error);
                        alert(
                            error instanceof Error
                                ? error.message
                                : "Failed to move item"
                        );
                    }
                });
                return;
            }
        }

        // Otherwise, reorder within the current folder
        const activeIndex = sortableItems.findIndex((i) => i.id === active.id);
        const overIndex = sortableItems.findIndex((i) => i.id === over.id);

        if (activeIndex === overIndex) return;

        // Create new order
        const newOrder = [...sortableItems];
        const [removed] = newOrder.splice(activeIndex, 1);
        newOrder.splice(overIndex, 0, removed);

        // Update optimistic state
        const newFolders = newOrder
            .filter((i) => i.type === "folder")
            .map((i, idx) => {
                const f = optimisticFolders.find((folder) => folder.id === i.id)!;
                return { ...f, sortOrder: idx };
            });
        const newNotes = newOrder
            .filter((i) => i.type === "note")
            .map((i, idx) => {
                const n = optimisticNotes.find((note) => note.id === i.id)!;
                return { ...n, sortOrder: idx };
            });

        setOptimisticFolders(newFolders);
        setOptimisticNotes(newNotes);

        // Persist the new order
        startTransition(async () => {
            const items = newOrder.map((item, index) => ({
                id: item.id,
                type: item.type,
                sortOrder: index
            }));
            await reorderFolderItems(folder?.id ?? null, items);
        });
    };

    const getActiveItemData = () => {
        if (!activeItem) return null;
        if (activeItem.type === "folder") {
            return optimisticFolders.find((f) => f.id === activeItem.id);
        }
        return optimisticNotes.find((n) => n.id === activeItem.id);
    };

    return (
        <div className="space-y-6">
            {/* Breadcrumbs */}
            <nav className="flex items-center gap-1 text-sm">
                <Link
                    href="/notebook/notes"
                    className="text-muted-foreground hover:text-foreground flex items-center gap-1 transition-colors"
                >
                    <IconHome className="size-4" />
                    Notes
                </Link>
                {breadcrumbs.map((crumb, index) => {
                    const path = breadcrumbs
                        .slice(0, index + 1)
                        .map((b) => b.slug)
                        .join("/");
                    const isLast = index === breadcrumbs.length - 1;

                    return (
                        <span key={crumb.id} className="flex items-center gap-1">
                            <IconChevronRight className="text-muted-foreground size-4" />
                            {isLast ? (
                                <span className="font-medium">{crumb.name}</span>
                            ) : (
                                <Link
                                    href={`/notebook/notes/${path}`}
                                    className="text-muted-foreground hover:text-foreground transition-colors"
                                >
                                    {crumb.name}
                                </Link>
                            )}
                        </span>
                    );
                })}
            </nav>

            {/* Actions */}
            <div className="flex items-center gap-2">
                <FolderFormDialog parentId={folder?.id ?? null} />
                <GenericNoteEditorDialog
                    folderId={folder?.id ?? null}
                    basePath={basePath}
                    projects={projects}
                />
            </div>

            {/* Empty State */}
            {isEmpty && (
                <div className="border-muted flex flex-col items-center justify-center rounded-lg border-2 border-dashed py-12">
                    <IconFolder className="text-muted-foreground mb-4 size-12" />
                    <h3 className="text-muted-foreground mb-2 text-lg font-medium">
                        This folder is empty
                    </h3>
                    <p className="text-muted-foreground mb-4 text-sm">
                        Create a folder or note to get started
                    </p>
                </div>
            )}

            {/* DnD Context */}
            {!isEmpty && (
                <DndContext
                    sensors={sensors}
                    collisionDetection={closestCenter}
                    onDragStart={handleDragStart}
                    onDragOver={handleDragOver}
                    onDragEnd={handleDragEnd}
                >
                    <SortableContext
                        items={sortableItems.map((i) => i.id)}
                        strategy={verticalListSortingStrategy}
                    >
                        {/* Folders */}
                        {optimisticFolders.length > 0 && (
                            <div className="space-y-3">
                                <h2 className="text-muted-foreground text-xs font-medium uppercase tracking-wide">
                                    Folders
                                </h2>
                                <div className="grid grid-cols-1 gap-3 sm:grid-cols-2 lg:grid-cols-3">
                                    {optimisticFolders.map((childFolder) => (
                                        <SortableFolderCard
                                            key={childFolder.id}
                                            folder={childFolder}
                                            basePath={basePath}
                                            onEdit={handleEditFolder}
                                            itemCount={folderCounts[childFolder.id] ?? 0}
                                            disabled={isPending}
                                        />
                                    ))}
                                </div>
                            </div>
                        )}

                        {/* Notes */}
                        {optimisticNotes.length > 0 && (
                            <div className="space-y-3">
                                <h2 className="text-muted-foreground text-xs font-medium uppercase tracking-wide">
                                    Notes
                                </h2>
                                <div className="grid grid-cols-1 gap-3 sm:grid-cols-2 lg:grid-cols-3">
                                    {optimisticNotes.map((noteItem) => (
                                        <SortableNoteCard
                                            key={noteItem.id}
                                            note={noteItem}
                                            basePath={basePath}
                                            projects={noteProjects[noteItem.id] ?? []}
                                            disabled={isPending}
                                        />
                                    ))}
                                </div>
                            </div>
                        )}
                    </SortableContext>

                    {/* Drag Overlay */}
                    <DragOverlay>
                        {activeItem && (
                            <div className="rounded-lg bg-white p-3 opacity-80 shadow-lg dark:bg-gray-800">
                                <div className="flex items-center gap-2">
                                    {activeItem.type === "folder" ? (
                                        <IconFolder className="text-muted-foreground size-4" />
                                    ) : (
                                        <IconFileText className="text-muted-foreground size-4" />
                                    )}
                                    <span className="text-sm font-medium">
                                        {activeItem.type === "folder"
                                            ? (getActiveItemData() as NoteFolder)?.name
                                            : (getActiveItemData() as Note)?.title}
                                    </span>
                                </div>
                            </div>
                        )}
                    </DragOverlay>
                </DndContext>
            )}

            {/* Edit Folder Dialog */}
            <FolderFormDialog
                folder={editingFolder ?? undefined}
                open={editFolderOpen}
                onOpenChange={(open) => {
                    setEditFolderOpen(open);
                    if (!open) setEditingFolder(null);
                }}
                trigger={<span className="hidden" />}
            />
        </div>
    );
}
