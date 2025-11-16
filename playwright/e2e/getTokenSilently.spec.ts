import { test, expect } from '../fixtures/auth-fixture';
import { getLocalStorageItem } from '../helpers/setup';

test.describe('getTokenSilently', () => {
  test('returns an error when not logged in', async ({ page, authHelper }) => {
    await page.goto('/');
    await authHelper.waitForReady();

    // Try to get token without being logged in
    await authHelper.getTokenSilently();

    // Verify error exists and contains expected message
    const error = authHelper.getError();
    await expect(error).toBeVisible();
    await expect(error).toContainText('End-User authentication is required');
  });

  test('can use form post data to call the token endpoint', async ({
    page,
    authHelper,
  }) => {
    let tokenRequest: any;

    // Intercept token endpoint to check request
    await page.route('**/oauth/token', async (route) => {
      tokenRequest = route.request();
      await route.continue();
    });

    await page.goto('/');
    await authHelper.waitForReady();

    // Login and get token
    await authHelper.login();
    await authHelper.getTokenSilently();

    // Should have 2 tokens: 1 from handleRedirectCallback, 1 from getTokenSilently
    const accessTokens = authHelper.getAccessToken();
    await expect(accessTokens).toHaveCount(2);

    // No error should be present
    const error = authHelper.getError();
    await expect(error).not.toBeVisible();

    // Verify content-type header
    expect(tokenRequest.headers()['content-type']).toBe(
      'application/x-www-form-urlencoded'
    );
  });

  test.describe('when using an iframe', () => {
    test.describe('using an in-memory store', () => {
      test('gets a new access token', async ({ page, authHelper }) => {
        await page.goto('/');
        await authHelper.waitForReady();

        await authHelper.login();
        await authHelper.getTokenSilently();

        // Should have 2 tokens
        const accessTokens = authHelper.getAccessToken();
        await expect(accessTokens).toHaveCount(2);

        // No error
        const error = authHelper.getError();
        await expect(error).not.toBeVisible();
      });

      test('can get the access token after refreshing the page', async ({
        page,
        authHelper,
      }) => {
        await page.goto('/');
        await authHelper.waitForReady();

        await authHelper.login();
        await page.reload();
        await authHelper.getTokenSilently();

        // Should have 1 token
        const accessTokens = authHelper.getAccessToken();
        await expect(accessTokens).toHaveCount(1);

        // No error
        const error = authHelper.getError();
        await expect(error).not.toBeVisible();
      });
    });

    test.describe('using local storage', () => {
      test('can get the access token after refreshing the page', async ({
        page,
        authHelper,
      }) => {
        await page.goto('/');
        await authHelper.waitForReady();

        // Enable local storage
        await authHelper.setSwitch('local-storage', true);

        await authHelper.login();
        await page.reload();
        await authHelper.getTokenSilently();

        // Should have 1 token
        const accessTokens = authHelper.getAccessToken();
        await expect(accessTokens).toHaveCount(1);

        // Verify local storage has the key
        const storageValue = await getLocalStorageItem(
          page,
          '@@auth0spajs@@::testing::default::openid profile email'
        );
        expect(storageValue).not.toBeNull();

        // No error
        const error = authHelper.getError();
        await expect(error).not.toBeVisible();
      });
    });
  });

  test.describe('when using refresh tokens', () => {
    /**
     * Helper to parse form data from request body
     */
    const formDataToObject = (formData: string): Record<string, string> => {
      const queryParams = new URLSearchParams(formData);
      const parsedQuery: Record<string, string> = {};

      queryParams.forEach((val, key) => {
        parsedQuery[key] = val;
      });

      return parsedQuery;
    };

    test('retrieves an access token using a refresh token', async ({
      page,
      authHelper,
    }) => {
      let tokenRequestBody: string;

      // Intercept token endpoint
      await page.route('**/oauth/token', async (route) => {
        tokenRequestBody = route.request().postData() || '';
        await route.continue();
      });

      await page.goto('/');
      await authHelper.waitForReady();

      // Enable required switches
      await authHelper.setSwitch('local-storage', true);
      await authHelper.setSwitch('use-cache', false);
      await authHelper.setSwitch('refresh-tokens', true);

      await authHelper.login();

      // Should have 1 token initially
      let accessTokens = authHelper.getAccessToken();
      await expect(accessTokens).toHaveCount(1);

      // Get token silently (should use refresh token)
      await authHelper.getTokenSilently();

      // Should now have 2 tokens
      accessTokens = authHelper.getAccessToken();
      await expect(accessTokens).toHaveCount(2);

      // Verify it used refresh_token grant type
      const formData = formDataToObject(tokenRequestBody!);
      expect(formData.grant_type).toBe('refresh_token');
    });

    test('retrieves an access token for another audience using a refresh token', async ({
      page,
      authHelper,
    }) => {
      const tokenRequests: string[] = [];

      // Intercept token endpoint to capture all requests
      await page.route('**/oauth/token', async (route) => {
        const body = route.request().postData() || '';
        tokenRequests.push(body);
        await route.continue();
      });

      await page.goto('/');
      await authHelper.waitForReady();

      // Enable required switches
      await authHelper.setSwitch('local-storage', true);
      await authHelper.setSwitch('use-cache', false);
      await authHelper.setSwitch('refresh-tokens', true);
      await authHelper.setSwitch('refresh-token-fallback', true);

      await authHelper.login();

      // First getTokenSilently
      await authHelper.getTokenSilently();
      let accessTokens = authHelper.getAccessToken();
      await expect(accessTokens).toHaveCount(2);

      // Verify it used refresh_token
      let formData = formDataToObject(tokenRequests[tokenRequests.length - 1]);
      expect(formData.grant_type).toBe('refresh_token');

      // Get token for different audience (index 1)
      await authHelper.getTokenSilently(1);
      let accessTokens1 = authHelper.getAccessToken(1);
      await expect(accessTokens1).toHaveCount(1);

      // Should use authorization_code for new audience
      formData = formDataToObject(tokenRequests[tokenRequests.length - 1]);
      expect(formData.grant_type).toBe('authorization_code');

      // Get token again for same audience (should use refresh token)
      await authHelper.getTokenSilently(1);
      accessTokens1 = authHelper.getAccessToken(1);
      await expect(accessTokens1).toHaveCount(2);

      // Should use refresh_token now
      formData = formDataToObject(tokenRequests[tokenRequests.length - 1]);
      expect(formData.grant_type).toBe('refresh_token');
    });

    test.describe('with workerUrl', () => {
      const workerUrl = 'auth0-spa-js.worker.development.js';

      test('loads the hosted worker file', async ({ page, authHelper }) => {
        let workerLoaded = false;

        // Intercept worker file request
        await page.route(`**/${workerUrl}`, async (route) => {
          workerLoaded = true;
          await route.continue();
        });

        await page.goto('/');
        await authHelper.waitForReady();

        // Enable worker URL
        await authHelper.setSwitch('refresh-tokens', true);
        await authHelper.setSwitch('use-worker-url', true);

        // Wait a bit for the worker to load
        await page.waitForTimeout(1000);

        // Verify worker was loaded
        expect(workerLoaded).toBe(true);
      });

      test('retrieves tokens using the hosted worker file', async ({
        page,
        authHelper,
      }) => {
        const tokenRequests: Array<{
          referer: string | undefined;
          body: string;
        }> = [];

        // Intercept token endpoint
        await page.route('**/oauth/token', async (route) => {
          tokenRequests.push({
            referer: route.request().headers().referer,
            body: route.request().postData() || '',
          });
          await route.continue();
        });

        await page.goto('/');
        await authHelper.waitForReady();

        // Enable required switches
        await authHelper.setSwitch('refresh-tokens', true);
        await authHelper.setSwitch('use-worker-url', true);
        await authHelper.setSwitch('use-cache', false);

        await authHelper.login();

        // Should have 1 token
        let accessTokens = authHelper.getAccessToken();
        await expect(accessTokens).toHaveCount(1);

        // Verify first request (authorization_code from login)
        let request = tokenRequests[tokenRequests.length - 1];
        expect(request.referer).toContain(workerUrl);
        expect(request.body).toContain('grant_type=authorization_code');

        // Get token silently
        await authHelper.getTokenSilently();
        accessTokens = authHelper.getAccessToken();
        await expect(accessTokens).toHaveCount(2);

        // Verify second request (refresh_token)
        request = tokenRequests[tokenRequests.length - 1];
        expect(request.referer).toContain(workerUrl);
        expect(request.body).toContain('grant_type=refresh_token');
      });
    });
  });
});
