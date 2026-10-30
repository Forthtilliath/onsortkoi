import type { ReactNode } from 'react';
import { Pressable, Text, View } from 'react-native';

import { Icon } from './Icon';
import { radius, spacing, themedStyles, useColors } from './theme';

interface RowProps {
  title: string;
  /** Lignes discrètes sous le titre (format, note…). */
  details?: string[];
  /** Valeur mise en avant à droite (ex. un stock). */
  value?: string;
  onPress: () => void;
  accessibilityLabel?: string;
}

/** Ligne cliquable d'une carte : titre, détails, valeur et chevron. */
export function CardRow({ title, details = [], value, onPress, accessibilityLabel }: RowProps) {
  const c = useColors();
  const styles = useStyles();
  return (
    <Pressable
      onPress={onPress}
      accessibilityRole="button"
      accessibilityLabel={accessibilityLabel ?? [title, ...details, value].filter(Boolean).join(', ')}
      style={({ pressed }) => [styles.row, pressed && styles.pressed]}
    >
      <View style={styles.texts}>
        <Text style={styles.title}>{title}</Text>
        {details.map((detail) => (
          <Text key={detail} style={styles.detail}>
            {detail}
          </Text>
        ))}
      </View>
      {!!value && <Text style={styles.value}>{value}</Text>}
      <Icon name="chevron-forward" size={18} color={c.muted} />
    </Pressable>
  );
}

/** Carte encadrée regroupant des `CardRow`, séparées d'un trait. */
export function Card({ children }: { children: ReactNode }) {
  const styles = useStyles();
  return <View style={styles.card}>{children}</View>;
}

const useStyles = themedStyles((c) => ({
  card: {
    backgroundColor: c.card,
    borderRadius: radius.lg,
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
    borderBottomWidth: 1,
    borderBottomColor: c.border,
    marginBottom: -1,
  },
  pressed: { backgroundColor: c.primarySoft },
  texts: { flex: 1, gap: 2 },
  title: { fontSize: 15, fontWeight: '600', color: c.text },
  detail: { fontSize: 13, color: c.muted },
  value: { fontSize: 15, fontWeight: '700', color: c.primary },
}));
