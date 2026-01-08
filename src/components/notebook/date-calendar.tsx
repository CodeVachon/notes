"use client";

import { useRouter } from "next/navigation";
import { Calendar } from "@/components/ui/calendar";
import { Button } from "@/components/ui/button";
import { formatDateForStorage, parseDateString, getTodayString } from "@/lib/date-utils";
import { cn } from "@/lib/utils";

interface DateCalendarProps {
    selectedDate?: string; // Optional - undefined when not on a notebook date page
    datesWithContent?: string[];
}

export function DateCalendar({ selectedDate, datesWithContent = [] }: DateCalendarProps) {
    const router = useRouter();

    // Only set selected date if we have a valid selectedDate prop
    const selected = selectedDate ? parseDateString(selectedDate) ?? undefined : undefined;

    // Convert date strings to Date objects for modifiers
    const contentDates = datesWithContent
        .map((d) => parseDateString(d))
        .filter((d): d is Date => d !== null);

    const handleSelect = (date: Date | undefined) => {
        if (date) {
            router.push(`/notebook/${formatDateForStorage(date)}`);
        }
    };

    const handleTodayClick = () => {
        router.push(`/notebook/${getTodayString()}`);
    };

    // Only hide button when actually on today's notebook page
    const isOnTodayPage = selectedDate === getTodayString();

    return (
        <div className="flex flex-col space-y-2">
            <div className="flex-shrink-0">
                <Calendar
                mode="single"
                selected={selected}
                onSelect={handleSelect}
                modifiers={{
                    hasContent: contentDates
                }}
                modifiersClassNames={{
                    hasContent:
                        "relative after:absolute after:bottom-1 after:left-1/2 after:-translate-x-1/2 after:size-1 after:rounded-full after:bg-primary"
                }}
                className="p-0"
                classNames={{
                    root: "w-full",
                    months: "flex flex-col w-full",
                    month: "flex flex-col w-full gap-4",
                    weekdays: "flex w-full",
                    weekday:
                        "text-muted-foreground rounded-(--cell-radius) flex-1 font-normal text-[0.8rem] select-none text-center",
                    week: "flex w-full mt-2",
                    day: "relative flex-1 rounded-(--cell-radius) h-full p-0 text-center [&:last-child[data-selected=true]_button]:rounded-r-(--cell-radius) group/day aspect-square select-none [&:first-child[data-selected=true]_button]:rounded-l-(--cell-radius)"
                }}
            />
            </div>
            <Button
                variant="outline"
                size="sm"
                className={cn("w-full", isOnTodayPage && "invisible")}
                onClick={handleTodayClick}
            >
                Go to Today
            </Button>
        </div>
    );
}
