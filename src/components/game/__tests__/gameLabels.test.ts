import type { Game } from '../../../domain/types';
import { gameAccessibilityLabel, gameFacts } from '../gameLabels';

const game = (overrides: Partial<Game>): Game => ({
  id: 1,
  title: 'Azul',
  subtitle: '',
  type: 'basegame',
  year: null,
  players: { min: 2, max: 4 },
  duration: { min: 30, max: 45 },
  age: 8,
  categories: [],
  themes: [],
  mechanisms: [],
  authors: [],
  rating: 8,
  averageRating: null,
  ...overrides,
});

describe('gameAccessibilityLabel', () => {
  it('décrit la carte en toutes lettres pour TalkBack', () => {
    expect(gameAccessibilityLabel(game({}))).toBe(
      'Azul, 2 à 4 joueurs, 30 à 45 minutes, dès 8 ans, ma note 8 sur 10',
    );
  });

  it('lit les intervalles ouverts, les valeurs seules et le type', () => {
    const label = gameAccessibilityLabel(
      game({ type: 'extension', players: { min: 2, max: null }, duration: { min: 1, max: 1 }, age: null, rating: null }),
    );
    expect(label).toBe('Azul, Extension, 2 joueurs ou plus, 1 minute');
  });
});

describe('gameFacts', () => {
  it('garde les valeurs affichées compactes', () => {
    expect(gameFacts(game({})).map((f) => f.value)).toEqual(['2–4', '30–45 min', '8+']);
  });
});
