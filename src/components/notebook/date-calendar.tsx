"use client";

import { useEffect, useState } from "react";
import { Calendar } from "@/components/ui/calendar";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";

interface DateCalendarProps {
    selectedDate?: Date;
    datesWithContent?: Date[];
    onDateSelect?: (date: Date) => void;
    onTodayClick?: () => void;
    showTodayButton?: boolean;
}

export function DateCalendar({
    selectedDate,
    datesWithContent = [],
    onDateSelect,
    onTodayClick,
    showTodayButton = true
}: DateCalendarProps) {
    const [isSafari, setIsSafari] = useState(false);

    useEffect(() => {
        // Detect Safari: includes Safari but excludes Chrome/Chromium-based browsers
        const ua = navigator.userAgent;
        setIsSafari(/^((?!chrome|android).)*safari/i.test(ua));
    }, []);

    const handleSelect = (date: Date | undefined) => {
        if (date && onDateSelect) {
            onDateSelect(date);
        }
    };

    return (
        <div className="grid gap-2">
            <div style={isSafari ? { minHeight: 370 } : undefined}>
                <Calendar
                    mode="single"
                    selected={selectedDate}
                    onSelect={handleSelect}
                    modifiers={{
                        hasContent: datesWithContent
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
                className={cn("relative z-10 w-full", !showTodayButton && "invisible")}
                onClick={onTodayClick}
            >
                Go to Today
            </Button>
        </div>
    );
}
