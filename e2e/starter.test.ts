/**
 * Required Detox E2E flow for the Users Directory.
 *
 * Covers: launch -> Home loads -> search filters -> clear resets -> open detail.
 *
 * Ordering: the app's initial state sorts by last name A->Z (and search results
 * are sorted the same way), so the assertions below key off the sorted order:
 *   - First page (lastName asc): id 31 Gabriel Adams is the first row.
 *   - GET /users/search?q=Emily (lastName asc) -> Emily Brown (id 103) + Emily
 *     Johnson (id 1), and EXCLUDES Gabriel Adams (id 31).
 *
 * Network: hits the real DummyJSON API (stable, deterministic records), so the
 * device must have network access to dummyjson.com.
 *
 * The header-collapse animation is intentionally NOT asserted here: Detox runs
 * with animations disabled, so the scroll-driven crossfade never plays under
 * test. The collapsible header's logic is covered by the unit/integration suite.
 *
 * Detox's `waitFor` is imported explicitly so it shadows Jest's in-file global;
 * `describe`/`beforeAll`/`it` remain Jest globals.
 */
import { by, device, element, waitFor } from 'detox';

import { launchAtHome } from './launch';

describe('Users Directory E2E flow', () => {
  beforeAll(async () => {
    await launchAtHome();
  });

  it('loads, searches, clears, and opens a user detail screen', async () => {
    // (1) Launch -> Home loads the first page, sorted by last name A->Z, so the
    // "A" section leads and Gabriel Adams (id 31) is the first row.
    await waitFor(element(by.id('users-list')))
      .toBeVisible()
      .withTimeout(30000);
    await waitFor(element(by.id('user-row-31')))
      .toBeVisible()
      .withTimeout(30000);

    // (2) Search "Emily" -> server-side search (also lastName-sorted) returns
    // Emily Brown (id 103) + Emily Johnson (id 1); Gabriel Adams (id 31) is
    // filtered out. waitFor absorbs the input debounce + network round-trip.
    await element(by.id('search-input')).typeText('Emily');
    await waitFor(element(by.id('user-row-1')))
      .toBeVisible()
      .withTimeout(8000);
    await waitFor(element(by.id('user-row-31')))
      .not.toBeVisible()
      .withTimeout(8000);

    // (3) Clear/reset -> the full sorted list returns, so Gabriel Adams (id 31)
    // is the first row again.
    await element(by.id('search-clear')).tap();
    await waitFor(element(by.id('user-row-31')))
      .toBeVisible()
      .withTimeout(8000);

    // (4) Re-search and open the detail screen for Emily Johnson (id 1).
    await element(by.id('search-input')).typeText('Emily');
    await waitFor(element(by.id('user-row-1')))
      .toBeVisible()
      .withTimeout(8000);

    // The detail screen runs a Reanimated collapsible header; Reanimated's
    // UI-thread runtime keeps Detox's auto-sync from ever settling, so it would
    // wait forever for "idle" on this screen. Disable synchronization for the
    // navigation + assertions — `waitFor` still polls in real time, so the
    // checks remain valid. (Home/search above keep auto-sync.)
    await device.disableSynchronization();
    await element(by.id('user-row-1')).tap();

    await waitFor(element(by.id('user-detail')))
      .toBeVisible()
      .withTimeout(8000);
    await waitFor(element(by.id('collapsible-header')))
      .toBeVisible()
      .withTimeout(8000);

    await device.enableSynchronization();
  });
});
