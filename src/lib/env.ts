import Constants from 'expo-constants';

/**
 * Runtime environment, sourced from `app.config.ts` -> `extra`.
 *
 * The DummyJSON base URL is configured once in `app.config.ts` and read here so
 * call sites (apiClient) never hard-code it. Throwing on a missing value fails
 * fast in development rather than producing confusing network errors later.
 */

interface ExtraConfig {
  apiBaseUrl?: string;
}

function readExtra(): ExtraConfig {
  // `expoConfig.extra` is the modern location; fall back for older runtimes.
  const extra = Constants.expoConfig?.extra ?? {};
  return extra as ExtraConfig;
}

function requireString(value: string | undefined, key: string): string {
  if (typeof value !== 'string' || value.length === 0) {
    throw new Error(
      `Missing required config value "${key}". Did you set it in app.config.ts -> extra?`,
    );
  }
  return value;
}

export const env = {
  apiBaseUrl: requireString(readExtra().apiBaseUrl, 'apiBaseUrl'),
} as const;
