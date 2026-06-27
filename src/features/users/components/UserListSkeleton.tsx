import { StyleSheet, View } from 'react-native';

import { Card, Skeleton } from '@/ui/components';
import { spacing } from '@/ui/theme';

/** Rows to render — enough to fill a typical screen before data arrives. */
const ROW_COUNT = 8;
/** Matches the `md` Avatar + fixed row height of `UserListItem`. */
const AVATAR_SIZE = 48;
const CARD_HEIGHT = 64;

function SkeletonRow() {
  return (
    <Card style={styles.card}>
      <View style={styles.row}>
        <Skeleton width={AVATAR_SIZE} height={AVATAR_SIZE} radius={AVATAR_SIZE / 2} />
        <View style={styles.texts}>
          <Skeleton width="55%" height={14} />
          <Skeleton width="38%" height={12} />
        </View>
      </View>
    </Card>
  );
}

/**
 * Loading placeholder for the Users Directory list: pulsing rows that mirror
 * `UserListItem`'s layout (avatar + two text lines), so the transition to real
 * data doesn't shift the page. Announces a single "Loading users" label; carries
 * the `loading-indicator` testID the loading state is queried by.
 */
export function UserListSkeleton() {
  return (
    <View
      style={styles.container}
      testID="loading-indicator"
      accessible
      accessibilityRole="progressbar"
      accessibilityLabel="Loading users"
      accessibilityState={{ busy: true }}
    >
      {Array.from({ length: ROW_COUNT }, (_, index) => (
        <SkeletonRow key={index} />
      ))}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    paddingHorizontal: spacing.lg,
  },
  card: {
    height: CARD_HEIGHT,
    marginBottom: spacing.md,
    justifyContent: 'center',
    paddingVertical: spacing.sm,
  },
  row: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  texts: {
    flex: 1,
    marginLeft: spacing.md,
    gap: spacing.xs,
  },
});
