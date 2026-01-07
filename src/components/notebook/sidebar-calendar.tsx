"use client";

import { usePathname } from "next/navigation";
import { DateCalendar } from "./date-calendar";

interface SidebarCalendarProps {
    datesWithContent: string[];
}

export function SidebarCalendar({ datesWithContent }: SidebarCalendarProps) {
    const pathname = usePathname();

    // Extract date from pathname (e.g., /notebook/2024-12-18)
    const dateMatch = pathname.match(/\/notebook\/(\d{4}-\d{2}-\d{2})/);
    // Don't default to today - pass undefined when not on a notebook date page
    const selectedDate = dateMatch?.[1];

    return <DateCalendar selectedDate={selectedDate} datesWithContent={datesWithContent} />;
}
