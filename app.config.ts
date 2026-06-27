import type { ExpoConfig, ConfigContext } from 'expo/config';
import {
  AndroidConfig,
  withAndroidManifest,
  withInfoPlist,
  type ConfigPlugin,
} from 'expo/config-plugins';

/**
 * Typed Expo config. We use `app.config.ts` (over `app.json`) so the DummyJSON
 * base URL can be injected through `extra` and read in `lib/env.ts` via
 * `expo-constants`. Keeping it here means call sites never hard-code the URL.
 */
const API_BASE_URL = 'https://dummyjson.com';

/**
 * Suppress the Expo dev-client launch-time UI: the "developer info" onboarding
 * bottom sheet, the auto-opened dev menu, and the floating action button. A debug
 * build then boots straight into the app instead of stalling Detox behind a
 * popup. The dev menu is still reachable via shake / ⌘D — only the launch-time UI
 * is disabled.
 *
 * expo-dev-menu reads these as native config (iOS Info.plist, Android
 * `<application>` meta-data); their defaults (`ShowsAtLaunch` true,
 * `IsOnboardingFinished` false) are what surface the popup on a fresh install.
 * Applied at prebuild, so it covers every debug build (interactive and E2E).
 */
const DEV_MENU_FLAGS = {
  EXDevMenuShowsAtLaunch: false,
  EXDevMenuIsOnboardingFinished: true,
  EXDevMenuShowFloatingActionButton: false,
};

const withQuietDevMenu: ConfigPlugin = (config) => {
  config = withInfoPlist(config, (cfg) => {
    Object.assign(cfg.modResults, DEV_MENU_FLAGS);
    return cfg;
  });
  config = withAndroidManifest(config, (cfg) => {
    const mainApplication = AndroidConfig.Manifest.getMainApplicationOrThrow(
      cfg.modResults,
    );
    for (const [name, value] of Object.entries(DEV_MENU_FLAGS)) {
      AndroidConfig.Manifest.addMetaDataItemToMainApplication(
        mainApplication,
        name,
        String(value),
      );
    }
    return cfg;
  });
  return config;
};

export default ({ config }: ConfigContext): ExpoConfig => {
  const expoConfig: ExpoConfig = {
    ...config,
    name: 'Users Directory',
    slug: 'users-directory',
    version: '1.0.0',
    orientation: 'portrait',
    icon: './assets/icon.png',
    userInterfaceStyle: 'light',
    scheme: 'usersdirectory',
    ios: {
      supportsTablet: true,
      bundleIdentifier: 'com.example.usersdirectory',
    },
    android: {
      package: 'com.example.usersdirectory',
      adaptiveIcon: {
        backgroundColor: '#E6F4FE',
        foregroundImage: './assets/android-icon-foreground.png',
        backgroundImage: './assets/android-icon-background.png',
        monochromeImage: './assets/android-icon-monochrome.png',
      },
      predictiveBackGestureEnabled: false,
    },
    web: {
      favicon: './assets/favicon.png',
    },
    plugins: [
      'expo-dev-client',
      'expo-image',
      // `subdomains: '*'` makes the Android network security config emit
      // `<base-config cleartextTrafficPermitted="true">`, allowing cleartext
      // (HTTP) to ANY host. Without it, this plugin defaults to permitting
      // cleartext only for 10.0.2.2/localhost, which blocks the Metro dev server
      // when it's served on the machine's LAN IP. Also keeps Detox's test server
      // reachable. NOTE: applies to all build types — acceptable for this dev/
      // take-home app; a production app would scope cleartext to debug only.
      ['@config-plugins/detox', { subdomains: '*' }],
    ],
    extra: {
      apiBaseUrl: API_BASE_URL,
    },
  };

  return withQuietDevMenu(expoConfig);
};
