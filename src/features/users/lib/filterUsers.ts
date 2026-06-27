import type { User } from '../types';

/**
 * Local (client-side) search used by the hybrid search path. Case-insensitive
 * substring match over the fields the DummyJSON `/users/search` endpoint is
 * confirmed to index and that we model: `firstName`, `lastName`, and `email`
 * (verified: `q=man` matches names, `q=x.dummyjson` matches every email).
 *
 * Mirroring those fields keeps local results comparable to the server's, so the
 * results don't visibly change when search switches from server to local. Parity
 * is approximate — the server may index further fields we don't store.
 *
 * A blank term returns the input unchanged (callers gate on a non-empty term;
 * this keeps the function total).
 */
export function filterUsers(users: User[], term: string): User[] {
  const q = term.trim().toLowerCase();
  if (q === '') return users;
  return users.filter(
    (user) =>
      user.firstName.toLowerCase().includes(q) ||
      user.lastName.toLowerCase().includes(q) ||
      user.email.toLowerCase().includes(q),
  );
}
