"use client";

import { useRouter } from "next/navigation";
import { Calendar } from "@/components/ui/calendar";
import { Button } from "@/components/ui/button";
import { formatDateForStorage, parseDateString, getTodayString } from "@/lib/date-utils";

interface DateCalendarProps {
    selectedDate: string;
    datesWithContent?: string[];
}

export function DateCalendar({ selectedDate, datesWithContent = [] }: DateCalendarProps) {
    const router = useRouter();

    const selected = parseDateString(selectedDate) ?? new Date();

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

    const isToday = selectedDate === getTodayString();

    return (
        <div className="flex flex-col items-center space-y-2">
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
            />
            {!isToday && (
                <Button variant="outline" size="sm" className="w-full" onClick={handleTodayClick}>
                    Go to Today
                </Button>
            )}
        </div>
    );
}
