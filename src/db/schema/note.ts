import { pgTable, text, timestamp, integer, uniqueIndex } from "drizzle-orm/pg-core";
import { user } from "./user";
import { noteFolder } from "./note-folder";

export const note = pgTable(
    "note",
    {
        id: text("id").primaryKey(),
        userId: text("user_id")
            .notNull()
            .references(() => user.id, { onDelete: "cascade" }),
        date: text("date"), // YYYY-MM-DD format, null for generic notes
        folderId: text("folder_id").references(() => noteFolder.id, { onDelete: "cascade" }),
        title: text("title").notNull(),
        slug: text("slug"), // URL-safe title for generic notes
        content: text("content").notNull().default(""), // HTML from Tiptap
        sortOrder: integer("sort_order").notNull().default(0),
        createdAt: timestamp("created_at").notNull().defaultNow(),
        updatedAt: timestamp("updated_at").notNull().defaultNow(),
        deletedAt: timestamp("deleted_at") // Soft delete - null means not deleted
    },
    (table) => ({
        // Unique note slug within same folder for same user (for generic notes)
        userFolderSlugUnique: uniqueIndex("user_folder_note_slug_unique").on(
            table.userId,
            table.folderId,
            table.slug
        )
    })
);

export type Note = typeof note.$inferSelect;
export type NewNote = typeof note.$inferInsert;
