import { keepPreviousData, useInfiniteQuery } from '@tanstack/react-query';
import { useMemo } from 'react';

import type { UserSort, UsersResponse } from '../types';
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
 * Both `useInfiniteQuery` calls run unconditionally (Rules of Hooks); the search
 * query is `enabled` only for a non-empty term, so it costs nothing until typed.
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

  const list = useInfiniteQuery({
    ...sharedInfiniteOptions,
    queryKey: userKeys.list({ limit: PAGE_SIZE, sort }),
    queryFn: ({ pageParam, signal }) =>
      getUsers({ limit: PAGE_SIZE, skip: pageParam, sort, signal }),
  });

  const search = useInfiniteQuery({
    ...sharedInfiniteOptions,
    queryKey: userKeys.search(term, sort),
    enabled: isSearching,
    queryFn: ({ pageParam, signal }) =>
      searchUsers({ term, limit: PAGE_SIZE, skip: pageParam, sort, signal }),
  });

  const active = isSearching ? search : list;

  // Group the (globally sorted) Users into alphabetical sections. Rebuilt from
  // the full flat array so appended pages can't split or duplicate a letter
  // across page boundaries.
  const sections = useMemo(
    () => buildSections(flattenUsers(active.data)),
    [active.data],
  );

  return {
    sections,
    isLoading: active.isLoading,
    isError: active.isError,
    isRefetching: active.isRefetching,
    isFetchingNextPage: active.isFetchingNextPage,
    hasNextPage: active.hasNextPage,
    fetchNextPage: active.fetchNextPage,
    refetch: active.refetch,
  };
}
