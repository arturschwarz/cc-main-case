/**
 * Detox E2E for the sort toggle (A–Z ↔ Z–A).
 *
 * The toggle (testID `sort-toggle`) flips the directory's last-name sort, which
 * re-orders both the list and search. The deterministic, observable outcome is
 * which user lands at the top of the list:
 *   - asc  (A–Z): Gabriel Adams (id 31) is the first row.
 *   - desc (Z–A): Layla Young   (id 191) is the first row.
 * Asserting the top row (rather than the button's en-dash label) keeps the test
 * robust and proves the functional effect of the toggle, not just its caption.
 *
 * Runs in its own file so it gets a fresh app launch at Home (the runner uses
 * maxWorkers: 1, so specs don't share state). Network: real DummyJSON API.
 *
 * `waitFor` is imported explicitly so it shadows Jest's global; `describe`/
 * `beforeAll`/`it` remain Jest globals.
 */
import { by, device, element, waitFor } from 'detox';

describe('Users Directory sort toggle', () => {
  beforeAll(async () => {
    await device.launchApp({ newInstance: true });
  });

  it('reorders the list between A–Z and Z–A', async () => {
    // Default state is A–Z: Gabriel Adams (id 31) leads the list.
    await waitFor(element(by.id('users-list')))
      .toBeVisible()
      .withTimeout(15000);
    await waitFor(element(by.id('user-row-31')))
      .toBeVisible()
      .withTimeout(15000);

    // Toggle to Z–A: the list re-fetches sorted descending, so Layla Young
    // (id 191) becomes the first row and Adams (id 31) drops off the top.
    await element(by.id('sort-toggle')).tap();
    await waitFor(element(by.id('user-row-191')))
      .toBeVisible()
      .withTimeout(8000);
    await waitFor(element(by.id('user-row-31')))
      .not.toBeVisible()
      .withTimeout(8000);

    // Toggle back to A–Z: Adams (id 31) returns to the top, Young (id 191)
    // drops off — confirming the control flips both ways.
    await element(by.id('sort-toggle')).tap();
    await waitFor(element(by.id('user-row-31')))
      .toBeVisible()
      .withTimeout(8000);
    await waitFor(element(by.id('user-row-191')))
      .not.toBeVisible()
      .withTimeout(8000);
  });
});
