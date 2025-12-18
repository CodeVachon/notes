"use client";

import { useRouter } from "next/navigation";
import { addDays, subDays } from "date-fns";
import { IconChevronLeft, IconChevronRight } from "@tabler/icons-react";
import { Button } from "@/components/ui/button";
import {
    formatDateForDisplay,
    formatDateForStorage,
    parseDateString,
    getTodayString,
    getYesterdayString,
    getTomorrowString
} from "@/lib/date-utils";

interface DailyHeaderProps {
    date: string;
}

function getDateLabel(date: string): string | null {
    if (date === getTodayString()) return "Today";
    if (date === getYesterdayString()) return "Yesterday";
    if (date === getTomorrowString()) return "Tomorrow";
    return null;
}

export function DailyHeader({ date }: DailyHeaderProps) {
    const router = useRouter();

    const currentDate = parseDateString(date) ?? new Date();
    const displayDate = formatDateForDisplay(currentDate);
    const dateLabel = getDateLabel(date);

    const handlePrevDay = () => {
        const prevDate = subDays(currentDate, 1);
        router.push(`/notebook/${formatDateForStorage(prevDate)}`);
    };

    const handleNextDay = () => {
        const nextDate = addDays(currentDate, 1);
        router.push(`/notebook/${formatDateForStorage(nextDate)}`);
    };

    return (
        <div className="flex w-full items-center justify-between">
            <Button variant="ghost" size="icon" onClick={handlePrevDay}>
                <IconChevronLeft className="size-4" />
            </Button>

            <h1 className="text-lg font-semibold">{displayDate}</h1>

            <Button variant="ghost" size="icon" onClick={handleNextDay}>
                <IconChevronRight className="size-4" />
            </Button>

            {dateLabel && (
                <span className="bg-primary text-primary-foreground absolute bottom-0 left-1/2 -translate-x-1/2 translate-y-1/2 rounded-full px-2 py-0.5 text-xs font-medium">
                    {dateLabel}
                </span>
            )}
        </div>
    );
}
