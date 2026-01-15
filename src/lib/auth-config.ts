/**
 * Authentication feature flags configuration.
 * All flags default to false (disabled) unless explicitly set to "true" in environment variables.
 * This allows production to have auth disabled by default while dev/testing can enable it.
 */

function envToBool(value: string | undefined): boolean {
    return value?.toLowerCase() === "true";
}

export const authConfig = {
    /** Whether the sign-in page is accessible */
    signInEnabled: envToBool(process.env.AUTH_ENABLE_SIGNIN),

    /** Whether the sign-up page is accessible */
    signUpEnabled: envToBool(process.env.AUTH_ENABLE_SIGNUP),

    /** Whether GitHub OAuth sign-in is enabled */
    githubEnabled: envToBool(process.env.AUTH_ENABLE_GITHUB),

    /** Whether email/password authentication is enabled */
    emailPasswordEnabled: envToBool(process.env.AUTH_ENABLE_EMAIL_PASSWORD)
} as const;

export type AuthConfig = typeof authConfig;
