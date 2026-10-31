import type { ReactNode } from 'react';
import { View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

import { BottomSheet } from '@forthtilliath/react-native-kit/components/overlay/BottomSheet';

import { useKitStyles } from './kitStyles';
import { spacing } from './theme';

interface Props {
  visible: boolean;
  onClose: () => void;
  title: string;
  /** Ligne discrète sous le titre. */
  subtitle?: string;
  /** Action texte à droite du titre (ex. « Réinitialiser »). */
  action?: { label: string; onPress: () => void };
  children: ReactNode;
}

/** BottomSheet de la lib avec son en-tête (poignée, titre, action, fermer), qui reste visible au défilement. */
export function Sheet({ visible, onClose, title, subtitle, action, children }: Props) {
  const { bottom } = useSafeAreaInsets();
  const kit = useKitStyles();

  return (
    <BottomSheet
      visible={visible}
      onClose={onClose}
      bottomInset={bottom}
      styles={kit.sheet}
      title={title}
      subtitle={subtitle}
      headerAction={action}
      showHandle
      showCloseButton
      headerStyles={kit.sheetHeader}
    >
      <View style={{ paddingHorizontal: spacing.lg, paddingBottom: spacing.lg, gap: spacing.lg }}>{children}</View>
    </BottomSheet>
  );
}
