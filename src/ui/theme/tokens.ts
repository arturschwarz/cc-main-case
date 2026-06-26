/**
 * Design tokens — the single source of truth for color, spacing, radii, and
 * typography. Light-only by design (see ADR/README): a static palette keeps the
 * design system simple for this scope; a ThemeProvider/dark mode would be the
 * next step if needed.
 *
 * Frozen so tokens are read-only at runtime. Contrast of text colors against
 * `colors.background`/`colors.surface` targets WCAG AA (>= 4.5:1).
 */

const palette = {
  white: '#FFFFFF',
  black: '#000000',
  // Neutrals
  gray50: '#F7F8FA',
  gray100: '#EEF0F4',
  gray200: '#E2E6EC',
  gray400: '#9AA3B2',
  gray600: '#5B6472',
  gray800: '#2B313B',
  gray900: '#15181E',
  // Brand / accent (contrast >= 4.5:1 on white)
  blue600: '#1D4ED8',
  blue700: '#1E40AF',
  // Feedback
  red600: '#C81E1E',
  green600: '#1F7A4D',
} as const;

export const colors = {
  // Surfaces
  background: palette.gray50,
  surface: palette.white,
  border: palette.gray200,
  overlay: 'rgba(0, 0, 0, 0.4)',
  // Text (on light surfaces)
  text: {
    primary: palette.gray900,
    secondary: palette.gray600,
    muted: palette.gray400,
    inverse: palette.white,
    link: palette.blue600,
    error: palette.red600,
    success: palette.green600,
  },
  // Brand
  primary: palette.blue600,
  primaryPressed: palette.blue700,
  // Feedback
  danger: palette.red600,
  // Decorative
  avatarBackground: palette.gray100,
} as const;

export const spacing = {
  xs: 4,
  sm: 8,
  md: 12,
  lg: 16,
  xl: 24,
  xxl: 32,
} as const;

export const radii = {
  sm: 6,
  md: 10,
  lg: 16,
  pill: 999,
} as const;

export const typography = {
  h1: { fontSize: 32, lineHeight: 38, fontWeight: '700' },
  h2: { fontSize: 26, lineHeight: 32, fontWeight: '700' },
  title: { fontSize: 20, lineHeight: 26, fontWeight: '600' },
  body: { fontSize: 16, lineHeight: 22, fontWeight: '400' },
  label: { fontSize: 14, lineHeight: 18, fontWeight: '600' },
  caption: { fontSize: 13, lineHeight: 17, fontWeight: '400' },
} as const;

/** Minimum interactive hit target (iOS HIG 44pt / Android 48dp). */
export const layout = {
  minTouchTarget: 44,
} as const;

export const tokens = Object.freeze({
  colors,
  spacing,
  radii,
  typography,
  layout,
});

export type Tokens = typeof tokens;
export type TextVariant = keyof typeof typography;
export type TextColor = keyof typeof colors.text;
