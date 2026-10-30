import { Text, TextInput, type TextInputProps, View } from 'react-native';

import { radius, spacing, themedStyles, useColors } from './theme';

type Props = Omit<TextInputProps, 'style'> & {
  label: string;
  /** Message affiché sous le champ, qui le borde aussi de rouge. */
  error?: string | null;
  /** Champ étroit, pour un nombre. */
  compact?: boolean;
};

/** Champ de saisie avec son libellé et son éventuel message d'erreur. */
export function TextField({ label, error, compact = false, ...input }: Props) {
  const c = useColors();
  const styles = useStyles();
  return (
    <View style={[styles.field, compact && styles.compact]}>
      <Text style={styles.label}>{label}</Text>
      <TextInput
        {...input}
        style={[styles.input, !!error && styles.inputError]}
        placeholderTextColor={c.muted}
        accessibilityLabel={label}
        accessibilityHint={error ?? undefined}
      />
      {!!error && <Text style={styles.error}>{error}</Text>}
    </View>
  );
}

const useStyles = themedStyles((c) => ({
  field: { gap: spacing.xs },
  compact: { flex: 1 },
  label: { fontSize: 14, fontWeight: '600', color: c.text },
  input: {
    minHeight: 48,
    backgroundColor: c.card,
    borderWidth: 1,
    borderColor: c.control,
    borderRadius: radius.md,
    paddingHorizontal: spacing.md,
    paddingVertical: 10,
    fontSize: 16,
    color: c.text,
  },
  inputError: { borderColor: c.danger, borderWidth: 1.5 },
  error: { fontSize: 13, color: c.danger },
}));
