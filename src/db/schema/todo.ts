import { pgTable, text, boolean, timestamp, AnyPgColumn } from "drizzle-orm/pg-core";
import { user } from "./user";

export const todoPriority = ["low", "medium", "high"] as const;
export type TodoPriority = (typeof todoPriority)[number];

export const todo = pgTable("todo", {
    id: text("id").primaryKey(),
    userId: text("user_id")
        .notNull()
        .references(() => user.id, { onDelete: "cascade" }),
    date: text("date").notNull(), // YYYY-MM-DD format
    title: text("title").notNull(),
    description: text("description"),
    priority: text("priority", { enum: todoPriority }).notNull().default("medium"),
    dueTime: text("due_time"), // HH:mm format
    completed: boolean("completed").notNull().default(false),
    completedAt: timestamp("completed_at"),
    sourceId: text("source_id").references((): AnyPgColumn => todo.id, { onDelete: "set null" }), // Reference to original todo if copied
    createdAt: timestamp("created_at").notNull().defaultNow(),
    updatedAt: timestamp("updated_at").notNull().defaultNow(),
    deletedAt: timestamp("deleted_at") // Soft delete - null means not deleted
});

export type Todo = typeof todo.$inferSelect;
export type NewTodo = typeof todo.$inferInsert;
