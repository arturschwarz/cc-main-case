import { StyleSheet, Text as RNText, type TextProps as RNTextProps } from 'react-native';

import { colors, typography, type TextColor, type TextVariant } from '../theme';

export interface TextProps extends Omit<RNTextProps, 'style'> {
  /** Typographic scale. Defaults to `body`. */
  variant?: TextVariant;
  /** Semantic text color key from the theme. Defaults to `primary`. */
  color?: TextColor;
  /** Escape hatch for one-off layout tweaks; tokens remain the default source. */
  style?: RNTextProps['style'];
}

/**
 * Themed text primitive. All copy in the app should render through this so font
 * sizes, weights, and colors stay consistent and come from tokens.
 */
export function Text({
  variant = 'body',
  color = 'primary',
  style,
  ...rest
}: TextProps) {
  return (
    <RNText
      style={[styles[variant], { color: colors.text[color] }, style]}
      {...rest}
    />
  );
}

const styles = StyleSheet.create({
  h1: typography.h1,
  h2: typography.h2,
  title: typography.title,
  body: typography.body,
  label: typography.label,
  caption: typography.caption,
});
