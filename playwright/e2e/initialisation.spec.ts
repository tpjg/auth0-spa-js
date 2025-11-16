import { test, expect } from '../fixtures/auth-fixture';

test.describe('initialisation', () => {
  test('should expose a factory method and constructor', async ({
    page,
    authHelper,
  }) => {
    await page.goto('/');
    await authHelper.waitForReady();

    // Verify window.auth0 API is exposed
    const hasFactoryMethod = await page.evaluate(() => {
      return (
        typeof (window as any).auth0?.createAuth0Client === 'function'
      );
    });

    const hasConstructor = await page.evaluate(() => {
      return typeof (window as any).auth0?.Auth0Client === 'function';
    });

    // Assert both are functions
    expect(hasFactoryMethod).toBe(true);
    expect(hasConstructor).toBe(true);
  });
});
