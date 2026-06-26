import type { InfiniteData } from '@tanstack/react-query';

import type { User, UsersResponse } from '../types';

/**
 * Flatten an infinite users query's pages into a single `User[]` (empty when the
 * data is absent). The one place that reads the cached `InfiniteData` page shape,
 * so both the directory list and the detail-placeholder cache scan go through it.
 */
export function flattenUsers(
  data: InfiniteData<UsersResponse> | undefined,
): User[] {
  return data?.pages.flatMap((page) => page.users) ?? [];
}
