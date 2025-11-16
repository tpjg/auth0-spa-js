import { Page } from '@playwright/test';

/**
 * Reset tests to initial state
 * Clears local storage and resets configuration
 * @param page Playwright page object
 */
export async function resetTests(page: Page) {
  await page.goto('http://127.0.0.1:3000');

  // Wait for Vue app to be ready (critical!)
  // The #loaded element appears when Vue has finished initializing
  // Note: Element is hidden, so we wait for 'attached' not 'visible'
  await page.waitForSelector('#loaded', { state: 'attached', timeout: 10000 });

  await page.click('#reset-config');
  await page.evaluate(() => window.localStorage.clear());

  // Wait for app to be ready again after reset
  await page.waitForSelector('#loaded', { state: 'attached', timeout: 10000 });

  await page.click('[data-cy=use-node-oidc-provider]');
  await page.click('#logout');

  // Final wait for app to stabilize after configuration changes
  await page.waitForSelector('#loaded', { state: 'attached', timeout: 10000 });
}

/**
 * Set a configuration switch/toggle
 * @param page Playwright page object
 * @param name The name of the switch (data-cy attribute value)
 * @param value true to enable, false to disable
 */
export async function setSwitch(page: Page, name: string, value: boolean) {
  // Get the label which has the data-cy attribute
  const label = page.locator(`[data-cy=switch-${name}]`);
  const forAttr = await label.getAttribute('for');

  if (!forAttr) {
    throw new Error(`Switch ${name} does not have a 'for' attribute`);
  }

  // Get the actual checkbox using the 'for' attribute
  const checkbox = page.locator(`#${forAttr}`);

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
 * @param page Playwright page object
 * @param scope The scope value to set
 */
export async function setScope(page: Page, scope: string) {
  await page.locator('[data-cy=scope]').clear();
  await page.locator('[data-cy=scope]').fill(scope);
}

/**
 * Wait for the application to be ready
 * Waits for the Vue app's #loaded indicator
 * @param page Playwright page object
 */
export async function whenReady(page: Page) {
  // Wait for Vue app to be ready - matches Cypress behavior
  // Element is hidden, so we wait for it to exist in DOM (attached)
  await page.waitForSelector('#loaded', { state: 'attached', timeout: 10000 });
  return page;
}

/**
 * Check if a value is within tolerance of expected value
 * Useful for timestamp comparisons that may have slight differences
 * @param actual The actual value
 * @param expected The expected value
 * @param tolerance The acceptable difference
 * @returns true if within tolerance, false otherwise
 */
export function tolerance(
  actual: number,
  expected: number,
  tolerance: number
): boolean {
  return Math.abs(actual - expected) <= tolerance;
}

/**
 * Get a locator by data-cy attribute
 * @param page Playwright page object
 * @param dataCy The data-cy attribute value
 * @returns Locator for the element
 */
export function get(page: Page, dataCy: string) {
  return page.locator(`[data-cy=${dataCy}]`);
}

/**
 * Check if URL should include a substring (case insensitive)
 * @param url The URL to check
 * @param expected The expected substring
 * @returns true if URL includes the substring
 */
export function shouldInclude(url: string, expected: string): boolean {
  return url.toLowerCase().includes(expected.toLowerCase());
}

/**
 * Clear all cookies (with Firefox compatibility)
 * @param page Playwright page object
 */
export async function clearAllCookies(page: Page) {
  const browserName = page.context().browser()?.browserType().name();

  if (browserName === 'firefox') {
    // Firefox-specific cookie clearing
    const cookies = await page.context().cookies();
    for (const cookie of cookies) {
      await page.context().clearCookies({ name: cookie.name });
    }
  } else {
    // Standard cookie clearing
    await page.context().clearCookies();
  }
}

/**
 * Get session storage item
 * @param page Playwright page object
 * @param key The session storage key
 * @returns The value or null if not found
 */
export async function getSessionStorageItem(
  page: Page,
  key: string
): Promise<string | null> {
  return await page.evaluate((k) => window.sessionStorage.getItem(k), key);
}

/**
 * Check if session storage has a key
 * @param page Playwright page object
 * @param key The session storage key
 * @returns true if key exists, false otherwise
 */
export async function sessionStorageHasKey(
  page: Page,
  key: string
): Promise<boolean> {
  const value = await getSessionStorageItem(page, key);
  return value !== null;
}

/**
 * Get local storage item
 * @param page Playwright page object
 * @param key The local storage key
 * @returns The value or null if not found
 */
export async function getLocalStorageItem(
  page: Page,
  key: string
): Promise<string | null> {
  return await page.evaluate((k) => window.localStorage.getItem(k), key);
}

/**
 * Find a cookie by name
 * @param page Playwright page object
 * @param name The cookie name
 * @returns The cookie or undefined if not found
 */
export async function findCookie(page: Page, name: string) {
  const cookies = await page.context().cookies();
  return cookies.find((c) => c.name === name);
}

/**
 * Check if a cookie exists
 * @param page Playwright page object
 * @param name The cookie name
 * @returns true if cookie exists, false otherwise
 */
export async function hasCookie(page: Page, name: string): Promise<boolean> {
  const cookie = await findCookie(page, name);
  return cookie !== undefined;
}
