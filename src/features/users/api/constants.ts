/**
 * Number of users fetched per page (DummyJSON allows 1–100; the assignment
 * suggests 20–50). 30 balances payload size against the number of round-trips
 * while scrolling. The infinite-query hooks (next increment) use this to derive
 * the `skip`/`limit` window and to stop once `skip + limit >= total`.
 */
export const PAGE_SIZE = 30;

/** Debounce window (ms) for the search input — cuts a request per keystroke. */
export const SEARCH_DEBOUNCE_MS = 350;
