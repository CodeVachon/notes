"use server";

import { headers } from "next/headers";
import { revalidatePath } from "next/cache";
import { eq, and, isNull, asc, count, sql } from "drizzle-orm";
import { db } from "@/db";
import { note, noteFolder, type Note, type NoteFolder } from "@/db/schema";
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

// ============ Slug Utilities ============

function generateSlug(name: string): string {
    return name
        .toLowerCase()
        .trim()
        .replace(/[^\w\s-]/g, "") // Remove special chars
        .replace(/[\s_-]+/g, "-") // Replace spaces/underscores with hyphens
        .replace(/^-+|-+$/g, ""); // Trim leading/trailing hyphens
}

async function isSlugAvailable(
    userId: string,
    slug: string,
    folderId: string | null,
    excludeId?: string,
    type?: "folder" | "note"
): Promise<boolean> {
    // Check folders
    if (type !== "note") {
        const existingFolder = await db
            .select({ id: noteFolder.id })
            .from(noteFolder)
            .where(
                and(
                    eq(noteFolder.userId, userId),
                    eq(noteFolder.slug, slug),
                    folderId ? eq(noteFolder.parentId, folderId) : isNull(noteFolder.parentId)
                )
            )
            .limit(1);

        if (existingFolder.length > 0 && existingFolder[0].id !== excludeId) {
            return false;
        }
    }

    // Check notes
    if (type !== "folder") {
        const existingNote = await db
            .select({ id: note.id })
            .from(note)
            .where(
                and(
                    eq(note.userId, userId),
                    eq(note.slug, slug),
                    folderId ? eq(note.folderId, folderId) : isNull(note.folderId)
                )
            )
            .limit(1);

        if (existingNote.length > 0 && existingNote[0].id !== excludeId) {
            return false;
        }
    }

    return true;
}

async function generateUniqueSlug(
    userId: string,
    name: string,
    folderId: string | null,
    excludeId?: string,
    type?: "folder" | "note"
): Promise<string> {
    const baseSlug = generateSlug(name);
    let slug = baseSlug;
    let counter = 1;

    while (!(await isSlugAvailable(userId, slug, folderId, excludeId, type))) {
        slug = `${baseSlug}-${counter}`;
        counter++;
    }

    return slug;
}

// ============ Folder Actions ============

export async function createFolder(data: { name: string; parentId?: string | null }) {
    const user = await getUser();
    const id = crypto.randomUUID();
    const parentId = data.parentId ?? null;

    // Generate unique slug within parent
    const slug = await generateUniqueSlug(user.id, data.name, parentId, undefined, "folder");

    // Get max sort order in parent
    const maxOrder = await db
        .select({ max: noteFolder.sortOrder })
        .from(noteFolder)
        .where(
            and(
                eq(noteFolder.userId, user.id),
                parentId ? eq(noteFolder.parentId, parentId) : isNull(noteFolder.parentId)
            )
        )
        .limit(1);

    const sortOrder = (maxOrder[0]?.max ?? -1) + 1;

    const result = await db
        .insert(noteFolder)
        .values({
            id,
            userId: user.id,
            name: data.name,
            slug,
            parentId,
            sortOrder
        })
        .returning();

    revalidatePath("/notebook/notes");
    return result[0];
}

export async function updateFolder(folderId: string, data: { name: string }) {
    const user = await getUser();

    // Get existing folder to check parent
    const existing = await db
        .select()
        .from(noteFolder)
        .where(and(eq(noteFolder.id, folderId), eq(noteFolder.userId, user.id)))
        .limit(1);

    if (!existing[0]) throw new Error("Folder not found");

    // Generate unique slug if name changed
    const slug = await generateUniqueSlug(
        user.id,
        data.name,
        existing[0].parentId,
        folderId,
        "folder"
    );

    const result = await db
        .update(noteFolder)
        .set({
            name: data.name,
            slug,
            updatedAt: new Date()
        })
        .where(and(eq(noteFolder.id, folderId), eq(noteFolder.userId, user.id)))
        .returning();

    revalidatePath("/notebook/notes");
    return result[0];
}

