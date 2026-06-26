import {
  Pressable,
  StyleSheet,
  TextInput,
  View,
  type TextInputProps,
} from 'react-native';

import { colors, layout, radii, spacing, typography } from '../theme';
import { Text } from './Text';

export interface InputProps extends Omit<TextInputProps, 'style'> {
  /** Visible, accessibility-associated label rendered above the field. */
  label?: string;
  value: string;
  onChangeText: (text: string) => void;
  /** When provided, renders a clear affordance that invokes this callback. */
  onClear?: () => void;
  /** Error message shown below the field (also flips the border to danger). */
  errorText?: string;
  testID?: string;
  /** testID for the clear button; defaults to `${testID}-clear` when omitted. */
  clearTestID?: string;
}

/**
 * Labeled text input with an optional clear button and error state. The label
 * is associated with the field for screen readers via `accessibilityLabel`.
 */
export function Input({
  label,
  value,
  onChangeText,
  onClear,
  errorText,
  testID,
  clearTestID,
  accessibilityLabel,
  ...rest
}: InputProps) {
  const hasError = typeof errorText === 'string' && errorText.length > 0;
  const showClear = typeof onClear === 'function' && value.length > 0;
  const resolvedClearTestID =
    clearTestID ?? (testID ? `${testID}-clear` : undefined);

  return (
    <View>
      {label ? (
        <Text variant="label" color="secondary" style={styles.label}>
          {label}
        </Text>
      ) : null}

      <View style={[styles.field, hasError && styles.fieldError]}>
        <TextInput
          style={styles.input}
          value={value}
          onChangeText={onChangeText}
          placeholderTextColor={colors.text.muted}
          accessibilityLabel={accessibilityLabel ?? label}
          testID={testID}
          {...rest}
        />

        {showClear ? (
          <Pressable
            onPress={onClear}
            hitSlop={12}
            accessibilityRole="button"
            accessibilityLabel="Clear text"
            testID={resolvedClearTestID}
            style={({ pressed }) => [styles.clear, pressed && styles.pressed]}
          >
            <Text variant="label" color="muted">
              ✕
            </Text>
          </Pressable>
        ) : null}
      </View>

      {hasError ? (
        <Text variant="caption" color="error" style={styles.error}>
          {errorText}
        </Text>
      ) : null}
    </View>
  );
}

const styles = StyleSheet.create({
  label: {
    marginBottom: spacing.xs,
  },
  field: {
    flexDirection: 'row',
    alignItems: 'center',
    minHeight: layout.minTouchTarget,
    paddingHorizontal: spacing.md,
    backgroundColor: colors.surface,
    borderWidth: StyleSheet.hairlineWidth,
    borderColor: colors.border,
    borderRadius: radii.md,
  },
  fieldError: {
    borderColor: colors.danger,
  },
  input: {
    flex: 1,
    paddingVertical: spacing.sm,
    color: colors.text.primary,
    fontSize: typography.body.fontSize,
    lineHeight: typography.body.lineHeight,
  },
  clear: {
    alignItems: 'center',
    justifyContent: 'center',
    width: layout.minTouchTarget,
    height: layout.minTouchTarget,
    marginRight: -spacing.sm,
  },
  pressed: {
    opacity: 0.6,
  },
  error: {
    marginTop: spacing.xs,
  },
});
