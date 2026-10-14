import { formatRange } from '../../domain/fields';
import type { Game, Range } from '../../domain/types';
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

export type GameFact = { key: string; icon: IconName; value: string; label: string; spoken: string };

/** Intervalle lu à voix haute : « 2 à 4 joueurs », « 2 joueurs ou plus », « 1 joueur ». */
function spokenRange({ min, max }: Range, singular: string, plural: string): string {
  if (max === null) return `${min} ${min > 1 ? plural : singular} ou plus`;
  if (min === max) return `${min} ${min > 1 ? plural : singular}`;
  return `${min} à ${max} ${plural}`;
}

/** Joueurs, durée et âge renseignés, prêts à afficher et à lire par TalkBack. */
export function gameFacts(game: Game): GameFact[] {
  const { players, duration, age } = game;
  const solo = players?.min === 1 && players.max === 1;
  const facts: (GameFact | null)[] = [
    players && {
      key: 'players',
      icon: 'people-outline',
      value: formatRange(players) ?? '',
      label: solo ? 'joueur' : 'joueurs',
      spoken: spokenRange(players, 'joueur', 'joueurs'),
    },
    duration && {
      key: 'duration',
      icon: 'time-outline',
      value: formatRange(duration, 'min') ?? '',
      label: 'durée',
      spoken: spokenRange(duration, 'minute', 'minutes'),
    },
    age !== null
      ? { key: 'age', icon: 'happy-outline', value: `${age}+`, label: 'ans', spoken: `dès ${age} ans` }
      : null,
  ];
  return facts.filter((fact): fact is GameFact => !!fact);
}

/** Description complète d'une carte pour les lecteurs d'écran. */
export function gameAccessibilityLabel(game: Game): string {
  return [
    game.title,
    ...subtitleParts(game),
    ...gameFacts(game).map((fact) => fact.spoken),
    game.rating !== null && `ma note ${game.rating} sur 10`,
  ]
    .filter(Boolean)
    .join(', ');
}

/** Première lettre ou chiffre du titre, pour la pastille. */
export const monogram = (title: string) => title.match(/[\p{L}\p{N}]/u)?.[0]?.toUpperCase() ?? '?';
