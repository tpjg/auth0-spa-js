import { Page, expect } from '@playwright/test';

/**
 * Helper class for authentication operations in Playwright tests
 * Provides methods for login, logout, token operations, etc.
 */
export class AuthHelper {
  constructor(private page: Page) {}

  /**
   * Perform login flow without handling callback
   * Navigates to auth provider, fills credentials, and submits
   */
  async loginNoCallback() {
    // Ensure Vue app is ready before clicking
    // Element is hidden, so we wait for it to exist in DOM (attached)
    await this.page.waitForSelector('#loaded', { state: 'attached', timeout: 10000 });

    // Click login button and wait for navigation
    // The click triggers a redirect, so we need to wait for it
    await Promise.all([
      this.page.waitForURL(/authorize/, { timeout: 30000 }),
      this.page.click('#login_redirect')
    ]);

    // Fill credentials
    await this.page.locator('.login-card input[name=login]').clear();
    await this.page.locator('.login-card input[name=login]').fill('test');

    await this.page.locator('.login-card input[name=password]').clear();
    await this.page.locator('.login-card input[name=password]').fill('test');

    // Submit login form
    await this.page.click('.login-submit');

    // Click again to give consent (OIDC provider requirement)
    // This is a second button with the same class
    await this.page.click('.login-submit');
  }

  /**
   * Complete login flow with callback handling
   * Performs login and handles the redirect callback
   */
  async login() {
    await this.loginNoCallback();
    await this.handleRedirectCallback();
  }

  /**
   * Handle the redirect callback after login
   * Waits for the profile to be visible after callback
   */
  async handleRedirectCallback() {
    await this.page.click('[data-cy=handle-redirect-callback]');
    await expect(this.page.locator('[data-cy=profile]')).toBeVisible();
  }

  /**
   * Logout from the application
   * Handles OIDC provider logout confirmation if needed
   */
  async logout() {
    await this.page.click('[data-cy=logout]');

    // Handle OIDC provider logout confirmation
    const url = this.page.url();
    if (url.includes('/v2/logout')) {
      await this.page.click('button[name=logout]');
    }
  }

  /**
   * Check if user is authenticated
   * @returns Promise<boolean> - true if authenticated, false otherwise
   */
  async isAuthenticated(): Promise<boolean> {
    const authenticatedElement = this.page.locator('[data-cy=authenticated]');
    try {
      await authenticatedElement.waitFor({ state: 'visible', timeout: 5000 });
      return true;
    } catch {
      return false;
    }
  }

  /**
   * Get user profile locator
   * @returns Locator for the user profile element
   */
  getUser() {
    return this.page.locator('[data-cy=profile]');
  }

  /**
   * Get access token locator
   * @param index Optional index for multiple token scenarios
   * @returns Locator for the access token element
   */
  getAccessToken(index?: number) {
    const selector = index
      ? `[data-cy=access-token-${index}]`
      : '[data-cy=access-token]';
    return this.page.locator(selector);
  }

  /**
   * Trigger get token silently operation
   * @param index Optional index for multiple client scenarios
   */
  async getTokenSilently(index?: number) {
    const selector = index
      ? `[data-cy=get-token-${index}]`
      : `[data-cy=get-token]`;
    await this.page.click(selector);
  }

  /**
   * Get error message locator
   * @returns Locator for the error element
   */
  getError() {
    return this.page.locator('[data-cy=error]');
  }

  /**
   * Get the authenticated status locator
   * @returns Locator for the authenticated status element
   */
  getAuthenticatedStatus() {
    return this.page.locator('[data-cy=authenticated]');
  }

  /**
   * Set a configuration switch/toggle
   * @param name The name of the switch (data-cy attribute value)
   * @param value true to enable, false to disable
   */
  async setSwitch(name: string, value: boolean) {
    // Get the label which has the data-cy attribute
    const label = this.page.locator(`[data-cy=switch-${name}]`);
    const forAttr = await label.getAttribute('for');

    if (!forAttr) {
      throw new Error(`Switch ${name} does not have a 'for' attribute`);
    }

    // Get the actual checkbox using the 'for' attribute
    const checkbox = this.page.locator(`#${forAttr}`);

    // Check or uncheck based on value
    // Force is used because the checkbox might be covered by styling
    if (value) {
      await checkbox.check({ force: true });
    } else {
      await checkbox.uncheck({ force: true });
    }
  }

  /**
   * Set the scope input field
   * @param scope The scope value to set
   */
  async setScope(scope: string) {
    await this.page.locator('[data-cy=scope]').clear();
    await this.page.locator('[data-cy=scope]').fill(scope);
  }

  /**
   * Get a form input value by data-cy attribute
   * @param dataCy The data-cy attribute value
   * @returns The input value
   */
  async getInputValue(dataCy: string): Promise<string> {
    const locator = this.page.locator(`[data-cy=${dataCy}]`);
    return await locator.inputValue();
  }

  /**
   * Wait for the application to be ready
   * Waits for Vue app's #loaded indicator
   */
  async waitForReady() {
    // Element is hidden, so we wait for it to exist in DOM (attached)
    await this.page.waitForSelector('#loaded', { state: 'attached', timeout: 10000 });
  }
}
