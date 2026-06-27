import { http, HttpResponse } from 'msw';

import { env } from '@/lib/env';
import { server } from '@/test/server';
import { userFixture, usersResponseFixture } from '@/test/fixtures/users';

import { getUser, getUsers, searchUsers } from './endpoints';

const base = env.apiBaseUrl;

/** Capture the requested URL while returning a canned response. */
function captureUrl(path: string, body: object) {
  const calls: URL[] = [];
  server.use(
    http.get(`${base}${path}`, ({ request }) => {
      calls.push(new URL(request.url));
      return HttpResponse.json(body);
    }),
  );
  return calls;
}

describe('users endpoints', () => {
  it('omits the sort suffix when no sort is requested', async () => {
    const calls = captureUrl('/users', usersResponseFixture);

    await getUsers({ limit: 30, skip: 0 });

    const params = calls[0].searchParams;
    expect(params.get('limit')).toBe('30');
    expect(params.get('skip')).toBe('0');
    expect(params.get('sortBy')).toBeNull();
    expect(params.get('order')).toBeNull();
  });

  it('appends sortBy and order when a sort is given', async () => {
    const calls = captureUrl('/users', usersResponseFixture);

    await getUsers({ limit: 30, skip: 30, sort: { sortBy: 'lastName', order: 'desc' } });

    const params = calls[0].searchParams;
    expect(params.get('skip')).toBe('30');
    expect(params.get('sortBy')).toBe('lastName');
    expect(params.get('order')).toBe('desc');
  });

  it('url-encodes the search term', async () => {
    const calls = captureUrl('/users/search', usersResponseFixture);

    await searchUsers({ term: 'jo hn', limit: 30, skip: 0 });

    expect(calls[0].searchParams.get('q')).toBe('jo hn');
    expect(calls[0].pathname).toBe('/users/search');
  });

  it('fetches a single user by id and returns it typed', async () => {
    const calls = captureUrl('/users/1', userFixture);

    const user = await getUser(1);

    expect(calls[0].pathname).toBe('/users/1');
    expect(user.id).toBe(1);
  });
});
