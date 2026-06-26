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
    maidenName: '',
    age: 30 + id,
    gender: 'other',
    email,
    phone: `+1 555 010 00${id}`,
    username: `${firstName.toLowerCase()}.${lastName.toLowerCase()}`,
    birthDate: '1994-05-01',
    image: `https://dummyjson.com/icon/${firstName.toLowerCase()}/128`,
    bloodGroup: 'O+',
    height: 175,
    weight: 70,
    eyeColor: 'brown',
    hair: { color: 'brown', type: 'straight' },
    ip: '127.0.0.1',
    address: {
      address: `${id} Main St`,
      city: 'Metropolis',
      state: 'NY',
      stateCode: 'NY',
      postalCode: '10001',
      coordinates: { lat: 40.7128, lng: -74.006 },
      country: 'United States',
    },
    macAddress: '00:00:00:00:00:00',
    university: 'State University',
    bank: {
      cardExpire: '12/30',
      cardNumber: '0000000000000000',
      cardType: 'visa',
      currency: 'USD',
      iban: 'US00000000000000',
    },
    company: {
      department: 'Engineering',
      name: 'Acme Inc',
      title: 'Engineer',
      address: {
        address: `${id} Work Ave`,
        city: 'Metropolis',
        state: 'NY',
        stateCode: 'NY',
        postalCode: '10001',
        coordinates: { lat: 40.7128, lng: -74.006 },
        country: 'United States',
      },
    },
    ein: '00-0000000',
    ssn: '000-00-0000',
    userAgent: 'test-agent',
    crypto: {
      coin: 'Bitcoin',
      wallet: '0x0000000000000000000000000000000000000000',
      network: 'Ethereum (ERC20)',
    },
    role: 'admin',
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
