"use server";

import { headers } from "next/headers";
import { revalidatePath } from "next/cache";
import { eq, and, sql, desc, ilike, asc, inArray } from "drizzle-orm";
import { db } from "@/db";
import {
    tag,
    tagMention,
    note,
    todo,
    comment,
    type Note,
    type Todo,
    type Comment
} from "@/db/schema";
import { auth } from "@/lib/auth";
import { extractTags } from "@/lib/tag-utils";

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

// ============ Tag Sync ============

// Sync tags when content is saved
export async function syncContentTags(
    userId: string,
    content: string,
    entityType: "note" | "todo" | "comment",
    entityId: string
) {
    const tagNames = extractTags(content);

    // Get or create tags and collect their IDs
    const tagIds: string[] = [];
    for (const name of tagNames) {
        // Try to find existing tag
        const existing = await db
            .select()
            .from(tag)
            .where(and(eq(tag.userId, userId), eq(tag.name, name)))
            .limit(1);

        let tagId: string;
        if (existing[0]) {
            tagId = existing[0].id;
        } else {
            // Create new tag
            const id = crypto.randomUUID();
            await db.insert(tag).values({ id, userId, name });
            tagId = id;
        }
        tagIds.push(tagId);
    }

    // Clear existing mentions for this entity
    if (entityType === "note") {
        await db.delete(tagMention).where(eq(tagMention.noteId, entityId));
    } else if (entityType === "todo") {
        await db.delete(tagMention).where(eq(tagMention.todoId, entityId));
    } else {
        await db.delete(tagMention).where(eq(tagMention.commentId, entityId));
    }

    // Create new mentions
    for (const tagId of tagIds) {
        await db.insert(tagMention).values({
            id: crypto.randomUUID(),
            tagId,
            noteId: entityType === "note" ? entityId : null,
            todoId: entityType === "todo" ? entityId : null,
            commentId: entityType === "comment" ? entityId : null
        });
    }

    // Revalidate tags pages
    revalidatePath("/tags");
}

// ============ Tag Queries ============

// Get all tags for user (for /tags landing page) with mention counts
export async function getAllTags() {
    const user = await getUser();

    const result = await db
        .select({
            id: tag.id,
            name: tag.name,
            createdAt: tag.createdAt,
            mentionCount: sql<number>`count(${tagMention.id})::int`.as("mention_count")
        })
        .from(tag)
        .leftJoin(tagMention, eq(tag.id, tagMention.tagId))
        .where(eq(tag.userId, user.id))
        .groupBy(tag.id)
        .orderBy(sql`lower(${tag.name})`);

    return result;
}

// Get tag suggestions for autocomplete
export async function getTagSuggestions(query: string) {
    const user = await getUser();

    if (!query) {
        // Return most used tags when no query
        return db
            .select({
                id: tag.id,
                name: tag.name,
                mentionCount: sql<number>`count(${tagMention.id})::int`.as("mention_count")
            })
            .from(tag)
            .leftJoin(tagMention, eq(tag.id, tagMention.tagId))
            .where(eq(tag.userId, user.id))
            .groupBy(tag.id)
            .orderBy(desc(sql`count(${tagMention.id})`))
            .limit(10);
    }

    return db
        .select({ id: tag.id, name: tag.name })
        .from(tag)
        .where(and(eq(tag.userId, user.id), ilike(tag.name, `%${query}%`)))
        .orderBy(tag.name)
        .limit(10);
}

// ============ Tag Mentions Queries ============

export type TagMentionsData = {
    notes: Note[];
    todos: Todo[];
    noteComments: Record<string, Comment[]>;
    todoComments: Record<string, Comment[]>;
    dates: string[]; // Unique dates sorted newest first
} | null;

// Get all mentions for a tag (for /tags/[tagname] page)
// Returns full note/todo objects with their comments, grouped by date
export async function getTagMentions(tagName: string): Promise<TagMentionsData> {
    const user = await getUser();

    // Find the tag
    const tagRecord = await db
        .select()
        .from(tag)
        .where(and(eq(tag.userId, user.id), eq(tag.name, tagName.toLowerCase())))
        .limit(1);

    if (!tagRecord[0]) return null;

    // Get all mentions
    const mentions = await db
        .select()
        .from(tagMention)
        .where(eq(tagMention.tagId, tagRecord[0].id));

    // Collect IDs
    const noteIds = mentions.filter((m) => m.noteId).map((m) => m.noteId!);
    const todoIds = mentions.filter((m) => m.todoId).map((m) => m.todoId!);

    // Fetch full notes and todos
    const notes =
        noteIds.length > 0
            ? await db
                  .select()
                  .from(note)
                  .where(and(eq(note.userId, user.id), inArray(note.id, noteIds)))
                  .orderBy(desc(note.date), desc(note.createdAt))
            : [];

    const todos =
        todoIds.length > 0
            ? await db
                  .select()
                  .from(todo)
                  .where(and(eq(todo.userId, user.id), inArray(todo.id, todoIds)))
                  .orderBy(desc(todo.date), desc(todo.createdAt))
            : [];

    // Fetch comments for these notes and todos
    const allNoteIds = notes.map((n) => n.id);
    const allTodoIds = todos.map((t) => t.id);

    const allComments = await db
        .select()
        .from(comment)
        .where(eq(comment.userId, user.id))
        .orderBy(asc(comment.createdAt));

    // Organize comments by noteId and todoId
    const noteComments: Record<string, Comment[]> = {};
    const todoComments: Record<string, Comment[]> = {};

    for (const c of allComments) {
        if (c.noteId && allNoteIds.includes(c.noteId)) {
            if (!noteComments[c.noteId]) noteComments[c.noteId] = [];
            noteComments[c.noteId].push(c);
        }
        if (c.todoId && allTodoIds.includes(c.todoId)) {
            if (!todoComments[c.todoId]) todoComments[c.todoId] = [];
            todoComments[c.todoId].push(c);
        }
    }

    // Get unique dates sorted newest first
    const allDates = new Set([...notes.map((n) => n.date), ...todos.map((t) => t.date)]);
    const dates = Array.from(allDates).sort((a, b) => b.localeCompare(a));

    return {
        notes,
        todos,
        noteComments,
        todoComments,
        dates
    };
}

// Check if a tag exists (for validation)
export async function tagExists(tagName: string): Promise<boolean> {
    const user = await getUser();

    const result = await db
        .select({ id: tag.id })
        .from(tag)
        .where(and(eq(tag.userId, user.id), eq(tag.name, tagName.toLowerCase())))
        .limit(1);

    return result.length > 0;
}
