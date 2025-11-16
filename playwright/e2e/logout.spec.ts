import { test, expect } from '../fixtures/auth-fixture';

test.describe('logout', () => {
  test('works correctly', async ({ page, authHelper }) => {
    await page.goto('/');

    // Login first
    await authHelper.login();

    // Verify authenticated
    const authenticatedStatus = authHelper.getAuthenticatedStatus();
    await expect(authenticatedStatus).toContainText('true');

    // Logout
    await authHelper.logout();

    // Verify user profile is removed
    const userProfile = authHelper.getUser();
    await expect(userProfile).not.toBeVisible();

    // Verify no longer authenticated
    await expect(authenticatedStatus).toContainText('false');

    // Try to get token (should fail)
    await authHelper.getTokenSilently();

    // Verify error is shown
    const error = authHelper.getError();
    await expect(error).toBeVisible();
  });
});
