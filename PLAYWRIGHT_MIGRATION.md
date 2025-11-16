# Playwright Migration Plan

## Executive Summary

This document outlines the complete migration from Cypress to Playwright for E2E testing in the auth0-spa-js SDK.

**Decision: Migrate to Playwright** (no dual maintenance)

**Rationale:**
- Native multi-browser support (Chromium, Firefox, WebKit/Safari)
- Superior reliability for OAuth/OIDC flows
- Better debugging tools (trace viewer)
- Excellent screenshot/video capabilities (better than Cypress)
- Modern TypeScript-first architecture
- Reduces/eliminates BrowserStack dependency

---

## Key Considerations for Auth0 SPA SDK

1. **Cross-browser testing** - Critical for an SDK used across diverse environments
2. **OAuth/OIDC flow testing** - Complex redirect flows, popup windows, iframe handling
3. **Multiple browser contexts** - Testing cookies, localStorage, sessionStorage
4. **Network interception** - Mocking/testing Auth0 API responses
5. **Mobile viewport testing** - SPAs run on mobile browsers
6. **CI/CD integration** - Must run reliably in pipelines
7. **Debugging capabilities** - OAuth flows are complex to debug
8. **Maintenance burden** - As an SDK maintainer, test maintenance time matters
9. **Cross-origin scenarios** - Testing CORS, third-party cookies, etc.

---

## Migration Phases

### Phase 1: Install and Configure Playwright (2-3 hours)

**Tasks:**
- [x] Save migration plan document
- [ ] Install Playwright dependencies
- [ ] Create Playwright configuration file
- [ ] Update package.json scripts
- [ ] Create directory structure

**Deliverables:**
- `playwright.config.ts` - Multi-browser configuration
- Updated `package.json` with new test scripts
- Directory structure: `playwright/e2e`, `playwright/fixtures`, `playwright/helpers`

---

### Phase 2: Create Helper Utilities and Fixtures (3-4 hours)

**Tasks:**
- [ ] Create `AuthHelper` class (login, logout, token operations)
- [ ] Create setup helpers (resetTests, setSwitch, whenReady, etc.)
- [ ] Create auth fixture with automatic setup/teardown
- [ ] Create mock response fixtures

**Deliverables:**
- `playwright/helpers/auth.ts` - Authentication helper methods
- `playwright/helpers/setup.ts` - Test setup utilities
- `playwright/fixtures/auth-fixture.ts` - Custom test fixture
- `playwright/fixtures/mock-responses.ts` - Mock API responses

---

### Phase 3: Migrate Existing Cypress Tests (4-6 hours)

**Test Migration Mapping:**

| Cypress Test | Playwright Test | Complexity |
|--------------|-----------------|------------|
| `loginWithRedirect.cy.js` | `loginWithRedirect.spec.ts` | Low |
| `handleRedirectCallback.cy.js` | `handleRedirectCallback.spec.ts` | Low |
| `getTokenSilently.cy.js` | `getTokenSilently.spec.ts` | Medium |
| `logout.cy.js` | `logout.spec.ts` | Low |
| `initialisation.cy.js` | `initialisation.spec.ts` | Low |
| `multiple_clients.cy.js` | `multiple_clients.spec.ts` | Medium |

**Tasks:**
- [ ] Migrate loginWithRedirect test
- [ ] Migrate handleRedirectCallback test
- [ ] Migrate getTokenSilently test
- [ ] Migrate logout test
- [ ] Migrate initialisation test
- [ ] Migrate multiple_clients test
- [ ] Verify all tests pass locally on all browsers

**Deliverables:**
- 6 migrated test files in `playwright/e2e/`
- All tests passing on Chromium, Firefox, WebKit

---

### Phase 4: Update CI/CD Configuration (2-3 hours)

**Tasks:**
- [ ] Add Playwright job to `.github/workflows/test.yml`
- [ ] Configure browser matrix (chromium, firefox, webkit)
- [ ] Setup artifact uploads (reports, traces, screenshots)
- [ ] Update BrowserStack workflow to run less frequently
- [ ] Test CI pipeline

**Deliverables:**
- Updated `.github/workflows/test.yml` with Playwright job
- Updated `.github/workflows/browserstack.yml` (optional/on-demand)
- CI running successfully with artifact uploads

---

### Phase 5: Add Enhanced Test Coverage (6-8 hours)

**New Test Categories:**

1. **Visual Regression Testing**
   - Home page snapshots
   - Login page snapshots
   - Post-authentication UI

