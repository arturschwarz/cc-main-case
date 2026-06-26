---
description: Review the current changes against the project rules
---

Review the current working changes (or the files named in `$ARGUMENTS` if given)
for this React Native / Expo project. Be rigorous but concise — report findings
ordered by severity, with `file:line` references and concrete fixes. Do not
restate code that is fine.

## Scope

1. Run `git diff` (and `git status`) to see what changed. If `$ARGUMENTS` names
   files/paths, focus there.
2. Read the relevant rule files before judging:
   - `.claude/rules/architecture.md`
   - `.claude/rules/react-native.md`
   - `.claude/rules/performance.md`
   - `.claude/rules/accessibility.md`
   - `.claude/rules/testing.md`

## Checklist

**Correctness**
- Logic bugs, unhandled error/loading/empty states, race conditions.
- Async: cancellation on unmount, debounce correctness, React Query keys
  uniquely identify their data.
- Pagination math (`skip`/`limit`/`total`), end-of-list handling.

**Architecture**
- Layer boundaries respected (`ui/` ⊥ `features/`; data fetching only in
  screens). No server data copied into local state.
- Detail screen navigates with `userId`, not a full object.
- No premature abstraction; no import cycles.

**React Native / TypeScript**
- `strict` honored — no `any`, no unexplained `@ts-ignore`/`!`.
- Styles via `StyleSheet`/theme tokens; no inline objects in hot paths.
- FlatList configured correctly (keyExtractor, pagination, refresh, empty).
- Reanimated worklets stay on the UI thread; Babel plugin present.

**Performance** (see performance.md)
- Memoized rows + stable callbacks; no inline closures in `renderItem`.
- Debounced search; sensible `staleTime`/`placeholderData`.

**Accessibility**
- Roles/labels/states on interactive elements; 44pt targets.
- Canonical `testID`s present and matching the accessibility.md table.

**Testing**
- New behavior has unit/integration tests; mocks centralized.
- Tests query by role/label where possible; deterministic (no real sleeps).

**Docs**
- README updated for any new tradeoff (architecture, data fetching, search,
  performance).

## Output

For each finding: `severity (blocker | should-fix | nit) — file:line — problem
— suggested fix`. End with a short verdict: is this ready to merge, and the top
1–3 things to address first. Then offer to run `npm run typecheck && npm run
lint && npm test` if not already green.
