"use client";

import { useState, useTransition } from "react";
import {
    DropdownMenu,
    DropdownMenuTrigger,
    DropdownMenuContent,
    DropdownMenuRadioGroup,
    DropdownMenuRadioItem
} from "@/components/ui/dropdown-menu";
import { PriorityBadge } from "./priority-badge";
import { updateTodo } from "@/app/notebook/actions";
import { cn } from "@/lib/utils";
import type { TodoPriority } from "@/db/schema";

interface PrioritySelectorProps {
    todoId: string;
    priority: TodoPriority;
    onPriorityChange?: (newPriority: TodoPriority) => void;
}

const PRIORITIES: { value: TodoPriority; label: string }[] = [
    { value: "high", label: "High" },
    { value: "medium", label: "Medium" },
    { value: "low", label: "Low" }
];

export function PrioritySelector({ todoId, priority, onPriorityChange }: PrioritySelectorProps) {
    const [open, setOpen] = useState(false);
    const [isPending, startTransition] = useTransition();

    const handlePriorityChange = (newPriority: string) => {
        const validPriority = newPriority as TodoPriority;
        if (validPriority === priority) {
            setOpen(false);
            return;
        }

        setOpen(false);
        startTransition(async () => {
            onPriorityChange?.(validPriority);
            await updateTodo(todoId, { priority: validPriority });
        });
    };

    return (
        <DropdownMenu open={open} onOpenChange={setOpen}>
            <DropdownMenuTrigger
                render={
                    <button
                        className={cn(
                            "cursor-pointer transition-opacity hover:opacity-80",
                            isPending && "pointer-events-none opacity-50"
                        )}
                        onClick={(e) => e.stopPropagation()}
                    >
                        <PriorityBadge priority={priority} />
                    </button>
                }
            />
            <DropdownMenuContent align="end" onClick={(e) => e.stopPropagation()}>
                <DropdownMenuRadioGroup value={priority} onValueChange={handlePriorityChange}>
                    {PRIORITIES.map((p) => (
                        <DropdownMenuRadioItem key={p.value} value={p.value}>
                            <PriorityBadge priority={p.value} />
                        </DropdownMenuRadioItem>
                    ))}
                </DropdownMenuRadioGroup>
            </DropdownMenuContent>
        </DropdownMenu>
    );
}
