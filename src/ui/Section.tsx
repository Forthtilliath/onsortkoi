import type { ReactNode } from 'react';

import { Section as KitSection } from '@forthtilliath/react-native-kit/components/layout/Section';

import { spacing, useColors } from './theme';

interface Props {
  title: string;
  /** Résumé du choix en cours, à droite du titre (ex. « 4 joueurs »). */
  aside?: string;
  children: ReactNode;
}

/** Bloc titré d'un sheet ou d'un écran de réglages (`Section` de react-native-kit). */
export function Section({ title, aside, children }: Props) {
  const c = useColors();
  return (
    <KitSection
      title={title}
      aside={aside}
      gap={spacing.sm}
      titleStyles={{
        container: { flexWrap: 'wrap', alignItems: 'baseline', columnGap: spacing.sm },
        title: { fontSize: 12, color: c.muted },
        aside: { color: c.primary },
      }}
    >
      {children}
    </KitSection>
  );
}
