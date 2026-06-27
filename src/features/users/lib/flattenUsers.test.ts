import type { InfiniteData } from '@tanstack/react-query';

import { usersFixture } from '@/test/fixtures/users';

import type { UsersResponse } from '../types';
import { flattenUsers } from './flattenUsers';

function page(users = usersFixture, skip = 0): UsersResponse {
  return { users, total: usersFixture.length, skip, limit: users.length };
}

describe('flattenUsers', () => {
  it('returns an empty array when the data is absent', () => {
    expect(flattenUsers(undefined)).toEqual([]);
  });

  it('flattens a single page', () => {
    const data: InfiniteData<UsersResponse> = {
      pages: [page()],
      pageParams: [0],
    };
    expect(flattenUsers(data)).toEqual(usersFixture);
  });

  it('concatenates multiple pages in order', () => {
    const [a, b, c] = usersFixture;
    const data: InfiniteData<UsersResponse> = {
      pages: [page([a, b], 0), page([c], 2)],
      pageParams: [0, 2],
    };
    expect(flattenUsers(data).map((u) => u.id)).toEqual([a.id, b.id, c.id]);
  });
});
