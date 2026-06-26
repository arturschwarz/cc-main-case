import { useQuery, useQueryClient } from '@tanstack/react-query';

import { getUser } from './endpoints';
import { userKeys } from './queryKeys';
import { findCachedUser } from './userCache';

/**
 * Single user by id. Seeds `placeholderData` from any already-cached list or
 * search page (via `findCachedUser`, the one module that knows the cache page
 * shape) so navigating from the list renders the detail header instantly, then
 * refetches the full record in the background.
 */
export function useUser(id: number) {
  const queryClient = useQueryClient();

  return useQuery({
    queryKey: userKeys.detail(id),
    queryFn: ({ signal }) => getUser(id, { signal }),
    // The `previousData` param disambiguates this as a PlaceholderDataFunction
    // (vs a function-valued placeholder); we ignore it and seed from the cache.
    placeholderData: (previousData) =>
      previousData ?? findCachedUser(queryClient, id),
  });
}
