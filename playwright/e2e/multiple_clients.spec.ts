import { test, expect } from '@playwright/test';
import { get, shouldInclude } from '../helpers/setup';

/**
 * Helper function to perform login for a specific client instance
 */
async function login(page: any, instanceId: number) {
  await page.locator(`[data-cy=client-login-${instanceId}]`).click();
  await page.locator('.login-card input[name=login]').clear();
  await page.locator('.login-card input[name=login]').fill('test');
  await page.locator('.login-card input[name=password]').clear();
  await page.locator('.login-card input[name=password]').fill('test');

  await page.click('.login-submit');
  // Click again for consent
  await page.click('.login-submit');
}

test.describe('using multiple clients in the app', () => {
  test.beforeEach(async ({ page }) => {
    // Navigate to multiple clients page
    await page.goto('http://127.0.0.1:3000/multiple_clients.html');

    // Logout first client and clear storage
    await page.locator('[data-cy=client-logout-1]').click();
    await page.evaluate(() => window.localStorage.clear());

    // Navigate again to reset state
    await page.goto('http://127.0.0.1:3000/multiple_clients.html');
  });

  test.afterEach(async ({ page }) => {
    // Clear cookies (Firefox compatibility)
    const browserName = page.context().browser()?.browserType().name();

    if (browserName === 'firefox') {
      const cookies = await page.context().cookies();
      for (const cookie of cookies) {
        await page.context().clearCookies({ name: cookie.name });
      }
    } else {
      await page.context().clearCookies();
    }
  });

  test('can log into just one client', async ({ page }) => {
    await page.waitForLoadState('networkidle');

    // Login to client 1 only
    await login(page, 1);

    // Verify only client 1 has a token
    const token1 = get(page, 'client-access-token-1');
    const token2 = get(page, 'client-access-token-2');
    const token3 = get(page, 'client-access-token-3');

    await expect(token1).not.toBeEmpty();
    await expect(token2).toBeEmpty();
    await expect(token3).toBeEmpty();

    // Try to get token for client 2 (should fail)
    await page.locator('[data-cy=client-token-2]').click();

    // Verify error for client 2
    const error2 = get(page, 'client-error-2');
    const errorText = await error2.textContent();
    expect(shouldInclude(errorText || '', 'requested scopes not granted')).toBe(
      true
    );

    // Reload and verify check session works
    await page.reload();
    await page.waitForLoadState('networkidle');

    // Client 1 should still have a token
    await expect(token1).not.toBeEmpty();
  });
});
