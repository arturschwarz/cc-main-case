import {
  keepPreviousData,
  useInfiniteQuery,
  type InfiniteData,
} from '@tanstack/react-query';
import { useCallback, useMemo } from 'react';

import type { UserSort, UsersResponse } from '../types';
import { filterUsers } from '../lib/filterUsers';
import { flattenUsers } from '../lib/flattenUsers';
import { buildSections, type UserSection } from '../lib/sections';
import { PAGE_SIZE } from './constants';
import { getUsers, searchUsers } from './endpoints';
import { userKeys } from './queryKeys';

/**
 * One deep hook for the whole Users Directory list. The screen consumes a single
 * flat interface (`UserDirectory`) and never touches React Query, page-flatten,
 * section-building, or the list/search/sort swaps.
 *
 * The server applies `sort` before windowing, so pages stay globally ordered and
 * the pagination math is order-agnostic. `keepPreviousData` keeps the current
 * results on screen while a search swap fetches, avoiding a full-screen spinner
 * flash; a fresh query (first load, or first search for a term) has no previous
 * data, so it still shows the spinner as expected.
 *
 * ## Hybrid search (see docs/adr/0002-hybrid-search.md)
 *
 * Search is server-side by default, switching to instant local filtering once it
 * can do so *correctly* — when the list cache is complete:
 *  - **Cache complete** → filter locally, search query disabled. Zero requests,
 *    works offline, results exhaustive.
 *  - **Cache incomplete + online** → hit `/users/search` (a partial cache can't
 *    tell "3 matches" from "3 of 20").
 *  - **Cache incomplete + request fails** → best-effort matches over the partial
 *    cache, flagged via `isPartialResults`. Never silently wrong.
 *
 * ## Client-side sort toggle (see docs/adr/0003-client-side-sort-toggle.md)
 *
 * A–Z and Z–A are exact reverses of each other *over the same complete dataset*.
 * So once either order is fully paged in, the opposite order is derived by
 * reversing that cache — **no API request**. While neither order is complete,
 * the opposite order is fetched server-side (then cached), because reversing a
 * partial cache would show the reverse of the loaded prefix, not the true tail.
 */
export interface UserDirectory {
  sections: UserSection[];
  isLoading: boolean;
  isError: boolean;
  isRefetching: boolean;
  isFetchingNextPage: boolean;
  hasNextPage: boolean;
  /** Hides React Query's Promise return; () => Promise<X> is assignable here. */
  fetchNextPage: () => void;
  refetch: () => void;
  /**
   * True only when showing best-effort local matches over an *incomplete* cache
   * because the search request failed (offline). The screen surfaces a notice;
   * complete-cache local search is exhaustive, so it stays false there.
   */
  isPartialResults: boolean;
}

/**
 * Shared pagination math: derive the next `skip` from `skip + limit`, stopping
 * once the window reaches `total`. Order-agnostic, so it works for asc and desc.
 */
const getNextPageParam = (last: UsersResponse): number | undefined => {
  const next = last.skip + last.limit;
  return next < last.total ? next : undefined;
};

/** True once every page of an infinite list query has been loaded. */
function isFullyLoaded(data: InfiniteData<UsersResponse> | undefined): boolean {
  const last = data?.pages[data.pages.length - 1];
  return last ? last.skip + last.limit >= last.total : false;
}

/** Config shared by both *active* infinite queries — declared once to avoid drift. */
const sharedInfiniteOptions = {
  placeholderData: keepPreviousData,
  initialPageParam: 0,
  getNextPageParam,
};

