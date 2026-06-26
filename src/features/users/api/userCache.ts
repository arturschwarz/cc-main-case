import type { InfiniteData, QueryClient } from '@tanstack/react-query';

import type { User, UsersResponse } from '../types';
import { flattenUsers } from '../lib/flattenUsers';
import { userKeys } from './queryKeys';

/**
 * Find a User already cached in any list/search infinite query, to seed the
 * detail screen's placeholder for instant render. Owns the detail-placeholder
 * seam: scans the lists()/searches() prefixes only (never the detail entries,
 * which hold a bare User) and reads the page shape through `flattenUsers`.
 */
export function findCachedUser(
  queryClient: QueryClient,
  id: number,
): User | undefined {
  const caches = [
    ...queryClient.getQueriesData<InfiniteData<UsersResponse>>({
      queryKey: userKeys.lists(),
    }),
    ...queryClient.getQueriesData<InfiniteData<UsersResponse>>({
      queryKey: userKeys.searches(),
    }),
  ];

  for (const [, data] of caches) {
    const hit = flattenUsers(data).find((u) => u.id === id);
    if (hit) return hit;
  }

  return undefined;
}
