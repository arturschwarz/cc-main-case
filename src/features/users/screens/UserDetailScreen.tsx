import { useCallback } from 'react';
import { ActivityIndicator, StyleSheet, View } from 'react-native';
import Animated, {
  useAnimatedScrollHandler,
  useSharedValue,
} from 'react-native-reanimated';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

import type { RootStackScreenProps } from '@/app/navigation';
import { Button, Text } from '@/ui/components';
import { colors, spacing } from '@/ui/theme';

import { useUser } from '../api/useUser';
import { UserDetailContent } from '../components/UserDetailContent';
import { HEADER_HEIGHT, UserDetailHeader } from '../components/UserDetailHeader';
import { getFullName } from '../components/format';

/**
 * User detail screen. Fetches by the stable `userId` route param and renders
 * instantly from list/search cache via `placeholderData`, then refetches the
 * full record. The collapsible header reacts to the body's scroll offset.
 */
export function UserDetailScreen({ route }: RootStackScreenProps<'UserDetail'>) {
  const { userId } = route.params;
  const insets = useSafeAreaInsets();
  const { data: user, isError, refetch } = useUser(userId);

  const scrollY = useSharedValue(0);
  const onScroll = useAnimatedScrollHandler((event) => {
    scrollY.value = event.contentOffset.y;
  });

  const handleRetry = useCallback(() => {
    void refetch();
  }, [refetch]);

  if (!user) {
    if (isError) {
      return (
        <View style={styles.centered} testID="user-detail">
          <Text variant="body" color="error" style={styles.centeredText}>
            Could not load this user.
          </Text>
          <Button
            label="Retry"
            onPress={handleRetry}
            variant="secondary"
            testID="retry-button"
          />
        </View>
      );
    }
    return (
      <View style={styles.centered} testID="user-detail">
        <ActivityIndicator
          testID="loading-indicator"
          accessibilityLabel="Loading user"
        />
      </View>
    );
  }

  return (
    <View style={styles.container} testID="user-detail">
      <Animated.ScrollView
        testID="detail-scroll"
        onScroll={onScroll}
        scrollEventThrottle={16}
        contentContainerStyle={[
          styles.scrollContent,
          // Bottom safe-area inset so the end of the detail content clears the
          // home indicator / gesture bar.
          { paddingBottom: insets.bottom + spacing.xl },
        ]}
        showsVerticalScrollIndicator={false}
      >
        <UserDetailContent user={user} />
      </Animated.ScrollView>

      <View style={styles.headerWrap} pointerEvents="box-none">
        <UserDetailHeader
          fullName={getFullName(user)}
          subtitle={user.email}
          imageUri={user.image}
          scrollY={scrollY}
        />
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.background,
  },
  scrollContent: {
    paddingTop: HEADER_HEIGHT,
    // paddingBottom is applied inline with the bottom safe-area inset.
  },
  headerWrap: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
  },
  centered: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    padding: spacing.lg,
    gap: spacing.md,
    backgroundColor: colors.background,
  },
  centeredText: {
    textAlign: 'center',
  },
});
