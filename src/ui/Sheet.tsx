import { BottomSheet } from '@forthtilliath/react-native-kit/components/overlay/BottomSheet';
import type { ReactNode } from 'react';
import { Pressable, StyleSheet, Text, View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

import { Icon } from './Icon';
import { sheetStyles } from './kitStyles';
import { colors, radius, spacing } from './theme';

type Props = {
  visible: boolean;
  onClose: () => void;
  title: string;
  /** Ligne discrète sous le titre. */
  subtitle?: string;
  /** Action texte à droite du titre (ex. « Réinitialiser »). */
  action?: { label: string; onPress: () => void };
  children: ReactNode;
};

/** BottomSheet de la lib, avec poignée, titre, action et bouton de fermeture. */
export function Sheet({ visible, onClose, title, subtitle, action, children }: Props) {
  const { bottom } = useSafeAreaInsets();

  return (
    <BottomSheet visible={visible} onClose={onClose} bottomInset={bottom} styles={sheetStyles}>
      <View style={styles.handle} />
      <View style={styles.header}>
        <View style={styles.titles}>
          <Text style={styles.title} accessibilityRole="header">
            {title}
          </Text>
          {!!subtitle && <Text style={styles.subtitle}>{subtitle}</Text>}
        </View>
        {action && (
          <Pressable onPress={action.onPress} accessibilityRole="button" hitSlop={8}>
            <Text style={styles.action}>{action.label}</Text>
          </Pressable>
        )}
        <Pressable
          onPress={onClose}
          accessibilityRole="button"
          accessibilityLabel="Fermer"
          hitSlop={8}
          style={styles.close}
        >
          <Icon name="close" size={20} color={colors.text} />
        </Pressable>
      </View>
      <View style={styles.body}>{children}</View>
    </BottomSheet>
  );
}

const styles = StyleSheet.create({
  handle: {
    alignSelf: 'center',
    width: 40,
    height: 4,
    borderRadius: radius.pill,
    backgroundColor: colors.border,
    marginTop: spacing.sm,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.md,
    paddingHorizontal: spacing.lg,
    paddingTop: spacing.md,
    paddingBottom: spacing.sm,
  },
  titles: { flex: 1, gap: 2 },
  title: { fontSize: 20, fontWeight: '800', color: colors.text },
  subtitle: { fontSize: 13, color: colors.muted },
  action: { fontSize: 14, fontWeight: '600', color: colors.primary },
  close: {
    width: 32,
    height: 32,
    borderRadius: radius.pill,
    backgroundColor: colors.primarySoft,
    alignItems: 'center',
    justifyContent: 'center',
  },
  body: { paddingHorizontal: spacing.lg, paddingBottom: spacing.lg, gap: spacing.lg },
});
