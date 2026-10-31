import { useSafeAreaInsets } from 'react-native-safe-area-context';

import { ToastHost as KitToastHost } from '@forthtilliath/react-native-kit/components/feedback/ToastHost';

import { radius, spacing, useColors } from './theme';

interface Props {
  /** Marge au-dessus du bas de l'écran (safe area comprise), pour laisser un bouton flottant visible. */
  offset?: number;
}

/**
 * Emplacement des toasts d'un écran (`ToastHost` du kit, aux couleurs du thème) ; à placer en dernier,
 * par-dessus le contenu. Le dernier monté (réglages, modale) reçoit les messages de `showToast`.
 */
export function ToastHost({ offset = 0 }: Props) {
  const c = useColors();
  const { bottom } = useSafeAreaInsets();
  return (
    <KitToastHost
      bottomOffset={bottom + spacing.lg + offset}
      maxLines={6}
      styles={{
        toast: { backgroundColor: c.text, borderRadius: radius.md },
        message: { color: c.background },
        action: { color: c.primary },
      }}
    />
  );
}
