import type { ReactNode } from 'react';
import { QueryClientProvider } from '@tanstack/react-query';
import { http, HttpResponse } from 'msw';

import { env } from '@/lib/env';
import { createTestQueryClient, renderHook, waitFor } from '@/test/render';
import { server } from '@/test/server';
import {
  largeUsersFixture,
  usersFixture,
} from '@/test/fixtures/users';
import type { User } from '@/features/users/types';

import { PAGE_SIZE } from './constants';
import { useUserDirectory } from './useUserDirectory';

const asc = { sortBy: 'lastName', order: 'asc' } as const;

/** Page a user array the way the DummyJSON list/search endpoints do. */
function paginate(users: User[], url: URL) {
  const limit = Number(url.searchParams.get('limit') ?? users.length);
  const skip = Number(url.searchParams.get('skip') ?? 0);
  return HttpResponse.json({
    users: users.slice(skip, skip + limit),
    total: users.length,
    skip,
    limit,
  });
}

/** Make the list endpoint serve a multi-page corpus (cache stays incomplete). */
function serveLargeList() {
  server.use(
    http.get(`${env.apiBaseUrl}/users`, ({ request }) =>
      paginate(largeUsersFixture, new URL(request.url)),
    ),
  );
}

function flatNames(sections: { data: User[] }[]): string[] {
  return sections.flatMap((s) => s.data.map((u) => `${u.firstName} ${u.lastName}`));
}

function wrapper() {
  const queryClient = createTestQueryClient();
  function Wrapper({ children }: { children: ReactNode }) {
    return <QueryClientProvider client={queryClient}>{children}</QueryClientProvider>;
  }
  return Wrapper;
}

describe('useUserDirectory — hybrid search', () => {
  it('filters locally with NO search request once the cache is complete', async () => {
    let searchCalls = 0;
    server.use(
      http.get(`${env.apiBaseUrl}/users/search`, () => {
        searchCalls += 1;
        return HttpResponse.json({ users: [], total: 0, skip: 0, limit: PAGE_SIZE });
      }),
    );

    // Default fixtures = 3 users = a single page, so the list cache is complete
    // after the first load.
    const { result, rerender } = await renderHook(
      ({ term }: { term: string }) => useUserDirectory({ term, sort: asc }),
      { wrapper: wrapper(), initialProps: { term: '' } },
    );

    await waitFor(() => expect(result.current.isLoading).toBe(false));
    expect(result.current.sections).toHaveLength(
      // all three fixture users rendered
      new Set(usersFixture.map((u) => u.lastName[0])).size,
    );

    rerender({ term: 'emi' });

    await waitFor(() => expect(flatNames(result.current.sections)).toEqual(['Emily Johnson']));
    expect(searchCalls).toBe(0);
    expect(result.current.isPartialResults).toBe(false);
    expect(result.current.hasNextPage).toBe(false);
  });

  it('hits the server when the cache is incomplete, returning matches beyond the loaded page', async () => {
    serveLargeList();
    server.use(
      http.get(`${env.apiBaseUrl}/users/search`, ({ request }) => {
        const url = new URL(request.url);
        const q = (url.searchParams.get('q') ?? '').toLowerCase();
        const matched = largeUsersFixture.filter((u) =>
          `${u.firstName} ${u.lastName}`.toLowerCase().includes(q),
        );
        return paginate(matched, url);
      }),
    );

    const { result, rerender } = await renderHook(
      ({ term }: { term: string }) => useUserDirectory({ term, sort: asc }),
      { wrapper: wrapper(), initialProps: { term: '' } },
    );

    // First page loaded, more pages remain → cache incomplete.
    await waitFor(() => expect(result.current.hasNextPage).toBe(true));

    // user 40 lives on page 2 (ids 31–60), so it is NOT in the local cache; only
    // the server can return it.
    rerender({ term: 'First40' });

    await waitFor(() => expect(flatNames(result.current.sections)).toEqual(['First40 Last40']));
    expect(result.current.isPartialResults).toBe(false);
  });

  it('falls back to best-effort local matches with isPartialResults when the search request fails', async () => {
    serveLargeList();
    server.use(
      http.get(`${env.apiBaseUrl}/users/search`, () =>
        HttpResponse.json({ message: 'offline' }, { status: 500 }),
      ),
    );

    const { result, rerender } = await renderHook(
      ({ term }: { term: string }) => useUserDirectory({ term, sort: asc }),
      { wrapper: wrapper(), initialProps: { term: '' } },
    );

    await waitFor(() => expect(result.current.hasNextPage).toBe(true));

    // 'First5' matches id 5 (in the loaded page 1) and ids 50–59 (page 2, not
    // cached). The server is down, so we show the one cached match and flag it.
    rerender({ term: 'First5' });

    await waitFor(() => expect(result.current.isPartialResults).toBe(true));
    expect(flatNames(result.current.sections)).toEqual(['First5 Last5']);
    expect(result.current.isError).toBe(false);
  });
});

describe('useUserDirectory — client-side sort toggle', () => {
  /** List handler that records the `order` of every request and serves it sorted. */
  function serveSortedList(users: User[], orders: string[]) {
    server.use(
      http.get(`${env.apiBaseUrl}/users`, ({ request }) => {
        const url = new URL(request.url);
        orders.push(url.searchParams.get('order') ?? 'none');
        const asc = [...users].sort((a, b) => a.lastName.localeCompare(b.lastName));
        const ordered = url.searchParams.get('order') === 'desc' ? asc.reverse() : asc;
        return paginate(ordered, url);
      }),
    );
  }

  it('derives the opposite order by reversing the cache, with NO request, when complete', async () => {
    const orders: string[] = [];
    serveSortedList(usersFixture, orders); // 3 users = one complete page

    const { result, rerender } = await renderHook(
      ({ order }: { order: 'asc' | 'desc' }) =>
        useUserDirectory({ term: '', sort: { sortBy: 'lastName', order } }),
      { wrapper: wrapper(), initialProps: { order: 'asc' as const } },
    );

    // Wait for the (single, complete) asc page to load.
    await waitFor(() =>
      expect(flatNames(result.current.sections)).toEqual([
        'Sophia Brown',
        'Emily Johnson',
        'Michael Williams',
      ]),
    );
    const ascNames = flatNames(result.current.sections);
    expect(result.current.hasNextPage).toBe(false); // complete

    rerender({ order: 'desc' });

    await waitFor(() =>
      expect(flatNames(result.current.sections)).toEqual([...ascNames].reverse()),
    );
    // Only the ascending order was ever requested; desc came from the cache.
    expect(orders).toEqual(['asc']);
    expect(result.current.hasNextPage).toBe(false);
  });

  it('fetches the opposite order from the server while the cache is incomplete', async () => {
    const orders: string[] = [];
    serveSortedList(largeUsersFixture, orders); // 65 users = multiple pages

    const { result, rerender } = await renderHook(
      ({ order }: { order: 'asc' | 'desc' }) =>
        useUserDirectory({ term: '', sort: { sortBy: 'lastName', order } }),
      { wrapper: wrapper(), initialProps: { order: 'asc' as const } },
    );

    await waitFor(() => expect(result.current.hasNextPage).toBe(true)); // incomplete

    rerender({ order: 'desc' });

    // Reversing a partial cache would be wrong, so we must hit the server.
    await waitFor(() => expect(orders).toContain('desc'));
  });
});
