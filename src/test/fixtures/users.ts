import type { User, UsersResponse } from '@/features/users/types';

/**
 * Deterministic User fixtures for tests. Centralized here (per testing.md) so
 * mocks stay maintainable and a single shape change updates every test.
 */

function makeUser(
  id: number,
  firstName: string,
  lastName: string,
  email: string,
): User {
  return {
    id,
    firstName,
    lastName,
    age: 30 + id,
    gender: 'other',
    email,
    phone: `+1 555 010 00${id}`,
    username: `${firstName.toLowerCase()}.${lastName.toLowerCase()}`,
    birthDate: '1994-05-01',
    image: `https://dummyjson.com/icon/${firstName.toLowerCase()}/128`,
    address: {
      address: `${id} Main St`,
      city: 'Metropolis',
      state: 'NY',
      postalCode: '10001',
      country: 'United States',
    },
    university: 'State University',
    company: {
      department: 'Engineering',
      name: 'Acme Inc',
      title: 'Engineer',
    },
  };
}

export const userFixture: User = makeUser(
  1,
  'Emily',
  'Johnson',
  'emily.johnson@x.dummyjson.com',
);

export const usersFixture: User[] = [
  userFixture,
  makeUser(2, 'Michael', 'Williams', 'michael.williams@x.dummyjson.com'),
  makeUser(3, 'Sophia', 'Brown', 'sophia.brown@x.dummyjson.com'),
];

export const usersResponseFixture: UsersResponse = {
  users: usersFixture,
  total: usersFixture.length,
  skip: 0,
  limit: usersFixture.length,
};

/**
 * Generate `count` deterministic users with unique, predictable names — handy
 * for exercising pagination across more than one page.
 */
export function makeUsers(count: number, startId = 1): User[] {
  return Array.from({ length: count }, (_, index) => {
    const id = startId + index;
    return makeUser(
      id,
      `First${id}`,
      `Last${id}`,
      `user${id}@x.dummyjson.com`,
    );
  });
}

/** ~2 pages worth (PAGE_SIZE 30) so `onEndReached` can load a second page. */
export const largeUsersFixture: User[] = makeUsers(65);
