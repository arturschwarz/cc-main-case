import { useMemo } from 'react';
import { StyleSheet, View } from 'react-native';
import { Image } from 'expo-image';

import { colors, radii, typography } from '../theme';
import { Text } from './Text';

export type AvatarSize = 'sm' | 'md' | 'lg';

export interface AvatarProps {
  /** Remote image URL. When absent/unloadable, initials are shown. */
  uri?: string;
  /** Full name — drives initials fallback and the accessibility label. */
  name: string;
  /** Visual size. Defaults to `md`. */
  size?: AvatarSize;
  testID?: string;
}

const DIMENSIONS: Record<AvatarSize, number> = {
  sm: 32,
  md: 48,
  lg: 96,
};

function getInitials(name: string): string {
  const parts = name.trim().split(/\s+/).filter(Boolean);
  if (parts.length === 0) return '?';
  const first = parts[0]?.[0] ?? '';
  const last = parts.length > 1 ? (parts[parts.length - 1]?.[0] ?? '') : '';
  return (first + last).toUpperCase();
}

/**
 * Circular avatar with an initials fallback. Uses `expo-image` for caching and
 * downsampling of remote avatars; the initials render instantly so list
 * scrolling never blocks on the network.
 */
export function Avatar({ uri, name, size = 'md', testID }: AvatarProps) {
  const dimension = DIMENSIONS[size];
  const initials = useMemo(() => getInitials(name), [name]);

  const containerStyle = {
    width: dimension,
    height: dimension,
    borderRadius: radii.pill,
  };

  return (
    <View
      style={[styles.container, containerStyle]}
      // Group the avatar as a single unit so the initials Text and the overlaid
      // image are not announced separately from the composed name label.
      accessible
      accessibilityRole="image"
      accessibilityLabel={name}
      testID={testID}
    >
      <Text variant="label" color="secondary" style={styles.initials}>
        {initials}
      </Text>
      {uri ? (
        <Image
          style={[StyleSheet.absoluteFill, containerStyle]}
          source={uri}
          contentFit="cover"
          transition={150}
          cachePolicy="memory-disk"
          accessible={false}
        />
      ) : null}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: colors.avatarBackground,
    overflow: 'hidden',
  },
  initials: {
    // Slightly larger weight reads better than the default label size.
    fontWeight: typography.label.fontWeight,
  },
});
