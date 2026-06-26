import { http, HttpResponse } from 'msw';
import { setupServer } from 'msw/node';

import { env } from '@/lib/env';
import type { User } from '@/features/users/types';
import { usersFixture } from './fixtures/users';

/**
 * MSW server with default DummyJSON handlers. Mocking at the network boundary
 * means `apiClient` and React Query run for real in tests. Override per-test
 * with `server.use(...)` for error/empty cases.
 */

const base = env.apiBaseUrl;

function paginate(users: User[], limitParam: string | null, skipParam: string | null) {
  const limit = limitParam ? Number(limitParam) : users.length;
  const skip = skipParam ? Number(skipParam) : 0;
  return {
    users: users.slice(skip, skip + limit),
    total: users.length,
    skip,
    limit,
  };
}

/**
 * Mirrors the DummyJSON `sortBy`/`order` behavior for tests. Clones the input
 * (never mutates the shared fixture) and sorts by last name via `localeCompare`,
 * reversed for `desc`. A no-op when `sortBy` is absent, so param-less requests
 * keep their original order and existing tests stay green.
 */
function sortUsers(
  users: User[],
  sortBy: string | null,
  order: string | null,
): User[] {
  if (sortBy !== 'lastName') return users;
  const direction = order === 'desc' ? -1 : 1;
  return [...users].sort(
    (a, b) => a.lastName.localeCompare(b.lastName) * direction,
  );
}

export const handlers = [
  // Search MUST be registered before the dynamic `/users/:id` so it is not
  // shadowed by it.
  http.get(`${base}/users/search`, ({ request }) => {
    const url = new URL(request.url);
    const q = (url.searchParams.get('q') ?? '').toLowerCase();
    const matched = usersFixture.filter((u) =>
      `${u.firstName} ${u.lastName}`.toLowerCase().includes(q),
    );
    const sorted = sortUsers(
      matched,
      url.searchParams.get('sortBy'),
      url.searchParams.get('order'),
    );
    return HttpResponse.json(
      paginate(sorted, url.searchParams.get('limit'), url.searchParams.get('skip')),
    );
  }),

  http.get(`${base}/users/:id`, ({ params }) => {
    const id = Number(params.id);
    const user = usersFixture.find((u) => u.id === id);
    if (!user) {
      return HttpResponse.json({ message: 'User not found' }, { status: 404 });
    }
    return HttpResponse.json(user);
  }),

  http.get(`${base}/users`, ({ request }) => {
    const url = new URL(request.url);
    const sorted = sortUsers(
      usersFixture,
      url.searchParams.get('sortBy'),
      url.searchParams.get('order'),
    );
    return HttpResponse.json(
      paginate(sorted, url.searchParams.get('limit'), url.searchParams.get('skip')),
    );
  }),
];

export const server = setupServer(...handlers);