export async function deleteFolder(folderId: string) {
    const user = await getUser();

    // Check if folder has any contents
    const [childFolders, childNotes] = await Promise.all([
        db
            .select({ count: count() })
            .from(noteFolder)
            .where(and(eq(noteFolder.userId, user.id), eq(noteFolder.parentId, folderId))),
        db
            .select({ count: count() })
            .from(note)
            .where(and(eq(note.userId, user.id), eq(note.folderId, folderId)))
    ]);

    const totalContents = (childFolders[0]?.count ?? 0) + (childNotes[0]?.count ?? 0);

    if (totalContents > 0) {
        throw new Error(
            "Cannot delete folder with contents. Please move or delete all items first."
        );
    }

    const deleted = await db
        .delete(noteFolder)
        .where(and(eq(noteFolder.id, folderId), eq(noteFolder.userId, user.id)))
        .returning();

    revalidatePath("/notebook/notes");
    return deleted[0];
}

export async function moveFolder(folderId: string, targetParentId: string | null) {
    const user = await getUser();

    // Verify folder exists
    const folder = await db
        .select()
        .from(noteFolder)
        .where(and(eq(noteFolder.id, folderId), eq(noteFolder.userId, user.id)))
        .limit(1);

    if (!folder[0]) throw new Error("Folder not found");

    // Prevent moving into itself
    if (folderId === targetParentId) {
        throw new Error("Cannot move folder into itself");
    }

    // Prevent moving into descendant
    if (targetParentId) {
        const isDescendant = await checkIsDescendant(user.id, targetParentId, folderId);
        if (isDescendant) {
            throw new Error("Cannot move folder into its own descendant");
        }
    }

    // Check if slug is available in target location
    const slugAvailable = await isSlugAvailable(user.id, folder[0].slug, targetParentId, folderId);
    if (!slugAvailable) {
        throw new Error("A folder or note with this name already exists in the target location");
    }

    // Get max sort order in target
    const maxOrder = await db
        .select({ max: noteFolder.sortOrder })
        .from(noteFolder)
        .where(
            and(
                eq(noteFolder.userId, user.id),
                targetParentId
                    ? eq(noteFolder.parentId, targetParentId)
                    : isNull(noteFolder.parentId)
            )
        )
        .limit(1);

    const sortOrder = (maxOrder[0]?.max ?? -1) + 1;

    const result = await db
        .update(noteFolder)
        .set({
            parentId: targetParentId,
            sortOrder,
            updatedAt: new Date()
        })
        .where(and(eq(noteFolder.id, folderId), eq(noteFolder.userId, user.id)))
        .returning();

    revalidatePath("/notebook/notes");
    return result[0];
}

async function checkIsDescendant(
    userId: string,
    folderId: string,
    ancestorId: string
): Promise<boolean> {
    // Use recursive CTE to check ancestry in a single query
    const result = await db.execute<{ is_descendant: boolean }>(sql`
        WITH RECURSIVE ancestors AS (
            -- Start with the folder we're checking
            SELECT id, parent_id FROM note_folder
            WHERE id = ${folderId} AND user_id = ${userId}
            UNION ALL
            -- Recursively get all ancestors
            SELECT nf.id, nf.parent_id FROM note_folder nf
            JOIN ancestors a ON nf.id = a.parent_id
            WHERE nf.user_id = ${userId}
        )
        SELECT EXISTS(
            SELECT 1 FROM ancestors WHERE id = ${ancestorId}
        ) as is_descendant
    `);

    // db.execute returns rows directly as an array
    const rows = result as unknown as Array<{ is_descendant: boolean }>;
    return rows[0]?.is_descendant ?? false;
}

