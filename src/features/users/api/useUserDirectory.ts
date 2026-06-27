import { keepPreviousData, useInfiniteQuery } from '@tanstack/react-query';
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
 * section-building, or the list/search swap.
 *
 * The server applies `sort` before windowing, so pages stay globally ordered and
 * the pagination math is order-agnostic. Each sort variant is its own cache
 * entry. `keepPreviousData` keeps the current results on screen while a sort or
 * search swap fetches, avoiding a full-screen spinner flash; a fresh query (the
 * first load, or the first search for a term) has no previous data, so it still
 * shows the spinner as expected.
 *
 * ## Hybrid search (see docs/adr/0002-hybrid-search.md)
 *
 * Search is server-side by default, but switches to instant local filtering once
 * it can do so *correctly*:
 *
 *  - **Cache complete** (`list` fully paged in for the active sort) → the whole
 *    directory is in memory, so we filter locally and disable the search query
 *    entirely. Zero search requests; works offline.
 *  - **Cache incomplete + online** → hit `/users/search` (the only sound choice:
 *    a partial cache can't tell "3 matches" from "3 of 20").
 *  - **Cache incomplete + the request fails** (e.g. offline) → fall back to
 *    best-effort matches over the partial cache and flag `isPartialResults` so
 *    the screen can warn the results may be incomplete. Never silently wrong.
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

/** Config shared by both infinite queries — declared once to avoid drift. */
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

  const list = useInfiniteQuery({
    ...sharedInfiniteOptions,
    queryKey: userKeys.list({ limit: PAGE_SIZE, sort }),
    queryFn: ({ pageParam, signal }) =>
      getUsers({ limit: PAGE_SIZE, skip: pageParam, sort, signal }),
  });

  // The cache is the search corpus once the list is fully paged in for this
  // sort — the one state where local filtering is provably complete.
  const isCacheComplete = list.isSuccess && !list.hasNextPage;

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

  // Local corpus + matches, both derived from the (already server-sorted) list
  // cache, so local results preserve the active sort order.
  const localUsers = useMemo(() => flattenUsers(list.data), [list.data]);
  const localMatches = useMemo(
    () => filterUsers(localUsers, term),
    [localUsers, term],
  );

  const useLocalSearch = isSearching && isCacheComplete;
  // Server search failed but we have a partial cache to fall back on.
  const isPartialResults =
    isSearching &&
    !isCacheComplete &&
    search.isError &&
    localMatches.length > 0;
  // No live query drives the visible data: it's synchronous local filtering.
  const localMode = useLocalSearch || isPartialResults;

  const sections = useMemo(() => {
    if (!isSearching) return buildSections(localUsers);
    if (localMode) return buildSections(localMatches);
    return buildSections(flattenUsers(search.data));
  }, [isSearching, localMode, localUsers, localMatches, search.data]);

  // Status flags resolve against the active source. Searching reads the search
  // query unless the cache is complete (local) or the request failed (fallback).
  const isLoading = isSearching
    ? !isCacheComplete && search.isLoading
    : list.isLoading;
  const isError = isSearching
    ? !isCacheComplete && search.isError && localMatches.length === 0
    : list.isError;
  // Pull-to-refresh + retry target the source that owns the data: the list in
  // local/complete mode, otherwise the search query.
  const searchOwnsData = isSearching && !isCacheComplete;
  const isRefetching = searchOwnsData ? search.isRefetching : list.isRefetching;
  const refetch = searchOwnsData ? search.refetch : list.refetch;

  return {
    sections,
    isLoading,
    isError,
    isRefetching,
    isFetchingNextPage: localMode
      ? false
      : searchOwnsData
        ? search.isFetchingNextPage
        : list.isFetchingNextPage,
    hasNextPage: localMode
      ? false
      : searchOwnsData
        ? search.hasNextPage
        : list.hasNextPage,
    fetchNextPage: localMode
      ? noop
      : searchOwnsData
        ? search.fetchNextPage
        : list.fetchNextPage,
    refetch,
    isPartialResults,
  };
}
