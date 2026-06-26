import {
  Pressable,
  StyleSheet,
  View,
  type StyleProp,
  type ViewStyle,
} from 'react-native';
import type { ReactNode } from 'react';

import { colors, radii, spacing } from '../theme';

export interface CardProps {
  children: ReactNode;
  /** When provided, the card becomes pressable (button role + feedback). */
  onPress?: () => void;
  style?: StyleProp<ViewStyle>;
  /** Accessibility label for the pressable variant. */
  accessibilityLabel?: string;
  testID?: string;
}

/**
 * Surface container with consistent padding, radius, and border. Renders as a
 * static `View` by default, or a `Pressable` (with feedback) when `onPress` is
 * supplied — composability without forcing interactivity.
 */
export function Card({
  children,
  onPress,
  style,
  accessibilityLabel,
  testID,
}: CardProps) {
  if (onPress) {
    return (
      <Pressable
        onPress={onPress}
        accessibilityRole="button"
        accessibilityLabel={accessibilityLabel}
        android_ripple={{ color: colors.border }}
        testID={testID}
        style={({ pressed }) => [
          styles.card,
          pressed && styles.pressed,
          style,
        ]}
      >
        {children}
      </Pressable>
    );
  }

  return (
    <View style={[styles.card, style]} testID={testID}>
      {children}
    </View>
  );
}

const styles = StyleSheet.create({
  card: {
    backgroundColor: colors.surface,
    borderRadius: radii.lg,
    borderWidth: StyleSheet.hairlineWidth,
    borderColor: colors.border,
    padding: spacing.lg,
  },
  pressed: {
    opacity: 0.85,
  },
});
