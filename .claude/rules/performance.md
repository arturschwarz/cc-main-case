# Performance rules

The assignment explicitly grades "attention to scalability and performance as
the dataset and UI complexity grow." Treat the list as if it could hold
thousands of rows.

## Lists (the hot path)

- Use `FlatList` (virtualized). Never `ScrollView` + `.map()` for the user list.
- **Stable `keyExtractor`** from the user `id` — never the array index.
- **Memoize rows.** Wrap `UserListItem` in `React.memo`; pass primitive props
  or stable references so memoization holds.
- **Stable callbacks.** `renderItem`, `onPress`, `onEndReached`, `keyExtractor`
  are wrapped in `useCallback`. Row press passes the `id`, with the handler
  reading it — avoid creating a new closure per row in render.
- **Pagination, not full load.** `useInfiniteQuery` with `PAGE_SIZE` (20–50);
  load the next page on `onEndReached` (threshold ~0.5). Stop when
  `skip + limit >= total`.
- Tune list props: `initialNumToRender`, `maxToRenderPerBatch`,
  `windowSize`. Set `getItemLayout` if row height is fixed — it skips async
  measurement.
- **Do NOT enable `removeClippedSubviews`.** On the New Architecture (Fabric) it
  crashes Android (`ReactClippingViewManager` `addViewAt: failed to insert
  view` / `IndexOutOfBoundsException`) when list contents churn — e.g. clearing
  the search term swaps the active query and rebuilds sections. Keep it `false`;
  virtualization already bounds mounted rows.
- Show a footer spinner while the next page loads; don't block the whole list.
- Consider `@shopify/flash-list` as a drop-in upgrade if FlatList scroll perf is
  insufficient — but FlatList tuned correctly is the expected baseline. Note the
  tradeoff in the README rather than swapping silently.

## Re-render hygiene

- No inline style objects or inline arrow functions in `renderItem` / frequently
  re-rendered components. Hoist styles to `StyleSheet.create`.
- Memoize derived data with `useMemo` only when the computation or downstream
  re-render is actually expensive — don't cargo-cult it.
- Keep React Query selectors narrow; subscribe components only to the slice they
  render so unrelated cache updates don't re-render them.
- Split state so a fast-changing value (search text) doesn't re-render the list
  on every keystroke before the debounce fires.

## Data fetching

- Configure `QueryClient` with a sensible `staleTime` so navigating back to Home
  doesn't refetch unnecessarily; rely on the cache.
- Use `placeholderData`/`initialData` to render the detail screen instantly from
  the list cache, then refetch the full record.
- Debounce search (~300ms) to cut request volume; `keepPreviousData` to avoid
  flicker. See `react-native.md`.
- Cancel in-flight requests on unmount/param change via `AbortController` in
  `apiClient` (React Query passes a signal).

## Animations

- Reanimated worklets run on the UI thread — keep them off the JS thread. Animate
  `transform`/`opacity` rather than layout properties to avoid reflow.
- Use `useAnimatedScrollHandler` for scroll-driven animation (collapsible
  header) instead of `onScroll` + `setState`, which thrashes the JS thread.

## Images

- `expo-image` for remote avatars (memory + disk cache, downsampling). Provide a
  lightweight placeholder/fallback so scrolling never blocks on network images.

## Measuring

- Validate with a release-ish build, not just dev (dev has overhead).
- Watch for: dropped frames while scrolling, jank during search typing, and
  unnecessary re-renders (React DevTools Profiler / `why-did-you-render` in dev
  only if needed).
- Document any perf decision and its tradeoff in the README.

## Don't over-optimize

- Don't add memoization, `getItemLayout`, or FlashList before there's a reason.
  Start with a correct, tuned FlatList; escalate only with evidence. Note what
  you'd do next under "what I'd improve with more time."
