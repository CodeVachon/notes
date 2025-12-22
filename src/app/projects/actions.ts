"use server";

import { headers } from "next/headers";
import { revalidatePath } from "next/cache";
import { eq, and, sql, desc, asc, inArray } from "drizzle-orm";
import { db } from "@/db";
import {
    project,
    projectAssignment,
    note,
    todo,
    comment,
    type Project,
    type ProjectColor,
    type Note,
    type Todo,
    type Comment
} from "@/db/schema";
import { auth } from "@/lib/auth";

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

// ============ Project CRUD ============

export async function createProject(data: {
    name: string;
    description?: string;
    color: ProjectColor;
    emoji?: string;
    showInSidebar?: boolean;
}): Promise<Project> {
    const user = await getUser();
    const id = crypto.randomUUID();

    const [newProject] = await db
        .insert(project)
        .values({
            id,
            userId: user.id,
            name: data.name,
            description: data.description ?? "",
            color: data.color,
            emoji: data.emoji ?? null,
            showInSidebar: data.showInSidebar ?? false
        })
        .returning();

    revalidatePath("/projects");
    revalidatePath("/notebook");
    return newProject;
}

export async function updateProject(
    projectId: string,
    data: Partial<{
        name: string;
        description: string;
        color: ProjectColor;
        emoji: string | null;
        showInSidebar: boolean;
    }>
): Promise<Project | undefined> {
    const user = await getUser();

    const [updated] = await db
        .update(project)
        .set({ ...data, updatedAt: new Date() })
        .where(and(eq(project.id, projectId), eq(project.userId, user.id)))
        .returning();

    revalidatePath("/projects");
    revalidatePath(`/projects/${projectId}`);
    revalidatePath("/notebook");
    return updated;
}

export async function deleteProject(projectId: string): Promise<Project | undefined> {
    const user = await getUser();

    const [deleted] = await db
        .delete(project)
        .where(and(eq(project.id, projectId), eq(project.userId, user.id)))
        .returning();

    revalidatePath("/projects");
    revalidatePath("/notebook");
    return deleted;
}

// ============ Project Queries ============

// Get all projects with item counts
export async function getAllProjects(): Promise<Array<Project & { itemCount: number }>> {
    const user = await getUser();

    const result = await db
        .select({
            id: project.id,
            userId: project.userId,
            name: project.name,
            description: project.description,
            color: project.color,
            emoji: project.emoji,
            showInSidebar: project.showInSidebar,
            createdAt: project.createdAt,
            updatedAt: project.updatedAt,
            itemCount: sql<number>`count(${projectAssignment.id})::int`.as("item_count")
        })
        .from(project)
        .leftJoin(projectAssignment, eq(project.id, projectAssignment.projectId))
        .where(eq(project.userId, user.id))
        .groupBy(project.id)
        .orderBy(sql`lower(${project.name})`);

    return result;
}

// Get single project by ID
export async function getProjectById(projectId: string): Promise<Project | null> {
    const user = await getUser();

    const result = await db
        .select()
        .from(project)
        .where(and(eq(project.id, projectId), eq(project.userId, user.id)))
        .limit(1);

    return result[0] ?? null;
}

// Get projects flagged for sidebar
export async function getSidebarProjects(): Promise<Project[]> {
    const user = await getUser();

    return db
        .select()
        .from(project)
        .where(and(eq(project.userId, user.id), eq(project.showInSidebar, true)))
        .orderBy(sql`lower(${project.name})`);
}

// Get projects assigned to a specific item
export async function getProjectsForItem(
    entityType: "note" | "todo" | "comment",
    entityId: string
): Promise<Project[]> {
    const user = await getUser();

    const assignments = await db
        .select({ projectId: projectAssignment.projectId })
        .from(projectAssignment)
        .where(
            entityType === "note"
                ? eq(projectAssignment.noteId, entityId)
                : entityType === "todo"
                  ? eq(projectAssignment.todoId, entityId)
                  : eq(projectAssignment.commentId, entityId)
        );

    if (assignments.length === 0) return [];

    const projectIds = assignments.map((a) => a.projectId);

    return db
        .select()
        .from(project)
        .where(and(eq(project.userId, user.id), inArray(project.id, projectIds)))
        .orderBy(sql`lower(${project.name})`);
}

// ============ Project Assignment ============

// Sync project assignments for an item (replaces existing assignments)
export async function syncItemProjects(
    projectIds: string[],
    entityType: "note" | "todo" | "comment",
    entityId: string
): Promise<void> {
    // Clear existing assignments for this entity
    if (entityType === "note") {
        await db.delete(projectAssignment).where(eq(projectAssignment.noteId, entityId));
    } else if (entityType === "todo") {
        await db.delete(projectAssignment).where(eq(projectAssignment.todoId, entityId));
    } else {
        await db.delete(projectAssignment).where(eq(projectAssignment.commentId, entityId));
    }

    // Create new assignments
    for (const projectId of projectIds) {
        await db.insert(projectAssignment).values({
            id: crypto.randomUUID(),
            projectId,
            noteId: entityType === "note" ? entityId : null,
            todoId: entityType === "todo" ? entityId : null,
            commentId: entityType === "comment" ? entityId : null
        });
    }

    revalidatePath("/projects");
}

// ============ Batch Project Queries ============

// Get projects for multiple items at once (to avoid N+1 queries)
export async function getProjectsForItems(
    entityType: "note" | "todo",
    entityIds: string[]
): Promise<Record<string, Project[]>> {
    if (entityIds.length === 0) return {};

    const user = await getUser();

    // Get all assignments for these entities
    const assignments = await db
        .select()
        .from(projectAssignment)
        .where(
            entityType === "note"
                ? inArray(projectAssignment.noteId, entityIds)
                : inArray(projectAssignment.todoId, entityIds)
        );

    if (assignments.length === 0) return {};

    // Get unique project IDs
    const projectIds = [...new Set(assignments.map((a) => a.projectId))];

    // Fetch all projects
    const projects = await db
        .select()
        .from(project)
        .where(and(eq(project.userId, user.id), inArray(project.id, projectIds)));

    // Create lookup map
    const projectMap = new Map(projects.map((p) => [p.id, p]));

    // Build result record
    const result: Record<string, Project[]> = {};
    for (const assignment of assignments) {
        const entityId = entityType === "note" ? assignment.noteId : assignment.todoId;
        if (!entityId) continue;

        const projectRecord = projectMap.get(assignment.projectId);
        if (!projectRecord) continue;

        if (!result[entityId]) result[entityId] = [];
        result[entityId].push(projectRecord);
    }

    return result;
}

// ============ Project Items Query ============

export type ProjectItemsData = {
    notes: Note[];
    todos: Todo[];
    noteComments: Record<string, Comment[]>;
    todoComments: Record<string, Comment[]>;
    dates: string[];
};

// Get all items for a project (for /projects/[id] page)
export async function getProjectItems(projectId: string): Promise<ProjectItemsData | null> {
    const user = await getUser();

    // Verify project exists and belongs to user
    const projectRecord = await db
        .select()
        .from(project)
        .where(and(eq(project.id, projectId), eq(project.userId, user.id)))
        .limit(1);

    if (!projectRecord[0]) return null;

    // Get all assignments for this project
    const assignments = await db
        .select()
        .from(projectAssignment)
        .where(eq(projectAssignment.projectId, projectId));

    // Collect IDs
    const noteIds = assignments.filter((a) => a.noteId).map((a) => a.noteId!);
    const todoIds = assignments.filter((a) => a.todoId).map((a) => a.todoId!);

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
