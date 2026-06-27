import { useEffect } from 'react';
import { StyleSheet, type DimensionValue, type ViewStyle } from 'react-native';
import Animated, {
  Easing,
  cancelAnimation,
  useAnimatedStyle,
  useSharedValue,
  withRepeat,
  withTiming,
} from 'react-native-reanimated';

import { colors, radii } from '../theme';

export interface SkeletonProps {
  /** Width — number (px) or percentage string. Defaults to full width. */
  width?: DimensionValue;
  /** Height in px. Defaults to a single text line. */
  height?: number;
  /** Corner radius. Defaults to `radii.sm`. */
  radius?: number;
  style?: ViewStyle;
  testID?: string;
}

const PULSE_MS = 900;

/**
 * Placeholder block that pulses while content loads. The opacity pulse runs on
 * the UI thread (Reanimated), so it stays smooth on both platforms even while the
 * JS thread builds the first screen. Hidden from screen readers — the enclosing
 * skeleton announces a single "Loading" label instead.
 */
export function Skeleton({
  width = '100%',
  height = 16,
  radius = radii.sm,
  style,
  testID,
}: SkeletonProps) {
  const progress = useSharedValue(0);

  useEffect(() => {
    progress.value = withRepeat(
      withTiming(1, { duration: PULSE_MS, easing: Easing.inOut(Easing.ease) }),
      -1,
      true,
    );
    return () => cancelAnimation(progress);
  }, [progress]);

  const animatedStyle = useAnimatedStyle(() => ({
    opacity: 0.4 + progress.value * 0.4,
  }));

  return (
    <Animated.View
      testID={testID}
      accessibilityElementsHidden
      importantForAccessibility="no-hide-descendants"
      style={[
        styles.base,
        { width, height, borderRadius: radius },
        style,
        animatedStyle,
      ]}
    />
  );
}

const styles = StyleSheet.create({
  base: {
    backgroundColor: colors.border,
  },
});
