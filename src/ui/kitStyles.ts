import type { BackupScreenStyles } from '@forthtilliath/expo-backup-ui';
import type { UpdateNotifierProps } from '@forthtilliath/expo-release-updates-ui/UpdateNotifier';
import type { UpdateSettingsScreenStyles } from '@forthtilliath/react-native-kit/components/settings/UpdateSettingsScreen';
import type { BottomSheetStyles } from '@forthtilliath/react-native-kit/components/overlay/BottomSheet';
import type { SwitchRowColors, SwitchRowStyles } from '@forthtilliath/react-native-kit/components/settings/SwitchRow';

import { colors, radius, spacing } from './theme';

// Habillage des composants de @forthtilliath/react-native-kit aux couleurs de l'app.

export const sheetStyles: BottomSheetStyles = {
  sheet: { backgroundColor: colors.background, paddingTop: 0, paddingBottom: 0, maxHeight: '90%' },
};

export const switchColors: SwitchRowColors = {
  trackOn: colors.primary,
  trackOff: colors.border,
  thumbOn: colors.card,
  thumbOff: colors.card,
};

export const switchStyles: SwitchRowStyles = {
  row: {
    backgroundColor: colors.card,
    borderRadius: radius.md,
    borderWidth: 1,
    borderColor: colors.border,
  },
  label: { color: colors.text },
  description: { color: colors.muted },
};

// Écran de sauvegarde de @forthtilliath/expo-backup-ui.
export const backupScreenStyles: BackupScreenStyles = {
  section: {
    backgroundColor: colors.card,
    borderRadius: radius.lg,
    borderColor: colors.border,
    padding: spacing.lg,
  },
  sectionTitle: { color: colors.text },
  hint: { color: colors.muted },
  status: { color: colors.text },
  button: { backgroundColor: colors.primary, minHeight: 50, borderRadius: radius.md, justifyContent: 'center' },
  buttonText: { color: colors.onPrimary, fontSize: 16 },
  secondaryButton: { minHeight: 50, borderRadius: radius.md, borderColor: colors.primary, justifyContent: 'center' },
  secondaryButtonText: { color: colors.primary, fontSize: 16 },
  ghostButtonText: { color: colors.primary },
  activityIndicatorColor: colors.primary,
};

// Mises à jour : bannière et téléchargement (@forthtilliath/expo-release-updates-ui), écran du kit.
const updateCard = {
  backgroundColor: colors.card,
  borderColor: colors.border,
  borderRadius: radius.lg,
  marginBottom: spacing.sm,
};
const updateButton = { backgroundColor: colors.primary, borderRadius: radius.md };
const notesStyles = {
  heading: { color: colors.text },
  bullet: { color: colors.primary },
  itemText: { color: colors.muted },
  text: { color: colors.muted },
  bold: { color: colors.text },
};

export const updateNotifierStyles: UpdateNotifierProps['styles'] = {
  banner: {
    container: updateCard,
    title: { color: colors.text },
    notes: notesStyles,
    actionButton: updateButton,
    actionButtonText: { color: colors.onPrimary },
    dismissButtonText: { color: colors.muted },
  },
  install: {
    container: updateCard,
    title: { color: colors.text },
    hint: { color: colors.muted },
    retryButton: updateButton,
    retryButtonText: { color: colors.onPrimary },
    closeButtonText: { color: colors.muted },
  },
};

export const updateScreenStyles: UpdateSettingsScreenStyles = {
  infoBox: { ...updateCard, marginBottom: 0 },
  infoLabel: { color: colors.muted },
  infoValue: { color: colors.text },
  helpText: { color: colors.muted },
  button: { ...updateButton, minHeight: 50, justifyContent: 'center', marginTop: spacing.md },
  buttonText: { color: colors.onPrimary },
  activityIndicatorColor: colors.onPrimary,
  updateAvailableBox: { ...updateCard, marginBottom: 0 },
  updateAvailableTitle: { color: colors.text },
  changelog: { marginTop: spacing.xl },
  changelogTitle: { color: colors.text },
  changelogEntry: updateCard,
  changelogVersion: { color: colors.text },
  changelogDate: { color: colors.muted },
  notes: notesStyles,
};
