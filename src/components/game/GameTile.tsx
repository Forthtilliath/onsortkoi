import { StyleSheet, Text, View } from 'react-native';

import type { Game } from '../../domain/types';
import { radius, tilePalette } from '../../ui/theme';
import { monogram } from './gameLabels';

/** Pastille colorée avec l'initiale du jeu (l'export MyLudo n'a pas d'image). */
export function GameTile({ game, size = 48 }: { game: Game; size?: number }) {
  const tone = tilePalette[game.id % tilePalette.length];
  return (
    <View
      style={[styles.tile, { width: size, height: size, backgroundColor: tone.bg }]}
      importantForAccessibility="no-hide-descendants"
      accessibilityElementsHidden
    >
      <Text style={[styles.letter, { color: tone.fg, fontSize: size * 0.45 }]}>{monogram(game.title)}</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  tile: { borderRadius: radius.md, alignItems: 'center', justifyContent: 'center' },
  letter: { fontWeight: '800' },
});
