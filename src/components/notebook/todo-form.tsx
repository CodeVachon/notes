"use client";

import { useState, useTransition } from "react";
import { IconPlus } from "@tabler/icons-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import {
    Select,
    SelectTrigger,
    SelectValue,
    SelectContent,
    SelectItem
} from "@/components/ui/select";
import {
    AlertDialog,
    AlertDialogTrigger,
    AlertDialogContent,
    AlertDialogHeader,
    AlertDialogTitle,
    AlertDialogDescription,
    AlertDialogFooter,
    AlertDialogCancel
} from "@/components/ui/alert-dialog";
import { createTodo, updateTodo } from "@/app/notebook/actions";
import type { Todo, TodoPriority } from "@/db/schema";

interface TodoFormProps {
    date: string;
    todo?: Todo;
    open?: boolean;
    onOpenChange?: (open: boolean) => void;
    trigger?: React.ReactElement;
}

export function TodoForm({ date, todo, open, onOpenChange, trigger }: TodoFormProps) {
    const [isPending, startTransition] = useTransition();
    const [title, setTitle] = useState(todo?.title ?? "");
    const [description, setDescription] = useState(todo?.description ?? "");
    const [priority, setPriority] = useState<TodoPriority>(todo?.priority ?? "medium");
    const [dueTime, setDueTime] = useState(todo?.dueTime ?? "");

    const isEditing = !!todo;

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        if (!title.trim()) return;

        startTransition(async () => {
            if (isEditing) {
                await updateTodo(todo.id, {
                    title: title.trim(),
                    description: description.trim() || null,
                    priority,
                    dueTime: dueTime || null
                });
            } else {
                await createTodo({
                    date,
                    title: title.trim(),
                    description: description.trim() || undefined,
                    priority,
                    dueTime: dueTime || null
                });
            }
            onOpenChange?.(false);
            if (!isEditing) {
                setTitle("");
                setDescription("");
                setPriority("medium");
                setDueTime("");
            }
        });
    };

    const defaultTrigger = (
        <Button variant="outline" size="sm">
            <IconPlus className="size-3.5" />
            Add Todo
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
                    <AlertDialogTitle>{isEditing ? "Edit Todo" : "Add Todo"}</AlertDialogTitle>
                    <AlertDialogDescription>
                        {isEditing
                            ? "Update the details of your todo item."
                            : "Create a new todo item for this day."}
                    </AlertDialogDescription>
                </AlertDialogHeader>

                <form onSubmit={handleSubmit} className="grid gap-4">
                    <div className="grid gap-2">
                        <Label htmlFor="title">Title</Label>
                        <Input
                            id="title"
                            value={title}
                            onChange={(e) => setTitle(e.target.value)}
                            placeholder="What needs to be done?"
                            required
                        />
                    </div>

                    <div className="grid gap-2">
                        <Label htmlFor="description">Description (optional)</Label>
                        <Textarea
                            id="description"
                            value={description}
                            onChange={(e) => setDescription(e.target.value)}
                            placeholder="Add more details..."
                            rows={2}
                        />
                    </div>

                    <div className="grid grid-cols-2 gap-4">
                        <div className="grid gap-2">
                            <Label>Priority</Label>
                            <Select
                                value={priority}
                                onValueChange={(v) => setPriority(v as TodoPriority)}
                            >
                                <SelectTrigger className="w-full">
                                    <SelectValue />
                                </SelectTrigger>
                                <SelectContent>
                                    <SelectItem value="low">Low</SelectItem>
                                    <SelectItem value="medium">Medium</SelectItem>
                                    <SelectItem value="high">High</SelectItem>
                                </SelectContent>
                            </Select>
                        </div>

                        <div className="grid gap-2">
                            <Label htmlFor="dueTime">Due Time (optional)</Label>
                            <Input
                                id="dueTime"
                                type="time"
                                value={dueTime}
                                onChange={(e) => setDueTime(e.target.value)}
                            />
                        </div>
                    </div>

                    <AlertDialogFooter>
                        <AlertDialogCancel>Cancel</AlertDialogCancel>
                        <Button type="submit" disabled={isPending || !title.trim()}>
                            {isPending ? "Saving..." : isEditing ? "Save Changes" : "Add Todo"}
                        </Button>
                    </AlertDialogFooter>
                </form>
            </AlertDialogContent>
        </AlertDialog>
    );
}
