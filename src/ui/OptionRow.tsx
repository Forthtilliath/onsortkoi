import { ScrollView, StyleSheet, Text, View } from 'react-native';

import { Chip } from './Chip';
import { colors, spacing } from './theme';

type Props = {
  label: string;
  options: number[];
  value: number | null;
  onChange: (value: number | null) => void;
  format: (option: number) => string;
};

/** Choix unique parmi des valeurs, avec « Tous » pour désactiver le filtre. */
export function OptionRow({ label, options, value, onChange, format }: Props) {
  return (
    <View style={styles.row}>
      <Text style={styles.label}>{label}</Text>
      <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={styles.chips}>
        <Chip label="Tous" selected={value === null} onPress={() => onChange(null)} />
        {options.map((option) => (
          <Chip
            key={option}
            label={format(option)}
            selected={value === option}
            onPress={() => onChange(value === option ? null : option)}
          />
        ))}
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  row: { gap: spacing.xs },
  label: { color: colors.muted, fontSize: 13, fontWeight: '600' },
  chips: { gap: spacing.sm, paddingRight: spacing.lg },
});
