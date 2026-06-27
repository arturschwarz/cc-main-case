import { useEffect } from 'react';
import { StyleSheet, type ViewStyle } from 'react-native';
import Animated, {
  Easing,
  cancelAnimation,
  useAnimatedStyle,
  useSharedValue,
  withRepeat,
  withTiming,
} from 'react-native-reanimated';

import { colors } from '../theme';

export interface SpinnerProps {
  /** Diameter in px. Defaults to `md` (28). */
  size?: number;
  /** Ring color. Defaults to the theme primary. */
  color?: string;
  /** Screen-reader label. Defaults to `Loading`. */
  accessibilityLabel?: string;
  testID?: string;
}

const SPIN_DURATION_MS = 800;

/**
 * Continuously rotating ring spinner, driven by Reanimated on the UI thread.
 *
 * Used instead of `ActivityIndicator`: on Android (New Architecture) the native
 * indicator can render static during the initial load, and a UI-thread rotation
 * keeps spinning smoothly even while the JS thread is busy building the first
 * screen. Exposes a `busy` accessibility state so it reads as a progress
 * indicator.
 */
export function Spinner({
  size = 28,
  color = colors.primary,
  accessibilityLabel = 'Loading',
  testID,
}: SpinnerProps) {
  const rotation = useSharedValue(0);

  useEffect(() => {
    rotation.value = withRepeat(
      withTiming(360, { duration: SPIN_DURATION_MS, easing: Easing.linear }),
      -1,
      false,
    );
    return () => cancelAnimation(rotation);
  }, [rotation]);

  const animatedStyle = useAnimatedStyle(() => ({
    transform: [{ rotate: `${rotation.value}deg` }],
  }));

  const ringStyle: ViewStyle = {
    width: size,
    height: size,
    borderRadius: size / 2,
    borderWidth: Math.max(2, Math.round(size / 10)),
    borderColor: color,
    // A transparent segment turns the full ring into an arc, so the rotation
    // reads as spinning rather than a static circle.
    borderTopColor: 'transparent',
  };

  return (
    <Animated.View
      testID={testID}
      accessibilityRole="progressbar"
      accessibilityLabel={accessibilityLabel}
      accessibilityState={{ busy: true }}
      style={[styles.base, ringStyle, animatedStyle]}
    />
  );
}

const styles = StyleSheet.create({
  base: {
    alignSelf: 'center',
  },
});
