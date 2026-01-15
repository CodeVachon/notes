import { test, expect } from "@playwright/test";

// These tests run with the authenticated state from auth.setup.ts
test.describe("Notebook (Authenticated)", () => {
    test("can access notebook when authenticated", async ({ page }) => {
        await page.goto("/notebook");

        // Should not be redirected to sign-in (may include date subpath)
        await expect(page).toHaveURL(/.*notebook.*/);

        // Page should load without errors
        await expect(page.locator("body")).toBeVisible();
    });

    test("redirects to sign-in when not authenticated", async ({ page }) => {
        // Clear cookies to simulate unauthenticated state
        await page.context().clearCookies();

        await page.goto("/notebook");

        // Should be redirected to sign-in
        await expect(page).toHaveURL(/.*sign-in/);
    });
});
