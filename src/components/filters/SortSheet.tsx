import { selectFeedback } from '@forthtilliath/react-native-kit/utils/helpers/haptics';
import { Pressable, Text, View } from 'react-native';

import { SORT_OPTIONS, type SortKey } from '../../domain/listing';
import { Icon } from '../../ui/Icon';
import { Sheet } from '../../ui/Sheet';
import { radius, spacing, themedStyles, useColors } from '../../ui/theme';

type Props = {
  visible: boolean;
  onClose: () => void;
  sort: SortKey;
  onChange: (sort: SortKey) => void;
};

/** Choix de l'ordre de la liste ; le panneau se ferme dès qu'un tri est choisi. */
export function SortSheet({ visible, onClose, sort, onChange }: Props) {
  const c = useColors();
  const styles = useStyles();
  return (
    <Sheet visible={visible} onClose={onClose} title="Trier par">
      <View style={styles.card} accessibilityRole="radiogroup" accessibilityLabel="Trier par">
        {SORT_OPTIONS.map(({ value, label, hint }, index) => {
          const checked = value === sort;
          return (
            <Pressable
              key={value}
              onPress={() => {
                selectFeedback();
                onChange(value);
                onClose();
              }}
              accessibilityRole="radio"
              accessibilityState={{ checked }}
              accessibilityLabel={`${label}, ${hint}`}
              style={({ pressed }) => [styles.row, index > 0 && styles.separator, pressed && styles.pressed]}
            >
              <View style={styles.texts}>
                <Text style={[styles.label, checked && styles.labelChecked]}>{label}</Text>
                <Text style={styles.hint}>{hint}</Text>
              </View>
              {checked && <Icon name="checkmark" size={22} color={c.primary} />}
            </Pressable>
          );
        })}
      </View>
    </Sheet>
  );
}

const useStyles = themedStyles((c) => ({
  card: {
    backgroundColor: c.card,
    borderRadius: radius.md,
    borderWidth: 1,
    borderColor: c.border,
    overflow: 'hidden',
  },
  row: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.sm,
    minHeight: 56,
    paddingHorizontal: spacing.lg,
    paddingVertical: spacing.sm,
  },
  separator: { borderTopWidth: 1, borderTopColor: c.border },
  pressed: { backgroundColor: c.primarySoft },
  texts: { flex: 1, gap: 1 },
  label: { fontSize: 15, fontWeight: '600', color: c.text },
  labelChecked: { color: c.primary },
  hint: { fontSize: 13, color: c.muted },
}));