export function useUserDirectory(params: {
  term: string;
  sort: UserSort;
}): UserDirectory {
  const { term, sort } = params;
  const isSearching = term.length > 0;
  const noop = useCallback(() => {}, []);

  const oppositeSort = useMemo<UserSort>(
    () => ({ sortBy: sort.sortBy, order: sort.order === 'asc' ? 'desc' : 'asc' }),
    [sort.sortBy, sort.order],
  );

  // Read-only view of the opposite order's cache. Never fetched here (`enabled:
  // false`, no `keepPreviousData` so it reflects the new key synchronously on
  // toggle); used only to derive the active order by reversing when it's whole.
  const opposite = useInfiniteQuery({
    queryKey: userKeys.list({ limit: PAGE_SIZE, sort: oppositeSort }),
    queryFn: ({ pageParam, signal }) =>
      getUsers({ limit: PAGE_SIZE, skip: pageParam, sort: oppositeSort, signal }),
    enabled: false,
    initialPageParam: 0,
    getNextPageParam,
  });
  // The opposite order is fully loaded → we can serve this order by reversing it.
  const canDeriveList = isFullyLoaded(opposite.data);

  const list = useInfiniteQuery({
    ...sharedInfiniteOptions,
    queryKey: userKeys.list({ limit: PAGE_SIZE, sort }),
    // Skipped entirely when the opposite cache already covers us by reversal.
    enabled: !canDeriveList,
    queryFn: ({ pageParam, signal }) =>
      getUsers({ limit: PAGE_SIZE, skip: pageParam, sort, signal }),
  });

  // Users in the active order: the reversed opposite cache when complete, else
  // this order's own fetched pages. (Reversing a *complete* set is exact.)
  const listUsers = useMemo(
    () =>
      canDeriveList
        ? [...flattenUsers(opposite.data)].reverse()
        : flattenUsers(list.data),
    [canDeriveList, opposite.data, list.data],
  );
  const isCacheComplete = canDeriveList || isFullyLoaded(list.data);

  const search = useInfiniteQuery({
    ...sharedInfiniteOptions,
    queryKey: userKeys.search(term, sort),
    // Disabled when the cache is complete (filter locally, zero requests) and
    // when not searching. Costs nothing until a term is typed against a partial
    // cache.
    enabled: isSearching && !isCacheComplete,
    queryFn: ({ pageParam, signal }) =>
      searchUsers({ term, limit: PAGE_SIZE, skip: pageParam, sort, signal }),
  });

  // Local matches reuse the active-order users, so they preserve the sort order.
  const localMatches = useMemo(
    () => filterUsers(listUsers, term),
    [listUsers, term],
  );

  const useLocalSearch = isSearching && isCacheComplete;
  // Server search failed but we have a partial cache to fall back on.
  const isPartialResults =
    isSearching && !isCacheComplete && search.isError && localMatches.length > 0;
  // No live query drives the visible data: it's synchronous local filtering.
  const localMode = useLocalSearch || isPartialResults;

  const sections = useMemo(() => {
    if (!isSearching) return buildSections(listUsers);
    if (localMode) return buildSections(localMatches);
    return buildSections(flattenUsers(search.data));
  }, [isSearching, localMode, listUsers, localMatches, search.data]);

  // Which query owns loading/refetch for the current view.
  const searchOwnsData = isSearching && !isCacheComplete;
  // Pagination only applies to a live (non-derived, non-local) list.
  const listPaginates = !isSearching && !canDeriveList;
  // Pull-to-refresh / retry target the source that actually holds the data: the
  // search query when searching a partial cache, the reversed opposite cache
  // when deriving, otherwise this order's list query.
  const listSource = canDeriveList ? opposite : list;

  const isLoading = isSearching
    ? !isCacheComplete && search.isLoading
    : !canDeriveList && list.isLoading;
  const isError = isSearching
    ? !isCacheComplete && search.isError && localMatches.length === 0
    : !canDeriveList && list.isError;

  return {
    sections,
    isLoading,
    isError,
    isRefetching: searchOwnsData ? search.isRefetching : listSource.isRefetching,
    isFetchingNextPage: searchOwnsData
      ? search.isFetchingNextPage
      : listPaginates
        ? list.isFetchingNextPage
        : false,
    hasNextPage: searchOwnsData
      ? search.hasNextPage
      : listPaginates
        ? list.hasNextPage
        : false,
    fetchNextPage: searchOwnsData
      ? search.fetchNextPage
      : listPaginates
        ? list.fetchNextPage
        : noop,
    refetch: searchOwnsData ? search.refetch : listSource.refetch,
    isPartialResults,
  };
}
