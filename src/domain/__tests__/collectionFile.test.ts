import { createBackup } from '../backup';
import { readCollectionFile } from '../collectionFile';
import type { StoredCollection } from '../types';

const myludoEntry = { ID: 4680, Titre: '7 Wonders', Type: 'basegame', 'Joueur(s)': '2-7', Durée: '30' };

const collection: StoredCollection = {
  importedAt: '2026-10-01T18:30:00.000Z',
  games: [
    {
      id: 4680,
      title: '7 Wonders',
      subtitle: '',
      type: 'basegame',
      year: 2010,
      players: { min: 2, max: 7 },
      duration: { min: 30, max: 30 },
      age: 10,
      categories: [],
      themes: [],
      mechanisms: [],
      authors: [],
      rating: null,
      averageRating: null,
    },
  ],
};
const settings = { showCategories: false, themes: [], mechanisms: [] };

describe('readCollectionFile', () => {
  it('reconnaît un export MyLudo', () => {
    const result = readCollectionFile(JSON.stringify([myludoEntry]));
    expect(result.ok && result.kind).toBe('myludo');
  });

  it('reconnaît une sauvegarde Onsortkoi', () => {
    const result = readCollectionFile(createBackup(collection, settings));
    expect(result).toEqual({ ok: true, kind: 'backup', backup: { collection, settings } });
  });

  it('garde la validation complète de chaque format', () => {
    expect(readCollectionFile(JSON.stringify([{ ...myludoEntry, ID: -1 }])).ok).toBe(false);
    const backup = JSON.parse(createBackup(collection, settings));
    backup.collection.games[0].title = '';
    expect(readCollectionFile(JSON.stringify(backup)).ok).toBe(false);
  });

  it('rejette un fichier qui n’est ni l’un ni l’autre', () => {
    for (const text of ['pas du json', '{"foo":1}', '42', 'null']) {
      const result = readCollectionFile(text);
      expect(result.ok).toBe(false);
      if (!result.ok) expect(result.error).toMatch(/ni un export MyLudo ni une sauvegarde/);
    }
  });

  it('accepte un BOM en tête de fichier', () => {
    expect(readCollectionFile(`﻿${JSON.stringify([myludoEntry])}`).ok).toBe(true);
  });
});
