import { Button } from '@forthtilliath/react-native-kit/components/form/Button';

import { Icon, type IconName } from './Icon';
import { radius, spacing, useColors } from './theme';

interface Props {
  label: string;
  onPress: () => void;
  icon?: IconName;
  disabled?: boolean;
  /** Bouton contour plutôt que plein, pour une action secondaire. */
  outline?: boolean;
}

/** `Button` de react-native-kit aux couleurs du thème, plein ou contour. */
export function PrimaryButton({ label, onPress, icon, disabled = false, outline = false }: Props) {
  const c = useColors();
  return (
    <Button
      label={label}
      onPress={onPress}
      disabled={disabled}
      variant={outline ? 'outline' : 'primary'}
      icon={icon && <Icon name={icon} size={20} color={outline ? c.primary : c.onPrimary} />}
      colors={{ primary: c.primary, onPrimary: c.onPrimary }}
      styles={{
        button: { minHeight: 50, paddingHorizontal: spacing.lg, borderRadius: radius.md },
        // Même atténuation qu'avant pour l'appui et l'état désactivé.
        pressed: { opacity: 0.7 },
        disabled: { opacity: 0.7 },
      }}
    />
  );
}
