# Architecture rules

How code is organized and how data flows. The goal is a structure that scales
as the dataset and UI grow, with clear boundaries that make the code easy to
reason about and test.

## Layering

Three layers, with a strict one-directional dependency rule:

```
ui/   →  generic design system. Knows nothing about users or the API.
features/  →  domain logic + screens. Composes ui/ and lib/.
lib/  →  cross-cutting infra (api client, query client, env, utils).
app/  →  wiring: navigation + providers.
```

- `ui/` **must not** import from `features/` or `lib/`. It is a self-contained,
  reusable component library driven only by props and theme.
- `features/` may import from `ui/` and `lib/`.
- `lib/` may not import from `features/` or `ui/`.
- Enforce this with import boundaries (eslint `no-restricted-imports` or
  `eslint-plugin-import` paths) where practical.

## Feature module shape

Each feature is a self-contained folder. For `users/`:

- `api/` — pure functions that hit endpoints (`getUsers`, `getUser`,
  `searchUsers`) **and** the React Query hooks that wrap them (`useUsers`,
  `useUser`, `useUserSearch`). Query keys live here as a typed factory.
- `components/` — feature-specific composites built from `ui/` primitives
  (`UserListItem`, `UserDetailHeader`). Presentational; data comes via props.
- `screens/` — route-level components. Screens own data fetching (via hooks)
  and navigation; they pass data down to components.
- `types/` — domain types (`User`, `UsersResponse`). Mirror the API shape, then
  map to a domain type if the API shape is awkward.

## State ownership

Distinguish three kinds of state and place each deliberately:

1. **Server state** → React Query. All remote data (lists, detail, search) is
   cached, deduped, and invalidated through React Query. Never copy server data
   into `useState`.
2. **URL / navigation state** → React Navigation params. The detail screen
   receives a `userId` param (the stable identifier), not a full user object.
3. **Local UI state** → `useState`/`useReducer` in the nearest component
   (search input text, expanded/collapsed, scroll position).

No global client-state library (Redux/Zustand) is needed for this scope; adding
one would be over-engineering. If shared cross-screen UI state appears, prefer
React Context with a small, typed value.

## Data flow

```
Screen → useQuery hook → api function → apiClient → DummyJSON
       ← cached data    ←              ←
Screen → passes data as props → feature component → ui primitive
```

- Screens are the only place that calls data hooks. Components stay
  presentational and prop-driven so they are trivial to test and reuse.
- The detail screen fetches by **stable id** (`/users/{id}`); it may show
  cached list data instantly via `initialData`/`placeholderData` while
  refetching the full record.

## Navigation

- A single native-stack navigator: `Home` → `UserDetail`.
- Route params are **typed** via a `RootStackParamList`. `UserDetail` takes
  `{ userId: number }` only.
- Keep navigation types in `app/` and export them for use in screens.

## Configuration & environment

- The API base URL lives in `lib/env.ts`, read from Expo config
  (`app.config.ts` `extra`) — not hard-coded in call sites.
- A single `apiClient` centralizes base URL, headers, timeout, and error
  normalization. See `react-native.md` for the networking contract.

## Error handling strategy

- `apiClient` throws a normalized `ApiError { status, message }`.
- React Query surfaces `isError`/`error`; screens render an error state with a
  retry that calls `refetch()`.
- Never swallow errors silently. Log in dev; show a user-facing recoverable
  state in production.

## Anti-patterns to avoid

- Business/data logic inside `ui/` components.
- Screens passing whole navigation objects deep into the tree (pass callbacks).
- Duplicating server data into local state.
- Barrel files that create import cycles — prefer explicit imports.
- Premature abstraction. Extract a shared component only after the second real
  use, and document the API.
