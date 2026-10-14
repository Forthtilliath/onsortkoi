/** Intervalle inclusif ; `max: null` = sans limite haute (ex. « 2+ »). */
export type Range = { min: number; max: number | null };

export type Game = {
  id: number;
  title: string;
  subtitle: string;
  /** Type MyLudo : basegame, standalone, extension, accessoire, goodie… */
  type: string;
  year: number | null;
  players: Range | null;
  /** Durée en minutes. */
  duration: Range | null;
  /** Âge minimum conseillé. */
  age: number | null;
  categories: string[];
  themes: string[];
  mechanisms: string[];
  authors: string[];
  /** Note personnelle sur 10. */
  rating: number | null;
  /** Note moyenne de la communauté MyLudo sur 10. */
  averageRating: number | null;
};

export type TagGroup = 'categories' | 'themes' | 'mechanisms';
