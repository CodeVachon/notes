import { pgTable, text, timestamp, uniqueIndex } from "drizzle-orm/pg-core";
import { user } from "./user";
import { note } from "./note";
import { todo } from "./todo";
import { comment } from "./comment";

// Normalized tag table - stores unique tag names per user
export const tag = pgTable(
    "tag",
    {
        id: text("id").primaryKey(),
        userId: text("user_id")
            .notNull()
            .references(() => user.id, { onDelete: "cascade" }),
        name: text("name").notNull(), // Lowercase, alphanumeric only
        createdAt: timestamp("created_at").notNull().defaultNow()
    },
    (table) => ({
        userTagUnique: uniqueIndex("user_tag_unique").on(table.userId, table.name)
    })
);

export type Tag = typeof tag.$inferSelect;
export type NewTag = typeof tag.$inferInsert;

// Junction table tracking where tags are mentioned
export const tagMention = pgTable("tag_mention", {
    id: text("id").primaryKey(),
    tagId: text("tag_id")
        .notNull()
        .references(() => tag.id, { onDelete: "cascade" }),
    noteId: text("note_id").references(() => note.id, { onDelete: "cascade" }),
    todoId: text("todo_id").references(() => todo.id, { onDelete: "cascade" }),
    commentId: text("comment_id").references(() => comment.id, { onDelete: "cascade" }),
    createdAt: timestamp("created_at").notNull().defaultNow()
});

export type TagMention = typeof tagMention.$inferSelect;
export type NewTagMention = typeof tagMention.$inferInsert;
