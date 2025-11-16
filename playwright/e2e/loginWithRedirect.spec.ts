import { test, expect } from '../fixtures/auth-fixture';
import {
  shouldInclude,
  tolerance,
  sessionStorageHasKey,
  getSessionStorageItem,
  findCookie,
} from '../helpers/setup';

test.describe('loginWithRedirect', () => {
  test('can perform the login flow', async ({ page, authHelper }) => {
    // Navigate to app and wait for ready
    await page.goto('/');
    await authHelper.waitForReady();

    // Perform login without handling callback
    await authHelper.loginNoCallback();

    // Verify we're back at the app URL
    const url = page.url();
    expect(shouldInclude(url, 'http://127.0.0.1:3000')).toBe(true);

    // Wait for ready state
    await authHelper.waitForReady();

    // Get client ID to check session storage
    const clientId = await authHelper.getInputValue('client-id');
    const txnKey = `a0.spajs.txs.${clientId}`;

    // Verify transaction exists in session storage
    const txnExists = await sessionStorageHasKey(page, txnKey);
    expect(txnExists).toBe(true);

    // Handle redirect callback
    await authHelper.handleRedirectCallback();

    // Verify transaction is removed from session storage
    const txnExistsAfter = await sessionStorageHasKey(page, txnKey);
    expect(txnExistsAfter).toBe(false);
  });

  test('can perform the login flow with cookie transactions', async ({
    page,
    authHelper,
  }) => {
    // Navigate and wait for ready
    await page.goto('/');
    await authHelper.waitForReady();

    // Enable cookie transactions
    await authHelper.setSwitch('cookie-txns', true);

    // Calculate expected expiry (tomorrow)
    const tomorrowInSeconds = Math.floor(Date.now() / 1000) + 86400;

    // Perform login without callback
    await authHelper.loginNoCallback();

    // Verify we're back at the app URL
    const url = page.url();
    expect(shouldInclude(url, 'http://127.0.0.1:3000')).toBe(true);

    // Wait for ready
    await authHelper.waitForReady();

    // Get client ID
    const clientId = await authHelper.getInputValue('client-id');
    const cookieName = `a0.spajs.txs.${clientId}`;

    // Find the transaction cookie
    const txnCookie = await findCookie(page, cookieName);

    // Verify cookie exists
    expect(txnCookie).toBeDefined();

    // Verify cookie expiry is within 1 second of expected
    // This makes the test less brittle with timing differences
    expect(tolerance(txnCookie!.expires, tomorrowInSeconds, 1)).toBe(true);

    // Handle redirect callback
    await authHelper.handleRedirectCallback();

    // Verify cookie is removed
    const txnCookieAfter = await findCookie(page, cookieName);
    expect(txnCookieAfter).toBeUndefined();
  });
});
