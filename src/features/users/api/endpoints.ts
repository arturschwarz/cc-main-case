import { apiGet } from '@/lib/apiClient';

import type { User, UserSort, UsersResponse } from '../types';

/**
 * Pure endpoint functions for the DummyJSON Users API. Each forwards React
 * Query's `AbortSignal` into the shared `apiClient` so in-flight requests are
 * cancelled on unmount / param change. No caching or React concerns here — the
 * hooks in this folder wrap these.
 */

export interface PageParams {
  limit: number;
  skip: number;
  /** Optional alphabetical sort; omitted requests keep the API's default order. */
  sort?: UserSort;
  signal?: AbortSignal;
}

export interface SearchParams extends PageParams {
  term: string;
}

/**
 * Builds the optional `&sortBy=…&order=…` suffix shared by list and search so
 * both endpoints stay consistent. Returns '' when no sort is requested, leaving
 * callers that omit `sort` unaffected.
 */
function sortSuffix(sort?: UserSort): string {
  return sort ? `&sortBy=${sort.sortBy}&order=${sort.order}` : '';
}

/** Paginated list of users: `GET /users?limit&skip[&sortBy&order]`. */
export function getUsers({
  limit,
  skip,
  sort,
  signal,
}: PageParams): Promise<UsersResponse> {
  return apiGet<UsersResponse>(
    `/users?limit=${limit}&skip=${skip}${sortSuffix(sort)}`,
    { signal },
  );
}

/** Server-side search: `GET /users/search?q&limit&skip[&sortBy&order]`. */
export function searchUsers({
  term,
  limit,
  skip,
  sort,
  signal,
}: SearchParams): Promise<UsersResponse> {
  const q = encodeURIComponent(term);
  return apiGet<UsersResponse>(
    `/users/search?q=${q}&limit=${limit}&skip=${skip}${sortSuffix(sort)}`,
    { signal },
  );
}

/** Single user by stable id: `GET /users/{id}`. */
export function getUser(
  id: number,
  options: { signal?: AbortSignal } = {},
): Promise<User> {
  return apiGet<User>(`/users/${id}`, { signal: options.signal });
}
