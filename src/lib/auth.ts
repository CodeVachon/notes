import { betterAuth } from "better-auth";
import { drizzleAdapter } from "better-auth/adapters/drizzle";
import { nextCookies } from "better-auth/next-js";
import { APIError } from "better-auth/api";
import { db } from "@/db";
import * as schema from "@/db/schema";

const ALLOWED_GITHUB_USERNAME = "codevachon";

export const auth = betterAuth({
    database: drizzleAdapter(db, {
        provider: "pg",
        schema: {
            ...schema
        }
    }),
    socialProviders: {
        github: {
            clientId: process.env.GITHUB_CLIENT_ID!,
            clientSecret: process.env.GITHUB_CLIENT_SECRET!
        }
    },
    session: {
        expiresIn: 60 * 60 * 24 * 7, // 7 days
        updateAge: 60 * 60 * 24, // 1 day
        cookieCache: {
            enabled: true,
            maxAge: 5 * 60 // 5 minutes
        }
    },
    databaseHooks: {
        account: {
            create: {
                before: async (account) => {
                    // Only allow the specific GitHub user
                    if (account.providerId === "github") {
                        if (account.accountId !== ALLOWED_GITHUB_USERNAME) {
                            throw new APIError("FORBIDDEN", {
                                message: "Access denied. This application is private."
                            });
                        }
                    }
                    return { data: account };
                }
            }
        }
    },
    plugins: [nextCookies()]
});

export type Session = typeof auth.$Infer.Session;
export type User = typeof auth.$Infer.Session.user;
