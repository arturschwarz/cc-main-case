# React Native / Expo rules

Concrete RN and Expo conventions for this project. Read alongside
`performance.md` (lists, re-renders) and `accessibility.md`.

## Expo

- Managed workflow with a **dev client** (`expo-dev-client`). Detox needs a real
  build, so plain Expo Go is not sufficient for E2E.
- Use `app.config.ts` (typed) over `app.json` so we can inject `extra` (API base
  URL) and read it via `expo-constants` in `lib/env.ts`.
- Use Expo SDK packages over bare community ones when an Expo equivalent exists
  (`expo-image` for avatars, `expo-constants`, `expo-status-bar`). `expo-image`
  gives caching + better perf than `<Image>` for remote avatars.
- Pin the Expo SDK and let `expo install` pick compatible native dep versions —
  do not hand-bump versions of native modules.

## TypeScript

- `strict: true`. No `any` in committed code; use `unknown` + narrowing.
- Type API responses explicitly; don't infer domain types from `fetch`.
- Props are typed with an exported `interface`/`type`. Prefer discriminated
  unions over optional-boolean soup for component variants.
- Avoid `React.FC`; type the props parameter directly.

## Components

- Function components only. One component per file for screens and feature
  components; the design system may group tiny related primitives.
- Keep components presentational; lift data fetching to screens (see
  `architecture.md`).
- Styles: `StyleSheet.create` at module scope (never inline objects in render —
  they break memoization and re-render hygiene). Pull values from the theme
  tokens, not hard-coded numbers/colors.
- No magic numbers for spacing/color/radius/typography — use `ui/theme` tokens.

## Navigation (React Navigation)

- `@react-navigation/native` + `@react-navigation/native-stack` (native stack
  uses platform navigators — better perf and feel than JS stack).
- Wrap the app in `NavigationContainer` inside `app/`.
- Strongly type the stack with `RootStackParamList`; use `NativeStackScreenProps`
  for screen prop types. Pass the **userId**, not the user object.
- Configure headers via `screenOptions`/`options`; use a Reanimated collapsible
  header on the detail screen (the assignment's suggested animation).

## Lists (FlatList)

- Home uses `FlatList` (not `ScrollView` + map). Details in `performance.md`.
- Always provide a stable `keyExtractor` using the user `id`.
- Implement: `onEndReached` + `onEndReachedThreshold` for pagination,
  `refreshing`/`onRefresh` for pull-to-refresh, and `ListEmptyComponent`.
- Page size 20–50 (pick one constant, e.g. `PAGE_SIZE = 30`, and document it).
- Render loading (initial spinner / skeletons), error (with retry), empty, and
  end-of-list footer states explicitly.

## Networking

- Single `apiClient` in `lib/`:
  - Base URL from `lib/env`.
  - `AbortController` timeout (e.g. 10s).
  - Checks `res.ok`; throws normalized `ApiError { status, message }`.
  - Parses JSON with a typed return.
- Data access goes through React Query hooks:
  - List: `useInfiniteQuery` keyed by `['users', { limit }]`, using
    `skip`/`limit` and `total` from the response to compute the next page.
  - Detail: `useQuery(['user', id])`, with `placeholderData` from the list cache
    for instant render.
  - Search: see `## Search` below.
- Configure a shared `QueryClient` (sane `staleTime`, retry, refetch settings)
  in `lib/queryClient` and provide it in `app/`.

## Search

- Use the dedicated endpoint: `GET /users/search?q=<term>`.
- **Debounce** input (~300–400ms) so we don't fire a request per keystroke.
- Empty query → show the normal paginated list (don't call search with empty q).
- React Query key includes the debounced term: `['users', 'search', term]`.
  `keepPreviousData` avoids flicker while typing.
- Provide a clear/reset control that empties the field and returns to the list.
- Document the chosen approach (server-side search + debounce, why not
  client-side filter) in the README.

## Animations (Reanimated)

- `react-native-reanimated` for all animation. Add its Babel plugin
  (`react-native-reanimated/plugin`) **last** in `babel.config.js`.
- Prefer `useAnimatedScrollHandler` + `useAnimatedStyle` for the collapsible
  detail header (interpolate height/opacity from scroll offset). Runs on the UI
  thread — keep worklets pure and free of JS-thread calls.
- Animation must be tied to interaction and stay smooth (no layout thrash, no
  animating non-transform/opacity properties where avoidable).
- Expose a `testID` on the animated element and a way for E2E to observe the
  result (see `testing.md`).

## Platform parity

- Build for both iOS and Android; verify safe areas with
  `react-native-safe-area-context`.
- Use `Platform.select` for genuinely platform-specific values; isolate larger
  divergences in `.ios.tsx` / `.android.tsx` files.
- Respect platform conventions (header back behavior, ripple vs opacity on
  pressables) but keep the design system consistent.

## Images

- Use `expo-image` for remote avatars with a `placeholder` and `contentFit`.
  Provide a fallback for missing images (initials via the `Avatar` primitive).
