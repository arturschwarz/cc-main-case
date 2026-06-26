import { userFixture } from '@/test/fixtures/users';

import type { User } from '../types';

import { buildSections } from './sections';

/** Build a User with a given last name off the shared fixture. */
function withLastName(id: number, lastName: string): User {
  return { ...userFixture, id, lastName };
}

describe('buildSections', () => {
  it('groups contiguous equal initials in input order (asc)', () => {
    const users = [
      withLastName(1, 'Brown'),
      withLastName(2, 'Johnson'),
      withLastName(3, 'Williams'),
    ];

    expect(buildSections(users).map((s) => s.title)).toEqual(['B', 'J', 'W']);
  });

  it('is direction-agnostic — a reversed input yields reversed sections', () => {
    const users = [
      withLastName(3, 'Williams'),
      withLastName(2, 'Johnson'),
      withLastName(1, 'Brown'),
    ];

    expect(buildSections(users).map((s) => s.title)).toEqual(['W', 'J', 'B']);
  });

  it('coalesces a run of the same initial into one section', () => {
    const users = [
      withLastName(1, 'Brown'),
      withLastName(2, 'Baker'),
      withLastName(3, 'Johnson'),
    ];

    const sections = buildSections(users);
    expect(sections.map((s) => s.title)).toEqual(['B', 'J']);
    expect(sections[0].data.map((u) => u.id)).toEqual([1, 2]);
  });

  it('returns no sections for an empty array', () => {
    expect(buildSections([])).toEqual([]);
  });

  it('buckets empty or non-alphabetic last names under "#"', () => {
    const users = [withLastName(1, ''), withLastName(2, '123 Corp')];

    expect(buildSections(users).map((s) => s.title)).toEqual(['#']);
  });
});
