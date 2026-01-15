import { test as setup, expect } from "@playwright/test";

const AUTH_FILE = "playwright/.auth/user.json";

// Test user credentials - create this user once before running tests
const TEST_USER = {
    name: "Test User",
    email: "test@example.com",
    password: "testpassword123"
};

setup("authenticate", async ({ page }) => {
    // First, try to sign up (will fail silently if user already exists)
    await page.goto("/sign-up");

    // Check if we're on the sign-up page (not redirected to notebook)
    if (page.url().includes("/sign-up")) {
        await page.fill('input[name="name"]', TEST_USER.name);
        await page.fill('input[name="email"]', TEST_USER.email);
        await page.fill('input[name="password"]', TEST_USER.password);
        await page.click('button[type="submit"]');

        // Wait for navigation - either to notebook (success) or stay on page (user exists)
        await page.waitForURL(/\/(notebook|sign-up)/, { timeout: 10000 });

        // If we're still on sign-up, the user likely already exists - go sign in
        if (page.url().includes("/sign-up")) {
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
