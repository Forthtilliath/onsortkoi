import { AccessibilityInfo } from 'react-native';

export type ToastHostCallback = (message: string) => void;

// Pile des hôtes montés : le dernier (ex. celui de l'écran de réglages, ouvert par-dessus la liste)
// est le seul visible, c'est donc lui qui affiche le message.
const hosts: ToastHostCallback[] = [];

/** Enregistre un hôte de toasts ; renvoie la fonction qui le retire. */
export function registerToastHost(host: ToastHostCallback): () => void {
  hosts.push(host);
  return () => {
    hosts.splice(hosts.indexOf(host), 1);
  };
}

/** Message bref qui disparaît seul, pour une action réussie (les erreurs restent des dialogues). */
export function showToast(message: string): void {
  hosts.at(-1)?.(message);
  // Annonce explicite : TalkBack ne lit pas toujours une vue qui vient d'apparaître.
  AccessibilityInfo.announceForAccessibility(message);
}
