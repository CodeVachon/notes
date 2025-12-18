import { redirect } from "next/navigation";
import { Separator } from "@/components/ui/separator";
import { DailyHeader } from "@/components/notebook/daily-header";
import { TodoList } from "@/components/notebook/todo-list";
import { NoteList } from "@/components/notebook/note-list";
import { getNotesForDate, getTodosForDate } from "@/app/notebook/actions";
import { isValidDateString, getTodayString } from "@/lib/date-utils";

interface DailyPageProps {
    params: Promise<{ date: string }>;
}

export default async function DailyPage({ params }: DailyPageProps) {
    const { date } = await params;

    // Validate date format
    if (!isValidDateString(date)) {
        redirect(`/notebook/${getTodayString()}`);
    }

    // Fetch data in parallel
    const [todos, notes] = await Promise.all([getTodosForDate(date), getNotesForDate(date)]);

    return (
        <div className="flex h-full flex-col">
            <div className="relative flex h-14 items-center border-b px-4">
                <DailyHeader date={date} />
            </div>

            <div className="flex-1 overflow-y-auto p-6">
                <div className="mx-auto max-w-3xl space-y-8">
                    <TodoList todos={todos} date={date} />

                    <Separator />

                    <NoteList notes={notes} date={date} />
                </div>
            </div>
        </div>
    );
}
