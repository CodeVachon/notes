"use server";

import { headers } from "next/headers";
import { revalidatePath } from "next/cache";
import { eq } from "drizzle-orm";
import { db } from "@/db";
import { userSettings, type TimeFormat } from "@/db/schema";
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

// Get user settings (create default if not exists)
export async function getUserSettings() {
    const user = await getUser();

    const existing = await db
        .select()
        .from(userSettings)
        .where(eq(userSettings.userId, user.id))
        .limit(1);

    if (existing[0]) {
        return existing[0];
    }

    // Create default settings
    const id = crypto.randomUUID();
    const result = await db
        .insert(userSettings)
        .values({
            id,
            userId: user.id,
            timeFormat: "12h",
            primaryColorL: null,
            primaryColorC: null,
            primaryColorH: null
        })
        .returning();

    return result[0];
}

// Update time format
export async function updateTimeFormat(timeFormat: TimeFormat) {
    const user = await getUser();

    // Ensure settings exist
    await getUserSettings();

    await db
        .update(userSettings)
        .set({ timeFormat, updatedAt: new Date() })
        .where(eq(userSettings.userId, user.id));

    revalidatePath("/settings");
    revalidatePath("/notebook");
}

// Update primary color
export async function updatePrimaryColor(color: { l: string; c: string; h: string } | null) {
    const user = await getUser();

    // Ensure settings exist
    await getUserSettings();

    await db
        .update(userSettings)
        .set({
            primaryColorL: color?.l ?? null,
            primaryColorC: color?.c ?? null,
            primaryColorH: color?.h ?? null,
            updatedAt: new Date()
        })
        .where(eq(userSettings.userId, user.id));

    revalidatePath("/settings");
    revalidatePath("/notebook");
}

// Reset primary color to default
export async function resetPrimaryColor() {
    return updatePrimaryColor(null);
}
