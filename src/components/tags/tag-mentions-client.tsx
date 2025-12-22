"use client";

import { useState } from "react";
import Link from "next/link";
import { NoteCard } from "@/components/notebook/note-card";
import { TodoItem } from "@/components/notebook/todo-item";
import { TodoForm } from "@/components/notebook/todo-form";
import { NoteEditorDialog } from "@/components/notebook/note-editor-dialog";
import { Separator } from "@/components/ui/separator";
import type { Note, Todo, Comment } from "@/db/schema";

interface TagMentionsClientProps {
    notes: Note[];
    todos: Todo[];
    noteComments: Record<string, Comment[]>;
    todoComments: Record<string, Comment[]>;
    dates: string[];
}

export function TagMentionsClient({
    notes,
    todos,
    noteComments,
    todoComments,
    dates
}: TagMentionsClientProps) {
    const [editingNote, setEditingNote] = useState<Note | null>(null);
    const [editingTodo, setEditingTodo] = useState<Todo | null>(null);

    // Group notes and todos by date
    const notesByDate = new Map<string, Note[]>();
    const todosByDate = new Map<string, Todo[]>();

    for (const n of notes) {
        if (!notesByDate.has(n.date)) notesByDate.set(n.date, []);
        notesByDate.get(n.date)!.push(n);
    }

    for (const t of todos) {
        if (!todosByDate.has(t.date)) todosByDate.set(t.date, []);
        todosByDate.get(t.date)!.push(t);
    }

    const formatDate = (dateStr: string) => {
        return new Date(dateStr + "T00:00:00").toLocaleDateString("en-US", {
            weekday: "long",
            year: "numeric",
            month: "long",
            day: "numeric"
        });
    };

    return (
        <div className="space-y-8">
            {dates.map((date) => {
                const dateTodos = todosByDate.get(date) ?? [];
                const dateNotes = notesByDate.get(date) ?? [];

                return (
                    <div key={date} className="space-y-4">
                        {/* Date Header */}
                        <div className="flex items-center gap-2">
                            <Link
                                href={`/notebook/${date}`}
                                className="text-primary text-sm font-medium hover:underline"
                            >
                                {formatDate(date)}
                            </Link>
                        </div>

                        {/* Todos for this date */}
                        {dateTodos.length > 0 && (
                            <div className="space-y-2">
                                <h3 className="text-muted-foreground text-xs font-medium tracking-wide uppercase">
                                    Todos ({dateTodos.length})
                                </h3>
                                <div className="space-y-2">
                                    {dateTodos.map((todo) => (
                                        <TodoItem
                                            key={todo.id}
                                            todo={todo}
                                            comments={todoComments[todo.id] ?? []}
                                            onEdit={setEditingTodo}
                                        />
                                    ))}
                                </div>
                            </div>
                        )}

                        {/* Notes for this date */}
                        {dateNotes.length > 0 && (
                            <div className="space-y-2">
                                <h3 className="text-muted-foreground text-xs font-medium tracking-wide uppercase">
                                    Notes ({dateNotes.length})
                                </h3>
                                <div className="grid gap-4 sm:grid-cols-2">
                                    {dateNotes.map((note) => (
                                        <NoteCard
                                            key={note.id}
                                            note={note}
                                            comments={noteComments[note.id] ?? []}
                                            onEdit={setEditingNote}
                                        />
                                    ))}
                                </div>
                            </div>
                        )}

                        <Separator />
                    </div>
                );
            })}

            {/* Edit dialogs */}
            {editingTodo && (
                <TodoForm
                    date={editingTodo.date}
                    todo={editingTodo}
                    open={!!editingTodo}
                    onOpenChange={(open) => !open && setEditingTodo(null)}
                />
            )}

            <NoteEditorDialog
                date={editingNote?.date ?? ""}
                note={editingNote ?? undefined}
                open={!!editingNote}
                onOpenChange={(open) => !open && setEditingNote(null)}
            />
        </div>
    );
}
