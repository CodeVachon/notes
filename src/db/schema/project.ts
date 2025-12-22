import { pgTable, text, boolean, timestamp, uniqueIndex } from "drizzle-orm/pg-core";
import { user } from "./user";
import { note } from "./note";
import { todo } from "./todo";
import { comment } from "./comment";

// Preset project colors
export const projectColors = [
    "red",
    "orange",
    "yellow",
    "green",
    "blue",
    "purple",
    "pink",
    "gray"
] as const;
export type ProjectColor = (typeof projectColors)[number];

// Project table
export const project = pgTable(
    "project",
    {
        id: text("id").primaryKey(),
        userId: text("user_id")
            .notNull()
            .references(() => user.id, { onDelete: "cascade" }),
        name: text("name").notNull(),
        description: text("description").default(""), // HTML from Tiptap
        color: text("color", { enum: projectColors }).notNull().default("blue"),
        emoji: text("emoji"), // Optional emoji icon
        showInSidebar: boolean("show_in_sidebar").notNull().default(false),
        createdAt: timestamp("created_at").notNull().defaultNow(),
        updatedAt: timestamp("updated_at").notNull().defaultNow()
    },
    (table) => ({
        userProjectNameUnique: uniqueIndex("user_project_name_unique").on(table.userId, table.name)
    })
);

export type Project = typeof project.$inferSelect;
export type NewProject = typeof project.$inferInsert;

// Junction table for many-to-many project assignments
export const projectAssignment = pgTable("project_assignment", {
    id: text("id").primaryKey(),
    projectId: text("project_id")
        .notNull()
        .references(() => project.id, { onDelete: "cascade" }),
    noteId: text("note_id").references(() => note.id, { onDelete: "cascade" }),
    todoId: text("todo_id").references(() => todo.id, { onDelete: "cascade" }),
    commentId: text("comment_id").references(() => comment.id, { onDelete: "cascade" }),
    createdAt: timestamp("created_at").notNull().defaultNow()
});

export type ProjectAssignment = typeof projectAssignment.$inferSelect;
export type NewProjectAssignment = typeof projectAssignment.$inferInsert;
