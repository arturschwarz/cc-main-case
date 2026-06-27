import { usersFixture } from '@/test/fixtures/users';

import { filterUsers } from './filterUsers';

describe('filterUsers', () => {
  it('matches on first name, case-insensitively', () => {
    const result = filterUsers(usersFixture, 'emi');
    expect(result.map((u) => u.id)).toEqual([1]); // Emily Johnson
  });

  it('matches on last name', () => {
    const result = filterUsers(usersFixture, 'brown');
    expect(result.map((u) => u.id)).toEqual([3]); // Sophia Brown
  });

  it('matches on email — mirroring the server, which indexes it', () => {
    const result = filterUsers(usersFixture, 'michael.williams@');
    expect(result.map((u) => u.id)).toEqual([2]);
  });

  it('returns the input unchanged for a blank term', () => {
    expect(filterUsers(usersFixture, '   ')).toBe(usersFixture);
  });

  it('returns an empty array when nothing matches', () => {
    expect(filterUsers(usersFixture, 'zzz-nobody')).toEqual([]);
  });
});
