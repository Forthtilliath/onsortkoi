import { formatRange } from '../../domain/fields';
import type { Game } from '../../domain/types';
import type { IconName } from '../../ui/Icon';

const TYPE_LABELS: Record<string, string> = {
  extension: 'Extension',
  standalone: 'Standalone',
  accessoire: 'Accessoire',
  goodie: 'Goodie',
};

/** Type (hors jeu de base) et sous-titre renseignés. */
export const subtitleParts = (game: Game) => [TYPE_LABELS[game.type], game.subtitle].filter(Boolean);

/** « Extension · sous-titre », ou chaîne vide pour un jeu de base sans sous-titre. */
export const gameSubtitle = (game: Game) => subtitleParts(game).join(' · ');

export type GameFact = { key: string; icon: IconName; value: string; label: string };

/** Joueurs, durée et âge renseignés, prêts à afficher. */
export function gameFacts(game: Game): GameFact[] {
  const players = formatRange(game.players);
  const duration = formatRange(game.duration, 'min');
  const solo = game.players?.min === 1 && game.players.max === 1;
  return [
    players && { key: 'players', icon: 'people-outline', value: players, label: solo ? 'joueur' : 'joueurs' },
    duration && { key: 'duration', icon: 'time-outline', value: duration, label: 'durée' },
    game.age !== null && { key: 'age', icon: 'happy-outline', value: `${game.age}+`, label: 'ans' },
  ].filter((fact): fact is GameFact => !!fact);
}

/** Première lettre ou chiffre du titre, pour la pastille. */
export const monogram = (title: string) => title.match(/[\p{L}\p{N}]/u)?.[0]?.toUpperCase() ?? '?';
