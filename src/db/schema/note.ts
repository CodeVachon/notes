import { pgTable, text, timestamp } from "drizzle-orm/pg-core";
import { user } from "./user";

export const note = pgTable("note", {
    id: text("id").primaryKey(),
    userId: text("user_id")
        .notNull()
        .references(() => user.id, { onDelete: "cascade" }),
    date: text("date").notNull(), // YYYY-MM-DD format
    title: text("title").notNull(),
    content: text("content").notNull().default(""), // HTML from Tiptap
    createdAt: timestamp("created_at").notNull().defaultNow(),
    updatedAt: timestamp("updated_at").notNull().defaultNow()
});

export type Note = typeof note.$inferSelect;
export type NewNote = typeof note.$inferInsert;
