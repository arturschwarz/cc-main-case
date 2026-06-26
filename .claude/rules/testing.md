# Testing rules

Testing is graded explicitly. Aim for meaningful coverage of behavior, not line
count. Three layers: unit (design system), integration (screen behavior), and
E2E (Detox flow).

## Stack

- **Jest** with the `jest-expo` preset.
- **React Native Testing Library** (`@testing-library/react-native`) +
  `@testing-library/jest-native` matchers.
- **Network mocking:** prefer **MSW** (`msw`) with a Node server in
  `src/test/server.ts`, started/stopped in Jest setup. It mocks at the network
  boundary, so `apiClient` and React Query run for real. If MSW + RN setup
  proves fiddly, fall back to mocking `apiClient` functions — but document it.
- **Detox** for E2E.

## What to test (minimums from the assignment, plus our bar)

### Unit — design system (`ui/`)
- At least one reusable component, tested thoroughly. Cover:
  - renders children/label, variant styling, `disabled` state
  - `onPress` fires (and does **not** fire when disabled)
  - accessibility role/label present
- Good first targets: `Button` and `Input`.

### Integration — screen behavior (`features/`)
- At least one non-trivial behavior. Strong candidates:
  - **Home list**: renders users from a mocked response; shows loading → data;
    shows error + retry when the request fails; shows empty state.
  - **Search**: typing filters the list (debounce can be flushed with fake
    timers); clear resets to the full list.
- Render screens through a shared helper that wraps them in
  `QueryClientProvider`, `NavigationContainer`, and `SafeAreaProvider`.

### E2E — Detox flow (the required path)
1. Launch app → Home screen loads users.
2. Search → list updates.
3. Tap a user → Detail screen opens.
4. Interact with the animated element (e.g. scroll to collapse the header) and
   assert an observable result (header title visible / element toggled).

Keep E2E focused and runnable. Document exact run steps in the README.

## Conventions

- **Test from the user's perspective.** Query by accessibility role, label, or
  text first; use `testID` only when semantic queries aren't viable.
- **Stable testIDs** on key elements: list (`users-list`), each row
  (`user-row-{id}`), section header (`section-header-{letter}`), search input
  (`search-input`), clear button
  (`search-clear`), sort toggle (`sort-toggle`), detail screen container
  (`user-detail`), animated element
  (`collapsible-header`), detail scroll view (`detail-scroll`), detail compact
  title (`detail-compact-title`). Keep these in sync with `accessibility.md`.
- **Reset state between tests**: clear the React Query cache and MSW handlers in
  `afterEach`. Each test gets a fresh `QueryClient` (no retries, `gcTime: 0`).
- **Use a fresh QueryClient per test** with `retry: false` so error states are
  deterministic and fast.
- **Async assertions** use `findBy*` / `waitFor`, never arbitrary `sleep`.
- **Debounced search**: drive with `jest.useFakeTimers()` and advance timers
  rather than waiting real milliseconds.
- **Maintainable mocks**: centralize fixtures in `src/test/fixtures` and MSW
  handlers in `src/test/server.ts`. Override per-test with `server.use(...)` for
  error/empty cases. Don't scatter inline `fetch` mocks.
- **No snapshot-only tests** for logic. Snapshots are acceptable only for stable
  presentational primitives, and must be reviewed when they change.

## Layout

```
src/test/
  render.tsx        renderWithProviders() helper
  server.ts         MSW server + default handlers
  fixtures/         user / users-response sample data
e2e/
  starter.test.ts   the required flow
  jest.config.js    detox jest runner config
```

## Definition of done (tests)

- `npm test` green locally and in a clean install.
- The required E2E flow runs (or README documents exact, reproducible steps and
  why if it can't run in a given environment).
- New behavior ships with a test; bug fixes ship with a regression test.
