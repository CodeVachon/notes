"use server";

import { headers } from "next/headers";
import { revalidatePath } from "next/cache";
import { eq, and, sql, desc, ilike } from "drizzle-orm";
import { db } from "@/db";
import { tag, tagMention, note, todo, comment } from "@/db/schema";
import { auth } from "@/lib/auth";
import { extractTags, truncateContent } from "@/lib/tag-utils";

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

export type TagMentionResult = {
    id: string;
    type: "note" | "todo" | "comment";
    date: string;
    title: string | null;
    contentSnippet: string;
    createdAt: Date;
};

// Get all mentions for a tag (for /tags/[tagname] page)
export async function getTagMentions(tagName: string): Promise<TagMentionResult[] | null> {
    const user = await getUser();

    // Find the tag
    const tagRecord = await db
        .select()
        .from(tag)
        .where(and(eq(tag.userId, user.id), eq(tag.name, tagName.toLowerCase())))
        .limit(1);

    if (!tagRecord[0]) return null;

    // Get all mentions with joined data
    const mentions = await db
        .select({
            mentionId: tagMention.id,
            mentionCreatedAt: tagMention.createdAt,
            noteId: tagMention.noteId,
            todoId: tagMention.todoId,
            commentId: tagMention.commentId,
            // Note fields
            noteTitle: note.title,
            noteContent: note.content,
            noteDate: note.date,
            // Todo fields
            todoTitle: todo.title,
            todoDescription: todo.description,
            todoDate: todo.date,
            // Comment fields
            commentContent: comment.content,
            commentNoteId: comment.noteId,
            commentTodoId: comment.todoId
        })
        .from(tagMention)
        .leftJoin(note, eq(tagMention.noteId, note.id))
        .leftJoin(todo, eq(tagMention.todoId, todo.id))
        .leftJoin(comment, eq(tagMention.commentId, comment.id))
        .where(eq(tagMention.tagId, tagRecord[0].id))
        .orderBy(desc(tagMention.createdAt));

    // For comments, we need to get the parent date
    const results: TagMentionResult[] = [];

    for (const m of mentions) {
        if (m.noteId && m.noteDate) {
            results.push({
                id: m.mentionId,
                type: "note",
                date: m.noteDate,
                title: m.noteTitle,
                contentSnippet: truncateContent(m.noteContent ?? ""),
                createdAt: m.mentionCreatedAt
            });
        } else if (m.todoId && m.todoDate) {
            results.push({
                id: m.mentionId,
                type: "todo",
                date: m.todoDate,
                title: m.todoTitle,
                contentSnippet: truncateContent(m.todoDescription ?? ""),
                createdAt: m.mentionCreatedAt
            });
        } else if (m.commentId) {
            // Get parent date from note or todo
            let parentDate = "";
            if (m.commentNoteId) {
                const parentNote = await db
                    .select({ date: note.date })
                    .from(note)
                    .where(eq(note.id, m.commentNoteId))
                    .limit(1);
                if (parentNote[0]) parentDate = parentNote[0].date;
            } else if (m.commentTodoId) {
                const parentTodo = await db
                    .select({ date: todo.date })
                    .from(todo)
                    .where(eq(todo.id, m.commentTodoId))
                    .limit(1);
                if (parentTodo[0]) parentDate = parentTodo[0].date;
            }

            results.push({
                id: m.mentionId,
                type: "comment",
                date: parentDate,
                title: null,
                contentSnippet: truncateContent(m.commentContent ?? ""),
                createdAt: m.mentionCreatedAt
            });
        }
    }

    return results;
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
