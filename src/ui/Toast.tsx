import { useEffect, useState } from 'react';
import { AccessibilityInfo, Animated, Pressable, Text } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

import { radius, spacing, themedStyles } from './theme';

const DURATION_MS = 3500;

type Host = (message: string) => void;

// Pile des hôtes montés : le dernier (ex. celui de l'écran de réglages, ouvert par-dessus la liste)
// est le seul visible, c'est donc lui qui affiche le message.
const hosts: Host[] = [];

/** Message bref qui disparaît seul, pour une action réussie (les erreurs restent des dialogues). */
export function showToast(message: string): void {
  hosts.at(-1)?.(message);
  // Annonce explicite : TalkBack ne lit pas toujours une vue qui vient d'apparaître.
  AccessibilityInfo.announceForAccessibility(message);
}

type Props = {
  /** Marge au-dessus du bas de l'écran (safe area comprise), pour laisser un bouton flottant visible. */
  offset?: number;
};

/** Emplacement des toasts d'un écran ; à placer en dernier, par-dessus le contenu. */
export function ToastHost({ offset = 0 }: Props) {
  const styles = useStyles();
  const { bottom } = useSafeAreaInsets();
  const [message, setMessage] = useState<string | null>(null);
  const [opacity] = useState(() => new Animated.Value(0));

  useEffect(() => {
    let timer: ReturnType<typeof setTimeout> | undefined;
    const hide = () =>
      Animated.timing(opacity, { toValue: 0, duration: 200, useNativeDriver: true }).start(({ finished }) => {
        if (finished) setMessage(null);
      });
    const host: Host = (next) => {
      clearTimeout(timer);
      setMessage(next);
      Animated.timing(opacity, { toValue: 1, duration: 200, useNativeDriver: true }).start();
      timer = setTimeout(hide, DURATION_MS);
    };
    hosts.push(host);
    return () => {
      clearTimeout(timer);
      hosts.splice(hosts.indexOf(host), 1);
    };
  }, [opacity]);

  if (message === null) return null;

  const translateY = opacity.interpolate({ inputRange: [0, 1], outputRange: [16, 0] });
  return (
    <Animated.View
      style={[styles.toast, { bottom: bottom + spacing.lg + offset, opacity, transform: [{ translateY }] }]}
    >
      <Pressable onPress={() => setMessage(null)} accessibilityRole="button" accessibilityHint="Masque le message">
        <Text style={styles.text}>{message}</Text>
      </Pressable>
    </Animated.View>
  );
}

const useStyles = themedStyles((c) => ({
  toast: {
    position: 'absolute',
    left: spacing.lg,
    right: spacing.lg,
    borderRadius: radius.md,
    backgroundColor: c.text,
    elevation: 6,
  },
  text: {
    color: c.background,
    fontSize: 15,
    lineHeight: 21,
    paddingHorizontal: spacing.lg,
    paddingVertical: spacing.md,
  },
}));
