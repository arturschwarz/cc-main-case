import { useCallback } from 'react';
import { StyleSheet, View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

import type { RootStackScreenProps } from '@/app/navigation';
import { QueryStateView } from '@/ui/components';
import { colors, spacing } from '@/ui/theme';

import { useUser } from '../api/useUser';
import { CollapsibleHeaderScrollView } from '../components/CollapsibleHeaderScrollView';
import { UserDetailContent } from '../components/UserDetailContent';
import { UserDetailSkeleton } from '../components/UserDetailSkeleton';
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

  const handleRetry = useCallback(() => {
    void refetch();
  }, [refetch]);

  if (!user) {
    return (
      <QueryStateView
        status={isError ? 'error' : 'loading'}
        onRetry={handleRetry}
        loadingContent={<UserDetailSkeleton />}
        errorMessage="Could not load this user."
        containerTestID="user-detail"
      />
    );
  }

  return (
    <View style={styles.container} testID="user-detail">
      <CollapsibleHeaderScrollView
        fullName={getFullName(user)}
        subtitle={user.email}
        imageUri={user.image}
        contentBottomInset={insets.bottom + spacing.xl}
      >
        <UserDetailContent user={user} />
      </CollapsibleHeaderScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.background,
  },
});