export async function getFolderByPath(pathSegments: string[]): Promise<NoteFolder | null> {
    const user = await getUser();

    let currentFolder: NoteFolder | null = null;

    for (const segment of pathSegments) {
        const folder = await db
            .select()
            .from(noteFolder)
            .where(
                and(
                    eq(noteFolder.userId, user.id),
                    eq(noteFolder.slug, segment),
                    currentFolder
                        ? eq(noteFolder.parentId, currentFolder.id)
                        : isNull(noteFolder.parentId)
                )
            )
            .limit(1);

        if (!folder[0]) return null;
        currentFolder = folder[0];
    }

    return currentFolder;
}

export async function getFolderContents(folderId: string | null): Promise<{
    folder: NoteFolder | null;
    childFolders: NoteFolder[];
    notes: Note[];
}> {
    const user = await getUser();

    // Get current folder (if not root)
    let folder: NoteFolder | null = null;
    if (folderId) {
        const folderResult = await db
            .select()
            .from(noteFolder)
            .where(and(eq(noteFolder.id, folderId), eq(noteFolder.userId, user.id)))
            .limit(1);
        folder = folderResult[0] ?? null;
    }

    // Get child folders
    const childFolders = await db
        .select()
        .from(noteFolder)
        .where(
            and(
                eq(noteFolder.userId, user.id),
                folderId ? eq(noteFolder.parentId, folderId) : isNull(noteFolder.parentId)
            )
        )
        .orderBy(asc(noteFolder.sortOrder), asc(noteFolder.name));

    // Get notes in folder (generic notes only - no date)
    const notes = await db
        .select()
        .from(note)
        .where(
            and(
                eq(note.userId, user.id),
                isNull(note.date),
                folderId ? eq(note.folderId, folderId) : isNull(note.folderId)
            )
        )
        .orderBy(asc(note.sortOrder), asc(note.title));

    return { folder, childFolders, notes };
}

export async function getFolderBreadcrumbs(
    folderId: string | null
): Promise<Array<{ id: string; name: string; slug: string }>> {
    if (!folderId) return [];

    const user = await getUser();

    // Use recursive CTE to get all ancestors in a single query
    const result = await db.execute<{ id: string; name: string; slug: string; depth: number }>(sql`
        WITH RECURSIVE breadcrumbs AS (
            -- Start with the target folder
            SELECT id, name, slug, parent_id, 0 as depth FROM note_folder
            WHERE id = ${folderId} AND user_id = ${user.id}
            UNION ALL
            -- Recursively get all ancestors
            SELECT nf.id, nf.name, nf.slug, nf.parent_id, b.depth + 1 FROM note_folder nf
            JOIN breadcrumbs b ON nf.id = b.parent_id
            WHERE nf.user_id = ${user.id}
        )
        SELECT id, name, slug, depth FROM breadcrumbs
        ORDER BY depth DESC
    `);

    // db.execute returns rows directly as an array
    const rows = result as unknown as Array<{
        id: string;
        name: string;
        slug: string;
        depth: number;
    }>;
    return rows.map((row) => ({
        id: row.id,
        name: row.name,
        slug: row.slug
    }));
}

// ============ Generic Note Actions ============

export async function createGenericNote(data: {
    title: string;
    content: string;
    folderId: string | null;
    projectIds?: string[];
}) {
    const user = await getUser();
    const id = crypto.randomUUID();

    // Generate unique slug within folder
    const slug = await generateUniqueSlug(user.id, data.title, data.folderId, undefined, "note");

    // Get max sort order in folder
    const maxOrder = await db
        .select({ max: note.sortOrder })
        .from(note)
        .where(
            and(
                eq(note.userId, user.id),
                isNull(note.date),
                data.folderId ? eq(note.folderId, data.folderId) : isNull(note.folderId)
            )
        )
        .limit(1);

    const sortOrder = (maxOrder[0]?.max ?? -1) + 1;

    const result = await db
        .insert(note)
        .values({
            id,
            userId: user.id,
            date: null, // Generic note - no date
            folderId: data.folderId,
            title: data.title,
            slug,
            content: data.content,
            sortOrder
        })
        .returning();

    // Sync tags from title and content
    await syncContentTags(user.id, `${data.title} ${data.content}`, "note", result[0].id);

    // Sync project assignments
    if (data.projectIds && data.projectIds.length > 0) {
        await syncItemProjects(data.projectIds, "note", result[0].id);
    }

    revalidatePath("/notebook/notes");
    return result[0];
}

