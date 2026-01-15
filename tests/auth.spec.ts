import { test, expect } from "@playwright/test";

test.describe("Authentication - Page Structure", () => {
    test("sign-in page shows email and GitHub options", async ({ page }) => {
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

    test("password field requires at least 8 characters", async ({ page }) => {
        await page.context().clearCookies();
        await page.goto("/sign-up");

        const passwordInput = page.locator('input[name="password"]');
        await expect(passwordInput).toHaveAttribute("minlength", "8");
    });
});

test.describe("Authentication - Sign In Errors", () => {
    test("shows error for invalid credentials", async ({ page }) => {
        await page.context().clearCookies();
        await page.goto("/sign-in");

        await page.fill('input[name="email"]', "nonexistent@example.com");
        await page.fill('input[name="password"]', "wrongpassword");
        await page.click('button[type="submit"]');

        // Should show an error message
        await expect(page.locator('[data-slot="field-error"]')).toBeVisible({ timeout: 10000 });
    });

    test("shows access denied error from URL parameter", async ({ page }) => {
        await page.context().clearCookies();

        // This simulates what happens when GitHub OAuth rejects a user
        await page.goto("/sign-in?error=access_denied");

        // Should show the access denied error message
        const errorElement = page.locator('[data-slot="field-error"]');
        await expect(errorElement).toBeVisible();
        await expect(errorElement).toContainText("Access denied");
    });

    test("shows forbidden error from URL parameter", async ({ page }) => {
        await page.context().clearCookies();

        // This simulates the FORBIDDEN error from GitHub username restriction
        await page.goto("/sign-in?error=forbidden");

        // Should show the access denied error message
        const errorElement = page.locator('[data-slot="field-error"]');
        await expect(errorElement).toBeVisible();
        await expect(errorElement).toContainText("Access denied");
    });

    test("shows generic error for unknown error codes", async ({ page }) => {
        await page.context().clearCookies();

        await page.goto("/sign-in?error=some_unknown_error");

        // Should show a generic error message
        const errorElement = page.locator('[data-slot="field-error"]');
        await expect(errorElement).toBeVisible();
        await expect(errorElement).toContainText("error");
    });
});

test.describe("Authentication - Sign Up Errors", () => {
    test("shows error when signing up with existing email", async ({ page }) => {
        await page.context().clearCookies();
        await page.goto("/sign-up");

        // Use the test user email that was created by auth.setup.ts
        await page.fill('input[name="name"]', "Another User");
        await page.fill('input[name="email"]', "test@example.com");
        await page.fill('input[name="password"]', "testpassword123");
        await page.click('button[type="submit"]');

        // Should show an error message about user already existing
        const errorElement = page.locator('[data-slot="field-error"]');
        await expect(errorElement).toBeVisible({ timeout: 10000 });
    });
});

test.describe("Authentication - Sign Out Flow", () => {
    test("can sign out from the user menu", async ({ page }) => {
        // This test uses the authenticated state from auth.setup.ts
        await page.goto("/notebook");

        // Wait for page to load and verify we're authenticated
        await expect(page).toHaveURL(/\/notebook/);

        // Find and click the user menu (contains the user's name/email)
        const userMenuTrigger = page.locator('[data-slot="dropdown-menu-trigger"]').first();
        await userMenuTrigger.click();

        // Click the sign out button
        const signOutButton = page.getByRole("menuitem", { name: /Sign out/i });
        await expect(signOutButton).toBeVisible();
        await signOutButton.click();

        // Should be redirected to sign-in page
        await expect(page).toHaveURL(/\/sign-in/, { timeout: 10000 });
    });

    test("cannot access protected routes after sign out", async ({ page }) => {
        // Start authenticated
        await page.goto("/notebook");
        await expect(page).toHaveURL(/\/notebook/);

        // Sign out via the user menu
        const userMenuTrigger = page.locator('[data-slot="dropdown-menu-trigger"]').first();
        await userMenuTrigger.click();

        const signOutButton = page.getByRole("menuitem", { name: /Sign out/i });
        await signOutButton.click();

        // Wait for redirect to sign-in
        await expect(page).toHaveURL(/\/sign-in/, { timeout: 10000 });

        // Try to access a protected route directly
        await page.goto("/notebook");

        // Should be redirected back to sign-in
        await expect(page).toHaveURL(/\/sign-in/);
    });
});

test.describe("Authentication - Complete Sign Up and Sign In Flow", () => {
    // This test involves multiple operations: sign-up, sign-out, sign-in
    test("can sign up a new user and sign in", async ({ page, context }) => {
        test.setTimeout(60000); // 60 second timeout for this multi-step test
        // Use a unique email with timestamp to avoid conflicts
        const uniqueEmail = `testflow-${Date.now()}@example.com`;

        // Clear cookies first
        await context.clearCookies();

        // Step 1: Sign up - navigate first, then clear storage
        await page.goto("/sign-up", { waitUntil: "networkidle" });

        // Clear any local/session storage after page loads
        await page.evaluate(() => {
            localStorage.clear();
            sessionStorage.clear();
        });

        await page.fill('input[name="name"]', "Flow Test User");
        await page.fill('input[name="email"]', uniqueEmail);
        await page.fill('input[name="password"]', "flowtest123");

        // Click and wait for the sign-up API response
        const [response] = await Promise.all([
            page.waitForResponse(
                (response) => response.url().includes("/api/auth/sign-up"),
                { timeout: 30000 }
            ),
            page.click('button[type="submit"]')
        ]);

        // Log response for debugging
        const responseStatus = response.status();
        const responseUrl = response.url();
        console.log(`Sign-up response: ${responseStatus} ${responseUrl}`);

        if (responseStatus >= 400) {
            const body = await response.text();
            throw new Error(`Sign-up failed with status ${responseStatus}: ${body}`);
        }

        // Wait for redirect to notebook (sign-up auto-signs in)
        await expect(page).toHaveURL(/\/notebook/, { timeout: 15000 });

        // Step 2: Sign out
        // Wait for the page to be fully loaded before clicking the menu
        await page.waitForLoadState("networkidle");

        const userMenuTrigger = page.locator('[data-slot="dropdown-menu-trigger"]').first();
        await expect(userMenuTrigger).toBeVisible({ timeout: 10000 });
        await userMenuTrigger.click();

        const signOutButton = page.getByRole("menuitem", { name: /Sign out/i });
        await expect(signOutButton).toBeVisible();
        await signOutButton.click();

        // Wait for sign-out to complete and redirect
        await expect(page).toHaveURL(/\/sign-in/, { timeout: 15000 });

        // Step 3: Sign back in with the same credentials
        await page.fill('input[name="email"]', uniqueEmail);
        await page.fill('input[name="password"]', "flowtest123");
        await page.click('button[type="submit"]');

        // Should be redirected to notebook
        await expect(page).toHaveURL(/\/notebook/, { timeout: 15000 });
    });
});
