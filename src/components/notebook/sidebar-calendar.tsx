"use client";

import { usePathname, useRouter } from "next/navigation";
import { DateCalendar } from "./date-calendar";
import { formatDateForStorage, parseDateString, getTodayString } from "@/lib/date-utils";

interface SidebarCalendarProps {
    datesWithContent: string[];
}

export function SidebarCalendar({ datesWithContent }: SidebarCalendarProps) {
    const pathname = usePathname();
    const router = useRouter();

    // Extract date from pathname (e.g., /notebook/2024-12-18)
    const dateMatch = pathname.match(/\/notebook\/(\d{4}-\d{2}-\d{2})/);
    const selectedDateString = dateMatch?.[1];

    // Convert string date to Date object
    const selectedDate = selectedDateString
        ? (parseDateString(selectedDateString) ?? undefined)
        : undefined;

    // Convert date strings to Date objects for content indicators
    const contentDates = datesWithContent
        .map((d) => parseDateString(d))
        .filter((d): d is Date => d !== null);

    // Only show Today button when not already on today's page
    const isOnTodayPage = selectedDateString === getTodayString();

    const handleDateSelect = (date: Date) => {
        router.push(`/notebook/${formatDateForStorage(date)}`);
    };

    const handleTodayClick = () => {
        router.push(`/notebook/${getTodayString()}`);
    };

    return (
        <DateCalendar
            selectedDate={selectedDate}
            datesWithContent={contentDates}
            onDateSelect={handleDateSelect}
            onTodayClick={handleTodayClick}
            showTodayButton={!isOnTodayPage}
        />
    );
}
