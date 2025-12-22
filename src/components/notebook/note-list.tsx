"use client";

import { useState } from "react";
import { NoteCard } from "./note-card";
import { NoteEditorDialog } from "./note-editor-dialog";
import type { Note, Comment, Project } from "@/db/schema";

interface NoteListProps {
    notes: Note[];
    date: string;
    noteComments: Record<string, Comment[]>;
    noteProjects?: Record<string, Project[]>;
    projects?: Project[];
}

export function NoteList({
    notes,
    date,
    noteComments,
    noteProjects = {},
    projects = []
}: NoteListProps) {
    const [editingNote, setEditingNote] = useState<Note | null>(null);
    const [isFormOpen, setIsFormOpen] = useState(false);

    return (
        <div className="space-y-4">
            <div className="flex items-center justify-between">
                <h2 className="text-muted-foreground text-sm font-medium">
                    Notes ({notes.length})
                </h2>
                <NoteEditorDialog
                    date={date}
                    projects={projects}
                    open={isFormOpen}
                    onOpenChange={setIsFormOpen}
                />
            </div>

            {notes.length === 0 ? (
                <div className="rounded-lg border border-dashed p-8 text-center">
                    <p className="text-muted-foreground text-sm">
                        No notes for this day. Add one to capture your thoughts!
                    </p>
                </div>
            ) : (
                <div className="grid gap-3 sm:grid-cols-2">
                    {notes.map((note) => (
                        <NoteCard
                            key={note.id}
                            note={note}
                            comments={noteComments[note.id] ?? []}
                            projects={noteProjects[note.id] ?? []}
                            onEdit={(n) => setEditingNote(n)}
                        />
                    ))}
                </div>
            )}

            {/* Edit dialog */}
            {editingNote && (
                <NoteEditorDialog
                    date={date}
                    note={editingNote}
                    projects={projects}
                    initialProjectIds={(noteProjects[editingNote.id] ?? []).map((p) => p.id)}
                    open={!!editingNote}
                    onOpenChange={(open) => {
                        if (!open) setEditingNote(null);
                    }}
                    trigger={<span className="hidden" />}
                />
            )}
        </div>
    );
}
