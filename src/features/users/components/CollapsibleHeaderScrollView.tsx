import { type ReactNode } from 'react';
import { StyleSheet, View } from 'react-native';
import Animated, {
  useAnimatedScrollHandler,
  useSharedValue,
} from 'react-native-reanimated';

import { HEADER_HEIGHT, UserDetailHeader } from './UserDetailHeader';

export interface CollapsibleHeaderScrollViewProps {
  /** Primary label rendered in the header (the User's full name). */
  fullName: string;
  /** Secondary line under the name (e.g. email). */
  subtitle?: string;
  imageUri?: string;
  /** Extra bottom padding for the scroll content (e.g. safe-area inset). */
  contentBottomInset?: number;
  /** Scrollable body rendered beneath the collapsing header. */
  children: ReactNode;
  /** testID for the scroll view. Defaults to `detail-scroll`. */
  testID?: string;
}

/**
 * Scroll view paired with a collapsing header. Owns the scroll offset
 * `SharedValue`, the animated scroll handler, the content inset that clears the
 * expanded header, and the header overlay — so callers pass only header data and
 * body content and never touch Reanimated. The animation knowledge that used to
 * straddle the detail screen and the header now lives behind one interface.
 */
export function CollapsibleHeaderScrollView({
  fullName,
  subtitle,
  imageUri,
  contentBottomInset = 0,
  children,
  testID = 'detail-scroll',
}: CollapsibleHeaderScrollViewProps) {
  const scrollY = useSharedValue(0);
  const onScroll = useAnimatedScrollHandler((event) => {
    scrollY.value = event.contentOffset.y;
  });

  return (
    <View style={styles.fill}>
      <Animated.ScrollView
        testID={testID}
        onScroll={onScroll}
        scrollEventThrottle={16}
        contentContainerStyle={[
          { paddingTop: HEADER_HEIGHT, paddingBottom: contentBottomInset },
        ]}
        showsVerticalScrollIndicator={false}
      >
        {children}
      </Animated.ScrollView>

      <View style={styles.headerWrap} pointerEvents="box-none">
        <UserDetailHeader
          fullName={fullName}
          subtitle={subtitle}
          imageUri={imageUri}
          scrollY={scrollY}
        />
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  fill: {
    flex: 1,
  },
  headerWrap: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
  },
});
