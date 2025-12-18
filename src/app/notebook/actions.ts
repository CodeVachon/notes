"use server";

import { headers } from "next/headers";
import { revalidatePath } from "next/cache";
import { eq, and, sql, asc } from "drizzle-orm";
import { db } from "@/db";
import { note, todo, type TodoPriority } from "@/db/schema";
import { auth } from "@/lib/auth";

// Helper to get authenticated user
async function getUser() {
    const session = await auth.api.getSession({ headers: await headers() });
    if (!session) throw new Error("Unauthorized");
    return session.user;
}

// ============ Notes Actions ============

export async function createNote(data: { date: string; title: string; content: string }) {
    const user = await getUser();
    const id = crypto.randomUUID();

    const result = await db
        .insert(note)
        .values({
            id,
            userId: user.id,
            date: data.date,
            title: data.title,
            content: data.content
        })
        .returning();

    revalidatePath(`/notebook/${data.date}`);
    revalidatePath("/notebook");
    return result[0];
}

export async function updateNote(noteId: string, data: { title?: string; content?: string }) {
    const user = await getUser();

    const result = await db
        .update(note)
        .set({
            ...data,
            updatedAt: new Date()
        })
        .where(and(eq(note.id, noteId), eq(note.userId, user.id)))
        .returning();

    if (result[0]) {
        revalidatePath(`/notebook/${result[0].date}`);
        revalidatePath("/notebook");
    }
    return result[0];
}

export async function deleteNote(noteId: string) {
    const user = await getUser();

    const deleted = await db
        .delete(note)
        .where(and(eq(note.id, noteId), eq(note.userId, user.id)))
        .returning();

    if (deleted[0]) {
        revalidatePath(`/notebook/${deleted[0].date}`);
        revalidatePath("/notebook");
    }
    return deleted[0];
}

export async function getNotesForDate(date: string) {
    const user = await getUser();

    return db
        .select()
        .from(note)
        .where(and(eq(note.userId, user.id), eq(note.date, date)))
        .orderBy(note.createdAt);
}

// ============ Todos Actions ============

export async function createTodo(data: {
    date: string;
    title: string;
    description?: string;
    priority?: TodoPriority;
    dueTime?: string | null;
}) {
    const user = await getUser();
    const id = crypto.randomUUID();

    const result = await db
        .insert(todo)
        .values({
            id,
            userId: user.id,
            date: data.date,
            title: data.title,
            description: data.description ?? null,
            priority: data.priority ?? "medium",
            dueTime: data.dueTime ?? null
        })
        .returning();

    revalidatePath(`/notebook/${data.date}`);
    revalidatePath("/notebook");
    return result[0];
}

export async function updateTodo(
    todoId: string,
    data: Partial<{
        title: string;
        description: string | null;
        priority: TodoPriority;
        dueTime: string | null;
        completed: boolean;
    }>
) {
    const user = await getUser();

    const updateData: Record<string, unknown> = {
        ...data,
        updatedAt: new Date()
    };

    // Set completedAt when marking as completed
    if (data.completed !== undefined) {
        updateData.completedAt = data.completed ? new Date() : null;
    }

    const result = await db
        .update(todo)
        .set(updateData)
        .where(and(eq(todo.id, todoId), eq(todo.userId, user.id)))
        .returning();

    if (result[0]) {
        revalidatePath(`/notebook/${result[0].date}`);
        revalidatePath("/notebook");
    }
    return result[0];
}

export async function toggleTodo(todoId: string) {
    const user = await getUser();

    const existing = await db
        .select()
        .from(todo)
        .where(and(eq(todo.id, todoId), eq(todo.userId, user.id)))
        .limit(1);

    if (!existing[0]) throw new Error("Todo not found");

    const newCompleted = !existing[0].completed;

    const result = await db
        .update(todo)
        .set({
            completed: newCompleted,
            completedAt: newCompleted ? new Date() : null,
            updatedAt: new Date()
        })
        .where(eq(todo.id, todoId))
        .returning();

    revalidatePath(`/notebook/${result[0].date}`);
    revalidatePath("/notebook");
    return result[0];
}

export async function deleteTodo(todoId: string) {
    const user = await getUser();

    const deleted = await db
        .delete(todo)
        .where(and(eq(todo.id, todoId), eq(todo.userId, user.id)))
        .returning();

    if (deleted[0]) {
        revalidatePath(`/notebook/${deleted[0].date}`);
        revalidatePath("/notebook");
    }
    return deleted[0];
}

export async function getTodosForDate(date: string) {
    const user = await getUser();

    // Custom priority order: high (1) -> medium (2) -> low (3)
    const priorityOrder = sql`CASE ${todo.priority} WHEN 'high' THEN 1 WHEN 'medium' THEN 2 WHEN 'low' THEN 3 END`;

    return db
        .select()
        .from(todo)
        .where(and(eq(todo.userId, user.id), eq(todo.date, date)))
        .orderBy(asc(todo.completed), asc(priorityOrder), asc(todo.dueTime));
}

// ============ Calendar Helpers ============

export async function getDatesWithContent() {
    const user = await getUser();

    const noteDates = await db
        .selectDistinct({ date: note.date })
        .from(note)
        .where(eq(note.userId, user.id));

    const todoDates = await db
        .selectDistinct({ date: todo.date })
        .from(todo)
        .where(eq(todo.userId, user.id));

    const allDates = new Set([...noteDates.map((n) => n.date), ...todoDates.map((t) => t.date)]);

    return Array.from(allDates);
}
