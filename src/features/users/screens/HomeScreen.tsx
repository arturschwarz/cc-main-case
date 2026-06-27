import { useCallback, useMemo, useState } from 'react';
import { StyleSheet, View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

import type { RootStackScreenProps } from '@/app/navigation';
import { QueryStateView, Text, type QueryViewStatus } from '@/ui/components';
import { colors, radii, spacing } from '@/ui/theme';

import { useUserDirectory } from '../api/useUserDirectory';
import { SearchBar } from '../components/SearchBar';
import { SortToggle } from '../components/SortToggle';
import { UserDirectoryList } from '../components/UserDirectoryList';
import { UserListSkeleton } from '../components/UserListSkeleton';
import type { SortOrder, UserSort } from '../types';

/**
 * Home — the Users Directory list. Owns navigation and the local UI state
 * (search term + sort order); all data access goes through the single
 * `useUserDirectory` hook, the list plumbing through `UserDirectoryList`, and the
 * loading/error/empty states through `QueryStateView`. The screen is composition.
 */
export function HomeScreen({ navigation }: RootStackScreenProps<'Home'>) {
  const insets = useSafeAreaInsets();
  const [term, setTerm] = useState('');
  const isSearching = term.length > 0;

  // Alphabetical sort by last name, defaulting to A–Z from first load. The same
  // sort feeds both the list and search so results stay consistently ordered.
  const [order, setOrder] = useState<SortOrder>('asc');
  const toggleOrder = useCallback(
    () => setOrder((o) => (o === 'asc' ? 'desc' : 'asc')),
    [],
  );
  const sort = useMemo<UserSort>(() => ({ sortBy: 'lastName', order }), [order]);

  const {
    sections,
    isLoading,
    isError,
    isRefetching,
    isFetchingNextPage,
    hasNextPage,
    fetchNextPage,
    refetch,
    isPartialResults,
  } = useUserDirectory({ term, sort });

  const handlePress = useCallback(
    (id: number) => navigation.navigate('UserDetail', { userId: id }),
    [navigation],
  );

  const handleRefresh = useCallback(() => {
    refetch();
  }, [refetch]);

  const status: QueryViewStatus = isLoading
    ? 'loading'
    : isError && sections.length === 0
      ? 'error'
      : sections.length === 0
        ? 'empty'
        : 'ready';

  return (
    <View style={styles.container}>
      <View style={styles.searchRow}>
        <SearchBar onDebouncedChange={setTerm} />
        <SortToggle order={order} onToggle={toggleOrder} />
      </View>
      {isPartialResults ? (
        <View
          style={styles.notice}
          testID="offline-notice"
          accessibilityRole="alert"
        >
          <Text variant="caption" color="secondary">
            Offline — showing cached matches; results may be incomplete.
          </Text>
        </View>
      ) : null}
      <QueryStateView
        status={status}
        onRetry={handleRefresh}
        loadingContent={<UserListSkeleton />}
        errorMessage="Something went wrong while loading users."
        emptyMessage={
          isSearching ? `No users match "${term}".` : 'No users to show right now.'
        }
      >
        <UserDirectoryList
          sections={sections}
          onPressUser={handlePress}
          hasNextPage={hasNextPage}
          isFetchingNextPage={isFetchingNextPage}
          fetchNextPage={fetchNextPage}
          isRefetching={isRefetching}
          onRefresh={handleRefresh}
          contentBottomInset={insets.bottom + spacing.md}
        />
      </QueryStateView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.background,
    // Native-stack header already handles the top safe area; only add a small
    // gap that matches the horizontal padding (spacing.lg) for uniform insets.
    paddingTop: spacing.lg,
  },
  searchRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.sm,
    paddingHorizontal: spacing.lg,
    paddingBottom: spacing.md,
  },
  notice: {
    marginHorizontal: spacing.lg,
    marginBottom: spacing.md,
    padding: spacing.sm,
    borderRadius: radii.sm,
    backgroundColor: colors.surface,
    borderWidth: 1,
    borderColor: colors.border,
  },
});
