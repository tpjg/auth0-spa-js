# Playwright E2E Tests

This directory contains end-to-end tests for the auth0-spa-js SDK using Playwright.

## Directory Structure

```
playwright/
├── e2e/          # E2E test files (.spec.ts)
├── fixtures/     # Test fixtures and custom test extensions
├── helpers/      # Helper utilities and page objects
└── README.md     # This file
```

## Running Tests

See the main project README.md for test execution commands.

### Quick Start

```bash
# Run all tests
npm run test:e2e

# Interactive UI mode (recommended for development)
npm run test:e2e:ui

# Run with visible browser
npm run test:e2e:headed

# Debug a specific test
npm run test:e2e:debug

# Run specific browser
npm run test:e2e:chromium
npm run test:e2e:firefox
npm run test:e2e:webkit
```

## Writing Tests

Tests should be placed in the `e2e/` directory and follow the naming convention `*.spec.ts`.

Example test structure:

```typescript
import { test, expect } from '../fixtures/auth-fixture';

test.describe('Feature Name', () => {
  test('should perform action', async ({ page, authHelper }) => {
    await page.goto('/');
    await authHelper.login();
    await expect(page.locator('[data-cy=profile]')).toBeVisible();
  });
});
```

## Helpers

Helper utilities are located in `helpers/` and provide common functionality:

- `auth.ts` - Authentication operations (login, logout, token operations)
- `setup.ts` - Test setup utilities (reset, configuration)

## Fixtures

Custom test fixtures are in `fixtures/` and provide:

- `auth-fixture.ts` - Extended test with authentication helpers
- Automatic test setup and teardown
- Mock API responses

## Browser Coverage

Tests run on multiple browsers:
- Chromium (Chrome, Edge)
- Firefox
- WebKit (Safari)
- Mobile Chrome (Pixel 5)
- Mobile Safari (iPhone 12)

## Best Practices

1. Use `data-cy` attributes for selectors (consistent with existing patterns)
2. Await all async operations
3. Use web-first assertions: `expect(locator).toBeVisible()`
4. Avoid hard-coded waits - use `waitForURL`, `waitForLoadState`
5. Keep tests independent - use fixtures for setup/teardown
6. Test across browsers locally before committing

## Debugging

1. **HTML Report**: `npm run test:e2e:report`
2. **Trace Viewer**: Check `playwright-report/` for trace files on failures
3. **Pause execution**: Add `await page.pause()` in tests
4. **Debug mode**: `npm run test:e2e:debug`

## Migration Notes

This test suite replaces the previous Cypress tests. Key differences:

- Multi-browser support out of the box (no BrowserStack needed for basic cross-browser testing)
- Better handling of OAuth flows and cross-origin scenarios
- Superior debugging with trace viewer
- Faster and more reliable execution
