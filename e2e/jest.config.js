/**
 * Jest runner config for Detox E2E (Detox 20).
 *
 * Separate from the unit/integration `jest.config.js` at the repo root: this
 * one uses Detox's Jest environment/reporter and only matches `e2e/**.test.ts`.
 * The root Jest config ignores `/e2e/`, so `npm test` never picks these up.
 *
 * @type {import('jest').Config}
 */
module.exports = {
  rootDir: '..',
  testMatch: ['<rootDir>/e2e/**/*.test.ts'],
  testTimeout: 120000,
  maxWorkers: 1,
  globalSetup: 'detox/runners/jest/globalSetup',
  globalTeardown: 'detox/runners/jest/globalTeardown',
  reporters: ['detox/runners/jest/reporter'],
  testEnvironment: 'detox/runners/jest/testEnvironment',
  verbose: true,
};
