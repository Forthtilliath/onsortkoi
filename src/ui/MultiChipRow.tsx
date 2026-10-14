import { StyleSheet, Text, View } from 'react-native';

import { Chip } from './Chip';
import { colors, spacing } from './theme';

type Props = {
  label: string;
  options: string[];
  selected: string[];
  onChange: (selected: string[]) => void;
};

/** Choix multiple parmi des libellés, en puces sur plusieurs lignes. */
export function MultiChipRow({ label, options, selected, onChange }: Props) {
  const toggle = (option: string) =>
    onChange(selected.includes(option) ? selected.filter((o) => o !== option) : [...selected, option]);

  return (
    <View style={styles.row}>
      <Text style={styles.label}>{label}</Text>
      <View style={styles.chips}>
        {options.map((option) => (
          <Chip key={option} label={option} selected={selected.includes(option)} onPress={() => toggle(option)} />
        ))}
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  row: { gap: spacing.xs },
  label: { color: colors.muted, fontSize: 13, fontWeight: '600' },
  chips: { flexDirection: 'row', flexWrap: 'wrap', gap: spacing.sm },
});
