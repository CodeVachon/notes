"use client";

import { useState } from "react";
import { TodoItem } from "./todo-item";
import { TodoForm } from "./todo-form";
import type { Todo, Comment, Project } from "@/db/schema";

interface TodoListProps {
    todos: Todo[];
    date: string;
    todoComments: Record<string, Comment[]>;
    todoProjects?: Record<string, Project[]>;
    sourceDates?: Record<string, string>; // Map of todo.sourceId -> source date
    projects?: Project[];
}

export function TodoList({
    todos,
    date,
    todoComments,
    todoProjects = {},
    sourceDates = {},
    projects = []
}: TodoListProps) {
    const [editingTodo, setEditingTodo] = useState<Todo | null>(null);
    const [isFormOpen, setIsFormOpen] = useState(false);

    const incompleteTodos = todos.filter((t) => !t.completed);
    const completedTodos = todos.filter((t) => t.completed);

    return (
        <div className="space-y-4">
            <div className="flex items-center justify-between">
                <h2 className="text-muted-foreground text-sm font-medium">
                    Todos ({todos.length})
                </h2>
                <TodoForm
                    date={date}
                    projects={projects}
                    open={isFormOpen}
                    onOpenChange={setIsFormOpen}
                />
            </div>

            {todos.length === 0 ? (
                <div className="rounded-lg border border-dashed p-8 text-center">
                    <p className="text-muted-foreground text-sm">
                        No todos for this day. Add one to get started!
                    </p>
                </div>
            ) : (
                <div className="space-y-2">
                    {incompleteTodos.map((todo) => (
                        <TodoItem
                            key={todo.id}
                            todo={todo}
                            comments={todoComments[todo.id] ?? []}
                            projects={todoProjects[todo.id] ?? []}
                            sourceDate={todo.sourceId ? sourceDates[todo.sourceId] : null}
                            onEdit={(t) => setEditingTodo(t)}
                        />
                    ))}

                    {completedTodos.length > 0 && incompleteTodos.length > 0 && (
                        <div className="py-2">
                            <p className="text-muted-foreground text-xs">
                                Completed ({completedTodos.length})
                            </p>
                        </div>
                    )}

                    {completedTodos.map((todo) => (
                        <TodoItem
                            key={todo.id}
                            todo={todo}
                            comments={todoComments[todo.id] ?? []}
                            projects={todoProjects[todo.id] ?? []}
                            sourceDate={todo.sourceId ? sourceDates[todo.sourceId] : null}
                            onEdit={(t) => setEditingTodo(t)}
                        />
                    ))}
                </div>
            )}

            {/* Edit dialog */}
            {editingTodo && (
                <TodoForm
                    date={date}
                    todo={editingTodo}
                    projects={projects}
                    initialProjectIds={(todoProjects[editingTodo.id] ?? []).map((p) => p.id)}
                    open={!!editingTodo}
                    onOpenChange={(open) => {
                        if (!open) setEditingTodo(null);
                    }}
                    trigger={<span className="hidden" />}
                />
            )}
        </div>
    );
}
