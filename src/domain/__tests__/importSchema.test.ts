import { readFileSync } from 'fs';

import { importCollection, MAX_GAMES } from '../importSchema';

const entry = (overrides: Record<string, unknown> = {}) => ({
  ID: 4680,
  Titre: '7 Wonders',
  'Sous-titre': '',
  Édition: 2010,
  Type: 'basegame',
  'Joueur(s)': '2 — 7',
  Durée: 30,
  'Age(s)': '10+',
  'Catégorie(s)': ['Jeu de Cartes'],
  'Thème(s)': ['Antiquité'],
  'Mécanisme(s)': ['Draft'],
  'Auteur(s)': ['Antoine Bauza'],
  'Prix d\'achat': '42',
  Commentaire: 'perso',
  'Note personnelle': 0,
  'Note moyenne': 7.9,
  ...overrides,
});

const run = (data: unknown) => importCollection(JSON.stringify(data));

describe('importCollection', () => {
  it('importe un export valide et normalise les champs', () => {
    const result = run([entry(), entry({ ID: 1, Titre: 'Codenames Duo', 'Joueur(s)': 'Duo', Durée: '15 — 30' })]);
    expect(result.ok).toBe(true);
    if (!result.ok) return;
    expect(result.games[0]).toEqual({
      id: 4680,
      title: '7 Wonders',
      subtitle: '',
      type: 'basegame',
      year: 2010,
      players: { min: 2, max: 7 },
      duration: { min: 30, max: 30 },
      age: 10,
      categories: ['Jeu de Cartes'],
      themes: ['Antiquité'],
      mechanisms: ['Draft'],
      authors: ['Antoine Bauza'],
      rating: null,
      averageRating: 7.9,
    });
    expect(result.games[1].players).toEqual({ min: 2, max: 2 });
    expect(result.games[1].duration).toEqual({ min: 15, max: 30 });
  });

  it('ne garde pas les champs inconnus ou personnels', () => {
    const result = run([entry({ Inconnu: 'x' })]);
    expect(result.ok && Object.keys(result.games[0])).not.toContain('Commentaire');
    expect(JSON.stringify(result)).not.toContain('perso');
  });

  it('accepte les champs facultatifs absents', () => {
    const result = run([{ ID: 1, Titre: 'Minimal' }]);
    expect(result.ok && result.games[0]).toMatchObject({ players: null, duration: null, age: null, categories: [] });
  });

  it.each([
    ['du texte', 'not json'],
    ['un objet', JSON.stringify({ games: [] })],
    ['une liste vide', '[]'],
  ])('rejette %s', (_label, text) => {
    expect(importCollection(text).ok).toBe(false);
  });

  it('rejette tout le fichier à la première anomalie et la localise', () => {
    const result = run([entry(), entry({ ID: 2, Titre: 'Cassé', 'Joueur(s)': 'plein' })]);
    expect(result).toEqual({ ok: false, error: expect.stringContaining('Jeu n°2 (« Cassé »)') });
    expect(!result.ok && result.error).toContain('Joueur(s)');
    expect(!result.ok && result.error).toContain("Rien n'a été importé");
  });

  it.each([
    ['un ID négatif', { ID: -1 }],
    ['un titre vide', { Titre: '  ' }],
    ['un titre trop long', { Titre: 'x'.repeat(201) }],
    ['une note hors bornes', { 'Note moyenne': 11 }],
    ['un tag non textuel', { 'Thème(s)': [42] }],
    ['trop de tags', { 'Thème(s)': Array.from({ length: 101 }, (_, i) => `t${i}`) }],
    ['un type suspect', { Type: '<script>' }],
    ['une durée décimale', { Durée: 12.5 }],
  ])('rejette %s', (_label, overrides) => {
    expect(run([entry(overrides)]).ok).toBe(false);
  });

  it('rejette les identifiants en double', () => {
    expect(run([entry(), entry()]).ok).toBe(false);
  });

  it('rejette un fichier avec trop de jeux', () => {
    const many = Array.from({ length: MAX_GAMES + 1 }, (_, i) => entry({ ID: i + 1 }));
    expect(run(many).ok).toBe(false);
  });

  it('ignore un BOM en début de fichier', () => {
    expect(importCollection(`﻿${JSON.stringify([entry()])}`).ok).toBe(true);
  });

  // Vérification sur un vrai export : MYLUDO_EXPORT=chemin/collection.json npm test
  const exportPath = process.env.MYLUDO_EXPORT;
  (exportPath ? it : it.skip)('importe le vrai export MyLudo indiqué', () => {
    const result = importCollection(readFileSync(exportPath!, 'utf8'));
    if (!result.ok) throw new Error(result.error);
    expect(result.games.length).toBeGreaterThan(0);
  });
});
