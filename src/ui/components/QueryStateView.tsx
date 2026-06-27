import { type ReactNode } from 'react';
import { ActivityIndicator, StyleSheet, View } from 'react-native';

import { Button } from './Button';
import { Text } from './Text';
import { colors, spacing } from '../theme';

export type QueryViewStatus = 'loading' | 'error' | 'empty' | 'ready';

export interface QueryStateViewProps {
  /** Which state to render. `ready` renders {@link children}. */
  status: QueryViewStatus;
  /** Success content, rendered only when `status` is `ready`. */
  children?: ReactNode;
  /** Retry handler shown in the error state. */
  onRetry?: () => void;
  /** Accessibility label for the loading spinner. */
  loadingLabel?: string;
  /** Message shown in the error state. */
  errorMessage?: string;
  /** Message shown in the empty state. */
  emptyMessage?: string;
  /** testID applied to the centered container in the loading and error states. */
  containerTestID?: string;
}

/**
 * Owns the loading / error / empty presentation for a data-driven screen so each
 * screen renders only its ready content. The four states sit behind one small
 * interface (a status plus an optional retry), so they are tested once here
 * instead of re-implemented per screen.
 */
export function QueryStateView({
  status,
  children,
  onRetry,
  loadingLabel = 'Loading',
  errorMessage = 'Something went wrong.',
  emptyMessage = 'Nothing to show right now.',
  containerTestID,
}: QueryStateViewProps) {
  if (status === 'loading') {
    return (
      <View style={styles.centered} testID={containerTestID}>
        <ActivityIndicator
          testID="loading-indicator"
          accessibilityLabel={loadingLabel}
        />
      </View>
    );
  }

  if (status === 'error') {
    return (
      <View style={styles.centered} testID={containerTestID}>
        <Text variant="body" color="error" style={styles.text}>
          {errorMessage}
        </Text>
        {onRetry ? (
          <Button
            label="Retry"
            onPress={onRetry}
            variant="secondary"
            testID="retry-button"
          />
        ) : null}
      </View>
    );
  }

  if (status === 'empty') {
    return (
      <View style={styles.centered} testID="empty-state">
        <Text variant="body" color="secondary" style={styles.text}>
          {emptyMessage}
        </Text>
      </View>
    );
  }

  return <>{children}</>;
}

const styles = StyleSheet.create({
  centered: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    padding: spacing.lg,
    gap: spacing.md,
    backgroundColor: colors.background,
  },
  text: {
    textAlign: 'center',
  },
});
