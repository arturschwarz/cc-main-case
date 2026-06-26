# CLAUDE.md

Guidance for Claude Code when working in this repository.

## Project

**Users Directory** — a React Native (Expo) app that lists users from the
[DummyJSON Users API](https://dummyjson.com/docs/users), with search, a detail
screen, a Reanimated animation, a small design system, and unit/integration +
E2E tests.

This is a recruiting take-home assignment. The grading criteria are: React
Native fundamentals, scalability/performance, reusable component design,
testing depth, and clear documentation of tradeoffs. **Engineering judgment and
clarity are weighted as heavily as raw functionality** — favour readable,
well-factored code over clever code, and document non-obvious decisions.

## Tech stack

- **Expo** (managed workflow with a **dev client** — required for Detox)
- **TypeScript** (strict mode, no `any` in committed code)
- **React Navigation** — native stack
- **TanStack Query (React Query)** — data fetching, caching, pagination
- **react-native-reanimated** — all animations
- **Jest + React Native Testing Library** — unit/integration
- **MSW** (or fetch mocks) — network mocking in tests
- **Detox** — E2E

Target both **Android and iOS**. Do not introduce platform-only code paths
unless a feature genuinely requires it, and isolate them behind
`Platform.select` / `.ios.tsx` / `.android.tsx` when you do.

## Repository layout

```
src/
  app/              Navigation container, stack navigator, route types
  features/
    users/
      api/          Endpoint functions + query keys/hooks (useUsers, useUser)
      components/   Feature-specific composites (UserListItem, UserDetailHeader)
      screens/      HomeScreen, UserDetailScreen
      types/        User domain types
  ui/               Design system — generic, app-agnostic
    components/      Button, Text, Card, Input, Avatar, ...
    theme/          static tokens (colors, spacing, typography, radii) — light-only
  lib/              apiClient, queryClient, env, shared utilities
  test/             render helpers, server (MSW), fixtures
e2e/                Detox specs + config
```

**Dependency rule:** `ui/` never imports from `features/`. `features/` may
import from `ui/` and `lib/`. Keep the design system pure and reusable.

## Commands

> The app is not scaffolded yet. Once `package.json` exists, these are the
> canonical scripts — keep them in sync with `package.json`.

```bash
# Run
npx expo start                  # dev server
npx expo run:android            # build + run dev client on Android
npx expo run:ios                # build + run dev client on iOS

# Quality
npm run lint                    # eslint
npm run typecheck               # tsc --noEmit
npm test                        # jest
npm test -- --watch             # jest watch

# E2E (Detox)
npm run e2e:build               # detox build
npm run e2e:test                # detox test
```

## Working agreements

- **Read the rules.** Detailed conventions live in `.claude/rules/`. Consult the
  relevant file before writing code:
  - `architecture.md` — module boundaries, data flow, state ownership
  - `react-native.md` — RN/Expo idioms, navigation, lists, networking
  - `performance.md` — list virtualization, memoization, re-render hygiene
  - `accessibility.md` — labels, roles, hit targets, testIDs
  - `testing.md` — what/how to test, mocking, Detox flow
- **Plan before large changes.** Use the `planner` agent for multi-file features,
  `implementer` to build, and `reviewer` (or `/review`) before considering work
  done.
- **TypeScript is strict.** No `any`, no non-null `!` to silence the compiler,
  no `@ts-ignore` without a one-line justification comment.
- **Tests ship with features.** A feature is not done until it has the tests
  described in `testing.md` and `npm run typecheck && npm run lint && npm test`
  all pass.
- **Every interactive/important element gets a stable `testID`** so Detox and
  RNTL can target it. See `accessibility.md`.
- **Document tradeoffs in the README**, not just in code. The assignment grades
  this explicitly (architecture, data fetching, search approach, scalability).
- **Don't commit secrets.** The DummyJSON base URL goes through `lib/env`.

## Definition of done

1. `npm run typecheck` — clean
2. `npm run lint` — clean
3. `npm test` — green, covering the targets in `testing.md`
4. Detox flow runs (or is documented as runnable with exact steps)
5. README updated with any new decisions/tradeoffs
6. Reviewed via `/review` or the `reviewer` agent

## Agent skills

### Issue tracker

No issue tracker is used for this repo. Issue-tracking skills (`triage`,
`to-issues`, `qa`) should no-op rather than create issues. See
`docs/agents/issue-tracker.md`.

### Triage labels

Not applicable — no issue tracker, so triage is not run. See
`docs/agents/triage-labels.md`.

### Domain docs

Single-context: one `CONTEXT.md` + `docs/adr/` at the repo root. See
`docs/agents/domain.md`.
