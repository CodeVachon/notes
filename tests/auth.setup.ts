import { test as setup, expect } from "@playwright/test";

const AUTH_FILE = "playwright/.auth/user.json";

// Test user credentials - global setup/teardown handles cleanup
const TEST_USER = {
    name: "Test User",
    email: "test@example.com",
    password: "testpassword123"
};

setup("authenticate", async ({ page }) => {
    // Try to sign up first (global-setup should have cleaned up any existing user)
    await page.goto("/sign-up");

    // Check if we're on the sign-up page (not redirected to notebook)
    if (page.url().includes("/sign-up")) {
        await page.fill('input[name="name"]', TEST_USER.name);
        await page.fill('input[name="email"]', TEST_USER.email);
        await page.fill('input[name="password"]', TEST_USER.password);
        await page.click('button[type="submit"]');

        // Wait for either navigation to notebook OR an error to appear
        await Promise.race([
            page.waitForURL(/\/notebook/, { timeout: 10000 }),
            page.waitForSelector('[data-slot="field-error"]', { timeout: 10000 })
        ]);

        // If there's an error (user exists), go to sign-in
        const hasError = await page.locator('[data-slot="field-error"]').isVisible();
        if (hasError || page.url().includes("/sign-up")) {
            await page.goto("/sign-in");
        }
    }

    // If we're not on the notebook, sign in
    if (!page.url().includes("/notebook")) {
        await page.goto("/sign-in");
        await page.fill('input[name="email"]', TEST_USER.email);
        await page.fill('input[name="password"]', TEST_USER.password);
        await page.click('button[type="submit"]');

        // Wait for successful navigation to notebook (includes date subpath like /notebook/2026-01-14)
        await page.waitForURL(/\/notebook/, { timeout: 10000, waitUntil: "domcontentloaded" });
    }

    // Verify we're authenticated
    await expect(page).toHaveURL(/\/notebook/);

    // Save the authenticated state
    await page.context().storageState({ path: AUTH_FILE });
});
