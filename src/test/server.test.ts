import { apiGet } from '@/lib/apiClient';
import type { UsersResponse } from '@/features/users/types';

/**
 * MSW smoke test: drives the real `apiClient` against mocked DummyJSON handlers
 * and asserts the typed response shape. This validates the whole network mock
 * pipeline that integration tests rely on. The server lifecycle (listen/reset/
 * close) is centralized in `jest.setup.ts`.
 */
describe('MSW server + apiClient', () => {
  it('returns a typed, paginated users response', async () => {
    const data = await apiGet<UsersResponse>('/users?limit=1&skip=0');

    expect(data).toEqual(
      expect.objectContaining({
        total: expect.any(Number),
        skip: 0,
        limit: 1,
      }),
    );
    expect(data.users).toHaveLength(1);
    expect(data.users[0]).toEqual(
      expect.objectContaining({
        id: expect.any(Number),
        firstName: expect.any(String),
        email: expect.any(String),
      }),
    );
  });

  it('fetches a single user by id', async () => {
    const user = await apiGet<{ id: number; firstName: string }>('/users/1');
    expect(user.id).toBe(1);
    expect(typeof user.firstName).toBe('string');
  });
});
