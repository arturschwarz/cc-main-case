# Client-side sort toggle: reverse the cache instead of re-fetching

The A–Z / Z–A toggle changes only the *direction* of a single sort key
(`lastName`). Ascending and descending are exact reverses of each other **over
the same complete dataset**. So once either order has been fully paged into the
cache, the opposite order needs no network call — we serve it by reversing the
cached array client-side. This builds on the hybrid-search decision
([ADR 0002](0002-hybrid-search.md)) to push API calls toward zero.

The rule is keyed on the same fact as search — is a cache complete:

- **An order is fully loaded** → derive the opposite order by reversing it; the
  opposite order's query is **disabled** (no request). Whichever direction the
  user finishes paging first makes every subsequent toggle free.
- **Neither order is complete** → fetch the requested order server-side
  (`sortBy=lastName&order=asc|desc`), then cache it. We do **not** reverse a
  partial cache: that would show the reverse of the loaded *prefix* (≈the
  alphabetical top, flipped) rather than the true tail — wrong rows, not just
  fewer. This is the pagination hazard the README's sort note describes.

This lives entirely in `useUserDirectory`: it reads the opposite order's cache
through a disabled query and reverses it when whole, falling back to a live query
otherwise. The screen is unchanged.

Trade-off: a second (disabled) infinite query and reversal bookkeeping in the
hook, versus one server round-trip per direction. We accept it because it
**fails safe** — on a dataset too large to ever fully cache, the derive branch
simply never triggers and we get the original server-side sort, so correctness is
never at risk; the optimization only ever *adds* request savings, never bugs.

Note this supersedes the earlier framing that server-side sort is strictly
*required*. It remains required for the **incomplete** case (correct global
ordering under pagination); the new insight is that the **complete** case can be
served from cache for free.
