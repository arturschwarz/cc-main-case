/**
 * Domain types for the DummyJSON Users API, narrowed to the subset the app
 * actually renders. See https://dummyjson.com/docs/users.
 *
 * The API returns many more fields (and a `password`); we model only what the
 * UI reads. Omitting `password` also avoids accidental use/logging of a
 * credential. Widen these interfaces when a screen starts using more fields.
 */

export interface Address {
  address: string;
  city: string;
  state: string;
  postalCode: string;
  country: string;
}

export interface Company {
  department: string;
  name: string;
  title: string;
}

export interface User {
  id: number;
  firstName: string;
  lastName: string;
  age: number;
  gender: string;
  email: string;
  phone: string;
  username: string;
  birthDate: string;
  image: string;
  address: Address;
  university: string;
  company: Company;
}

/** Paginated list/search envelope returned by `/users` and `/users/search`. */
export interface UsersResponse {
  users: User[];
  total: number;
  skip: number;
  limit: number;
}
