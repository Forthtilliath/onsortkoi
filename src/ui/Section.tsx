import type { ReactNode } from 'react';
import { Text, View } from 'react-native';

import { spacing, themedStyles } from './theme';

type Props = {
  title: string;
  /** Résumé du choix en cours, à droite du titre (ex. « 4 joueurs »). */
  aside?: string;
  children: ReactNode;
};

/** Bloc titré d'un sheet ou d'un écran de réglages. */
export function Section({ title, aside, children }: Props) {
  const styles = useStyles();
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

const useStyles = themedStyles((c) => ({
  section: { gap: spacing.sm },
  header: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    alignItems: 'baseline',
    justifyContent: 'space-between',
    columnGap: spacing.sm,
  },
  title: { fontSize: 12, fontWeight: '700', color: c.muted, textTransform: 'uppercase', letterSpacing: 0.6 },
  aside: { fontSize: 13, fontWeight: '600', color: c.primary },
}));
