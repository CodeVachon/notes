"use client";

import { useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import { IconCopy, IconCalendar } from "@tabler/icons-react";
import { Button } from "@/components/ui/button";
import {
    Dialog,
    DialogTrigger,
    DialogContent,
    DialogTitle,
    DialogDescription,
    DialogClose
} from "@/components/ui/dialog";
import { Calendar } from "@/components/ui/calendar";
import { copyTodoToDate } from "@/app/notebook/actions";
import { formatDateForStorage, formatDateForDisplay } from "@/lib/date-utils";

interface CopyTodoDialogProps {
    todoId: string;
    todoTitle: string;
    onCopy?: () => void;
}

export function CopyTodoDialog({ todoId, todoTitle, onCopy }: CopyTodoDialogProps) {
    const router = useRouter();
    const [open, setOpen] = useState(false);
    const [selectedDate, setSelectedDate] = useState<Date | undefined>(undefined);
    const [isPending, startTransition] = useTransition();

    const handleCopy = async () => {
        if (!selectedDate) return;

        startTransition(async () => {
            const targetDate = formatDateForStorage(selectedDate);
            await copyTodoToDate(todoId, targetDate);
            setOpen(false);
            setSelectedDate(undefined);
            onCopy?.();
            router.push(`/notebook/${targetDate}`);
        });
    };

    return (
        <Dialog open={open} onOpenChange={setOpen}>
            <DialogTrigger
                render={
                    <button
                        className="hover:bg-accent hover:text-accent-foreground flex w-full cursor-default items-center gap-2 px-2 py-1.5 text-sm outline-none select-none"
                        onClick={(e) => e.stopPropagation()}
                    >
                        <IconCopy className="size-3.5" />
                        Copy to date
                    </button>
                }
            />
            <DialogContent onClick={(e) => e.stopPropagation()} showCloseButton={false}>
                <DialogTitle>Copy Todo</DialogTitle>
                <DialogDescription>
                    Copy "{todoTitle.length > 40 ? todoTitle.slice(0, 40) + "..." : todoTitle}" to
                    another date.
                </DialogDescription>

                <div className="mt-4 flex flex-col items-center">
                    <Calendar
                        mode="single"
                        selected={selectedDate}
                        onSelect={setSelectedDate}
                        className="rounded-md border"
                    />

                    {selectedDate && (
                        <p className="text-muted-foreground mt-2 flex items-center gap-1 text-sm">
                            <IconCalendar className="size-4" />
                            {formatDateForDisplay(selectedDate)}
                        </p>
                    )}
                </div>

                <div className="mt-4 flex justify-end gap-2">
                    <DialogClose
                        render={
                            <Button variant="outline" size="sm">
                                Cancel
                            </Button>
                        }
                    />
                    <Button size="sm" onClick={handleCopy} disabled={!selectedDate || isPending}>
                        {isPending ? "Copying..." : "Copy"}
                    </Button>
                </div>
            </DialogContent>
        </Dialog>
    );
}
