import type { BackupScreenStyles } from '@forthtilliath/expo-backup-ui';
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
