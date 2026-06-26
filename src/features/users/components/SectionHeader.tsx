import { memo } from 'react';
import { StyleSheet, View } from 'react-native';

import { Text } from '@/ui/components';
import { colors, spacing } from '@/ui/theme';

/**
 * Fixed height of a sticky section header. Kept constant so the list's layout is
 * predictable and the header fully obscures rows scrolling beneath it.
 */
export const SECTION_HEADER_HEIGHT = 32;

export interface SectionHeaderProps {
  /** Single uppercase letter A–Z, or '#'. */
  title: string;
}

/**
 * Sticky alphabetical section header for the Users Directory list. Presentational
 * and memoized. The OPAQUE background matters: when a header is stuck at the top,
 * rows scroll under it, so it must paint over them rather than let them show
 * through.
 */
function SectionHeaderBase({ title }: SectionHeaderProps) {
  return (
    <View
      style={styles.container}
      accessibilityRole="header"
      accessible
      testID={`section-header-${title}`}
    >
      <Text variant="label" color="secondary">
        {title}
      </Text>
    </View>
  );
}

export const SectionHeader = memo(SectionHeaderBase);

const styles = StyleSheet.create({
  container: {
    height: SECTION_HEADER_HEIGHT,
    justifyContent: 'center',
    // Align the letter with the row content (rows sit at spacing.lg inset).
    paddingHorizontal: spacing.lg,
    // Opaque so stuck headers obscure rows scrolling underneath.
    backgroundColor: colors.background,
  },
});
