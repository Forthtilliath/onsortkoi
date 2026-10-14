import type { BackupScreenStyles } from '@forthtilliath/expo-backup-ui';
import type { UpdateNotifierProps } from '@forthtilliath/expo-release-updates-ui/UpdateNotifier';
import type { BottomSheetStyles } from '@forthtilliath/react-native-kit/components/overlay/BottomSheet';
import type { SwitchRowColors, SwitchRowStyles } from '@forthtilliath/react-native-kit/components/settings/SwitchRow';
import type { UpdateSettingsScreenStyles } from '@forthtilliath/react-native-kit/components/settings/UpdateSettingsScreen';
import type { ThemeToggleStyles } from '@forthtilliath/react-native-kit/components/theme/ThemeToggle';

import { byPalette, type Palette, radius, spacing } from './theme';

// Habillage des composants des libs (kit, sauvegarde, mises à jour) aux couleurs du thème en cours :
// leurs couleurs par défaut sont claires, chaque texte et chaque fond est donc redéfini.

function sheet(c: Palette): BottomSheetStyles {
  return { sheet: { backgroundColor: c.background, paddingTop: 0, paddingBottom: 0, maxHeight: '90%' } };
}

function switchColors(c: Palette): SwitchRowColors {
  return { trackOn: c.primary, trackOff: c.border, thumbOn: c.card, thumbOff: c.muted };
}

function switchStyles(c: Palette): SwitchRowStyles {
  return {
    row: { backgroundColor: c.card, borderRadius: radius.md, borderWidth: 1, borderColor: c.border },
    label: { color: c.text },
    description: { color: c.muted },
  };
}

function backup(c: Palette): BackupScreenStyles {
  return {
    section: { backgroundColor: c.card, borderRadius: radius.lg, borderColor: c.border, padding: spacing.lg },
    sectionTitle: { color: c.text },
    hint: { color: c.muted },
    status: { color: c.text },
    errorText: { color: c.danger },
    button: { backgroundColor: c.primary, minHeight: 50, borderRadius: radius.md, justifyContent: 'center' },
    buttonText: { color: c.onPrimary, fontSize: 16 },
    secondaryButton: { minHeight: 50, borderRadius: radius.md, borderColor: c.primary, justifyContent: 'center' },
    secondaryButtonText: { color: c.primary, fontSize: 16 },
    ghostButtonText: { color: c.primary },
    switchLabel: { color: c.text },
    modalCard: { backgroundColor: c.card },
    recoveryCode: { color: c.text },
    input: { color: c.text, borderColor: c.control },
    activityIndicatorColor: c.primary,
    placeholderTextColor: c.muted,
  };
}

function updates(c: Palette) {
  const card = { backgroundColor: c.card, borderColor: c.border, borderRadius: radius.lg, marginBottom: spacing.sm };
  const button = { backgroundColor: c.primary, borderRadius: radius.md };
  const notes = {
    heading: { color: c.text },
    bullet: { color: c.primary },
    itemText: { color: c.muted },
    text: { color: c.muted },
    bold: { color: c.text },
  };

  const notifier: UpdateNotifierProps['styles'] = {
    banner: {
      container: card,
      title: { color: c.text },
      notes,
      actionButton: button,
      actionButtonText: { color: c.onPrimary },
      dismissButtonText: { color: c.muted },
    },
    install: {
      container: card,
      title: { color: c.text },
      hint: { color: c.muted },
      error: { color: c.danger },
      retryButton: button,
      retryButtonText: { color: c.onPrimary },
      closeButtonText: { color: c.muted },
    },
  };

  const screen: UpdateSettingsScreenStyles = {
    infoBox: { ...card, marginBottom: 0 },
    infoLabel: { color: c.muted },
    infoValue: { color: c.text },
    helpText: { color: c.muted },
    errorText: { color: c.danger },
    button: { ...button, minHeight: 50, justifyContent: 'center', marginTop: spacing.md },
    buttonText: { color: c.onPrimary },
    activityIndicatorColor: c.onPrimary,
    updateAvailableBox: { ...card, marginBottom: 0 },
    updateAvailableTitle: { color: c.text },
    changelog: { marginTop: spacing.xl },
    changelogTitle: { color: c.text },
    changelogEntry: card,
    changelogVersion: { color: c.text },
    changelogDate: { color: c.muted },
    notes,
  };

  return { notifier, screen };
}

function themeToggle(c: Palette): ThemeToggleStyles {
  return {
    option: {
      minHeight: 48,
      justifyContent: 'center',
      backgroundColor: c.card,
      borderColor: c.border,
      borderRadius: radius.md,
    },
    optionActive: { backgroundColor: c.primary, borderColor: c.primary },
    optionText: { color: c.text },
    optionTextActive: { color: c.onPrimary },
  };
}

/** Styles des composants des libs pour le thème en cours. */
export const useKitStyles = byPalette((c) => {
  const { notifier, screen } = updates(c);
  return {
    sheet: sheet(c),
    switchColors: switchColors(c),
    switchStyles: switchStyles(c),
    backup: backup(c),
    updateNotifier: notifier,
    updateScreen: screen,
    themeToggle: themeToggle(c),
  };
});
