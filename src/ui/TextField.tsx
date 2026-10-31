import {
  TextField as KitTextField,
  type TextFieldProps,
} from '@forthtilliath/react-native-kit/components/form/TextField';

import { radius, spacing, useColors } from './theme';

type Props = Omit<TextFieldProps, 'label' | 'colors' | 'styles'> & {
  label: string;
  /** Champ étroit, pour un nombre. */
  compact?: boolean;
};

/** `TextField` de react-native-kit aux couleurs du thème : libellé, erreur annoncée, bordure au focus. */
export function TextField({ compact = false, ...field }: Props) {
  const c = useColors();
  return (
    <KitTextField
      {...field}
      colors={{
        text: c.text,
        label: c.text,
        placeholder: c.muted,
        background: c.card,
        border: c.control,
        borderFocused: c.primary,
        error: c.danger,
      }}
      styles={{
        container: [{ gap: spacing.xs }, compact && { flex: 1 }],
        input: { borderRadius: radius.md, paddingHorizontal: spacing.md },
        error: { fontWeight: '400' },
      }}
    />
  );
}
