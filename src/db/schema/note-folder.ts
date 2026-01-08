import { pgTable, text, timestamp, integer, uniqueIndex } from "drizzle-orm/pg-core";
import { user } from "./user";

// Note folder table for organizing generic notes
export const noteFolder = pgTable(
    "note_folder",
    {
        id: text("id").primaryKey(),
        userId: text("user_id")
            .notNull()
            .references(() => user.id, { onDelete: "cascade" }),
        name: text("name").notNull(),
        slug: text("slug").notNull(), // URL-safe name
        parentId: text("parent_id"), // Self-reference added via SQL for restrict behavior
        sortOrder: integer("sort_order").notNull().default(0),
        createdAt: timestamp("created_at").notNull().defaultNow(),
        updatedAt: timestamp("updated_at").notNull().defaultNow()
    },
    (table) => ({
        // Unique folder slug within same parent for same user
        userParentSlugUnique: uniqueIndex("user_parent_folder_slug_unique").on(
            table.userId,
            table.parentId,
            table.slug
        )
    })
);

export type NoteFolder = typeof noteFolder.$inferSelect;
export type NewNoteFolder = typeof noteFolder.$inferInsert;
