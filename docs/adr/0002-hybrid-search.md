# Hybrid search: server-side by default, local filtering once the cache is complete

Search runs against the dedicated `GET /users/search?q=` endpoint (debounced
~350 ms, paginated, server-sorted). That is the right default: the list is
paginated, so a pure client-side filter would only match the rows already
loaded and silently miss everyone else — non-deterministic results that depend
on how far the user happened to scroll.

We layer a **hybrid** path on top to cut requests and degrade gracefully
offline, *without* reintroducing that non-determinism. The rule is keyed on one
fact — whether the local cache is provably complete:

- **Cache complete** (the list is fully paged in for the active sort, so the
  whole directory is in memory) → filter locally on `firstName`/`lastName`/
  `email` and **disable the search query entirely**. Zero search requests; works
  offline. Local results are exhaustive here, so they can't lie.
- **Cache incomplete + online** → hit the server. A partial cache cannot tell
  "3 matches" from "3 of 20", so trusting it would be wrong.
- **Cache incomplete + the request fails (offline)** → fall back to best-effort
  matches over the partial cache and surface an *"Offline — results may be
  incomplete"* notice. Never silently incomplete.

All of this lives inside `useUserDirectory`; the screen consumes one flat
interface plus an `isPartialResults` flag for the notice.

Field parity with the server is approximate: we mirror the fields DummyJSON is
confirmed to index and that we model (firstName, lastName, email — verified
`q=man` hits names, `q=x.dummyjson` hits every email). The server may index more
fields we don't store; documented as a known limitation.

Trade-off: more branching in the directory hook (completeness detection, a local
filter, an offline notice) versus a single server call per term. We accept it
because it cleanly serves two real goals — fewer requests and offline search —
and because it **fails safe**: request-cutting only engages once the cache is
complete (realistic for the ~208-user directory at 7 pages, rare for a genuinely
huge dataset), so on a large dataset the feature simply no-ops back to server
search rather than breaking correctness.
