import type { UserSort } from '../types';

/**
 * Typed query-key factory for the users feature. Centralizing keys here keeps
 * cache reads/writes and invalidations consistent and refactor-safe.
 *
 * Hierarchy (each level a prefix of the next so partial invalidation works):
 *   ['users']
 *   ['users','list']                        → all list queries
 *   ['users','list',{ limit, sort }]        → one paginated list (per sort variant)
 *   ['users','search']                      → all search queries
 *   ['users','search', term, sort]          → one search (per sort variant)
 *   ['users','detail']                      → all detail queries
 *   ['users','detail', id]                  → one user
 *
 * Each sort variant gets its own cache entry (intended). The `lists()` /
 * `searches()` prefixes are unchanged, so `useUser`'s placeholder scan over
 * those prefixes keeps matching every list/search variant.
 */
export const userKeys = {
  all: ['users'] as const,
  lists: () => [...userKeys.all, 'list'] as const,
  list: (params: { limit: number; sort: UserSort }) =>
    [...userKeys.lists(), params] as const,
  searches: () => [...userKeys.all, 'search'] as const,
  search: (term: string, sort: UserSort) =>
    [...userKeys.searches(), term, sort] as const,
  details: () => [...userKeys.all, 'detail'] as const,
  detail: (id: number) => [...userKeys.details(), id] as const,
} as const;
