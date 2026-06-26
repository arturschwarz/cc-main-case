const expoPreset = require('jest-expo/jest-preset');

// jest-expo only transforms .js/.jsx/.ts/.tsx; add .mjs so ESM-only deps
// (MSW pulls in `rettime`, `@bundled-es-modules/*`, etc.) are transpiled too.
const jsTransform = expoPreset.transform['\\.[jt]sx?$'];

/** @type {import('jest').Config} */
module.exports = {
  preset: 'jest-expo',
  setupFilesAfterEnv: ['<rootDir>/jest.setup.ts'],
  transform: {
    ...expoPreset.transform,
    '^.+\\.mjs$': jsTransform,
  },
  moduleFileExtensions: ['js', 'jsx', 'ts', 'tsx', 'mjs', 'json', 'node'],
  moduleNameMapper: {
    '^@/(.*)$': '<rootDir>/src/$1',
    // MSW marks the `react-native` export condition as null, which the jest-expo
    // environment would otherwise pick. Point at the CommonJS builds directly.
    '^msw/node$': '<rootDir>/node_modules/msw/lib/node/index.js',
    '^msw$': '<rootDir>/node_modules/msw/lib/core/index.js',
  },
  // jest-expo ignores most of node_modules; allow the RN/Expo/3rd-party
  // packages that ship untranspiled ESM to be transformed.
  transformIgnorePatterns: [
    'node_modules/(?!((jest-)?react-native|@react-native(-community)?|expo(nent)?|@expo(nent)?/.*|@expo-google-fonts/.*|react-navigation|@react-navigation/.*|@unimodules/.*|unimodules|sentry-expo|native-base|react-native-svg|react-native-reanimated|react-native-worklets|@tanstack/.*|msw|@mswjs/.*|@bundled-es-modules/.*|until-async|rettime|@open-draft/.*|strict-event-emitter|headers-polyfill|outvariant|is-node-process|tough-cookie))',
  ],
  testPathIgnorePatterns: ['/node_modules/', '/e2e/'],
};
