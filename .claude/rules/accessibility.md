# Accessibility rules

Accessible components are also the most testable ones (RNTL and Detox query by
role/label). Good a11y is a senior signal and directly helps the test suite.

## Roles & labels

- Every interactive element has an appropriate `accessibilityRole`
  (`button`, `link`, `search`, `image`, `header`).
- Provide `accessibilityLabel` where the visible text is insufficient or absent
  (icon-only buttons, avatars). Avatars: `accessibilityLabel="{fullName}"`.
- Use `accessibilityState` for `disabled`, `selected`, `busy` (e.g. loading
  button), and `expanded` for the collapsible header.
- Group related content (a list row) so a screen reader reads it as one unit:
  set `accessible` on the row container with a composed label
  (`"{fullName}, {email}"`).

## Touch targets & feedback

- Minimum hit target **44×44 pt** (iOS HIG) / 48×48 dp (Android). Use
  `hitSlop` when the visual is smaller.
- Use `Pressable` with visible pressed feedback (opacity / Android ripple via
  `android_ripple`). Don't rely on color alone to convey state.

## Visuals

- Text contrast ≥ 4.5:1 against its background (theme tokens should already
  satisfy this — verify when adding colors).
- Respect dynamic type / `allowFontScaling` where reasonable; don't hard-cap
  font scaling.
- Don't encode meaning in color alone (error states need text/icon too).

## Motion

- The collapsible header and other animations should degrade gracefully. Check
  `AccessibilityInfo.isReduceMotionEnabled()` and reduce/disable non-essential
  motion when the user prefers reduced motion.

## States must be perceivable

- Loading: expose `accessibilityState={{ busy: true }}` or an
  `accessibilityLabel="Loading users"` on spinners.
- Error: the error message is real text (screen-reader readable), with a labeled
  retry button.
- Empty: a clear, readable empty message.

## testIDs (shared contract with testing.md)

`testID` is for automated tests, not a substitute for a11y props — add both.
Canonical testIDs:

| Element                 | testID                |
|-------------------------|-----------------------|
| User list (SectionList) | `users-list`          |
| List row                | `user-row-{id}`       |
| Section header          | `section-header-{letter}` |
| Search input            | `search-input`        |
| Clear search button     | `search-clear`        |
| Sort toggle             | `sort-toggle`         |
| Detail screen container | `user-detail`         |
| Collapsible header      | `collapsible-header`  |
| Detail scroll view      | `detail-scroll`       |
| Detail compact title    | `detail-compact-title`|
| Retry button            | `retry-button`        |
| Loading indicator       | `loading-indicator`   |
| Empty state             | `empty-state`         |

Keep this table authoritative; update it (and `testing.md`) when adding new
targeted elements.

## Design system responsibility

- a11y is built into `ui/` primitives, not bolted on per screen. `Button`
  defaults `accessibilityRole="button"` and wires `disabled` →
  `accessibilityState`. `Input` associates its label. `Avatar` requires/derives
  an `accessibilityLabel`. Consumers can override, but get accessible defaults
  for free.
