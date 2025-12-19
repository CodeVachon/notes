import { pgTable, text, timestamp } from "drizzle-orm/pg-core";
import { user } from "./user";
import { todo } from "./todo";
import { note } from "./note";

export const comment = pgTable("comment", {
    id: text("id").primaryKey(),
    userId: text("user_id")
        .notNull()
        .references(() => user.id, { onDelete: "cascade" }),
    todoId: text("todo_id").references(() => todo.id, { onDelete: "cascade" }),
    noteId: text("note_id").references(() => note.id, { onDelete: "cascade" }),
    content: text("content").notNull(),
    createdAt: timestamp("created_at").notNull().defaultNow(),
    updatedAt: timestamp("updated_at").notNull().defaultNow()
});

export type Comment = typeof comment.$inferSelect;
export type NewComment = typeof comment.$inferInsert;
