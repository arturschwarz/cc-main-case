/** Sort direction for the Users Directory list and search. */
export type SortOrder = 'asc' | 'desc';

/**
 * How the directory is ordered. `sortBy` is a single-member union for now
 * (last name only); widen it here when more sort fields are added.
 */
export interface UserSort {
  sortBy: 'lastName';
  order: SortOrder;
}
