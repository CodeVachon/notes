"use server";

import { headers } from "next/headers";
import { revalidatePath } from "next/cache";
import { eq, and, sql, asc, inArray } from "drizzle-orm";
import { db } from "@/db";
import { note, todo, comment, type TodoPriority } from "@/db/schema";
import { auth } from "@/lib/auth";
import { syncContentTags } from "@/app/tags/actions";
import { syncItemProjects } from "@/app/projects/actions";

// Helper to get authenticated user
async function getUser() {
    let session;
    try {
        session = await auth.api.getSession({ headers: await headers() });
    } catch {
        throw new Error("Unauthorized");
    }
    if (!session) throw new Error("Unauthorized");
    return session.user;
}

// ============ Notes Actions ============

export async function createNote(data: {
    date: string;
    title: string;
    content: string;
    projectIds?: string[];
}) {
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

    // Sync tags from title and content
    await syncContentTags(user.id, `${data.title} ${data.content}`, "note", result[0].id);

    // Sync project assignments
    if (data.projectIds && data.projectIds.length > 0) {
        await syncItemProjects(data.projectIds, "note", result[0].id);
    }

    revalidatePath(`/notebook/${data.date}`);
    revalidatePath("/notebook");
    return result[0];
}

export async function updateNote(
    noteId: string,
    data: { title?: string; content?: string; projectIds?: string[] }
) {
    const user = await getUser();

    const result = await db
        .update(note)
        .set({
            title: data.title,
            content: data.content,
            updatedAt: new Date()
        })
        .where(and(eq(note.id, noteId), eq(note.userId, user.id)))
        .returning();

    if (result[0]) {
        // Sync tags from title and content if either was updated
        if (data.title !== undefined || data.content !== undefined) {
            await syncContentTags(
                user.id,
                `${result[0].title} ${result[0].content}`,
                "note",
                noteId
            );
        }
        // Sync project assignments if provided
        if (data.projectIds !== undefined) {
            await syncItemProjects(data.projectIds, "note", noteId);
        }
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
    projectIds?: string[];
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

    // Sync tags from title and description
    await syncContentTags(
        user.id,
        `${data.title} ${data.description ?? ""}`,
        "todo",
        result[0].id
    );

    // Sync project assignments
    if (data.projectIds && data.projectIds.length > 0) {
        await syncItemProjects(data.projectIds, "todo", result[0].id);
    }

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
        projectIds: string[];
    }>
) {
    const user = await getUser();

    // Extract projectIds before spreading to updateData (it's not a db column)
    const { projectIds, ...dbData } = data;

    const updateData: Record<string, unknown> = {
        ...dbData,
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
        // Sync tags from title and description if either was updated
        if (data.title !== undefined || data.description !== undefined) {
            await syncContentTags(
                user.id,
                `${result[0].title} ${result[0].description ?? ""}`,
                "todo",
                todoId
            );
        }
        // Sync project assignments if provided
        if (projectIds !== undefined) {
            await syncItemProjects(projectIds, "todo", todoId);
        }
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

export async function copyTodoToDate(todoId: string, targetDate: string) {
    const user = await getUser();

    // Fetch source todo
    const source = await db
        .select()
        .from(todo)
        .where(and(eq(todo.id, todoId), eq(todo.userId, user.id)))
        .limit(1);

    if (!source[0]) throw new Error("Todo not found");

    // Create new todo with sourceId reference
    const id = crypto.randomUUID();
    const result = await db
        .insert(todo)
        .values({
            id,
            userId: user.id,
            date: targetDate,
            title: source[0].title,
            description: source[0].description,
            priority: source[0].priority,
            dueTime: null, // Don't copy time
            sourceId: source[0].id // Reference to source
        })
        .returning();

    // Sync tags from title and description
    await syncContentTags(
        user.id,
        `${result[0].title} ${result[0].description ?? ""}`,
        "todo",
        result[0].id
    );

    revalidatePath(`/notebook/${targetDate}`);
    revalidatePath("/notebook");
    return result[0];
}

export async function getSourceTodoDate(sourceId: string): Promise<string | null> {
    const user = await getUser();

    const source = await db
        .select({ date: todo.date })
        .from(todo)
        .where(and(eq(todo.id, sourceId), eq(todo.userId, user.id)))
        .limit(1);

    return source[0]?.date ?? null;
}

export async function getSourceDatesForTodos(
    sourceIds: string[]
): Promise<Record<string, string>> {
    if (sourceIds.length === 0) return {};

    const user = await getUser();

    const sources = await db
        .select({ id: todo.id, date: todo.date })
        .from(todo)
        .where(and(inArray(todo.id, sourceIds), eq(todo.userId, user.id)));

    const result: Record<string, string> = {};
    for (const s of sources) {
        result[s.id] = s.date;
    }
    return result;
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

// ============ Comments Actions ============

export async function createComment(data: { content: string; todoId?: string; noteId?: string }) {
    const user = await getUser();
    const id = crypto.randomUUID();

    if (!data.todoId && !data.noteId) {
        throw new Error("Comment must be attached to a todo or note");
    }

    const result = await db
        .insert(comment)
        .values({
            id,
            userId: user.id,
            content: data.content,
            todoId: data.todoId ?? null,
            noteId: data.noteId ?? null
        })
        .returning();

    // Sync tags from comment content
    await syncContentTags(user.id, data.content, "comment", result[0].id);

    revalidatePath("/notebook");
    return result[0];
}

export async function updateComment(commentId: string, data: { content: string }) {
    const user = await getUser();

    const result = await db
        .update(comment)
        .set({
            content: data.content,
            updatedAt: new Date()
        })
        .where(and(eq(comment.id, commentId), eq(comment.userId, user.id)))
        .returning();

    if (result[0]) {
        // Sync tags from comment content
        await syncContentTags(user.id, data.content, "comment", commentId);
    }

    revalidatePath("/notebook");
    return result[0];
}

export async function deleteComment(commentId: string) {
    const user = await getUser();

    const deleted = await db
        .delete(comment)
        .where(and(eq(comment.id, commentId), eq(comment.userId, user.id)))
        .returning();

    revalidatePath("/notebook");
    return deleted[0];
}

export async function getCommentsForTodo(todoId: string) {
    const user = await getUser();

    return db
        .select()
        .from(comment)
        .where(and(eq(comment.userId, user.id), eq(comment.todoId, todoId)))
        .orderBy(asc(comment.createdAt));
}

export async function getCommentsForNote(noteId: string) {
    const user = await getUser();

    return db
        .select()
        .from(comment)
        .where(and(eq(comment.userId, user.id), eq(comment.noteId, noteId)))
        .orderBy(asc(comment.createdAt));
}

export async function getCommentsForDate(date: string) {
    const user = await getUser();

    // Get all todos and notes for this date
    const [dateTodos, dateNotes] = await Promise.all([
        db
            .select({ id: todo.id })
            .from(todo)
            .where(and(eq(todo.userId, user.id), eq(todo.date, date))),
        db
            .select({ id: note.id })
            .from(note)
            .where(and(eq(note.userId, user.id), eq(note.date, date)))
    ]);

    const todoIds = dateTodos.map((t) => t.id);
    const noteIds = dateNotes.map((n) => n.id);

    if (todoIds.length === 0 && noteIds.length === 0) {
        return { todoComments: {}, noteComments: {} };
    }

    // Fetch all comments for these todos and notes
    const allComments = await db
        .select()
        .from(comment)
        .where(eq(comment.userId, user.id))
        .orderBy(asc(comment.createdAt));

    // Organize by todoId and noteId
    const todoComments: Record<string, typeof allComments> = {};
    const noteComments: Record<string, typeof allComments> = {};

    for (const c of allComments) {
        if (c.todoId && todoIds.includes(c.todoId)) {
            if (!todoComments[c.todoId]) todoComments[c.todoId] = [];
            todoComments[c.todoId].push(c);
        }
        if (c.noteId && noteIds.includes(c.noteId)) {
            if (!noteComments[c.noteId]) noteComments[c.noteId] = [];
            noteComments[c.noteId].push(c);
        }
    }

    return { todoComments, noteComments };
}
