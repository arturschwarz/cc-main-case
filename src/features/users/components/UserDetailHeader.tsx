import { useEffect, useState } from 'react';
import { AccessibilityInfo, StyleSheet } from 'react-native';
import Animated, {
  Extrapolation,
  interpolate,
  runOnJS,
  useAnimatedReaction,
  useAnimatedStyle,
  type SharedValue,
} from 'react-native-reanimated';

import { Avatar, Text } from '@/ui/components';
import { colors, spacing, typography } from '@/ui/theme';

/** Fully-expanded header height (the scroll container offsets content by this). */
export const HEADER_HEIGHT = 220;
/** Collapsed height — a compact title bar with minimal top/bottom whitespace. */
const COMPACT_HEIGHT = 56;
/** Scroll distance over which the expanded block fades into the compact title. */
const COLLAPSE_DISTANCE = 140;
/** Upward drift applied to the expanded block as it fades out. */
const COLLAPSE_TRANSLATE = 24;
/** Distance the compact title slides leftward into place as it appears. */
const COMPACT_SLIDE = spacing.xl;

export interface UserDetailHeaderProps {
  fullName: string;
  /** Secondary line under the name (e.g. email). */
  subtitle?: string;
  imageUri?: string;
  /** Live scroll offset from the detail ScrollView (UI thread). */
  scrollY: SharedValue<number>;
}

/**
 * Collapsible detail header. As the body scrolls, the header height shrinks from
 * `HEADER_HEIGHT` to a compact title bar (`COMPACT_HEIGHT`): the large avatar/
 * name block fades and drifts up while a single-line compact title crossfades
 * in. The compact title is left-aligned and normal-weight (vs. the expanded
 * centered, bold name), and slides leftward into place as it fades in, so the
 * collapse reads as the title smoothly moving to the left and de-emphasizing.
 * Height, opacity, and transform are all interpolated on the UI thread
 * (Reanimated). Honors the OS "reduce motion" setting (stays fully expanded).
 */
export function UserDetailHeader({
  fullName,
  subtitle,
  imageUri,
  scrollY,
}: UserDetailHeaderProps) {
  const reducedMotion = useReducedMotion();
  const [expanded, setExpanded] = useState(true);

  useAnimatedReaction(
    () => scrollY.value < COLLAPSE_DISTANCE * 0.6,
    (isExpanded, previous) => {
      if (previous !== null && isExpanded !== previous) {
        runOnJS(setExpanded)(isExpanded);
      }
    },
    [],
  );

  const headerStyle = useAnimatedStyle(() => {
    if (reducedMotion) {
      return { height: HEADER_HEIGHT };
    }
    return {
      height: interpolate(
        scrollY.value,
        [0, COLLAPSE_DISTANCE],
        [HEADER_HEIGHT, COMPACT_HEIGHT],
        Extrapolation.CLAMP,
      ),
    };
  });

  const expandedStyle = useAnimatedStyle(() => {
    if (reducedMotion) {
      return { opacity: 1, transform: [{ translateY: 0 }] };
    }
    return {
      opacity: interpolate(
        scrollY.value,
        [0, COLLAPSE_DISTANCE],
        [1, 0],
        Extrapolation.CLAMP,
      ),
      transform: [
        {
          translateY: interpolate(
            scrollY.value,
            [0, COLLAPSE_DISTANCE],
            [0, -COLLAPSE_TRANSLATE],
            Extrapolation.CLAMP,
          ),
        },
      ],
    };
  });

  const compactStyle = useAnimatedStyle(() => {
    if (reducedMotion) {
      return { opacity: 0, transform: [{ translateX: 0 }] };
    }
    const progress = interpolate(
      scrollY.value,
      [COLLAPSE_DISTANCE * 0.6, COLLAPSE_DISTANCE],
      [0, 1],
      Extrapolation.CLAMP,
    );
    return {
      opacity: progress,
      // Slide from a small rightward offset to its left-aligned resting spot as
      // it fades in, so the title visibly travels to the left during collapse.
      transform: [{ translateX: interpolate(progress, [0, 1], [COMPACT_SLIDE, 0]) }],
    };
  });

  return (
    <Animated.View
      style={[styles.header, headerStyle]}
      testID="collapsible-header"
      accessibilityRole="header"
      accessibilityState={{ expanded }}
    >
      <Animated.View
        style={[styles.expanded, expandedStyle]}
        pointerEvents="none"
      >
        <Avatar uri={imageUri} name={fullName} size="lg" />
        <Text variant="title" style={styles.name} numberOfLines={1}>
          {fullName}
        </Text>
        {subtitle ? (
          <Text variant="caption" color="secondary" numberOfLines={1}>
            {subtitle}
          </Text>
        ) : null}
      </Animated.View>

      <Animated.View
        style={[styles.compact, compactStyle]}
        pointerEvents="none"
        testID="detail-compact-title"
      >
        <Text variant="title" style={styles.compactTitle} numberOfLines={1}>
          {fullName}
        </Text>
      </Animated.View>
    </Animated.View>
  );
}

/**
 * Track the OS "reduce motion" preference. Uses `AccessibilityInfo` (rather than
 * Reanimated's `useReducedMotion`, which is absent from the test mock) so the
 * component renders in both the app and tests.
 */
function useReducedMotion(): boolean {
  const [reduced, setReduced] = useState(false);

  useEffect(() => {
    let mounted = true;
    void AccessibilityInfo.isReduceMotionEnabled().then((value) => {
      if (mounted) setReduced(value);
    });
    const subscription = AccessibilityInfo.addEventListener(
      'reduceMotionChanged',
      setReduced,
    );
    return () => {
      mounted = false;
      subscription.remove();
    };
  }, []);

  return reduced;
}

const styles = StyleSheet.create({
  header: {
    // Height is animated (HEADER_HEIGHT -> COMPACT_HEIGHT). overflow:hidden so
    // the expanded block clips (not squishes) as the bar shrinks while fading.
    // Matches the detail screen background (not surface) so the header blends
    // in; still opaque, so rows are obscured when the bar collapses over them.
    backgroundColor: colors.background,
    overflow: 'hidden',
  },
  expanded: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    // Pinned to the full expanded height so the avatar/name keep their layout
    // and are clipped from the bottom (not compressed) as the header collapses.
    height: HEADER_HEIGHT,
    alignItems: 'center',
    justifyContent: 'center',
    padding: spacing.lg,
  },
  name: {
    marginTop: spacing.md,
    textAlign: 'center',
  },
  compact: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    // Left-aligned (vs. the expanded block's centered name), vertically centered
    // in the thin bar. Horizontal padding matches the detail content inset.
    alignItems: 'flex-start',
    justifyContent: 'center',
    paddingHorizontal: spacing.lg,
  },
  compactTitle: {
    // Normal weight in the collapsed state (the expanded name is bold `title`).
    fontWeight: typography.body.fontWeight,
  },
});
