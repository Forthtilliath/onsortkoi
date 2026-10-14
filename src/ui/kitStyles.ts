import type { BottomSheetStyles } from '@forthtilliath/react-native-kit/components/overlay/BottomSheet';
import type { BackupSettingsScreenStyles } from '@forthtilliath/react-native-kit/components/settings/BackupSettingsScreen';
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

export const backupStyles: BackupSettingsScreenStyles = {
  container: {
    backgroundColor: colors.card,
    borderRadius: radius.lg,
    borderWidth: 1,
    borderColor: colors.border,
    padding: spacing.lg,
  },
  hint: { color: colors.muted, marginTop: 0 },
  button: { minHeight: 50, borderRadius: radius.md, borderWidth: 1.5, borderColor: colors.primary },
  buttonText: { color: colors.primary, fontSize: 16 },
  iconColor: colors.primary,
  activityIndicatorColor: colors.primary,
};
