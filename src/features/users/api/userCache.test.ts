import { QueryClient } from '@tanstack/react-query';

import { usersFixture } from '@/test/fixtures/users';

import { PAGE_SIZE } from './constants';
import { userKeys } from './queryKeys';
import { findCachedUser } from './userCache';

const sort = { sortBy: 'lastName', order: 'asc' } as const;

function seedList(client: QueryClient) {
  client.setQueryData(userKeys.list({ limit: PAGE_SIZE, sort }), {
    pages: [
      {
        users: usersFixture,
        total: usersFixture.length,
        skip: 0,
        limit: PAGE_SIZE,
      },
    ],
    pageParams: [0],
  });
}

describe('findCachedUser', () => {
  it('returns a user cached in a list infinite query', () => {
    const client = new QueryClient();
    seedList(client);

    expect(findCachedUser(client, 2)).toEqual(usersFixture[1]);
  });

  it('returns a user cached in a search infinite query', () => {
    const client = new QueryClient();
    client.setQueryData(userKeys.search('soph', sort), {
      pages: [
        {
          users: [usersFixture[2]],
          total: 1,
          skip: 0,
          limit: PAGE_SIZE,
        },
      ],
      pageParams: [0],
    });

    expect(findCachedUser(client, 3)).toEqual(usersFixture[2]);
  });

  it('returns undefined when no list/search cache holds the id', () => {
    const client = new QueryClient();
    seedList(client);

    expect(findCachedUser(client, 999)).toBeUndefined();
  });

  it('ignores detail entries, which hold a bare User (not the page shape)', () => {
    const client = new QueryClient();
    // A detail entry holds a bare User, not InfiniteData<UsersResponse>. Even
    // though the id matches, it must not be scanned (no `.pages` shape) — only
    // lists/searches are.
    const user = usersFixture[0];
    client.setQueryData(userKeys.detail(user.id), user);

    expect(findCachedUser(client, user.id)).toBeUndefined();
  });
});