export async function updateGenericNote(
    noteId: string,
    data: { title?: string; content?: string; projectIds?: string[] }
) {
    const user = await getUser();

    // Get existing note
    const existing = await db
        .select()
        .from(note)
        .where(and(eq(note.id, noteId), eq(note.userId, user.id), isNull(note.date)))
        .limit(1);

    if (!existing[0]) throw new Error("Note not found");

    const updateData: Record<string, unknown> = { updatedAt: new Date() };

    if (data.title !== undefined) {
        updateData.title = data.title;
        // Update slug if title changed
        updateData.slug = await generateUniqueSlug(
            user.id,
            data.title,
            existing[0].folderId,
            noteId,
            "note"
        );
    }

    if (data.content !== undefined) {
        updateData.content = data.content;
    }

    const result = await db
        .update(note)
        .set(updateData)
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
    }

    revalidatePath("/notebook/notes");
    return result[0];
}

export async function deleteGenericNote(noteId: string) {
    const user = await getUser();

    const deleted = await db
        .delete(note)
        .where(and(eq(note.id, noteId), eq(note.userId, user.id), isNull(note.date)))
        .returning();

    revalidatePath("/notebook/notes");
    return deleted[0];
}

export async function moveGenericNote(noteId: string, targetFolderId: string | null) {
    const user = await getUser();

    // Get existing note
    const existing = await db
        .select()
        .from(note)
        .where(and(eq(note.id, noteId), eq(note.userId, user.id), isNull(note.date)))
        .limit(1);

    if (!existing[0]) throw new Error("Note not found");

    // Check if slug is available in target location
    const slugAvailable = await isSlugAvailable(user.id, existing[0].slug!, targetFolderId, noteId);
    if (!slugAvailable) {
        throw new Error("A folder or note with this name already exists in the target location");
    }

    // Get max sort order in target folder
    const maxOrder = await db
        .select({ max: note.sortOrder })
        .from(note)
        .where(
            and(
                eq(note.userId, user.id),
                isNull(note.date),
                targetFolderId ? eq(note.folderId, targetFolderId) : isNull(note.folderId)
            )
        )
        .limit(1);

    const sortOrder = (maxOrder[0]?.max ?? -1) + 1;

    const result = await db
        .update(note)
        .set({
            folderId: targetFolderId,
            sortOrder,
            updatedAt: new Date()
        })
        .where(and(eq(note.id, noteId), eq(note.userId, user.id)))
        .returning();

    revalidatePath("/notebook/notes");
    return result[0];
}

export async function getGenericNoteBySlug(
    folderId: string | null,
    slug: string
): Promise<Note | null> {
    const user = await getUser();

    const result = await db
        .select()
        .from(note)
        .where(
            and(
                eq(note.userId, user.id),
                isNull(note.date),
                eq(note.slug, slug),
                folderId ? eq(note.folderId, folderId) : isNull(note.folderId)
            )
        )
        .limit(1);

    return result[0] ?? null;
}

export async function getGenericNoteById(noteId: string): Promise<Note | null> {
    const user = await getUser();

    const result = await db
        .select()
        .from(note)
        .where(and(eq(note.id, noteId), eq(note.userId, user.id), isNull(note.date)))
        .limit(1);

    return result[0] ?? null;
}

// ============ Reorder Actions ============

