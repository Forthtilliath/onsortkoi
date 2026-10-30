import type { ReactNode } from 'react';
import { Modal, Pressable, ScrollView, Text, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

import { IconButton } from './IconButton';
import { spacing, themedStyles } from './theme';
import { ToastHost } from './Toast';

interface Props {
  visible: boolean;
  onClose: () => void;
  title: string;
  /** Ligne discrète sous le titre. */
  subtitle?: string;
  /** Action texte à droite du titre (ex. « Enregistrer »). */
  action?: { label: string; onPress: () => void };
  /** `false` quand le contenu gère son propre défilement (FlatList). */
  scroll?: boolean;
  children: ReactNode;
}

/**
 * Écran plein en modale, avec titre, action et fermeture. Les champs restent en haut :
 * le clavier ne les recouvre pas, et un appui sur un bouton ne sert pas d'abord à le fermer.
 */
export function ScreenModal({ visible, onClose, title, subtitle, action, scroll = true, children }: Props) {
  const styles = useStyles();
  return (
    <Modal visible={visible} animationType="slide" onRequestClose={onClose}>
      <SafeAreaView style={styles.screen}>
        <View style={styles.header}>
          <View style={styles.titles}>
            <Text style={styles.title} accessibilityRole="header" numberOfLines={2}>
              {title}
            </Text>
            {!!subtitle && <Text style={styles.subtitle}>{subtitle}</Text>}
          </View>
          {action && (
            <Pressable onPress={action.onPress} accessibilityRole="button" hitSlop={8} style={styles.actionButton}>
              <Text style={styles.action}>{action.label}</Text>
            </Pressable>
          )}
          <IconButton icon="close" label="Fermer" onPress={onClose} />
        </View>
        {scroll ? (
          <ScrollView contentContainerStyle={styles.content} keyboardShouldPersistTaps="handled">
            {children}
          </ScrollView>
        ) : (
          <View style={styles.fill}>{children}</View>
        )}
        <ToastHost />
      </SafeAreaView>
    </Modal>
  );
}

const useStyles = themedStyles((c) => ({
  screen: { flex: 1, backgroundColor: c.background },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.md,
    paddingHorizontal: spacing.lg,
    paddingVertical: spacing.md,
  },
  titles: { flex: 1, gap: 2 },
  title: { fontSize: 22, fontWeight: '800', color: c.text },
  subtitle: { fontSize: 13, color: c.muted },
  actionButton: { minHeight: 44, justifyContent: 'center' },
  action: { fontSize: 16, fontWeight: '700', color: c.primary },
  content: { padding: spacing.lg, paddingTop: spacing.sm, gap: spacing.xl },
  fill: { flex: 1, paddingHorizontal: spacing.lg },
}));
