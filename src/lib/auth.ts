import { betterAuth } from "better-auth";
import { drizzleAdapter } from "better-auth/adapters/drizzle";
import { nextCookies } from "better-auth/next-js";
import { APIError } from "better-auth/api";
import { db } from "@/db";
import * as schema from "@/db/schema";

// Allowed GitHub username (case-insensitive)
const ALLOWED_GITHUB_USERNAME = process.env.ALLOWED_GITHUB_USERNAME;

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
            clientSecret: process.env.GITHUB_CLIENT_SECRET!,
            mapProfileToUser: (profile) => {
                // GitHub profile includes 'login' (username) which we validate here
                const githubUsername = (profile as { login?: string }).login;

                if (
                    !ALLOWED_GITHUB_USERNAME ||
                    githubUsername?.toLowerCase() !== ALLOWED_GITHUB_USERNAME.toLowerCase()
                ) {
                    throw new APIError("FORBIDDEN", {
                        message: "Access denied. This application is private."
                    });
                }

                // Return empty object to use default mapping
                return {};
            }
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
    plugins: [nextCookies()]
});

export type Session = typeof auth.$Infer.Session;
export type User = typeof auth.$Infer.Session.user;
