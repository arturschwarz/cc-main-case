import { useCallback } from 'react';
import {
  ActivityIndicator,
  SectionList,
  StyleSheet,
  View,
  type SectionListRenderItem,
} from 'react-native';

import { spacing } from '@/ui/theme';

import type { UserSection } from '../lib/sections';
import type { User } from '../types';
import { SectionHeader } from './SectionHeader';
import { UserListItem } from './UserListItem';
import { getFullName } from './format';

export interface UserDirectoryListProps {
  /** Globally-sorted Users grouped into alphabetical sections. */
  sections: UserSection[];
  /** Row press handler; receives the stable User id. */
  onPressUser: (id: number) => void;
  /** Whether another page exists (gates `onEndReached`). */
  hasNextPage: boolean;
  /** Whether the next page is in flight (gates `onEndReached`; drives footer). */
  isFetchingNextPage: boolean;
  /** Loads the next page. */
  fetchNextPage: () => void;
  /** Whether a pull-to-refresh refetch is in flight. */
  isRefetching: boolean;
  /** Pull-to-refresh handler. */
  onRefresh: () => void;
  /** Extra bottom padding for the scroll content (e.g. safe-area inset). */
  contentBottomInset?: number;
}

/**
 * The Users Directory list. Owns the virtualized `SectionList`, its perf tuning,
 * the Android/Fabric `removeClippedSubviews` workaround, the footer spinner, and
 * the pagination gating — so the screen passes ready-made sections plus the
 * directory's status and never touches list configuration or cache state.
 */
export function UserDirectoryList({
  sections,
  onPressUser,
  hasNextPage,
  isFetchingNextPage,
  fetchNextPage,
  isRefetching,
  onRefresh,
  contentBottomInset = 0,
}: UserDirectoryListProps) {
  const renderItem = useCallback<SectionListRenderItem<User, UserSection>>(
    ({ item }) => (
      <UserListItem
        id={item.id}
        fullName={getFullName(item)}
        email={item.email}
        imageUri={item.image}
        onPress={onPressUser}
      />
    ),
    [onPressUser],
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

  const listFooter = isFetchingNextPage ? (
    <View style={styles.footer}>
      <ActivityIndicator
        testID="loading-indicator-footer"
        accessibilityLabel="Loading more users"
      />
    </View>
  ) : null;

  return (
    <SectionList
      testID="users-list"
      sections={sections}
      renderItem={renderItem}
      renderSectionHeader={renderSectionHeader}
      keyExtractor={keyExtractor}
      stickySectionHeadersEnabled
      ListFooterComponent={listFooter}
      contentContainerStyle={[
        styles.content,
        // Bottom safe-area inset so the last row/footer clears the home
        // indicator / gesture bar. Applied to the scroll content (not the
        // screen) so the list still scrolls fully behind it.
        { paddingBottom: contentBottomInset },
      ]}
      onEndReached={handleEndReached}
      onEndReachedThreshold={0.5}
      refreshing={isRefetching && !isFetchingNextPage}
      onRefresh={onRefresh}
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

const styles = StyleSheet.create({
  content: {
    flexGrow: 1,
    paddingHorizontal: spacing.lg,
  },
  footer: {
    paddingVertical: spacing.lg,
    alignItems: 'center',
  },
});
