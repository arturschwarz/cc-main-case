import { Pressable, StyleSheet } from 'react-native';

import { Text } from '@/ui/components';
import { colors, layout, radii, spacing } from '@/ui/theme';

import type { SortOrder } from '../types';

export interface SortToggleProps {
  /** Current sort direction. */
  order: SortOrder;
  /** Flip the direction (asc ↔ desc). */
  onToggle: () => void;
}

/**
 * Toolbar control that toggles the directory's alphabetical sort by last name.
 *
 * Built from `Pressable` + `Text` rather than the `ui/Button` primitive on
 * purpose: `Button` hard-sets `accessibilityState`, and direction is not a
 * disabled/selected/busy state. We model it with `accessibilityValue.text`
 * ("A to Z" / "Z to A") plus a stable label, which screen readers announce
 * correctly without misrepresenting it as a toggle state.
 */
export function SortToggle({ order, onToggle }: SortToggleProps) {
  // Minimal visible label; the meaning ("by last name") lives in the
  // accessibilityLabel so screen readers still get the full context.
  const label = order === 'asc' ? 'A–Z' : 'Z–A';
  const valueText = order === 'asc' ? 'A to Z' : 'Z to A';

  return (
    <Pressable
      onPress={onToggle}
      accessibilityRole="button"
      accessibilityLabel="Sort users by last name"
      accessibilityHint="Toggles between A to Z and Z to A"
      accessibilityValue={{ text: valueText }}
      android_ripple={{ color: colors.border }}
      hitSlop={8}
      testID="sort-toggle"
      style={({ pressed }) => [styles.base, pressed && styles.pressed]}
    >
      <Text variant="label" color="link">
        {label}
      </Text>
    </Pressable>
  );
}

const styles = StyleSheet.create({
  base: {
    minHeight: layout.minTouchTarget,
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.sm,
    borderRadius: radii.md,
    borderWidth: StyleSheet.hairlineWidth,
    borderColor: colors.border,
    backgroundColor: colors.surface,
  },
  pressed: {
    opacity: 0.7,
  },
});
