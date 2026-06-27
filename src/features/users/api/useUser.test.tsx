import type { ReactNode } from 'react';
import { QueryClientProvider } from '@tanstack/react-query';
import { delay, http, HttpResponse } from 'msw';

import { env } from '@/lib/env';
import { createTestQueryClient, renderHook, waitFor } from '@/test/render';
import { server } from '@/test/server';
import { userFixture, usersFixture } from '@/test/fixtures/users';

import { PAGE_SIZE } from './constants';
import { userKeys } from './queryKeys';
import { useUser } from './useUser';

describe('useUser', () => {
  it('seeds placeholder data from the list cache, then settles on the fetched record', async () => {
    // The by-id fetch is delayed and returns a distinct field, so the placeholder
    // (from the cached list row) is observable before the fetch replaces it.
    server.use(
      http.get(`${env.apiBaseUrl}/users/1`, async () => {
        await delay(40);
        return HttpResponse.json({ ...userFixture, university: 'Fetched University' });
      }),
    );

    const queryClient = createTestQueryClient();
    queryClient.setQueryData(
      userKeys.list({ limit: PAGE_SIZE, sort: { sortBy: 'lastName', order: 'asc' } }),
      {
        pages: [
          { users: usersFixture, total: usersFixture.length, skip: 0, limit: PAGE_SIZE },
        ],
        pageParams: [0],
      },
    );

    function Wrapper({ children }: { children: ReactNode }) {
      return <QueryClientProvider client={queryClient}>{children}</QueryClientProvider>;
    }

    const { result } = await renderHook(() => useUser(1), { wrapper: Wrapper });

    // Placeholder: the cached list row renders the detail instantly.
    expect(result.current.isPlaceholderData).toBe(true);
    expect(result.current.data?.university).toBe('State University');

    // The by-id fetch settles and replaces the placeholder.
    await waitFor(() => expect(result.current.isPlaceholderData).toBe(false));
    expect(result.current.data?.university).toBe('Fetched University');
  });
});
