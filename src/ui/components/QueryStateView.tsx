import { type ReactNode } from 'react';
import { StyleSheet, View } from 'react-native';

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
  /**
   * The loading UI (a skeleton), rendered while `status` is `loading`. It owns
   * its own `testID`/accessibility.
   */
  loadingContent?: ReactNode;
  /** Message shown in the error state. */
  errorMessage?: string;
  /** Message shown in the empty state. */
  emptyMessage?: string;
  /** testID applied to the centered container in the error state. */
  containerTestID?: string;
}

/**
 * Owns the loading / error / empty presentation for a data-driven screen so each
 * screen renders only its ready content. The four states sit behind one small
 * interface (a status plus an optional retry), so they are tested once here
 * instead of re-implemented per screen. The loading UI is a screen-supplied
 * skeleton; only the error and empty states are rendered generically.
 */
export function QueryStateView({
  status,
  children,
  onRetry,
  loadingContent,
  errorMessage = 'Something went wrong.',
  emptyMessage = 'Nothing to show right now.',
  containerTestID,
}: QueryStateViewProps) {
  if (status === 'loading') {
    return <>{loadingContent ?? null}</>;
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