export async function reorderFolderItems(
    folderId: string | null,
    items: Array<{ id: string; type: "folder" | "note"; sortOrder: number }>
) {
    const user = await getUser();

    // Update each item's sort order
    for (const item of items) {
        if (item.type === "folder") {
            await db
                .update(noteFolder)
                .set({ sortOrder: item.sortOrder, updatedAt: new Date() })
                .where(and(eq(noteFolder.id, item.id), eq(noteFolder.userId, user.id)));
        } else {
            await db
                .update(note)
                .set({ sortOrder: item.sortOrder, updatedAt: new Date() })
                .where(and(eq(note.id, item.id), eq(note.userId, user.id)));
        }
    }

    revalidatePath("/notebook/notes");
}

// ============ Path Resolution ============

export async function resolvePathToItem(pathSegments: string[]): Promise<{
    type: "folder" | "note" | "not_found";
    folder?: NoteFolder;
    note?: Note;
    parentFolder?: NoteFolder | null;
}> {
    const user = await getUser();

    if (pathSegments.length === 0) {
        return { type: "folder", parentFolder: null };
    }

    // Try to resolve as folder first
    let currentFolder: NoteFolder | null = null;

    for (let i = 0; i < pathSegments.length; i++) {
        const segment = pathSegments[i];
        const isLast = i === pathSegments.length - 1;

        // Try to find folder
        const folder = await db
            .select()
            .from(noteFolder)
            .where(
                and(
                    eq(noteFolder.userId, user.id),
                    eq(noteFolder.slug, segment),
                    currentFolder
                        ? eq(noteFolder.parentId, currentFolder.id)
                        : isNull(noteFolder.parentId)
                )
            )
            .limit(1);

        if (folder[0]) {
            currentFolder = folder[0];
            if (isLast) {
                return { type: "folder", folder: folder[0], parentFolder: currentFolder };
            }
        } else if (isLast) {
            // Not a folder, try to find as note
            const noteResult = await db
                .select()
                .from(note)
                .where(
                    and(
                        eq(note.userId, user.id),
                        isNull(note.date),
                        eq(note.slug, segment),
                        currentFolder ? eq(note.folderId, currentFolder.id) : isNull(note.folderId)
                    )
                )
                .limit(1);

            if (noteResult[0]) {
                return { type: "note", note: noteResult[0], parentFolder: currentFolder };
            }

            return { type: "not_found" };
        } else {
            // Can't continue - segment not found
            return { type: "not_found" };
        }
    }

    return { type: "not_found" };
}

// ============ Get All Folders ============

export async function getAllFolders(): Promise<NoteFolder[]> {
    const user = await getUser();

    const folders = await db
        .select()
        .from(noteFolder)
        .where(eq(noteFolder.userId, user.id))
        .orderBy(asc(noteFolder.name));

    return folders;
}

// ============ Folder Item Counts ============

export async function getFolderItemCounts(folderIds: string[]): Promise<Record<string, number>> {
    if (folderIds.length === 0) return {};

    const user = await getUser();
    const counts: Record<string, number> = {};

    // Initialize all counts to 0
    for (const id of folderIds) {
        counts[id] = 0;
    }

    // Count child folders for each folder
    for (const folderId of folderIds) {
        const [folderCount, noteCount] = await Promise.all([
            db
                .select({ count: count() })
                .from(noteFolder)
                .where(and(eq(noteFolder.userId, user.id), eq(noteFolder.parentId, folderId))),
            db
                .select({ count: count() })
                .from(note)
                .where(
                    and(eq(note.userId, user.id), isNull(note.date), eq(note.folderId, folderId))
                )
        ]);

        counts[folderId] = (folderCount[0]?.count ?? 0) + (noteCount[0]?.count ?? 0);
    }

    return counts;
}

// ============ Utility Exports ============

export async function checkNameAvailable(
    name: string,
    folderId: string | null,
    excludeId?: string
): Promise<boolean> {
    const user = await getUser();
    const slug = generateSlug(name);
    return isSlugAvailable(user.id, slug, folderId, excludeId);
}
