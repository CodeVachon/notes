import { pgTable, text, timestamp, uniqueIndex } from "drizzle-orm/pg-core";
import { user } from "./user";

// Time format options
export const timeFormats = ["12h", "24h"] as const;
export type TimeFormat = (typeof timeFormats)[number];

// User settings table - one row per user
export const userSettings = pgTable(
    "user_settings",
    {
        id: text("id").primaryKey(),
        userId: text("user_id")
            .notNull()
            .references(() => user.id, { onDelete: "cascade" }),
        timeFormat: text("time_format", { enum: timeFormats }).notNull().default("12h"),
        // Store OKLch as individual components for precision
        primaryColorL: text("primary_color_l"), // Lightness: "0.71"
        primaryColorC: text("primary_color_c"), // Chroma: "0.13"
        primaryColorH: text("primary_color_h"), // Hue: "215"
        createdAt: timestamp("created_at").notNull().defaultNow(),
        updatedAt: timestamp("updated_at").notNull().defaultNow()
    },
    (table) => ({
        userSettingsUnique: uniqueIndex("user_settings_user_id_unique").on(table.userId)
    })
);

export type UserSettings = typeof userSettings.$inferSelect;
export type NewUserSettings = typeof userSettings.$inferInsert;

// Default primary color (dark mode): oklch(0.71 0.13 215)
export const DEFAULT_PRIMARY_COLOR = {
    l: "0.71",
    c: "0.13",
    h: "215"
};
