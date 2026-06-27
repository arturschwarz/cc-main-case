import { memo, useCallback } from 'react';
import { StyleSheet, View } from 'react-native';

import { Avatar, Card, Text } from '@/ui/components';
import { spacing } from '@/ui/theme';

/** Card height (avatar + two text lines). */
const CARD_HEIGHT = 64;

/**
 * Full row slot = card + the inter-row gap it carries as `marginBottom`. The gap
 * lives on the row (not an ItemSeparator) so the slot has one constant height —
 * useful documentation of the fixed row height and the basis for a future
 * `getItemLayout` should we escalate list perf (see README).
 */
export const ROW_HEIGHT = CARD_HEIGHT + spacing.md;

export interface UserListItemProps {
  id: number;
  fullName: string;
  email: string;
  imageUri?: string;
  /** Receives the stable id; the handler resolves what to do (navigate). */
  onPress: (id: number) => void;
}

/**
 * One row in the Users Directory list. Presentational + memoized: it takes
 * primitive props and a stable `onPress`, so identical rows skip re-render as
 * the list grows. The whole row is one accessible unit ("{fullName}, {email}").
 */
function UserListItemBase({
  id,
  fullName,
  email,
  imageUri,
  onPress,
}: UserListItemProps) {
  const handlePress = useCallback(() => onPress(id), [onPress, id]);

  return (
    <Card
      onPress={handlePress}
      accessibilityLabel={`${fullName}, ${email}`}
      testID={`user-row-${id}`}
      style={styles.card}
    >
      <View style={styles.row}>
        <Avatar uri={imageUri} name={fullName} size="md" />
        <View style={styles.texts}>
          <Text variant="label" numberOfLines={1}>
            {fullName}
          </Text>
          <Text variant="caption" color="secondary" numberOfLines={1}>
            {email}
          </Text>
        </View>
      </View>
    </Card>
  );
}

export const UserListItem = memo(UserListItemBase);

const styles = StyleSheet.create({
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
  },
});
