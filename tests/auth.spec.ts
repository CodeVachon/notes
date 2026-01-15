import { test, expect } from "@playwright/test";

test.describe("Authentication", () => {
    test("sign-in page shows email and GitHub options", async ({ page }) => {
        // Clear auth state for this test
        await page.context().clearCookies();

        await page.goto("/sign-in");

        // Check for email/password form
        await expect(page.locator('input[name="email"]')).toBeVisible();
        await expect(page.locator('input[name="password"]')).toBeVisible();
        await expect(page.locator('button[type="submit"]')).toContainText("Sign in");

        // Check for GitHub OAuth button
        await expect(page.getByRole("button", { name: /GitHub/i })).toBeVisible();

        // Check for "or continue with" divider
        await expect(page.getByText("or continue with")).toBeVisible();

        // Check for sign-up link
        await expect(page.getByRole("link", { name: "Sign up" })).toBeVisible();
    });

    test("sign-up page shows registration form", async ({ page }) => {
        // Clear auth state for this test
        await page.context().clearCookies();

        await page.goto("/sign-up");

        // Check for registration form fields
        await expect(page.locator('input[name="name"]')).toBeVisible();
        await expect(page.locator('input[name="email"]')).toBeVisible();
        await expect(page.locator('input[name="password"]')).toBeVisible();
        await expect(page.locator('button[type="submit"]')).toContainText("Create account");

        // Check for sign-in link
        await expect(page.getByRole("link", { name: "Sign in" })).toBeVisible();
    });

    test("shows error for invalid credentials", async ({ page }) => {
        // Clear auth state for this test
        await page.context().clearCookies();

        await page.goto("/sign-in");

        await page.fill('input[name="email"]', "nonexistent@example.com");
        await page.fill('input[name="password"]', "wrongpassword");
        await page.click('button[type="submit"]');

        // Should show an error message
        await expect(page.locator('[data-slot="field-error"]')).toBeVisible({ timeout: 10000 });
    });

    test("password must be at least 8 characters", async ({ page }) => {
        // Clear auth state for this test
        await page.context().clearCookies();

        await page.goto("/sign-up");

        // Fill form with short password
        await page.fill('input[name="name"]', "Test");
        await page.fill('input[name="email"]', "short@example.com");
        await page.fill('input[name="password"]', "short");

        // HTML5 validation should prevent submission
        const passwordInput = page.locator('input[name="password"]');
        await expect(passwordInput).toHaveAttribute("minlength", "8");
    });
});
