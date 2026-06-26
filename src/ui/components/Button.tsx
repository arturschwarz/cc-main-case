import { useCallback } from 'react';
import {
  ActivityIndicator,
  Pressable,
  StyleSheet,
  View,
  type GestureResponderEvent,
  type PressableProps,
} from 'react-native';

import { colors, layout, radii, spacing } from '../theme';
import { Text, type TextProps } from './Text';

export type ButtonVariant = 'primary' | 'secondary' | 'ghost';

export interface ButtonProps
  extends Omit<PressableProps, 'children' | 'style' | 'onPress' | 'disabled'> {
  label: string;
  onPress: (event: GestureResponderEvent) => void;
  /** Visual style. Defaults to `primary`. */
  variant?: ButtonVariant;
  disabled?: boolean;
  /** Shows a spinner, marks the control busy, and blocks `onPress`. */
  loading?: boolean;
  testID?: string;
}

/**
 * Themed pressable button. Accessibility (`button` role, `disabled`/`busy`
 * state) and a 44pt minimum hit target are built in so consumers get accessible
 * behavior for free.
 */
export function Button({
  label,
  onPress,
  variant = 'primary',
  disabled = false,
  loading = false,
  testID,
  ...rest
}: ButtonProps) {
  const isInactive = disabled || loading;

  const handlePress = useCallback(
    (event: GestureResponderEvent) => {
      if (isInactive) return;
      onPress(event);
    },
    [isInactive, onPress],
  );

  const textColor: TextProps['color'] =
    variant === 'primary' ? 'inverse' : 'link';

  return (
    <Pressable
      onPress={handlePress}
      disabled={isInactive}
      accessibilityRole="button"
      accessibilityState={{ disabled: isInactive, busy: loading }}
      android_ripple={{ color: colors.border }}
      hitSlop={8}
      testID={testID}
      style={({ pressed }) => [
        styles.base,
        styles[variant],
        pressed && !isInactive && styles.pressed,
        disabled && styles.disabled,
      ]}
      {...rest}
    >
      {/* Keep label width stable while loading by overlaying the spinner. */}
      <View style={styles.content}>
        <Text
          variant="label"
          color={textColor}
          style={loading ? styles.hiddenLabel : undefined}
        >
          {label}
        </Text>
        {loading ? (
          <ActivityIndicator
            style={StyleSheet.absoluteFill}
            color={variant === 'primary' ? colors.text.inverse : colors.primary}
            accessibilityLabel="Loading"
          />
        ) : null}
      </View>
    </Pressable>
  );
}

const styles = StyleSheet.create({
  base: {
    minHeight: layout.minTouchTarget,
    paddingHorizontal: spacing.lg,
    paddingVertical: spacing.sm,
    borderRadius: radii.md,
    alignItems: 'center',
    justifyContent: 'center',
  },
  content: {
    alignItems: 'center',
    justifyContent: 'center',
  },
  primary: {
    backgroundColor: colors.primary,
  },
  secondary: {
    backgroundColor: colors.surface,
    borderWidth: StyleSheet.hairlineWidth,
    borderColor: colors.primary,
  },
  ghost: {
    backgroundColor: 'transparent',
  },
  pressed: {
    opacity: 0.7,
  },
  disabled: {
    opacity: 0.5,
  },
  hiddenLabel: {
    opacity: 0,
  },
});
