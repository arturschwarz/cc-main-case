import { StyleSheet, View } from 'react-native';

import { Card, Skeleton } from '@/ui/components';
import { colors, spacing } from '@/ui/theme';

import { HEADER_HEIGHT } from './UserDetailHeader';

/** Matches the `lg` Avatar used in the expanded detail header. */
const AVATAR_SIZE = 96;

function SkeletonCard({ lines }: { lines: number }) {
  return (
    <Card style={styles.card}>
      <Skeleton width="30%" height={12} />
      {Array.from({ length: lines }, (_, index) => (
        <View key={index} style={styles.field}>
          <Skeleton width="40%" height={10} />
          <Skeleton width="70%" height={14} />
        </View>
      ))}
    </Card>
  );
}

/**
 * Loading placeholder for the detail screen: a header block (avatar + name +
 * subtitle) over a couple of field cards, mirroring `UserDetailHeader` +
 * `UserDetailContent`. Rarely seen in practice (the detail usually renders
 * instantly from the list cache via `placeholderData`); shown on a cold
 * deep-link. Carries the `user-detail` testID the screen is identified by.
 */
export function UserDetailSkeleton() {
  return (
    <View
      style={styles.container}
      testID="user-detail"
      accessible
      accessibilityRole="progressbar"
      accessibilityLabel="Loading user"
      accessibilityState={{ busy: true }}
    >
      <View style={styles.header}>
        <Skeleton width={AVATAR_SIZE} height={AVATAR_SIZE} radius={AVATAR_SIZE / 2} />
        <Skeleton width={180} height={20} style={styles.headerName} />
        <Skeleton width={140} height={14} />
      </View>
      <View style={styles.content}>
        <SkeletonCard lines={3} />
        <SkeletonCard lines={4} />
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.background,
  },
  header: {
    height: HEADER_HEIGHT,
    alignItems: 'center',
    justifyContent: 'center',
    padding: spacing.lg,
    gap: spacing.sm,
  },
  headerName: {
    marginTop: spacing.md,
  },
  content: {
    padding: spacing.lg,
    gap: spacing.lg,
  },
  card: {
    gap: spacing.md,
  },
  field: {
    gap: spacing.xs,
  },
});
