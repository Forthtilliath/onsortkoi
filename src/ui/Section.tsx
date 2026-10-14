import type { ReactNode } from 'react';
import { StyleSheet, Text, View } from 'react-native';

import { colors, spacing } from './theme';

type Props = {
  title: string;
  /** Résumé du choix en cours, à droite du titre (ex. « 4 joueurs »). */
  aside?: string;
  children: ReactNode;
};

/** Bloc titré d'un sheet ou d'un écran de réglages. */
export function Section({ title, aside, children }: Props) {
  return (
    <View style={styles.section}>
      <View style={styles.header}>
        <Text style={styles.title} accessibilityRole="header">
          {title}
        </Text>
        {!!aside && <Text style={styles.aside}>{aside}</Text>}
      </View>
      {children}
    </View>
  );
}

const styles = StyleSheet.create({
  section: { gap: spacing.sm },
  header: { flexDirection: 'row', alignItems: 'baseline', justifyContent: 'space-between', gap: spacing.sm },
  title: { fontSize: 12, fontWeight: '700', color: colors.muted, textTransform: 'uppercase', letterSpacing: 0.6 },
  aside: { fontSize: 13, fontWeight: '600', color: colors.primary },
});
