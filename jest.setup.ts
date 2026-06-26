/* eslint-disable @typescript-eslint/no-require-imports */
// Jest setup: matchers, Reanimated mock, and MSW lifecycle/polyfills.
//
// RNTL v14 auto-extends Jest with its native matchers (toBeOnTheScreen,
// toHaveTextContent, ...), so no separate jest-native import is required.
import { TextEncoder, TextDecoder } from 'util';

// --- Expo Constants -------------------------------------------------------
// jest-expo does not load app.config.ts, so `extra` is empty under test.
// Provide the config values lib/env.ts expects.
jest.mock('expo-constants', () => ({
  __esModule: true,
  default: {
    expoConfig: { extra: { apiBaseUrl: 'https://dummyjson.com' } },
  },
}));

// --- Reanimated -----------------------------------------------------------
// The package's own `/mock` transitively initializes react-native-worklets and
// crashes under Jest, so we use a lightweight manual mock (src/test/mocks)
// exposing just the API our screens use. Animated components render
// synchronously; types still come from the real package during `tsc`.
jest.mock('react-native-reanimated', () =>
  require('@/test/mocks/reanimated.js'),
);

// --- MSW polyfills --------------------------------------------------------
// MSW v2 relies on standard Web/Fetch globals. Node 18+ provides them, but the
// jest-expo (react-native) environment does not expose all of them by default,
// so we backfill any that are missing before MSW is imported.
const globalAny = global as unknown as Record<string, unknown>;

if (typeof globalAny.TextEncoder === 'undefined') {
  globalAny.TextEncoder = TextEncoder;
}
if (typeof globalAny.TextDecoder === 'undefined') {
  globalAny.TextDecoder = TextDecoder;
}

// Pull Web Streams / structuredClone from Node core when absent.
if (typeof globalAny.ReadableStream === 'undefined') {
  const streams = require('stream/web');
  globalAny.ReadableStream = streams.ReadableStream;
  globalAny.TransformStream = streams.TransformStream;
  globalAny.WritableStream = streams.WritableStream;
}
if (typeof globalAny.structuredClone === 'undefined') {
  globalAny.structuredClone = (value: unknown) =>
    JSON.parse(JSON.stringify(value));
}

// fetch / Response / Request / Headers are provided as Node globals (Node 18+)
// and are left in place; MSW's interceptors patch them at the network boundary.
if (typeof globalAny.BroadcastChannel === 'undefined') {
  const { BroadcastChannel } = require('worker_threads');
  globalAny.BroadcastChannel = BroadcastChannel;
}

// --- MSW lifecycle --------------------------------------------------------
// Centralized here (testing.md) so every suite shares one server lifecycle
// instead of repeating the boilerplate. `require`d (not `import`ed) so it runs
// AFTER the polyfills above — MSW's network globals must exist at import time.
// `onUnhandledRequest: 'error'` keeps the mock boundary strict: any un-mocked
// request fails the test loudly rather than hitting the real network.
const { server } = require('@/test/server') as typeof import('@/test/server');

beforeAll(() => server.listen({ onUnhandledRequest: 'error' }));
afterEach(() => server.resetHandlers());
afterAll(() => server.close());
