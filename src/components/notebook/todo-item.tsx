"use client";

import { useOptimistic, useTransition } from "react";
import Link from "next/link";
import { IconDotsVertical, IconTrash, IconPencil, IconLink } from "@tabler/icons-react";
import { Checkbox } from "@/components/ui/checkbox";
import { Button } from "@/components/ui/button";
import {
    DropdownMenu,
    DropdownMenuTrigger,
    DropdownMenuContent,
    DropdownMenuItem
} from "@/components/ui/dropdown-menu";
import { PriorityBadge } from "./priority-badge";
import { ProjectBadge } from "./project-badge";
import { HtmlContent } from "./html-content";
import { CommentSection } from "./comment-section";
import { TitleWithTags } from "./title-with-tags";
import { CopyTodoDialog } from "./copy-todo-dialog";
import { toggleTodo, deleteTodo } from "@/app/notebook/actions";
import { formatTimeForDisplay } from "@/lib/date-utils";
import { useSettings } from "@/lib/settings-context";
import { cn } from "@/lib/utils";
import type { Todo, Comment, Project } from "@/db/schema";

interface TodoItemProps {
    todo: Todo;
    comments: Comment[];
    projects?: Pick<Project, "id" | "name" | "color" | "emoji">[];
    sourceDate?: string | null; // Date of the source todo if this was copied
    onEdit: (todo: Todo) => void;
}

export function TodoItem({ todo, comments, projects = [], sourceDate, onEdit }: TodoItemProps) {
    const [isPending, startTransition] = useTransition();
    const [optimisticTodo, setOptimisticTodo] = useOptimistic(todo);
    const { settings } = useSettings();

    const handleToggle = () => {
        startTransition(async () => {
            setOptimisticTodo({ ...optimisticTodo, completed: !optimisticTodo.completed });
            await toggleTodo(todo.id);
        });
    };

    const handleDelete = () => {
        startTransition(async () => {
            await deleteTodo(todo.id);
        });
    };

    const formattedTime = formatTimeForDisplay(optimisticTodo.dueTime, settings.timeFormat);

    return (
        <div
            className={cn(
                "group flex items-start gap-3 rounded-lg border p-3 transition-all",
                optimisticTodo.completed
                    ? "border-border/50 bg-muted/30 opacity-60"
                    : "border-border bg-card hover:bg-accent/30",
                isPending && "pointer-events-none opacity-50"
            )}
        >
            <Checkbox
                checked={optimisticTodo.completed}
                onCheckedChange={handleToggle}
                className="mt-0.5"
            />

            <div className="min-w-0 flex-1">
                <div className="flex items-start justify-between gap-2">
                    <div className="min-w-0 flex-1">
                        <p
                            className={cn(
                                "text-sm font-medium",
                                optimisticTodo.completed && "text-muted-foreground"
                            )}
                        >
                            <TitleWithTags title={optimisticTodo.title} />
                        </p>
                        {optimisticTodo.description && (
                            <HtmlContent
                                content={optimisticTodo.description}
                                className="mt-1 text-xs [&_pre]:my-1 [&_pre]:p-2"
                            />
                        )}
                        <CommentSection comments={comments} todoId={todo.id} />
                        {projects.length > 0 && (
                            <div className="mt-1.5 flex flex-wrap gap-1">
                                {projects.map((project) => (
                                    <ProjectBadge key={project.id} project={project} asLink />
                                ))}
                            </div>
                        )}
                        {sourceDate && (
                            <Link
                                href={`/notebook/${sourceDate}`}
                                className="text-muted-foreground hover:text-foreground mt-1.5 flex items-center gap-1 text-xs transition-colors"
                                onClick={(e) => e.stopPropagation()}
                            >
                                <IconLink className="size-3" />
                                Copied from {sourceDate}
                            </Link>
                        )}
                    </div>

                    <div className="flex shrink-0 items-center gap-2">
                        <PriorityBadge priority={optimisticTodo.priority} />
                        {formattedTime && (
                            <span className="text-muted-foreground text-xs">{formattedTime}</span>
                        )}

                        <DropdownMenu>
                            <DropdownMenuTrigger
                                render={
                                    <Button
                                        variant="ghost"
                                        size="icon-xs"
                                        className="opacity-0 transition-opacity group-hover:opacity-100"
                                    />
                                }
                            >
                                <IconDotsVertical className="size-3.5" />
                            </DropdownMenuTrigger>
                            <DropdownMenuContent align="end">
                                <DropdownMenuItem onClick={() => onEdit(todo)}>
                                    <IconPencil className="size-3.5" />
                                    Edit
                                </DropdownMenuItem>
                                <CopyTodoDialog
                                                    todoId={todo.id}
                                                    todoTitle={todo.title}
                                                    currentPageDate={todo.date}
                                                />
                                <DropdownMenuItem onClick={handleDelete} variant="destructive">
                                    <IconTrash className="size-3.5" />
                                    Delete
                                </DropdownMenuItem>
                            </DropdownMenuContent>
                        </DropdownMenu>
                    </div>
                </div>
            </div>
        </div>
    );
}
