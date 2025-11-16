import { test, expect } from '../fixtures/auth-fixture';

test.describe('handleRedirectCallback', () => {
  test('caches token and user', async ({ page, authHelper }) => {
    // Navigate to app
    await page.goto('/');

    // Perform login without handling callback
    await authHelper.loginNoCallback();

    // Handle the redirect callback
    await authHelper.handleRedirectCallback();

    // Verify user is authenticated
    const authenticatedStatus = authHelper.getAuthenticatedStatus();
    await expect(authenticatedStatus).toContainText('true');

    // Verify access token is cached (should have exactly 1)
    const accessTokens = authHelper.getAccessToken();
    await expect(accessTokens).toHaveCount(1);

    // Verify user profile is visible
    const userProfile = authHelper.getUser();
    await expect(userProfile).toBeVisible();
  });
});
