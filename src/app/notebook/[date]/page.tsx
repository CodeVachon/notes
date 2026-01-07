import type { Metadata } from "next";
import { redirect } from "next/navigation";
import { Separator } from "@/components/ui/separator";
import { DailyHeader } from "@/components/notebook/daily-header";
import { TodoList } from "@/components/notebook/todo-list";
import { NoteList } from "@/components/notebook/note-list";
import {
    getNotesForDate,
    getTodosForDate,
    getCommentsForDate,
    getSourceDatesForTodos
} from "@/app/notebook/actions";
import { getAllProjects, getProjectsForItems } from "@/app/projects/actions";
import { isValidDateString, getTodayString } from "@/lib/date-utils";

interface DailyPageProps {
    params: Promise<{ date: string }>;
}

export async function generateMetadata({ params }: DailyPageProps): Promise<Metadata> {
    const { date } = await params;
    return {
        title: `Notes - ${date}`
    };
}

export default async function DailyPage({ params }: DailyPageProps) {
    const { date } = await params;

    // Validate date format
    if (!isValidDateString(date)) {
        redirect(`/notebook/${getTodayString()}`);
    }

    // Fetch data in parallel
    const [todos, notes, { todoComments, noteComments }, projects] = await Promise.all([
        getTodosForDate(date),
        getNotesForDate(date),
        getCommentsForDate(date),
        getAllProjects()
    ]);

    // Get source IDs for todos that were copied
    const sourceIds = todos.map((t) => t.sourceId).filter((id): id is string => id !== null);

    // Fetch project assignments and source dates in parallel
    const [todoProjects, noteProjects, sourceDates] = await Promise.all([
        getProjectsForItems(
            "todo",
            todos.map((t) => t.id)
        ),
        getProjectsForItems(
            "note",
            notes.map((n) => n.id)
        ),
        getSourceDatesForTodos(sourceIds)
    ]);

    return (
        <div className="flex h-full flex-col">
            <div className="relative flex h-14 items-center border-b px-4">
                <DailyHeader date={date} />
            </div>

            <div className="flex-1 overflow-y-auto p-6">
                <div className="mx-auto max-w-3xl space-y-8">
                    <TodoList
                        todos={todos}
                        date={date}
                        todoComments={todoComments}
                        todoProjects={todoProjects}
                        sourceDates={sourceDates}
                        projects={projects}
                    />

                    <Separator />

                    <NoteList
                        notes={notes}
                        date={date}
                        noteComments={noteComments}
                        noteProjects={noteProjects}
                        projects={projects}
                    />
                </div>
            </div>
        </div>
    );
}
