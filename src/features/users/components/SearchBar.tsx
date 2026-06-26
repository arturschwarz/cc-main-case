import { useEffect, useRef, useState } from 'react';
import { StyleSheet, View } from 'react-native';

import { Input } from '@/ui/components';

import { SEARCH_DEBOUNCE_MS } from '../api/constants';

export interface SearchBarProps {
  /** Called with the trimmed term after the debounce settles (empty → ''). */
  onDebouncedChange: (term: string) => void;
  /** Debounce window in ms. Defaults to {@link SEARCH_DEBOUNCE_MS}. */
  debounceMs?: number;
}

/**
 * Search field for the Users Directory. Owns the raw input text locally so fast
 * keystrokes never re-render the list; only the debounced, trimmed term is
 * lifted via `onDebouncedChange`. Clearing resets the field and emits '' at once
 * so the list returns immediately.
 */
export function SearchBar({
  onDebouncedChange,
  debounceMs = SEARCH_DEBOUNCE_MS,
}: SearchBarProps) {
  const [value, setValue] = useState('');

  // Keep the latest callback in a ref so changing its identity does not reset
  // the in-flight debounce timer.
  const onChangeRef = useRef(onDebouncedChange);
  useEffect(() => {
    onChangeRef.current = onDebouncedChange;
  }, [onDebouncedChange]);

  useEffect(() => {
    const handle = setTimeout(() => {
      onChangeRef.current(value.trim());
    }, debounceMs);
    return () => clearTimeout(handle);
  }, [value, debounceMs]);

  const handleClear = () => {
    setValue('');
    // Reset immediately rather than waiting for the debounce.
    onChangeRef.current('');
  };

  return (
    <View style={styles.container}>
      <Input
        value={value}
        onChangeText={setValue}
        onClear={handleClear}
        placeholder="Search users by name"
        accessibilityRole="search"
        accessibilityLabel="Search users by name"
        autoCapitalize="none"
        autoCorrect={false}
        returnKeyType="search"
        testID="search-input"
        clearTestID="search-clear"
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    // Fills the remaining width of the search row; the row owns outer padding.
    flex: 1,
  },
});
