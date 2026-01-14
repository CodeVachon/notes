"use server";

import { headers } from "next/headers";
import { sql } from "drizzle-orm";
import { db } from "@/db";
import { auth } from "@/lib/auth";

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

export type SearchResultType = "note" | "todo";

export interface SearchResult {
    id: string;
    type: SearchResultType;
    title: string;
    preview: string;
    date: string | null;
    score: number;
    matchedTags: string[];
}

export async function search(query: string, limit = 20): Promise<SearchResult[]> {
    const user = await getUser();

    const trimmedQuery = query.trim().toLowerCase();
    if (!trimmedQuery || trimmedQuery.length < 2) {
        return [];
    }

    // Use pg_trgm similarity for fuzzy matching with weighted scoring
    // Tags: 3x, Title: 2x, Content: 1x
    const results = await db.execute<{
        id: string;
        type: string;
        title: string;
        preview: string;
        date: string | null;
        score: number;
        matched_tags: string[] | null;
    }>(sql`
        WITH tag_matches AS (
            SELECT DISTINCT
                tm.note_id,
                tm.todo_id,
                t.name AS tag_name,
                similarity(t.name, ${trimmedQuery}) AS tag_similarity
            FROM tag t
            JOIN tag_mention tm ON t.id = tm.tag_id
            WHERE t.user_id = ${user.id}
              AND similarity(t.name, ${trimmedQuery}) > 0.1
        )
        SELECT * FROM (
            SELECT
                n.id,
                'note'::text AS type,
                n.title,
                LEFT(regexp_replace(n.content, '<[^>]*>', '', 'g'), 200) AS preview,
                n.date,
                GREATEST(
                    COALESCE(MAX(tm.tag_similarity) * 3.0, 0) +
                    similarity(n.title, ${trimmedQuery}) * 2.0 +
                    similarity(regexp_replace(n.content, '<[^>]*>', '', 'g'), ${trimmedQuery}) * 1.0,
                    0.0
                ) AS score,
                array_agg(DISTINCT tm.tag_name) FILTER (WHERE tm.tag_name IS NOT NULL) AS matched_tags
            FROM note n
            LEFT JOIN tag_matches tm ON tm.note_id = n.id
            WHERE n.user_id = ${user.id}
              AND (
                similarity(n.title, ${trimmedQuery}) > 0.1 OR
                similarity(regexp_replace(n.content, '<[^>]*>', '', 'g'), ${trimmedQuery}) > 0.05 OR
                EXISTS (SELECT 1 FROM tag_matches tm2 WHERE tm2.note_id = n.id)
              )
            GROUP BY n.id

            UNION ALL

            SELECT
                t.id,
                'todo'::text AS type,
                t.title,
                LEFT(COALESCE(t.description, ''), 200) AS preview,
                t.date,
                GREATEST(
                    COALESCE(MAX(tm.tag_similarity) * 3.0, 0) +
                    similarity(t.title, ${trimmedQuery}) * 2.0 +
                    similarity(COALESCE(t.description, ''), ${trimmedQuery}) * 1.0,
                    0.0
                ) AS score,
                array_agg(DISTINCT tm.tag_name) FILTER (WHERE tm.tag_name IS NOT NULL) AS matched_tags
            FROM todo t
            LEFT JOIN tag_matches tm ON tm.todo_id = t.id
            WHERE t.user_id = ${user.id}
              AND (
                similarity(t.title, ${trimmedQuery}) > 0.1 OR
                similarity(COALESCE(t.description, ''), ${trimmedQuery}) > 0.05 OR
                EXISTS (SELECT 1 FROM tag_matches tm2 WHERE tm2.todo_id = t.id)
              )
            GROUP BY t.id
        ) combined
        WHERE score > 0.1
        ORDER BY score DESC
        LIMIT ${limit}
    `);

    // db.execute returns the rows directly as an array
    return (
        results as unknown as Array<{
            id: string;
            type: string;
            title: string;
            preview: string;
            date: string | null;
            score: number;
            matched_tags: string[] | null;
        }>
    ).map((row) => ({
        id: row.id,
        type: row.type as SearchResultType,
        title: row.title,
        preview: row.preview ?? "",
        date: row.date,
        score: row.score,
        matchedTags: row.matched_tags ?? []
    }));
}
