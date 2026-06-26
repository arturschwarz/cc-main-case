import { QueryClient } from '@tanstack/react-query';

/**
 * Shared React Query client. Tuned so navigating back to Home reuses cached
 * data instead of refetching, while still recovering from transient failures.
 *
 * - `staleTime` 60s: list/detail data stays fresh on quick back-navigation.
 * - `gcTime` 5m: cached pages survive long enough to render instantly on return.
 * - `retry` 2: ride out flaky networks without hammering the API.
 * - `refetchOnWindowFocus` false: mobile apps don't have a meaningful "window
 *   focus"; avoid surprise refetches.
 */
export const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      staleTime: 60_000,
      gcTime: 300_000,
      retry: 2,
      refetchOnWindowFocus: false,
    },
  },
});
