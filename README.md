# cypress-saucedemo-e2e

[![Cypress](https://github.com/ellaine22/cypress-saucedemo-e2e/actions/workflows/cypress.yml/badge.svg)](https://github.com/ellaine22/cypress-saucedemo-e2e/actions/workflows/cypress.yml)

UI and API tests written with Cypress, run against two public practice apps:

- **[SauceDemo](https://www.saucedemo.com)**: login, product sorting, cart and checkout
- **[Restful Booker](https://restful-booker.herokuapp.com)**: CRUD and auth checks on a REST API

## What's covered

| Area | Spec | Notes |
| --- | --- | --- |
| Login | `ui/login.cy.js` | happy path, locked out user, bad credentials, required fields, protected routes, logout |
| Inventory | `ui/inventory.cy.js` | all four sort orders, cart badge add/remove, persistence after reload, product detail |
| Checkout | `ui/checkout.cy.js` | full order, subtotal/tax/total math, form validation |
| Booking API | `api/booking.cy.js` | create, read, filter, PUT, PATCH, DELETE, 403 without token, bad credentials |

## Structure

```
cypress/
  config/       per-environment settings (base URLs, API credentials)
  e2e/
    api/        request-level tests, no browser UI
    ui/         browser tests
  fixtures/     users and request payloads
  pages/        page objects
  support/      custom commands (loginAs, getByTest, apiToken)
```

## Design decisions

- **Session caching.** `cy.loginAs()` uses `cy.session()`, so the UI login runs once per user and gets reused across specs. Only `login.cy.js` goes through the login form every time, because that's the thing it's testing.
- **`data-test` selectors only.** No CSS classes or text matching for locating elements, so styling changes don't break tests.
- **Page objects stay thin.** They expose elements and actions. The assertions live in the specs so it's obvious what each test checks.
- **Independent API tests.** Restful Booker is shared by everyone, so each test creates its own booking with a unique name instead of relying on existing ids.
- **Secrets vs. public config.** URLs and grep options go in `expose`. Credentials go in `env` and are read with `cy.env()`. `allowCypressEnv` is off, so nothing can read secrets synchronously.
- **Retries in CI only.** One retry in `run` mode absorbs network hiccups from the public sites. Interactive mode never retries, so flaky tests show up while you're writing them.

## Running locally

Requires Node 20+.

```bash
npm install
npm test              # everything, headless
npm run test:ui       # browser specs only
npm run test:api      # API specs only
npm run test:smoke    # tests tagged @smoke
npm run cy:open       # interactive runner
```

To point at a different environment, add `cypress/config/<name>.json` and run with `--expose target=<name>`. Credentials can be overridden without touching the file:

```bash
CYPRESS_apiUser=me CYPRESS_apiPassword=secret npm run test:api
```

## CI

GitHub Actions lints first, then runs the suite in Chrome and Firefox in parallel. It runs on every push and PR, plus nightly, since the target sites can change underneath the tests. Screenshots from failed runs are uploaded as build artifacts.
