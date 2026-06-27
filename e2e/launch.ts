import { device } from 'detox';

/**
 * Launch the app at a fresh instance for an E2E run.
 *
 * - **Release** (the default E2E path) embeds the JS bundle, so a plain launch
 *   loads the app directly.
 * - **Debug** is an Expo dev-client that fetches JS from Metro at runtime. A
 *   plain launch lands on the dev-launcher screen ("enter exp:// URL"). When
 *   `E2E_DEV_CLIENT` is set we deep-link the client at Metro so it skips the
 *   launcher and loads our bundle immediately.
 *
 * Deep-link delivery differs per platform:
 * - **iOS**: cold-launch, then `openURL` against the running client. Passing
 *   `url` to a cold `launchApp` is dropped by some iOS dev-client versions.
 * - **Android**: deliver the deep link as the cold-launch intent
 *   (`launchApp({ url })`). `openURL` only sends a VIEW intent to the
 *   already-foreground launcher, which doesn't reload it — the menu just stays.
 *
 * Metro must be running for the debug path; `e2e:ios:debug` / `e2e:android:debug`
 * start and stop it for you. The first launch then waits on Metro's initial
 * bundle build, which is why the specs allow a long timeout on the first query.
 */
export async function launchAtHome(): Promise<void> {
  if (!process.env.E2E_DEV_CLIENT) {
    await device.launchApp({ newInstance: true });
    return;
  }

  const isAndroid = device.getPlatform() === 'android';
  // Android emulators reach the host loopback via 10.0.2.2; the iOS simulator
  // shares the host network, so localhost works.
  const host = isAndroid ? '10.0.2.2' : 'localhost';
  const metroUrl = `http://${host}:8081`;
  const url = `usersdirectory://expo-development-client/?url=${encodeURIComponent(
    metroUrl,
  )}`;

  console.log(`[e2e] dev-client launch -> ${url}`);

  if (isAndroid) {
    await device.launchApp({ newInstance: true, url });
    return;
  }

  await device.launchApp({ newInstance: true });
  await device.openURL({ url });
}