2. **Network Interception Tests**
   - Token endpoint failures
   - Network error handling
   - Retry logic validation
   - Response validation

3. **Mobile-Specific Tests**
   - iPhone 12 viewport
   - Android viewport
   - Touch interactions
   - Mobile UI variations

4. **Performance Tests**
   - SDK load time budgets
   - Time to interactive
   - Bundle size validation

5. **Accessibility Tests** (optional)
   - WCAG 2.1 AA compliance
   - Keyboard navigation
   - Screen reader compatibility

**Deliverables:**
- Organized test structure under `playwright/e2e/`
- Additional 10-15 test scenarios
- Test coverage report

---

### Phase 6: Cleanup and Documentation (2-3 hours)

**Tasks:**
- [ ] Remove Cypress dependencies from package.json
- [ ] Delete `cypress/` directory
- [ ] Delete `cypress.config.js`
- [ ] Update README.md with Playwright instructions
- [ ] Create `PLAYWRIGHT.md` guide
- [ ] Update CONTRIBUTING.md
- [ ] Final verification

**Deliverables:**
- Clean repository (no Cypress remnants)
- Comprehensive documentation
- Developer guide for writing new tests

---

## Timeline and Effort Estimate

| Phase | Duration | Dependencies | Risk Level |
|-------|----------|--------------|------------|
| Phase 1: Install & Configure | 2-3 hours | None | Low |
| Phase 2: Create Helpers | 3-4 hours | Phase 1 | Low |
| Phase 3: Migrate Tests | 4-6 hours | Phase 2 | Medium |
| Phase 4: Update CI/CD | 2-3 hours | Phase 3 | Medium |
| Phase 5: Enhanced Coverage | 6-8 hours | Phase 3 | Low |
| Phase 6: Cleanup & Docs | 2-3 hours | Phase 4 | Low |
| **Total** | **19-27 hours** | | |

**Recommended Schedule:**
- **Week 1:** Phases 1-2 (Setup & Helpers)
- **Week 2:** Phase 3 (Migration)
- **Week 3:** Phase 4 (CI/CD)
- **Week 4:** Phase 5 (Enhanced Tests)
- **Week 5:** Phase 6 (Cleanup)

---

## Playwright Configuration Details

### Browser Coverage
- **Chromium** - Chrome, Edge, Brave
- **Firefox** - Firefox
- **WebKit** - Safari (desktop and mobile)
- **Mobile Chrome** - Pixel 5 emulation
- **Mobile Safari** - iPhone 12 emulation

### Key Features Enabled
- **Trace on first retry** - Detailed debugging info
- **Screenshots on failure** - Visual debugging
- **Videos on failure** - Full test replay
- **Parallel execution** - Fast CI builds
- **Auto-waiting** - Reduced flakiness
- **Network interception** - Mock API responses

---

## Success Criteria

- [x] Migration plan documented
- [ ] All 6 existing Cypress tests migrated and passing
- [ ] Tests pass on Chromium, Firefox, WebKit
- [ ] CI/CD runs Playwright tests successfully
- [ ] HTML reports generated and uploaded as artifacts
- [ ] Trace viewer available for debugging failures
- [ ] Test execution time < 5 minutes for full suite
- [ ] Documentation updated
- [ ] Team trained on Playwright basics
- [ ] BrowserStack usage reduced or eliminated

---

## Risk Mitigation

| Risk | Impact | Mitigation |
|------|--------|------------|
| Tests fail intermittently | High | Use Playwright's auto-wait, retries in CI |
| Safari behavior differs from WebKit | Medium | Keep BrowserStack for validation initially |
| Team unfamiliar with Playwright | Low | Pair programming, docs, Playwright's excellent docs |
| Migration takes longer than estimated | Medium | Keep Cypress until complete migration |
| CI costs increase | Low | Playwright is faster than Cypress typically |

---

## Resources

- [Playwright Documentation](https://playwright.dev/)
- [Playwright Test Runner](https://playwright.dev/docs/test-runners)
- [Migrating from Cypress](https://playwright.dev/docs/intro#migrating-from-cypress)
- [CI/CD Integration](https://playwright.dev/docs/ci)
- [Trace Viewer](https://playwright.dev/docs/trace-viewer)

---

## Notes

- **No dual maintenance**: We will NOT maintain both Cypress and Playwright
- **Screenshots/Videos**: Playwright has superior capabilities compared to Cypress
- **BrowserStack**: Initially keep for validation, phase out after confidence in WebKit
- **Commit strategy**: Regular intermediate commits during migration
