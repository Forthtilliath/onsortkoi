import { useResolvedScheme } from '@forthtilliath/react-native-kit/components/theme/themePreferenceContext';
import { StyleSheet } from 'react-native';

export type Palette = {
  scheme: 'light' | 'dark';
  background: string;
  card: string;
  primary: string;
  primarySoft: string;
  text: string;
  muted: string;
  /** Séparateurs et contours décoratifs. */
  border: string;
  /** Contour des champs de saisie : contraste d'au moins 3:1 avec le fond (WCAG 1.4.11). */
  control: string;
  onPrimary: string;
  star: string;
  /** Messages d'erreur. */
  danger: string;
  /** Pastilles des jeux (fond, initiale). */
  tiles: { bg: string; fg: string }[];
};

// Contrastes vérifiés : texte ≥ 4,5:1 sur fond et carte, étoile et contours ≥ 3:1.
export const lightColors: Palette = {
  scheme: 'light',
  background: '#F6F1EA',
  card: '#FFFFFF',
  primary: '#9A3F14',
  primarySoft: '#F3E1D5',
  text: '#2B2118',
  muted: '#76665A',
  border: '#E4D9CC',
  control: '#958676',
  onPrimary: '#FFFFFF',
  star: '#B07A0A',
  danger: '#B42318',
  tiles: [
    { bg: '#F3E1D5', fg: '#9A3F14' },
    { bg: '#E3EBD9', fg: '#4E6B2E' },
    { bg: '#DCE7EE', fg: '#2F5D7C' },
    { bg: '#F1E6C8', fg: '#8A6212' },
    { bg: '#EADCEB', fg: '#6E3F75' },
  ],
};

export const darkColors: Palette = {
  scheme: 'dark',
  background: '#1C1612',
  card: '#28201A',
  primary: '#E08A5C',
  primarySoft: '#3D2A1F',
  text: '#F2E9E1',
  muted: '#B5A596',
  border: '#3E332B',
  control: '#857464',
  onPrimary: '#1C1612',
  star: '#E5A93A',
  danger: '#F28B82',
  tiles: [
    { bg: '#4A2A1A', fg: '#F0B894' },
    { bg: '#2F3B24', fg: '#B8D39A' },
    { bg: '#22333F', fg: '#A8C8DE' },
    { bg: '#3F3218', fg: '#E8C978' },
    { bg: '#3A2840', fg: '#D7B3DD' },
  ],
};

export const spacing = { xs: 4, sm: 8, md: 12, lg: 16, xl: 24 };

export const radius = { sm: 8, md: 12, lg: 16, pill: 999 };

/** Palette du thème en cours : choix de l'utilisateur, ou celui du téléphone. */
export function useColors(): Palette {
  return useResolvedScheme() === 'dark' ? darkColors : lightColors;
}

/** Hook renvoyant `factory(palette)`, calculé une seule fois par palette. */
export function byPalette<T>(factory: (c: Palette) => T): () => T {
  const cache = new Map<Palette, T>();
  return function usePaletteValue() {
    const c = useColors();
    let value = cache.get(c);
    if (value === undefined) {
      value = factory(c);
      cache.set(c, value);
    }
    return value;
  };
}

/** `StyleSheet.create` aux couleurs du thème en cours, une feuille par palette. */
export function themedStyles<T extends StyleSheet.NamedStyles<T>>(factory: (c: Palette) => T): () => T {
  return byPalette((c) => StyleSheet.create(factory(c)));
}
