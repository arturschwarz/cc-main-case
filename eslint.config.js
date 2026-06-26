// ESLint flat config (ESLint 9). Builds on eslint-config-expo and adds the
// architectural import-boundary rules from .claude/rules/architecture.md:
//   ui/   must not import from features/ or lib/
//   lib/  must not import from features/ or ui/
// Enforced with import/no-restricted-paths (operates on resolved paths, so it
// catches both "@/..." alias and relative imports).
const expoConfig = require('eslint-config-expo/flat');
const prettier = require('eslint-config-prettier');

module.exports = [
  ...expoConfig,
  prettier,
  {
    ignores: [
      'node_modules/**',
      '.expo/**',
      'dist/**',
      'coverage/**',
      'ios/**',
      'android/**',
      'babel.config.js',
      'jest.config.js',
      'eslint.config.js',
    ],
  },
  {
    files: ['src/**/*.{ts,tsx}'],
    settings: {
      'import/resolver': {
        typescript: { project: './tsconfig.json' },
      },
    },
    rules: {
      'import/no-restricted-paths': [
        'error',
        {
          zones: [
            {
              target: './src/ui',
              from: ['./src/features', './src/lib'],
              message:
                'ui/ is a generic design system and must not import from features/ or lib/.',
            },
            {
              target: './src/lib',
              from: ['./src/features', './src/ui'],
              message:
                'lib/ is cross-cutting infra and must not import from features/ or ui/.',
            },
          ],
        },
      ],
      '@typescript-eslint/no-explicit-any': 'error',
    },
  },
];
