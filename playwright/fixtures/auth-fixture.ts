import { test as base } from '@playwright/test';
import { AuthHelper } from '../helpers/auth';
import { resetTests, clearAllCookies } from '../helpers/setup';

/**
 * Extended test fixtures for auth0-spa-js E2E tests
 * Provides automatic setup/teardown and authentication helpers
 */
type AuthFixtures = {
  authHelper: AuthHelper;
};

/**
 * Custom test with auth fixture
 * Automatically resets tests before each test and clears cookies after
 *
 * Usage:
 * ```typescript
 * import { test, expect } from '../fixtures/auth-fixture';
 *
 * test('should login successfully', async ({ page, authHelper }) => {
 *   await page.goto('/');
 *   await authHelper.login();
 *   await expect(authHelper.getUser()).toBeVisible();
 * });
 * ```
 */
export const test = base.extend<AuthFixtures>({
  authHelper: async ({ page }, use) => {
    // Setup: Reset tests before each test
    // This clears storage and resets configuration
    await resetTests(page);

    // Create and provide the helper to the test
    const authHelper = new AuthHelper(page);

    // Run the test with the authHelper
    await use(authHelper);

    // Teardown: Clear cookies after each test
    // This ensures clean state for the next test
    // Includes Firefox-specific handling
    await clearAllCookies(page);
  },
});

// Re-export expect from Playwright for convenience
export { expect } from '@playwright/test';
