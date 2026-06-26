import { useCallback, useMemo, useState } from 'react';
import {
  ActivityIndicator,
  SectionList,
  StyleSheet,
  View,
  type SectionListRenderItem,
} from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

import type { RootStackScreenProps } from '@/app/navigation';
import { Button, Text } from '@/ui/components';
import { colors, spacing } from '@/ui/theme';

import { useUserDirectory } from '../api/useUserDirectory';
import { SearchBar } from '../components/SearchBar';
import { SectionHeader } from '../components/SectionHeader';
import { SortToggle } from '../components/SortToggle';
import { UserListItem } from '../components/UserListItem';
import { getFullName } from '../components/format';
import type { UserSection } from '../lib/sections';
import type { SortOrder, User, UserSort } from '../types';

/**
 * Home — the Users Directory list. Owns navigation and the local UI state
 * (search term + sort order); all data access goes through the single
 * `useUserDirectory` hook, which returns ready-to-render sections and hides the
 * list/search swap, pagination, and section-building. Rows stay presentational.
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
  } = useUserDirectory({ term, sort });

  const handlePress = useCallback(
    (id: number) => navigation.navigate('UserDetail', { userId: id }),
    [navigation],
  );

  const renderItem = useCallback<SectionListRenderItem<User, UserSection>>(
    ({ item }) => (
      <UserListItem
        id={item.id}
        fullName={getFullName(item)}
        email={item.email}
        imageUri={item.image}
        onPress={handlePress}
      />
    ),
    [handlePress],
  );

  const renderSectionHeader = useCallback(
    ({ section }: { section: UserSection }) => (
      <SectionHeader title={section.title} />
    ),
    [],
  );

  const keyExtractor = useCallback((item: User) => String(item.id), []);

  const handleEndReached = useCallback(() => {
    if (hasNextPage && !isFetchingNextPage) {
      fetchNextPage();
    }
  }, [hasNextPage, isFetchingNextPage, fetchNextPage]);

  const handleRefresh = useCallback(() => {
    refetch();
  }, [refetch]);

  const listFooter = isFetchingNextPage ? (
    <View style={styles.footer}>
      <ActivityIndicator
        testID="loading-indicator-footer"
        accessibilityLabel="Loading more users"
      />
    </View>
  ) : null;

  const listEmpty = (
    <View style={styles.centered} testID="empty-state">
      <Text variant="body" color="secondary" style={styles.centeredText}>
        {isSearching
          ? `No users match "${term}".`
          : 'No users to show right now.'}
      </Text>
    </View>
  );

  let content: React.ReactNode;
  if (isLoading) {
    content = (
      <View style={styles.centered}>
        <ActivityIndicator
          testID="loading-indicator"
          accessibilityLabel="Loading users"
        />
      </View>
    );
  } else if (isError && sections.length === 0) {
    content = (
      <View style={styles.centered}>
        <Text variant="body" color="error" style={styles.centeredText}>
          Something went wrong while loading users.
        </Text>
        <Button
          label="Retry"
          onPress={handleRefresh}
          variant="secondary"
          testID="retry-button"
        />
      </View>
    );
  } else {
    content = (
      <SectionList
        testID="users-list"
        sections={sections}
        renderItem={renderItem}
        renderSectionHeader={renderSectionHeader}
        keyExtractor={keyExtractor}
        stickySectionHeadersEnabled
        ListEmptyComponent={listEmpty}
        ListFooterComponent={listFooter}
        contentContainerStyle={[
          styles.listContent,
          // Bottom safe-area inset so the last row/footer clears the home
          // indicator / gesture bar. Applied to the scroll content (not the
          // screen) so the list still scrolls fully behind it.
          { paddingBottom: insets.bottom + spacing.md },
        ]}
        onEndReached={handleEndReached}
        onEndReachedThreshold={0.5}
        refreshing={isRefetching && !isFetchingNextPage}
        onRefresh={handleRefresh}
        keyboardShouldPersistTaps="handled"
        initialNumToRender={10}
        maxToRenderPerBatch={10}
        windowSize={11}
        // Intentionally OFF. On the New Architecture (Fabric), Android crashes
        // with a ReactClippingViewManager "addViewAt: failed to insert view"
        // IndexOutOfBounds when list contents churn rapidly (e.g. clearing the
        // search term swaps the active query and rebuilds sections). The
        // offscreen-memory win isn't worth the crash; virtualization still
        // bounds how many rows are mounted.
        removeClippedSubviews={false}
      />
    );
  }

  return (
    <View style={styles.container}>
      <View style={styles.searchRow}>
        <SearchBar onDebouncedChange={setTerm} />
        <SortToggle order={order} onToggle={toggleOrder} />
      </View>
      {content}
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
  listContent: {
    flexGrow: 1,
    paddingHorizontal: spacing.lg,
  },
  centered: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    padding: spacing.lg,
    gap: spacing.md,
  },
  centeredText: {
    textAlign: 'center',
  },
  footer: {
    paddingVertical: spacing.lg,
    alignItems: 'center',
  },
});
